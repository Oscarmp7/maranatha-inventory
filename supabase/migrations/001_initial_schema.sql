-- ============================================================
-- 001_initial_schema.sql
-- Maranatha Inventory — esquema completo
-- ============================================================


-- ============================================================
-- LOOKUP TABLES
-- ============================================================

create table categories (
  id   serial      primary key,
  name text        not null unique
);

create table brands (
  id   serial      primary key,
  name text        not null unique
);


-- ============================================================
-- PROFILES
-- ============================================================

create table profiles (
  id         uuid        primary key references auth.users on delete cascade,
  name       text        not null,
  role       text        not null check (role in ('admin', 'operator')),
  created_at timestamptz not null default now()
);


-- ============================================================
-- PRODUCTS (una fila = un SKU/variante)
-- ============================================================

create table products (
  id                uuid        primary key default gen_random_uuid(),
  code              text        not null unique,
  name              text        not null,
  brand_id          integer     references brands,
  category_id       integer     references categories,
  specification     text,
  color             text,
  base_unit         text        not null default 'unidad',
  package_type      text,
  units_per_package numeric     check (units_per_package > 0),
  current_stock     numeric     not null default 0 check (current_stock >= 0),
  min_stock         numeric     not null default 0 check (min_stock >= 0),
  is_active         boolean     not null default true,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint package_fields_consistent check (
    (package_type is null and units_per_package is null)
    or
    (package_type is not null and units_per_package is not null)
  )
);


-- ============================================================
-- PURCHASES
-- ============================================================

create table purchases (
  id               uuid        primary key default gen_random_uuid(),
  product_id       uuid        not null references products on delete restrict,
  quantity_ordered numeric     not null check (quantity_ordered > 0),
  unit_ordered     text        not null,
  quantity_units   numeric     not null check (quantity_units > 0),
  unit_cost        numeric     not null check (unit_cost >= 0),
  total_cost       numeric     generated always as (quantity_ordered * unit_cost) stored,
  supplier         text,
  notes            text,
  registered_by    uuid        not null references profiles on delete restrict,
  purchase_date    date        not null default current_date,
  created_at       timestamptz not null default now()
);


-- ============================================================
-- SALES
-- ============================================================

create table sales (
  id               uuid        primary key default gen_random_uuid(),
  product_id       uuid        not null references products on delete restrict,
  quantity_ordered numeric     not null check (quantity_ordered > 0),
  unit_ordered     text        not null,
  quantity_units   numeric     not null check (quantity_units > 0),
  unit_price       numeric     not null check (unit_price >= 0),
  total_price      numeric     generated always as (quantity_ordered * unit_price) stored,
  customer         text,
  notes            text,
  registered_by    uuid        not null references profiles on delete restrict,
  sale_date        date        not null default current_date,
  created_at       timestamptz not null default now()
);


-- ============================================================
-- TRIGGER: auto-update products.updated_at
-- ============================================================

create or replace function fn_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_products_updated_at
  before update on products
  for each row
  execute function fn_products_updated_at();


-- ============================================================
-- TRIGGER: purchases → actualizar stock
-- ============================================================

create or replace function fn_purchases_update_stock()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    update products
      set current_stock = current_stock + new.quantity_units
    where id = new.product_id;

  elsif (tg_op = 'UPDATE') then
    update products
      set current_stock = current_stock - old.quantity_units + new.quantity_units
    where id = new.product_id;

  elsif (tg_op = 'DELETE') then
    update products
      set current_stock = current_stock - old.quantity_units
    where id = old.product_id;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger trg_purchases_stock
  after insert or update or delete on purchases
  for each row
  execute function fn_purchases_update_stock();


-- ============================================================
-- TRIGGER: sales → actualizar stock (con guard de stock negativo)
-- ============================================================

create or replace function fn_sales_update_stock()
returns trigger
language plpgsql
as $$
declare
  v_stock numeric;
begin
  if (tg_op = 'INSERT') then
    select current_stock into v_stock
      from products where id = new.product_id for update;

    if v_stock < new.quantity_units then
      raise exception
        'Stock insuficiente: disponible=%, solicitado=%',
        v_stock, new.quantity_units
        using errcode = 'P0001';
    end if;

    update products
      set current_stock = current_stock - new.quantity_units
    where id = new.product_id;

  elsif (tg_op = 'UPDATE') then
    select current_stock into v_stock
      from products where id = new.product_id for update;

    if (v_stock + old.quantity_units) < new.quantity_units then
      raise exception
        'Stock insuficiente al editar venta: disponible efectivo=%, solicitado=%',
        v_stock + old.quantity_units, new.quantity_units
        using errcode = 'P0001';
    end if;

    update products
      set current_stock = current_stock + old.quantity_units - new.quantity_units
    where id = new.product_id;

  elsif (tg_op = 'DELETE') then
    update products
      set current_stock = current_stock + old.quantity_units
    where id = old.product_id;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger trg_sales_stock
  after insert or update or delete on sales
  for each row
  execute function fn_sales_update_stock();


-- ============================================================
-- RLS — helper function (security definer evita recursión)
-- ============================================================

create or replace function fn_get_my_role()
returns text
language sql
stable
security definer
as $$
  select role from profiles where id = auth.uid();
$$;


-- ============================================================
-- RLS: CATEGORIES
-- ============================================================

alter table categories enable row level security;

create policy "categories: authenticated read"
  on categories for select to authenticated using (true);

create policy "categories: admin insert"
  on categories for insert to authenticated
  with check (fn_get_my_role() = 'admin');

create policy "categories: admin update"
  on categories for update to authenticated
  using (fn_get_my_role() = 'admin');

create policy "categories: admin delete"
  on categories for delete to authenticated
  using (fn_get_my_role() = 'admin');


-- ============================================================
-- RLS: BRANDS
-- ============================================================

alter table brands enable row level security;

create policy "brands: authenticated read"
  on brands for select to authenticated using (true);

create policy "brands: admin insert"
  on brands for insert to authenticated
  with check (fn_get_my_role() = 'admin');

create policy "brands: admin update"
  on brands for update to authenticated
  using (fn_get_my_role() = 'admin');

create policy "brands: admin delete"
  on brands for delete to authenticated
  using (fn_get_my_role() = 'admin');


-- ============================================================
-- RLS: PROFILES
-- ============================================================

alter table profiles enable row level security;

create policy "profiles: read own or admin reads all"
  on profiles for select to authenticated
  using (id = auth.uid() or fn_get_my_role() = 'admin');

create policy "profiles: admin insert"
  on profiles for insert to authenticated
  with check (fn_get_my_role() = 'admin');

create policy "profiles: admin update"
  on profiles for update to authenticated
  using (fn_get_my_role() = 'admin');


-- ============================================================
-- RLS: PRODUCTS
-- ============================================================

alter table products enable row level security;

create policy "products: authenticated read"
  on products for select to authenticated using (true);

create policy "products: admin insert"
  on products for insert to authenticated
  with check (fn_get_my_role() = 'admin');

create policy "products: admin update"
  on products for update to authenticated
  using (fn_get_my_role() = 'admin');

create policy "products: admin delete"
  on products for delete to authenticated
  using (fn_get_my_role() = 'admin');


-- ============================================================
-- RLS: PURCHASES
-- ============================================================

alter table purchases enable row level security;

create policy "purchases: authenticated read"
  on purchases for select to authenticated using (true);

create policy "purchases: authenticated insert"
  on purchases for insert to authenticated
  with check (registered_by = auth.uid());

create policy "purchases: admin update"
  on purchases for update to authenticated
  using (fn_get_my_role() = 'admin');

create policy "purchases: admin delete"
  on purchases for delete to authenticated
  using (fn_get_my_role() = 'admin');


-- ============================================================
-- RLS: SALES
-- ============================================================

alter table sales enable row level security;

create policy "sales: authenticated read"
  on sales for select to authenticated using (true);

create policy "sales: authenticated insert"
  on sales for insert to authenticated
  with check (registered_by = auth.uid());

create policy "sales: admin update"
  on sales for update to authenticated
  using (fn_get_my_role() = 'admin');

create policy "sales: admin delete"
  on sales for delete to authenticated
  using (fn_get_my_role() = 'admin');

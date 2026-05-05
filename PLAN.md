# Plan: PWA de Inventario — Maranatha v1

## Contexto

Oscar necesita una PWA para que 4 miembros de la familia (él, papá, mamá, esposa) puedan registrar compras y ventas manualmente, y que el inventario se actualice automáticamente con cada movimiento. No existe ningún sistema previo; se parte desde cero. La base de datos estará en Supabase (PostgreSQL) y el deploy inicial en Vercel. En el futuro se migrará a un servidor propio con Cloudflare tunnel usando el dominio de Maranatha.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind CSS |
| PWA | `@ducanh2912/next-pwa` (más mantenido que next-pwa) |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deploy | Vercel → luego self-hosted + Cloudflare tunnel |

## Esquema de base de datos

### `profiles` (extiende `auth.users` de Supabase)
```sql
id uuid references auth.users primary key
name text not null
role text not null check (role in ('admin', 'operator'))
created_at timestamptz default now()
```

### `products`
```sql
id uuid primary key default gen_random_uuid()
name text not null
description text
unit text not null  -- 'unidad', 'caja', 'resma', etc.
current_stock numeric not null default 0
min_stock numeric default 0  -- para alertas futuras
is_active boolean default true
created_at timestamptz default now()
updated_at timestamptz default now()
```

### `purchases` (compras — aumentan inventario)
```sql
id uuid primary key default gen_random_uuid()
product_id uuid references products not null
quantity numeric not null
unit_cost numeric not null
total_cost numeric generated always as (quantity * unit_cost) stored
supplier text
notes text
registered_by uuid references profiles not null
purchase_date date not null default current_date
created_at timestamptz default now()
```

### `sales` (ventas — disminuyen inventario)
```sql
id uuid primary key default gen_random_uuid()
product_id uuid references products not null
quantity numeric not null
unit_price numeric not null
total_price numeric generated always as (quantity * unit_price) stored
customer text
notes text
registered_by uuid references profiles not null
sale_date date not null default current_date
created_at timestamptz default now()
```

El inventario se actualiza mediante **triggers en Supabase** (PostgreSQL):
- `after insert on purchases` → `current_stock += quantity`
- `after insert on sales` → `current_stock -= quantity`

## Roles

| Rol | Permisos |
|---|---|
| `admin` | Todo: gestionar productos, ver reportes, registrar movimientos |
| `operator` | Registrar compras y ventas, ver inventario |

Los permisos se aplican con **Row Level Security (RLS)** en Supabase y con guards en la UI de Next.js.

Para v1: Oscar será `admin`. Los demás `operator`. Cuando se defina qué puede hacer cada quien, se ajustan los roles sin cambiar la arquitectura.

## Estructura del proyecto

```
maranatha-inventory/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          ← navbar + auth guard
│   │   ├── dashboard/page.tsx  ← inventario actual
│   │   ├── purchases/
│   │   │   ├── page.tsx        ← historial de compras
│   │   │   └── new/page.tsx    ← registrar compra
│   │   ├── sales/
│   │   │   ├── page.tsx        ← historial de ventas
│   │   │   └── new/page.tsx    ← registrar venta
│   │   └── products/
│   │       └── page.tsx        ← gestión de productos (solo admin)
├── components/
│   ├── ui/                     ← botones, inputs, cards
│   ├── inventory/
│   ├── purchases/
│   └── sales/
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── types.ts            ← tipos generados de Supabase
└── public/
    ├── manifest.json           ← PWA manifest
    └── icons/                  ← íconos PWA
```

## Páginas y funcionalidad de v1

### Login
- Email + password via Supabase Auth
- Los 4 usuarios se crean manualmente en Supabase Dashboard

### Dashboard (`/dashboard`)
- Tarjetas por producto: nombre, stock actual, unidad
- Indicador visual si el stock está bajo (< min_stock)
- Accesible para todos los roles

### Registrar compra (`/purchases/new`)
- Select: producto
- Inputs: cantidad, costo unitario, proveedor, fecha, notas
- Al guardar: inserta en `purchases` → trigger actualiza stock
- Accesible: admin y operator

### Registrar venta (`/sales/new`)
- Select: producto
- Inputs: cantidad, precio unitario, cliente, fecha, notas
- Al guardar: inserta en `sales` → trigger actualiza stock
- Validación: no puede vender más de lo que hay en stock
- Accesible: admin y operator

### Historial (`/purchases` y `/sales`)
- Lista de movimientos en orden cronológico
- Filtros básicos: por fecha, por producto
- Accesible: todos

### Gestión de productos (`/products`) — solo admin
- Agregar, editar, activar/desactivar productos
- Campos: nombre, descripción, unidad, stock mínimo

## PWA (instalable en móvil)

- `manifest.json` con nombre, colores, íconos
- Service worker para cachear la app shell
- El usuario puede instalar desde el navegador del celular como app nativa
- Funciona bien en iOS Safari y Android Chrome

## Secuencia de implementación

1. Inicializar proyecto Next.js + Tailwind + Supabase client
2. Crear esquema SQL en Supabase (tablas + triggers + RLS)
3. Configurar autenticación (Supabase Auth + middleware Next.js)
4. Dashboard: listar productos con stock
5. Formulario registrar compra
6. Formulario registrar venta (con validación de stock)
7. Historial de movimientos
8. Gestión de productos (admin)
9. Configurar PWA (manifest + service worker)
10. Deploy en Vercel

## Verificación al terminar

- Iniciar sesión desde el celular, instalar como app (PWA)
- Agregar un producto y verificar que aparece en el dashboard
- Registrar una compra → stock sube
- Registrar una venta → stock baja
- Intentar vender más de lo que hay → debe rechazarlo
- Verificar historial de ambos movimientos
- Verificar que un `operator` no ve la pantalla de productos

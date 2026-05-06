-- ============================================================
-- 002_seed_data.sql
-- Categorías y marcas iniciales para Suplidora Maranatha
-- ============================================================

insert into categories (name) values
  ('Carpetas'),
  ('Bolígrafos y lápices'),
  ('Papel'),
  ('Cajas y empaques'),
  ('Sobres'),
  ('Grapas y perforadoras'),
  ('Cinta adhesiva'),
  ('Marcadores'),
  ('Libretas y blocks'),
  ('Otros');

insert into brands (name) values
  ('Pilot'),
  ('BIC'),
  ('Acco'),
  ('Avery'),
  ('3M'),
  ('Mead'),
  ('Esselte'),
  ('Universal'),
  ('Sin marca');

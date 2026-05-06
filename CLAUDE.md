@AGENTS.md

# Maranatha Inventario — PWA

Sistema de inventario para Suplidora Maranatha. 4 usuarios de la familia registran compras y ventas manualmente.

## Stack
- Next.js 16 (App Router) + React 19
- Tailwind CSS v4 (CSS-first config — NO tailwind.config.js)
- Supabase (PostgreSQL + Auth + RLS)
- Deploy: Netlify + @netlify/plugin-nextjs
- PWA: @ducanh2912/next-pwa

## Brand
- Azul primario: #0A0A63
- Azul secundario: #1C1C9B
- Design tokens en src/app/globals.css bajo @theme inline

## Arquitectura de rutas
- /login → autenticación
- /dashboard → stock de productos
- /purchases → historial de compras
- /purchases/new → registrar compra (FAB → aquí)
- /sales → historial de ventas
- /sales/new → registrar venta (FAB → aquí)
- /products → gestión de productos (solo admin)

## Auth
- Supabase Auth con cookies vía @supabase/ssr
- Middleware en src/middleware.ts protege todas las rutas excepto /login
- Roles: admin (acceso total) | operator (sin /products)

## DB: project ref vzfonevygwsoggzmfgbp
Tablas: profiles, products, purchases, sales
Triggers automáticos actualizan current_stock en cada insert de purchases/sales

## Design
- Bottom nav bar (mobile-first, PWA)
- FAB flotante para acción principal (nueva compra/venta según contexto)
- Dark nav (#0A0A63) + contenido blanco
- NO usar sidebar horizontal — esto es mobile-first

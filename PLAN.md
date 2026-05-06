# Plan Expandido: PWA de Inventario — Maranatha v1

## Contexto

Oscar necesita una PWA para que 4 miembros de la familia registren compras y ventas manualmente, actualizando el inventario automáticamente. Ya existe un sitio de Maranatha en Netlify con su dominio propio, así que el sistema de inventario vivirá en un subdominio dedicado (`inventario.maranatha.com` o similar), eliminando la dependencia de Vercel del plan original y centralizando todo en la infraestructura que ya tienen.

---

## Stack (actualizado)

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind CSS |
| PWA | `@ducanh2912/next-pwa` |
| Base de datos | Supabase (PostgreSQL) + RLS + Triggers |
| Auth | Supabase Auth |
| Deploy | **Netlify** con `@netlify/plugin-nextjs` |
| Dominio | Subdominio del dominio Maranatha existente |

---

## MCPs a instalar (herramientas que Claude usará durante el build)

### 1. Supabase MCP
- **Paquete:** `@supabase/mcp-server-supabase`
- **Para qué:** Crear tablas, triggers, RLS directamente desde Claude Code sin copiar/pegar SQL en el dashboard. También inspeccionar datos, correr migraciones, y verificar que los triggers funcionan.
- **Configuración:** Se conecta con el Personal Access Token de Supabase + project ref.

### 2. Netlify MCP
- **Paquete:** `netlify/mcp` (oficial de Netlify)
- **Para qué:** Crear el site en Netlify, configurar variables de entorno, asignar el subdominio, y hacer deploys — todo desde Claude Code sin tocar la UI de Netlify manualmente.
- **Configuración:** Netlify Personal Access Token.

### 3. GitHub MCP (opcional pero recomendado)
- **Paquete:** `@modelcontextprotocol/server-github`
- **Para qué:** Crear el repositorio, manejar PRs si el proyecto crece, integrar con Netlify CI/CD automáticamente.

---

## Skills de Claude Code a usar

| Skill | Momento de uso |
|---|---|
| `init` | Al inicio — genera `CLAUDE.md` con documentación del proyecto |
| `session-start-hook` | Para configurar el hook de inicio que levanta el servidor de dev |
| `security-review` | Antes del deploy a producción — revisar RLS, auth guards, secrets |
| `fewer-permission-prompts` | Después de la primera sesión de build para afinar los permisos |

---

## Assets necesarios

### Íconos PWA (generar con una herramienta como `pwa-asset-generator`)
```
public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png    ← mínimo para Android
├── icon-384x384.png
├── icon-512x512.png    ← mínimo para splash
├── apple-touch-icon.png (180x180)
└── favicon.ico
```
- El ícono base puede ser el logo de Maranatha o un ícono de caja/inventario con los colores de la marca.
- Usar `pwa-asset-generator` para generar todas las variantes desde un SVG fuente.

### Colores PWA en `manifest.json`
- `theme_color` y `background_color` deben coincidir con la paleta de Maranatha para que la splash screen y la barra del sistema se vean consistentes.

---

## Estrategia de Deploy: Netlify + Subdominio

```
maranatha.com          ← sitio principal (ya existe en Netlify)
inventario.maranatha.com  ← nueva app (nuevo site en Netlify)
```

### Pasos de configuración del subdominio:
1. Crear un nuevo site en Netlify (via MCP o UI) para el inventario.
2. En la configuración de dominio del sitio principal de Maranatha en Netlify → agregar custom domain `inventario.maranatha.com`.
3. En el proveedor DNS del dominio Maranatha → agregar registro CNAME:
   ```
   inventario  CNAME  [netlify-site-name].netlify.app
   ```
4. Netlify provee SSL automático vía Let's Encrypt — el subdominio queda HTTPS sin configuración extra.

### Variables de entorno en Netlify (via MCP):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY  ← solo para server-side, nunca al cliente
```

### Plugin de Next.js para Netlify:
```toml
# netlify.toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```
Esto habilita SSR, middleware de auth, y API routes — necesarios para Supabase Auth con cookies.

---

## Esquema de base de datos (sin cambios del plan original)

### `profiles`
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
unit text not null
current_stock numeric not null default 0
min_stock numeric default 0
is_active boolean default true
created_at timestamptz default now()
updated_at timestamptz default now()
```

### `purchases`
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

### `sales`
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

**Triggers:**
- `after insert on purchases` → `current_stock += quantity`
- `after insert on sales` → `current_stock -= quantity`

---

## Secuencia de implementación (detallada)

```
Fase 0: Setup
  └── Instalar MCPs (Supabase + Netlify)
  └── Crear repo en GitHub
  └── npx create-next-app + Tailwind
  └── /init → genera CLAUDE.md
  └── /session-start-hook → hook de dev server

Fase 1: Base de datos (via Supabase MCP)
  └── Crear tablas (profiles, products, purchases, sales)
  └── Crear triggers de stock
  └── Configurar RLS por rol
  └── Crear 4 usuarios en Supabase Auth

Fase 2: Auth en Next.js
  └── Configurar middleware de Supabase + cookies
  └── Página de login
  └── Auth guard en layout del grupo (app)

Fase 3: Features (en orden)
  └── Dashboard: lista de productos con stock
  └── Registrar compra (form → insert → trigger)
  └── Registrar venta (form → validar stock → insert → trigger)
  └── Historial de compras (con filtros)
  └── Historial de ventas (con filtros)
  └── Gestión de productos (solo admin)

Fase 4: PWA
  └── Generar íconos con pwa-asset-generator
  └── manifest.json con colores Maranatha
  └── Configurar @ducanh2912/next-pwa

Fase 5: Deploy
  └── /security-review antes del push
  └── Crear site en Netlify (via MCP)
  └── Configurar env vars (via MCP)
  └── Agregar netlify.toml + @netlify/plugin-nextjs
  └── Push → CI/CD automático
  └── Configurar subdominio inventario.maranatha.com

Fase 6: QA
  └── Probar desde móvil: instalar como PWA
  └── Probar flujo completo: compra → stock sube
  └── Probar flujo completo: venta → stock baja
  └── Probar guard: venta > stock → rechazado
  └── Probar roles: operator no ve /products
```

---

## Estructura del proyecto

```
maranatha-inventory/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx            ← navbar + auth guard
│   │   ├── dashboard/page.tsx
│   │   ├── purchases/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── sales/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   └── products/page.tsx     ← solo admin
├── components/ui/
├── lib/supabase/
│   ├── client.ts
│   ├── server.ts
│   └── types.ts
├── public/
│   ├── manifest.json
│   └── icons/
├── netlify.toml
└── CLAUDE.md
```

---

## Verificación final

- Abrir `inventario.maranatha.com` desde el celular
- Instalar como app (PWA) en iOS y Android
- Login como admin (Oscar): ver todos los menús
- Login como operator: no ver /products
- Registrar compra → dashboard muestra stock actualizado
- Registrar venta → stock baja correctamente
- Intentar vender más de lo existente → error claro al usuario
- Ver historial filtrado por fecha y producto
- Verificar HTTPS con candado en el subdominio
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: products } = await supabase
    .from('products')
    .select('id, code, name, specification, color, base_unit, package_type, units_per_package, current_stock, min_stock, is_active, brand:brands(name), category:categories(name)')
    .order('name')

  const active = products?.filter(p => p.is_active) ?? []
  const inactive = products?.filter(p => !p.is_active) ?? []

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <p className="page-subtitle">{active.length} activos · {inactive.length} inactivos</p>
      </div>

      {active.length === 0 && inactive.length === 0 ? (
        <div className="page-empty">
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" width="48" height="48">
            <rect x="8" y="8" width="32" height="32" rx="4" stroke="#d1d5db" strokeWidth="2"/>
            <path d="M16 20h16M16 28h10" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>No hay productos registrados.</p>
          <p className="page-empty-sub">Importa el inventario desde el Excel para comenzar.</p>
        </div>
      ) : (
        <div className="product-list">
          {active.map(p => {
            const low = p.current_stock <= p.min_stock
            return (
              <div key={p.id} className={`product-card ${low ? 'low' : ''}`}>
                <div className="product-left">
                  <span className="product-name">{p.name}</span>
                  <span className="product-code">{p.code}</span>
                  <span className="product-meta">
                    {(p.brand as any)?.name ? `${(p.brand as any).name} · ` : ''}
                    {(p.category as any)?.name ?? ''}
                    {p.specification ? ` · ${p.specification}` : ''}
                    {p.color ? ` · ${p.color}` : ''}
                  </span>
                  {p.package_type && p.units_per_package && (
                    <span className="product-pkg">{p.package_type} = {p.units_per_package} {p.base_unit}s</span>
                  )}
                </div>
                <div className="product-right">
                  <span className={`stock-num ${low ? 'stock-low' : 'stock-ok'}`}>
                    {p.current_stock}
                  </span>
                  <span className="stock-unit">{p.base_unit}s</span>
                  {low && <span className="low-badge">bajo</span>}
                </div>
              </div>
            )
          })}
          {inactive.length > 0 && (
            <>
              <p className="section-label">Inactivos ({inactive.length})</p>
              {inactive.map(p => (
                <div key={p.id} className="product-card inactive">
                  <div className="product-left">
                    <span className="product-name">{p.name}</span>
                    <span className="product-code">{p.code}</span>
                  </div>
                  <div className="product-right">
                    <span className="stock-num inactive-num">{p.current_stock}</span>
                    <span className="stock-unit">{p.base_unit}s</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <style>{`
        .page { display: flex; flex-direction: column; gap: 1rem; }
        .page-header { margin-bottom: 0.25rem; }
        .page-title { font-size: 1.4rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; font-family: 'DM Sans', sans-serif; }
        .page-subtitle { font-size: 0.8rem; color: #9ca3af; margin: 0; }

        .page-empty { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 3rem 1rem; text-align: center; }
        .page-empty p { margin: 0; font-weight: 500; color: #6b7280; font-size: 0.875rem; }
        .page-empty-sub { font-size: 0.775rem !important; font-weight: 400 !important; color: #9ca3af !important; }

        .product-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .section-label { font-size: 0.72rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin: 0.5rem 0 0; }

        .product-card {
          display: flex; align-items: flex-start; justify-content: space-between;
          background: white; border-radius: 12px; padding: 0.875rem 1rem;
          border: 1px solid #f3f4f6; box-shadow: 0 1px 3px rgba(0,0,0,0.04); gap: 0.75rem;
        }
        .product-card.low { border-color: #fef3c7; background: #fffbeb; }
        .product-card.inactive { opacity: 0.5; }

        .product-left { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; flex: 1; }
        .product-name { font-size: 0.875rem; font-weight: 500; color: #111827; }
        .product-code { font-size: 0.68rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
        .product-meta { font-size: 0.72rem; color: #9ca3af; }
        .product-pkg { font-size: 0.7rem; color: #6b7280; background: #f3f4f6; border-radius: 4px; padding: 0.1rem 0.35rem; align-self: flex-start; margin-top: 0.1rem; }

        .product-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.1rem; flex-shrink: 0; }
        .stock-num { font-size: 1.1rem; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1; }
        .stock-ok { color: #111827; }
        .stock-low { color: #d97706; }
        .inactive-num { color: #9ca3af; }
        .stock-unit { font-size: 0.68rem; color: #9ca3af; }
        .low-badge { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #92400e; background: #fef3c7; border-radius: 4px; padding: 0.1rem 0.35rem; }
      `}</style>
    </div>
  )
}

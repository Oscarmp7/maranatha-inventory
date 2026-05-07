import { createClient } from '@/lib/supabase/server'

export default async function SalesPage() {
  const supabase = await createClient()

  const { data: sales } = await supabase
    .from('sales')
    .select('id, quantity_ordered, unit_ordered, unit_price, total_price, customer, sale_date, product:products(name, code)')
    .order('sale_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Ventas</h1>
        <p className="page-subtitle">{sales?.length ?? 0} registros recientes</p>
      </div>

      {!sales || sales.length === 0 ? (
        <div className="page-empty">
          <div className="page-empty-icon">
            <svg viewBox="0 0 40 40" fill="none" width="40" height="40" aria-hidden="true">
              <rect x="7" y="10" width="26" height="20" rx="4" stroke="#059669" strokeWidth="1.75" strokeOpacity="0.3"/>
              <path d="M20 14v12M15 19h10" stroke="#059669" strokeWidth="1.75" strokeOpacity="0.4" strokeLinecap="round"/>
            </svg>
          </div>
          <p>Sin ventas registradas</p>
          <p className="page-empty-sub">Toca el botón + para registrar tu primera venta.</p>
        </div>
      ) : (
        <div className="tx-list">
          {sales.map((s) => (
            <div key={s.id} className="tx-card">
              <div className="tx-info">
                <span className="tx-name">{(s.product as any)?.name ?? '—'}</span>
                <span className="tx-code">{(s.product as any)?.code ?? ''}</span>
                <span className="tx-meta">
                  {s.quantity_ordered} {s.unit_ordered}
                  {s.customer ? ` · ${s.customer}` : ''}
                </span>
              </div>
              <div className="tx-right">
                <span className="tx-total">${Number(s.total_price).toFixed(2)}</span>
                <span className="tx-date">{new Date(s.sale_date).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .page { display: flex; flex-direction: column; gap: 1rem; }
        .page-header { margin-bottom: 0.25rem; }
        .page-title { font-size: 1.4rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; font-family: 'DM Sans', sans-serif; }
        .page-subtitle { font-size: 0.8rem; color: #9ca3af; margin: 0; }
        .page-empty { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem 1rem 1.5rem; text-align: center; background: white; border-radius: 16px; border: 1px solid #f0f0f5; }
        .page-empty-icon { width: 64px; height: 64px; border-radius: 16px; background: #f0fdf4; display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem; }
        .page-empty p { margin: 0; font-weight: 600; color: #374151; font-size: 0.875rem; }
        .page-empty-sub { font-size: 0.775rem !important; font-weight: 400 !important; color: #9ca3af !important; max-width: 240px; line-height: 1.5; }
        .tx-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .tx-card { display: flex; align-items: center; justify-content: space-between; background: white; border-radius: 12px; padding: 0.875rem 1rem; border: 1px solid #f3f4f6; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .tx-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
        .tx-name { font-size: 0.875rem; font-weight: 500; color: #111827; }
        .tx-code { font-size: 0.68rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
        .tx-meta { font-size: 0.75rem; color: #6b7280; }
        .tx-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem; flex-shrink: 0; margin-left: 1rem; }
        .tx-total { font-size: 0.95rem; font-weight: 700; color: #0A0A63; font-variant-numeric: tabular-nums; }
        .tx-date { font-size: 0.7rem; color: #9ca3af; }
      `}</style>
    </div>
  )
}

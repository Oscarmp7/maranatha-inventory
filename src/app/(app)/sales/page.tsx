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
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle cx="24" cy="24" r="18" stroke="#d1d5db" strokeWidth="2"/>
            <path d="M24 14v20M18 20l6-6 6 6" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>No hay ventas aún.</p>
          <p className="page-empty-sub">Usa el botón + para registrar una venta.</p>
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
        .page-empty { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 3rem 1rem; text-align: center; }
        .page-empty p { margin: 0; font-weight: 500; color: #6b7280; font-size: 0.875rem; }
        .page-empty-sub { font-size: 0.775rem !important; font-weight: 400 !important; color: #9ca3af !important; }
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

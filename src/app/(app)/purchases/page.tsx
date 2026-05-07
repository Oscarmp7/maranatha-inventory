import { createClient } from '@/lib/supabase/server'

export default async function PurchasesPage() {
  const supabase = await createClient()

  const { data: purchases } = await supabase
    .from('purchases')
    .select('id, quantity_ordered, unit_ordered, unit_cost, total_cost, supplier, purchase_date, product:products(name, code)')
    .order('purchase_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Compras</h1>
        <p className="page-subtitle">{purchases?.length ?? 0} registros recientes</p>
      </div>

      {!purchases || purchases.length === 0 ? (
        <div className="page-empty">
          <div className="page-empty-icon">
            <svg viewBox="0 0 40 40" fill="none" width="40" height="40" aria-hidden="true">
              <path d="M8 14l12-6 12 6v16a2 2 0 01-2 2H10a2 2 0 01-2-2V14z" stroke="#0A0A63" strokeWidth="1.75" strokeOpacity="0.3" strokeLinejoin="round"/>
              <path d="M15 32V20h10v12" stroke="#0A0A63" strokeWidth="1.75" strokeOpacity="0.3" strokeLinejoin="round"/>
            </svg>
          </div>
          <p>Sin compras registradas</p>
          <p className="page-empty-sub">Toca el botón + para registrar tu primera compra.</p>
        </div>
      ) : (
        <div className="tx-list">
          {purchases.map((p) => (
            <div key={p.id} className="tx-card">
              <div className="tx-info">
                <span className="tx-name">{(p.product as any)?.name ?? '—'}</span>
                <span className="tx-code">{(p.product as any)?.code ?? ''}</span>
                <span className="tx-meta">
                  {p.quantity_ordered} {p.unit_ordered}
                  {p.supplier ? ` · ${p.supplier}` : ''}
                </span>
              </div>
              <div className="tx-right">
                <span className="tx-total">${Number(p.total_cost).toFixed(2)}</span>
                <span className="tx-date">{new Date(p.purchase_date).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}</span>
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
        .page-empty-icon { width: 64px; height: 64px; border-radius: 16px; background: #f4f4fc; display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem; }
        .page-empty p { margin: 0; font-weight: 600; color: #374151; font-size: 0.875rem; }
        .page-empty-sub { font-size: 0.775rem !important; font-weight: 400 !important; color: #9ca3af !important; max-width: 240px; line-height: 1.5; }
        .tx-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .tx-card { display: flex; align-items: center; justify-content: space-between; background: white; border-radius: 12px; padding: 0.875rem 1rem; border: 1px solid #f3f4f6; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .tx-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
        .tx-name { font-size: 0.875rem; font-weight: 500; color: #111827; }
        .tx-code { font-size: 0.68rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
        .tx-meta { font-size: 0.75rem; color: #6b7280; }
        .tx-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem; flex-shrink: 0; margin-left: 1rem; }
        .tx-total { font-size: 0.95rem; font-weight: 700; color: #059669; font-variant-numeric: tabular-nums; }
        .tx-date { font-size: 0.7rem; color: #9ca3af; }
      `}</style>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, code, name, current_stock, min_stock, base_unit, is_active')
    .eq('is_active', true)
    .order('name')

  const lowStock = products?.filter(p => p.current_stock <= p.min_stock) ?? []
  const totalProducts = products?.length ?? 0

  return (
    <div className="dashboard">

      {/* Page header */}
      <div className="dash-header">
        <h1 className="dash-title">Inventario</h1>
        <p className="dash-subtitle">Resumen del stock actual</p>
      </div>

      {/* Metric cards — always visible */}
      <div className="dash-metrics">
        <div className="metric-card">
          <span className="metric-value">{totalProducts}</span>
          <span className="metric-label">Productos activos</span>
        </div>
        <div className={`metric-card ${lowStock.length > 0 ? 'metric-card--warn' : ''}`}>
          <span className={`metric-value ${lowStock.length > 0 ? 'metric-value--warn' : ''}`}>
            {lowStock.length}
          </span>
          <span className="metric-label">Stock bajo</span>
        </div>
      </div>

      {/* Low stock alert strip */}
      {lowStock.length > 0 && (
        <div className="dash-alert">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
          </svg>
          <span>
            <strong>{lowStock.length}</strong> producto{lowStock.length > 1 ? 's' : ''} necesita{lowStock.length > 1 ? 'n' : ''} reposición
          </span>
        </div>
      )}

      {/* Product list / empty state */}
      {totalProducts === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">
            <svg viewBox="0 0 40 40" fill="none" width="40" height="40" aria-hidden="true">
              <rect x="5" y="12" width="30" height="22" rx="4" stroke="#0A0A63" strokeWidth="1.75" strokeOpacity="0.25"/>
              <path d="M5 18h30" stroke="#0A0A63" strokeWidth="1.75" strokeOpacity="0.25"/>
              <rect x="13" y="6" width="14" height="8" rx="3" stroke="#0A0A63" strokeWidth="1.75" strokeOpacity="0.25"/>
              <path d="M16 25h8M20 22v6" stroke="#0A0A63" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.35"/>
            </svg>
          </div>
          <p className="dash-empty-text">Sin productos registrados</p>
          <p className="dash-empty-sub">El inventario aparecerá aquí una vez que importes o agregues productos.</p>
        </div>
      ) : (
        <>
          <p className="dash-section-label">Todos los productos</p>
          <div className="dash-list">
            {products!.map((product, i) => {
              const isLow = product.current_stock <= product.min_stock
              return (
                <div
                  key={product.id}
                  className={`dash-product ${isLow ? 'dash-product--low' : ''}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="dash-product-info">
                    <span className="dash-product-code">{product.code}</span>
                    <span className="dash-product-name">{product.name}</span>
                  </div>
                  <div className="dash-product-stock">
                    <span className={`dash-stock-num ${isLow ? 'dash-stock-num--low' : ''}`}>
                      {product.current_stock}
                    </span>
                    <span className="dash-stock-unit">{product.base_unit}</span>
                    {isLow && <span className="dash-low-dot" aria-hidden="true" />}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: page-in 0.22s ease-out both;
        }

        @keyframes page-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .dash-header { margin-bottom: 0.125rem; }
        .dash-title {
          font-size: clamp(1.3rem, 5vw, 1.5rem);
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.2rem;
          letter-spacing: -0.02em;
        }
        .dash-subtitle {
          font-size: 0.78rem;
          color: #9ca3af;
          margin: 0;
        }

        /* Metric cards */
        .dash-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.625rem;
        }

        .metric-card {
          background: white;
          border-radius: 14px;
          padding: 1rem 1rem 0.875rem;
          border: 1px solid #f0f0f5;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metric-card--warn {
          background: #fffbeb;
          border-color: #fde68a;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.03em;
        }

        .metric-value--warn { color: #d97706; }

        .metric-label {
          font-size: 0.72rem;
          color: #9ca3af;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Alert strip */
        .dash-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-left: 3px solid #f59e0b;
          border-radius: 10px;
          padding: 0.625rem 0.875rem;
          font-size: 0.8rem;
          color: #92400e;
        }
        .dash-alert svg { flex-shrink: 0; color: #f59e0b; }

        /* Empty state — compact and intentional */
        .dash-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 1rem 1.5rem;
          gap: 0.5rem;
          background: white;
          border-radius: 16px;
          border: 1px solid #f0f0f5;
        }

        .dash-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #f4f4fc;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.25rem;
        }

        .dash-empty-text {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .dash-empty-sub {
          margin: 0;
          font-size: 0.775rem;
          color: #9ca3af;
          max-width: 260px;
          line-height: 1.5;
        }

        /* Section label */
        .dash-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9ca3af;
          margin: 0;
        }

        /* Product list */
        .dash-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .dash-product {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-radius: 12px;
          padding: 0.8rem 1rem;
          border: 1px solid #f0f0f5;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          animation: row-in 0.2s ease-out both;
          gap: 0.75rem;
        }

        @keyframes row-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dash-product--low {
          border-color: #fde68a;
          background: #fffdf5;
        }

        .dash-product-info {
          display: flex;
          flex-direction: column;
          gap: 0.18rem;
          min-width: 0;
          flex: 1;
        }

        .dash-product-code {
          font-size: 0.64rem;
          font-weight: 600;
          color: #c4c4d4;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .dash-product-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dash-product-stock {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
          flex-shrink: 0;
          position: relative;
        }

        .dash-stock-num {
          font-size: 1.15rem;
          font-weight: 700;
          color: #059669;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }

        .dash-stock-num--low { color: #d97706; }

        .dash-stock-unit {
          font-size: 0.65rem;
          color: #9ca3af;
          text-transform: lowercase;
        }

        .dash-low-dot {
          position: absolute;
          top: -2px;
          right: -4px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 0 2px #fffdf5;
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard, .dash-product { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

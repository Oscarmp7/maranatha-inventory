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
      {/* Header */}
      <div className="dash-header">
        <h1 className="dash-title">Inventario</h1>
        <p className="dash-subtitle">{totalProducts} productos activos</p>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="dash-alert">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
          </svg>
          <span><strong>{lowStock.length}</strong> producto{lowStock.length > 1 ? 's' : ''} con stock bajo</span>
        </div>
      )}

      {/* Product list */}
      {!products || products.length === 0 ? (
        <div className="dash-empty">
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <rect x="8" y="8" width="32" height="32" rx="6" stroke="#d1d5db" strokeWidth="2"/>
            <path d="M24 18v12M18 24h12" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>No hay productos aún.</p>
          <p className="dash-empty-sub">Agrega productos desde la sección Productos.</p>
        </div>
      ) : (
        <div className="dash-list">
          {products.map((product) => {
            const isLow = product.current_stock <= product.min_stock
            return (
              <div key={product.id} className={`dash-product ${isLow ? 'low' : ''}`}>
                <div className="dash-product-info">
                  <span className="dash-product-code">{product.code}</span>
                  <span className="dash-product-name">{product.name}</span>
                </div>
                <div className="dash-product-stock">
                  <span className={`dash-stock-num ${isLow ? 'low' : ''}`}>
                    {product.current_stock}
                  </span>
                  <span className="dash-stock-unit">{product.base_unit}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .dash-header {
          margin-bottom: 0.25rem;
        }

        .dash-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.2rem;
          font-family: 'DM Sans', sans-serif;
        }

        .dash-subtitle {
          font-size: 0.8rem;
          color: #9ca3af;
          margin: 0;
          font-weight: 400;
        }

        .dash-alert {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-left: 3px solid #f59e0b;
          border-radius: 10px;
          padding: 0.75rem 0.875rem;
          font-size: 0.82rem;
          color: #92400e;
          font-weight: 400;
        }

        .dash-alert svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: #f59e0b;
        }

        .dash-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 3rem 1rem;
          text-align: center;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .dash-empty svg {
          margin-bottom: 0.5rem;
        }

        .dash-empty p {
          margin: 0;
          font-weight: 500;
          color: #6b7280;
        }

        .dash-empty-sub {
          font-size: 0.775rem !important;
          font-weight: 400 !important;
          color: #9ca3af !important;
        }

        .dash-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .dash-product {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-radius: 12px;
          padding: 0.875rem 1rem;
          border: 1px solid #f3f4f6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: box-shadow 0.15s;
        }

        .dash-product.low {
          border-color: #fde68a;
          background: #fffdf5;
        }

        .dash-product-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }

        .dash-product-code {
          font-size: 0.68rem;
          font-weight: 600;
          color: #9ca3af;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }

        .dash-product-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
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
          margin-left: 1rem;
        }

        .dash-stock-num {
          font-size: 1.1rem;
          font-weight: 700;
          color: #059669;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .dash-stock-num.low {
          color: #d97706;
        }

        .dash-stock-unit {
          font-size: 0.68rem;
          color: #9ca3af;
          font-weight: 400;
          text-transform: lowercase;
        }
      `}</style>
    </div>
  )
}

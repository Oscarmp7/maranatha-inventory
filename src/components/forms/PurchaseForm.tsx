'use client'

import { useActionState, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createPurchase } from '@/app/actions/purchases'
import type { Product } from '@/lib/supabase/types'

type ProductRow = Pick<Product, 'id' | 'code' | 'name' | 'base_unit' | 'package_type' | 'units_per_package' | 'specification' | 'color' | 'current_stock'>

interface Props {
  products: ProductRow[]
}

export default function PurchaseForm({ products }: Props) {
  const router = useRouter()
  const [error, formAction, isPending] = useActionState(createPurchase, null)

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ProductRow | null>(null)
  const [showList, setShowList] = useState(false)
  const [usePackage, setUsePackage] = useState(false)
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [date] = useState(() => new Date().toISOString().split('T')[0])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return products.slice(0, 20)
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    ).slice(0, 15)
  }, [products, query])

  const unitOrdered = selected
    ? (usePackage && selected.package_type ? selected.package_type : selected.base_unit)
    : ''

  const quantityUnits = (() => {
    const n = parseFloat(qty)
    if (!selected || isNaN(n)) return 0
    if (usePackage && selected.units_per_package) return n * selected.units_per_package
    return n
  })()

  const total = (() => {
    const n = parseFloat(qty)
    const p = parseFloat(price)
    return isNaN(n) || isNaN(p) ? 0 : n * p
  })()

  function handleSelect(p: ProductRow) {
    setSelected(p)
    setQuery(p.name)
    setShowList(false)
    setUsePackage(false)
    setQty('')
  }

  function handleClear() {
    setSelected(null)
    setQuery('')
    setUsePackage(false)
    setQty('')
    setPrice('')
  }

  return (
    <form action={formAction} className="pf">
      <input type="hidden" name="product_id" value={selected?.id ?? ''} />
      <input type="hidden" name="unit_ordered" value={unitOrdered} />
      <input type="hidden" name="quantity_units" value={String(quantityUnits || '')} />

      {/* Producto */}
      <div className="field">
        <label className="label">Producto *</label>
        <div className="search-wrap">
          <input
            type="text"
            className={`input ${selected ? 'input-selected' : ''}`}
            placeholder="Buscar por nombre o código..."
            value={query}
            onChange={e => { setQuery(e.target.value); setShowList(true); if (selected) setSelected(null) }}
            onFocus={() => !selected && setShowList(true)}
            autoComplete="off"
            readOnly={!!selected}
          />
          {selected && (
            <button type="button" className="clear-btn" onClick={handleClear} aria-label="Limpiar selección">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>
        {showList && !selected && (
          <div className="product-list" onMouseDown={e => e.preventDefault()}>
            {filtered.length === 0 ? (
              <div className="list-empty">Sin resultados</div>
            ) : filtered.map(p => (
              <button key={p.id} type="button" className="product-item" onClick={() => handleSelect(p)}>
                <span className="item-name">{p.name}</span>
                <span className="item-meta">
                  {p.code}
                  {p.specification ? ` · ${p.specification}` : ''}
                  {p.color ? ` · ${p.color}` : ''}
                </span>
              </button>
            ))}
          </div>
        )}
        {selected && (
          <div className="selected-chip">
            <span className="chip-code">{selected.code}</span>
            <span className="chip-stock">Stock actual: {selected.current_stock} {selected.base_unit}{selected.current_stock !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Unidad de compra */}
      {selected?.package_type && (
        <div className="field">
          <label className="label">Unidad de compra</label>
          <div className="unit-toggle">
            <button type="button" className={`unit-btn ${!usePackage ? 'active' : ''}`} onClick={() => { setUsePackage(false); setQty('') }}>
              Por {selected.base_unit}
            </button>
            <button type="button" className={`unit-btn ${usePackage ? 'active' : ''}`} onClick={() => { setUsePackage(true); setQty('') }}>
              Por {selected.package_type}
              {selected.units_per_package ? <><br/><small>{selected.units_per_package} {selected.base_unit}s c/u</small></> : null}
            </button>
          </div>
        </div>
      )}

      {/* Cantidad y costo */}
      <div className="row-2">
        <div className="field">
          <label className="label">Cantidad *</label>
          <div className="input-affixed">
            <input
              type="number"
              name="quantity_ordered"
              className="input"
              placeholder="0"
              value={qty}
              onChange={e => setQty(e.target.value)}
              min="0.01"
              step="any"
              inputMode="decimal"
              required
            />
            {unitOrdered && <span className="affix-right">{unitOrdered}</span>}
          </div>
        </div>
        <div className="field">
          <label className="label">Costo / {unitOrdered || 'unidad'} *</label>
          <div className="input-affixed">
            <span className="affix-left">$</span>
            <input
              type="number"
              name="unit_cost"
              className="input input-pl"
              placeholder="0.00"
              value={price}
              onChange={e => setPrice(e.target.value)}
              min="0"
              step="any"
              inputMode="decimal"
              required
            />
          </div>
        </div>
      </div>

      {/* Resumen calculado */}
      {selected && qty && price && parseFloat(qty) > 0 && parseFloat(price) >= 0 && (
        <div className="calc-card">
          <div className="calc-row">
            <span className="calc-label">Entra al inventario</span>
            <span className="calc-val">{quantityUnits} {selected.base_unit}{quantityUnits !== 1 ? 's' : ''}</span>
          </div>
          <div className="calc-divider" />
          <div className="calc-row">
            <span className="calc-label">Total</span>
            <span className="calc-total">${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Proveedor */}
      <div className="field">
        <label className="label">Proveedor <span className="opt">(opcional)</span></label>
        <input type="text" name="supplier" className="input" placeholder="Ej. Distribuidora XYZ" autoComplete="off" />
      </div>

      {/* Fecha */}
      <div className="field">
        <label className="label">Fecha</label>
        <input type="date" name="purchase_date" className="input" defaultValue={date} required />
      </div>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" className="submit-btn" disabled={isPending || !selected}>
        {isPending ? 'Registrando...' : 'Registrar compra'}
      </button>

      <button type="button" className="cancel-btn" onClick={() => router.back()} disabled={isPending}>
        Cancelar
      </button>

      <style>{`
        .pf { display: flex; flex-direction: column; gap: 1rem; }
        .field { display: flex; flex-direction: column; gap: 0.35rem; }
        .label { font-size: 0.78rem; font-weight: 600; color: #374151; letter-spacing: 0.01em; }
        .opt { font-weight: 400; color: #9ca3af; }

        .search-wrap { position: relative; }
        .input {
          width: 100%; padding: 0.7rem 0.875rem; border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 0.9rem; color: #111827; background: white; outline: none;
          font-family: 'DM Sans', sans-serif; box-sizing: border-box; transition: border-color 0.15s;
        }
        .input:focus { border-color: #0A0A63; }
        .input-selected { background: #f8f9ff; border-color: #c7d2fe; color: #374151; cursor: default; }
        .clear-btn {
          position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%);
          background: #f3f4f6; border: none; border-radius: 50%; width: 26px; height: 26px;
          display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280;
        }
        .clear-btn:hover { background: #e5e7eb; }

        .product-list {
          background: white; border: 1.5px solid #e5e7eb; border-radius: 10px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08); max-height: 220px; overflow-y: auto;
          margin-top: 0.25rem;
        }
        .list-empty { padding: 1rem; text-align: center; font-size: 0.85rem; color: #9ca3af; }
        .product-item {
          display: flex; flex-direction: column; gap: 0.1rem; padding: 0.65rem 0.875rem;
          width: 100%; background: none; border: none; border-bottom: 1px solid #f9fafb;
          text-align: left; cursor: pointer;
        }
        .product-item:last-child { border-bottom: none; }
        .product-item:active { background: #f0f4ff; }
        .item-name { font-size: 0.875rem; font-weight: 500; color: #111827; }
        .item-meta { font-size: 0.7rem; color: #9ca3af; }

        .selected-chip {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.7rem;
          background: #eff6ff; border-radius: 6px; margin-top: 0.15rem;
        }
        .chip-code { font-size: 0.68rem; font-weight: 700; color: #0A0A63; text-transform: uppercase; letter-spacing: 0.05em; }
        .chip-stock { font-size: 0.7rem; color: #6b7280; margin-left: auto; }

        .unit-toggle { display: flex; gap: 0.5rem; }
        .unit-btn {
          flex: 1; padding: 0.6rem 0.5rem; border: 1.5px solid #e5e7eb; border-radius: 10px;
          background: white; font-size: 0.8rem; color: #6b7280; cursor: pointer;
          font-family: 'DM Sans', sans-serif; text-align: center; line-height: 1.3; transition: all 0.15s;
        }
        .unit-btn.active { border-color: #0A0A63; background: #0A0A63; color: white; font-weight: 600; }
        .unit-btn small { font-size: 0.68rem; opacity: 0.8; }

        .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .input-affixed { position: relative; }
        .affix-right {
          position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
          font-size: 0.75rem; color: #9ca3af; pointer-events: none;
        }
        .affix-left {
          position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
          font-size: 0.9rem; color: #6b7280; pointer-events: none;
        }
        .input-pl { padding-left: 1.5rem; }

        .calc-card {
          background: #f8faff; border: 1.5px solid #e0e7ff; border-radius: 12px; padding: 0.875rem 1rem;
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .calc-row { display: flex; align-items: center; justify-content: space-between; }
        .calc-label { font-size: 0.8rem; color: #6b7280; }
        .calc-val { font-size: 0.875rem; font-weight: 600; color: #374151; }
        .calc-total { font-size: 1.05rem; font-weight: 700; color: #0A0A63; font-variant-numeric: tabular-nums; }
        .calc-divider { height: 1px; background: #e0e7ff; }

        .form-error {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
          border-radius: 8px; padding: 0.65rem 0.875rem; font-size: 0.825rem;
        }

        .submit-btn {
          width: 100%; padding: 0.85rem; background: #0A0A63; color: white;
          border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity 0.15s;
          margin-top: 0.25rem;
        }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .submit-btn:not(:disabled):active { opacity: 0.85; }
        .cancel-btn {
          width: 100%; padding: 0.75rem; background: none; color: #6b7280;
          border: 1.5px solid #e5e7eb; border-radius: 12px; font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
        }
        .cancel-btn:active { background: #f9fafb; }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </form>
  )
}

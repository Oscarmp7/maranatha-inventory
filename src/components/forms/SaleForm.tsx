'use client'

import { useActionState, useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSale } from '@/app/actions/sales'
import { createProductQuick, type QuickProductResult } from '@/app/actions/products'

type ProductRow = QuickProductResult

interface Props {
  products: ProductRow[]
}

const BASE_UNITS = ['unidad', 'metro', 'kg', 'litro', 'rollo', 'resma', 'par']
const PACKAGE_TYPES = ['caja', 'paquete', 'docena', 'bolsa', 'bandeja']

export default function SaleForm({ products: initialProducts }: Props) {
  const router = useRouter()
  const [error, formAction, isPending] = useActionState(createSale, null)

  const [allProducts, setAllProducts] = useState(initialProducts)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ProductRow | null>(null)
  const [showList, setShowList] = useState(false)
  const [usePackage, setUsePackage] = useState(false)
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [date] = useState(() => new Date().toISOString().split('T')[0])

  const [showCreate, setShowCreate] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, startCreating] = useTransition()
  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('')
  const [newBrand, setNewBrand] = useState('')
  const [newSpec, setNewSpec] = useState('')
  const [newColor, setNewColor] = useState('')
  const [newUnit, setNewUnit] = useState('unidad')
  const [newPackageType, setNewPackageType] = useState('')
  const [newUnitsPerPkg, setNewUnitsPerPkg] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return allProducts.slice(0, 20)
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.specification?.toLowerCase().includes(q) ||
      p.color?.toLowerCase().includes(q)
    ).slice(0, 15)
  }, [allProducts, query])

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

  const stockOk = !selected || quantityUnits <= selected.current_stock

  function handleSelect(p: ProductRow) {
    setSelected(p)
    setQuery(p.name)
    setShowList(false)
    setUsePackage(false)
    setQty('')
    setShowCreate(false)
  }

  function handleClear() {
    setSelected(null)
    setQuery('')
    setUsePackage(false)
    setQty('')
    setPrice('')
    setShowCreate(false)
  }

  function openCreate() {
    setNewName(query.trim())
    setShowCreate(true)
    setShowList(false)
  }

  function handleCreateProduct() {
    startCreating(async () => {
      setCreateError(null)
      const result = await createProductQuick({
        name: newName, code: newCode, brand_name: newBrand,
        specification: newSpec, color: newColor, base_unit: newUnit,
        package_type: newPackageType, units_per_package: newUnitsPerPkg,
      })
      if ('error' in result) {
        setCreateError(result.error)
      } else {
        setAllProducts(prev => [...prev, result.product])
        handleSelect(result.product)
        setShowCreate(false)
        resetCreateForm()
      }
    })
  }

  function resetCreateForm() {
    setNewName(''); setNewCode(''); setNewBrand(''); setNewSpec('')
    setNewColor(''); setNewUnit('unidad'); setNewPackageType(''); setNewUnitsPerPkg('')
    setCreateError(null)
  }

  return (
    <form action={formAction} className="pf">
      <input type="hidden" name="product_id" value={selected?.id ?? ''} />
      <input type="hidden" name="unit_ordered" value={unitOrdered} />
      <input type="hidden" name="quantity_units" value={String(quantityUnits || '')} />

      <div className="field">
        <label className="label">Producto *</label>
        <div className="search-wrap">
          <input
            type="text"
            className={`input ${selected ? 'input-selected' : ''}`}
            placeholder="Buscar por nombre, código, color..."
            value={query}
            onChange={e => { setQuery(e.target.value); setShowList(true); if (selected) setSelected(null); setShowCreate(false) }}
            onFocus={() => !selected && setShowList(true)}
            autoComplete="off"
            readOnly={!!selected}
          />
          {selected && (
            <button type="button" className="clear-btn" onClick={handleClear} aria-label="Limpiar">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>
        {showList && !selected && filtered.length > 0 && (
          <div className="product-list" onMouseDown={e => e.preventDefault()}>
            {filtered.map(p => (
              <button key={p.id} type="button" className="product-item" onClick={() => handleSelect(p)}>
                <span className="item-name">{p.name}</span>
                <span className="item-meta">
                  {p.code}{p.specification ? ` · ${p.specification}` : ''}{p.color ? ` · ${p.color}` : ''}
                  {' · '}<span className={p.current_stock <= 0 ? 'stock-zero' : ''}>{p.current_stock} {p.base_unit}s</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {!selected && !showCreate && (
          <button type="button" className="add-product-btn-static" onClick={openCreate}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            {query.trim() && filtered.length === 0
              ? `Añadir "${query.trim()}" como nuevo producto`
              : 'Añadir nuevo producto'}
          </button>
        )}
        {selected && (
          <div className="selected-chip">
            <span className="chip-code">{selected.code}</span>
            {selected.specification && <span className="chip-spec">{selected.specification}</span>}
            {selected.color && <span className="chip-color">{selected.color}</span>}
            <span className={`chip-stock ${selected.current_stock <= 0 ? 'stock-zero' : ''}`}>
              {selected.current_stock} {selected.base_unit}s disponibles
            </span>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="create-card">
          <div className="create-header">
            <span className="create-title">Nuevo producto</span>
            <button type="button" className="create-close" onClick={() => { setShowCreate(false); resetCreateForm() }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="create-grid">
            <div className="field full">
              <label className="label">Nombre *</label>
              <input type="text" className="input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej. Folder Manila" />
            </div>
            <div className="field">
              <label className="label">Marca</label>
              <input type="text" className="input" value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="Ej. Acco" />
            </div>
            <div className="field">
              <label className="label">Código</label>
              <input type="text" className="input" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="Auto si vacío" />
            </div>
            <div className="field full">
              <label className="label">Especificación / tamaño</label>
              <input type="text" className="input" value={newSpec} onChange={e => setNewSpec(e.target.value)} placeholder="Ej. Tamaño carta, 3 pulgadas" />
            </div>
            <div className="field">
              <label className="label">Color</label>
              <input type="text" className="input" value={newColor} onChange={e => setNewColor(e.target.value)} placeholder="Ej. Azul" />
            </div>
            <div className="field">
              <label className="label">Unidad base *</label>
              <select className="input" value={newUnit} onChange={e => setNewUnit(e.target.value)}>
                {BASE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                <option value="_other">otra...</option>
              </select>
              {newUnit === '_other' && (
                <input type="text" className="input mt-1" placeholder="Escribe la unidad" onChange={e => setNewUnit(e.target.value)} autoFocus />
              )}
            </div>
          </div>
          <div className="pkg-section">
            <label className="label">Viene en paquete / caja?</label>
            <div className="pkg-row">
              <div className="field" style={{flex: 1}}>
                <select className="input" value={newPackageType} onChange={e => setNewPackageType(e.target.value)}>
                  <option value="">No aplica</option>
                  {PACKAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {newPackageType && (
                <div className="field" style={{flex: 1}}>
                  <input type="number" className="input" placeholder={`Unidades por ${newPackageType}`}
                    value={newUnitsPerPkg} onChange={e => setNewUnitsPerPkg(e.target.value)} min="1" inputMode="numeric" />
                </div>
              )}
            </div>
          </div>
          {createError && <div className="form-error">{createError}</div>}
          <button type="button" className="create-submit" onClick={handleCreateProduct} disabled={isCreating || !newName.trim()}>
            {isCreating ? 'Creando...' : 'Crear y seleccionar'}
          </button>
        </div>
      )}

      {selected?.package_type && (
        <div className="field">
          <label className="label">Unidad de venta</label>
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

      <div className="row-2">
        <div className="field">
          <label className="label">Cantidad *</label>
          <div className="input-affixed">
            <input type="number" name="quantity_ordered" className="input" placeholder="0"
              value={qty} onChange={e => setQty(e.target.value)} min="0.01" step="any" inputMode="decimal" required />
            {unitOrdered && <span className="affix-right">{unitOrdered}</span>}
          </div>
        </div>
        <div className="field">
          <label className="label">Precio / {unitOrdered || 'unidad'} *</label>
          <div className="input-affixed">
            <span className="affix-left">$</span>
            <input type="number" name="unit_price" className="input input-pl" placeholder="0.00"
              value={price} onChange={e => setPrice(e.target.value)} min="0" step="any" inputMode="decimal" required />
          </div>
        </div>
      </div>

      {selected && qty && parseFloat(qty) > 0 && !stockOk && (
        <div className="stock-warning">Stock insuficiente — disponible: {selected.current_stock} {selected.base_unit}s</div>
      )}

      {selected && qty && price && parseFloat(qty) > 0 && parseFloat(price) >= 0 && stockOk && (
        <div className="calc-card">
          <div className="calc-row">
            <span className="calc-label">Sale del inventario</span>
            <span className="calc-val">{quantityUnits} {selected.base_unit}{quantityUnits !== 1 ? 's' : ''}</span>
          </div>
          <div className="calc-divider" />
          <div className="calc-row">
            <span className="calc-label">Total venta</span>
            <span className="calc-total">${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="field">
        <label className="label">Cliente <span className="opt">(opcional)</span></label>
        <input type="text" name="customer" className="input" placeholder="Ej. Colmado Los Ángeles" autoComplete="off" />
      </div>
      <div className="field">
        <label className="label">Fecha</label>
        <input type="date" name="sale_date" className="input" defaultValue={date} required />
      </div>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" className="submit-btn" disabled={isPending || !selected || !stockOk}>
        {isPending ? 'Registrando...' : 'Registrar venta'}
      </button>
      <button type="button" className="cancel-btn" onClick={() => router.back()} disabled={isPending}>Cancelar</button>

      <style>{`
        .pf { display: flex; flex-direction: column; gap: 1rem; }
        .field { display: flex; flex-direction: column; gap: 0.35rem; }
        .full { grid-column: 1 / -1; }
        .label { font-size: 0.78rem; font-weight: 600; color: #374151; letter-spacing: 0.01em; }
        .opt { font-weight: 400; color: #9ca3af; }
        .mt-1 { margin-top: 0.35rem; }

        .search-wrap { position: relative; }
        .input {
          width: 100%; padding: 0.7rem 0.875rem; border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 0.9rem; color: #111827; background: white; outline: none;
          font-family: 'DM Sans', sans-serif; box-sizing: border-box; transition: border-color 0.15s;
          touch-action: manipulation;
        }
        .input:focus { border-color: #0A0A63; }
        .input-selected { background: #f8f9ff; border-color: #c7d2fe; cursor: default; }
        select.input { cursor: pointer; }
        .clear-btn {
          position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%);
          background: #f3f4f6; border: none; border-radius: 50%; width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280;
          touch-action: manipulation;
        }

        .product-list {
          background: white; border: 1.5px solid #e5e7eb; border-radius: 10px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08); max-height: 240px; overflow-y: auto; margin-top: 0.25rem;
        }
        .list-empty { padding: 0.875rem; text-align: center; font-size: 0.85rem; color: #9ca3af; }
        .product-item {
          display: flex; flex-direction: column; gap: 0.1rem; padding: 0.65rem 0.875rem;
          width: 100%; background: none; border: none; border-bottom: 1px solid #f9fafb;
          text-align: left; cursor: pointer; touch-action: manipulation;
        }
        .product-item:last-child { border-bottom: none; }
        .product-item:active { background: #f0f4ff; }
        .item-name { font-size: 0.875rem; font-weight: 500; color: #111827; }
        .item-meta { font-size: 0.7rem; color: #9ca3af; }
        .stock-zero { color: #ef4444 !important; }
        .add-product-btn-static {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.875rem;
          width: 100%; background: #f0f4ff; border: 1.5px dashed #c7d2fe;
          border-radius: 10px; text-align: left; cursor: pointer; font-size: 0.825rem;
          font-weight: 600; color: #0A0A63; font-family: 'DM Sans', sans-serif;
          touch-action: manipulation; margin-top: 0.25rem; transition: background 0.15s;
        }
        .add-product-btn-static:active { background: #e0e7ff; }

        .selected-chip {
          display: flex; align-items: center; flex-wrap: wrap; gap: 0.4rem;
          padding: 0.4rem 0.7rem; background: #eff6ff; border-radius: 6px; margin-top: 0.15rem;
        }
        .chip-code { font-size: 0.68rem; font-weight: 700; color: #0A0A63; text-transform: uppercase; letter-spacing: 0.05em; }
        .chip-spec, .chip-color { font-size: 0.7rem; color: #4b5563; background: white; border-radius: 4px; padding: 0.1rem 0.4rem; }
        .chip-stock { font-size: 0.7rem; color: #6b7280; margin-left: auto; }

        .create-card {
          background: #f8faff; border: 1.5px solid #dbeafe; border-radius: 12px;
          padding: 1rem; display: flex; flex-direction: column; gap: 0.875rem;
        }
        .create-header { display: flex; align-items: center; justify-content: space-between; }
        .create-title { font-size: 0.85rem; font-weight: 700; color: #0A0A63; }
        .create-close {
          background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px;
          display: flex; align-items: center; touch-action: manipulation;
        }
        .create-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem; }
        .pkg-section { display: flex; flex-direction: column; gap: 0.35rem; }
        .pkg-row { display: flex; gap: 0.625rem; }
        .create-submit {
          width: 100%; padding: 0.75rem; background: #0A0A63; color: white; border: none;
          border-radius: 10px; font-size: 0.875rem; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer; touch-action: manipulation; transition: opacity 0.15s;
        }
        .create-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .unit-toggle { display: flex; gap: 0.5rem; }
        .unit-btn {
          flex: 1; padding: 0.6rem 0.5rem; border: 1.5px solid #e5e7eb; border-radius: 10px;
          background: white; font-size: 0.8rem; color: #6b7280; cursor: pointer;
          font-family: 'DM Sans', sans-serif; text-align: center; line-height: 1.3;
          transition: all 0.15s; touch-action: manipulation;
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

        .stock-warning {
          background: #fef3c7; border: 1px solid #fcd34d; color: #92400e;
          border-radius: 8px; padding: 0.6rem 0.875rem; font-size: 0.8rem; font-weight: 500;
        }
        .calc-card {
          background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px;
          padding: 0.875rem 1rem; display: flex; flex-direction: column; gap: 0.5rem;
        }
        .calc-row { display: flex; align-items: center; justify-content: space-between; }
        .calc-label { font-size: 0.8rem; color: #6b7280; }
        .calc-val { font-size: 0.875rem; font-weight: 600; color: #374151; }
        .calc-total { font-size: 1.05rem; font-weight: 700; color: #059669; font-variant-numeric: tabular-nums; }
        .calc-divider { height: 1px; background: #bbf7d0; }

        .form-error {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
          border-radius: 8px; padding: 0.65rem 0.875rem; font-size: 0.825rem;
        }
        .submit-btn {
          width: 100%; padding: 0.875rem; background: #0A0A63; color: white; border: none;
          border-radius: 12px; font-size: 0.95rem; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity 0.15s;
          margin-top: 0.25rem; touch-action: manipulation;
        }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cancel-btn {
          width: 100%; padding: 0.75rem; background: none; color: #6b7280;
          border: 1.5px solid #e5e7eb; border-radius: 12px; font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif; cursor: pointer; touch-action: manipulation;
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </form>
  )
}

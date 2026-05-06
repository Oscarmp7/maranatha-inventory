import { createClient } from '@/lib/supabase/server'
import SaleForm from '@/components/forms/SaleForm'

export default async function NewSalePage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, code, name, base_unit, package_type, units_per_package, specification, color, current_stock')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Nueva Venta</h1>
        <p className="page-subtitle">Registra una salida de inventario</p>
      </div>
      <SaleForm products={products ?? []} />
      <style>{`
        .page { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 2rem; }
        .page-header { margin-bottom: 0.25rem; }
        .page-title { font-size: 1.4rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; font-family: 'DM Sans', sans-serif; }
        .page-subtitle { font-size: 0.8rem; color: #9ca3af; margin: 0; }
      `}</style>
    </div>
  )
}

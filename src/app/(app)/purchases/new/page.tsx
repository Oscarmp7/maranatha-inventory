import { createClient } from '@/lib/supabase/server'
import PurchaseForm from '@/components/forms/PurchaseForm'

export default async function NewPurchasePage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, code, name, base_unit, package_type, units_per_package, specification, color, current_stock')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Nueva Compra</h1>
        <p className="page-subtitle">Registra una entrada de inventario</p>
      </div>
      <PurchaseForm products={products ?? []} />
      <style>{`
        .page { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 2rem; }
        .page-header { margin-bottom: 0.25rem; }
        .page-title { font-size: 1.4rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; font-family: 'DM Sans', sans-serif; }
        .page-subtitle { font-size: 0.8rem; color: #9ca3af; margin: 0; }
      `}</style>
    </div>
  )
}

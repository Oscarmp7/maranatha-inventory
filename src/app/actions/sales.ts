'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createSale(prevState: string | null, formData: FormData): Promise<string | null> {
  const product_id = formData.get('product_id') as string
  const quantity_ordered = parseFloat(formData.get('quantity_ordered') as string)
  const unit_ordered = (formData.get('unit_ordered') as string)?.trim()
  const quantity_units = parseFloat(formData.get('quantity_units') as string)
  const unit_price = parseFloat(formData.get('unit_price') as string)
  const customer = ((formData.get('customer') as string) || '').trim() || null
  const notes = ((formData.get('notes') as string) || '').trim() || null
  const sale_date = formData.get('sale_date') as string

  if (!product_id) return 'Selecciona un producto.'
  if (!quantity_ordered || isNaN(quantity_ordered) || quantity_ordered <= 0) return 'Ingresa una cantidad válida.'
  if (!unit_ordered) return 'La unidad es requerida.'
  if (!quantity_units || isNaN(quantity_units) || quantity_units <= 0) return 'Error en el cálculo de unidades.'
  if (isNaN(unit_price) || unit_price < 0) return 'Ingresa un precio válido.'
  if (!sale_date) return 'La fecha es requerida.'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'No autenticado. Recarga la página.'

  const { error } = await supabase.from('sales').insert({
    product_id,
    quantity_ordered,
    unit_ordered,
    quantity_units,
    unit_price,
    customer,
    notes,
    registered_by: user.id,
    sale_date,
  })

  if (error) {
    if (error.code === 'P0001') return 'Stock insuficiente para completar esta venta.'
    return `Error al registrar: ${error.message}`
  }

  redirect('/sales')
}

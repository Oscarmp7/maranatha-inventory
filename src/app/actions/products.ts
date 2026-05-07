'use server'

import { createClient } from '@/lib/supabase/server'

export interface QuickProductResult {
  id: string
  code: string
  name: string
  base_unit: string
  package_type: string | null
  units_per_package: number | null
  specification: string | null
  color: string | null
  current_stock: number
}

export async function createProductQuick(data: {
  name: string
  code: string
  brand_name: string
  specification: string
  color: string
  base_unit: string
  package_type: string
  units_per_package: string
}): Promise<{ product: QuickProductResult } | { error: string }> {
  const name = data.name.trim()
  if (!name) return { error: 'El nombre del producto es requerido.' }

  const base_unit = data.base_unit.trim() || 'unidad'

  const supabase = await createClient()

  // Resolve brand_id
  let brand_id: number | null = null
  const brandName = data.brand_name.trim()
  if (brandName) {
    const { data: existing } = await supabase
      .from('brands')
      .select('id')
      .ilike('name', brandName)
      .single()

    if (existing) {
      brand_id = existing.id
    } else {
      const { data: newBrand, error: brandErr } = await supabase
        .from('brands')
        .insert({ name: brandName })
        .select('id')
        .single()
      if (brandErr) return { error: `Error creando marca: ${brandErr.message}` }
      brand_id = newBrand.id
    }
  }

  // Build code
  let code = data.code.trim()
  if (!code) {
    code = `PROD-${Date.now().toString(36).toUpperCase()}`
  }

  // Package fields
  const package_type = data.package_type.trim() || null
  const units_per_package = package_type && data.units_per_package
    ? parseFloat(data.units_per_package)
    : null

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name,
      code,
      brand_id,
      specification: data.specification.trim() || null,
      color: data.color.trim() || null,
      base_unit,
      package_type,
      units_per_package,
      current_stock: 0,
      min_stock: 0,
      is_active: true,
    })
    .select('id, code, name, base_unit, package_type, units_per_package, specification, color, current_stock')
    .single()

  if (error) {
    if (error.code === '23505') return { error: `El código "${code}" ya existe. Usa uno diferente.` }
    return { error: `Error al crear producto: ${error.message}` }
  }

  return { product: product as QuickProductResult }
}

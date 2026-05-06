export type UserRole = 'admin' | 'operator'

export interface Category {
  id: number
  name: string
}

export interface Brand {
  id: number
  name: string
}

export interface Profile {
  id: string
  name: string
  role: UserRole
  created_at: string
}

export interface Product {
  id: string
  code: string
  name: string
  brand_id: number | null
  category_id: number | null
  specification: string | null
  color: string | null
  base_unit: string
  package_type: string | null
  units_per_package: number | null
  current_stock: number
  min_stock: number
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
  brand?: Pick<Brand, 'name'>
  category?: Pick<Category, 'name'>
}

export interface Purchase {
  id: string
  product_id: string
  quantity_ordered: number
  unit_ordered: string
  quantity_units: number
  unit_cost: number
  total_cost: number
  supplier: string | null
  notes: string | null
  registered_by: string
  purchase_date: string
  created_at: string
  product?: Pick<Product, 'code' | 'name' | 'base_unit'>
  profile?: Pick<Profile, 'name'>
}

export interface Sale {
  id: string
  product_id: string
  quantity_ordered: number
  unit_ordered: string
  quantity_units: number
  unit_price: number
  total_price: number
  customer: string | null
  notes: string | null
  registered_by: string
  sale_date: string
  created_at: string
  product?: Pick<Product, 'code' | 'name' | 'base_unit'>
  profile?: Pick<Profile, 'name'>
}

export type ProductInsert = Omit<Product, 'id' | 'current_stock' | 'created_at' | 'updated_at' | 'brand' | 'category'>
export type PurchaseInsert = Omit<Purchase, 'id' | 'total_cost' | 'created_at' | 'product' | 'profile'>
export type SaleInsert = Omit<Sale, 'id' | 'total_price' | 'created_at' | 'product' | 'profile'>

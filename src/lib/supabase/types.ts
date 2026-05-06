export type UserRole = 'admin' | 'operator'

export interface Profile {
  id: string
  name: string
  role: UserRole
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  unit: string
  current_stock: number
  min_stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  product_id: string
  quantity: number
  unit_cost: number
  total_cost: number
  supplier: string | null
  notes: string | null
  registered_by: string
  purchase_date: string
  created_at: string
  product?: Pick<Product, 'name' | 'unit'>
  profile?: Pick<Profile, 'name'>
}

export interface Sale {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  customer: string | null
  notes: string | null
  registered_by: string
  sale_date: string
  created_at: string
  product?: Pick<Product, 'name' | 'unit'>
  profile?: Pick<Profile, 'name'>
}

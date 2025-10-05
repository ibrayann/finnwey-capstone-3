export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  type: CategoryType
  parent_id?: string
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export type CategoryType = 'income' | 'expense' | 'transfer' | 'savings'

export interface CreateCategoryInput {
  name: string
  description?: string
  icon?: string
  color?: string
  type: CategoryType
  parent_id?: string
}

export interface UpdateCategoryInput {
  name?: string
  description?: string
  icon?: string
  color?: string
  type?: CategoryType
  parent_id?: string
  is_active?: boolean
}

export interface CategoryFilters {
  type?: CategoryType
  is_active?: boolean
  is_default?: boolean
  parent_id?: string | null
}

// Categorías predefinidas del sistema
export const DEFAULT_CATEGORIES = {
  INCOME: [
    { name: 'Salario', icon: 'briefcase', color: '#10B981' },
    { name: 'Freelance', icon: 'user', color: '#3B82F6' },
    { name: 'Inversiones', icon: 'trending-up', color: '#8B5CF6' },
    { name: 'Ventas', icon: 'shopping-bag', color: '#F59E0B' },
    { name: 'Otros ingresos', icon: 'plus-circle', color: '#6B7280' },
  ],
  EXPENSE: [
    { name: 'Alimentación', icon: 'utensils', color: '#EF4444' },
    { name: 'Transporte', icon: 'car', color: '#F97316' },
    { name: 'Vivienda', icon: 'home', color: '#84CC16' },
    { name: 'Salud', icon: 'heart', color: '#EC4899' },
    { name: 'Educación', icon: 'book-open', color: '#06B6D4' },
    { name: 'Entretenimiento', icon: 'film', color: '#8B5CF6' },
    { name: 'Ropa', icon: 'shirt', color: '#F59E0B' },
    { name: 'Tecnología', icon: 'smartphone', color: '#6366F1' },
    { name: 'Servicios', icon: 'zap', color: '#10B981' },
    { name: 'Otros gastos', icon: 'minus-circle', color: '#6B7280' },
  ],
  TRANSFER: [
    { name: 'Transferencia entre cuentas', icon: 'arrow-left-right', color: '#6B7280' },
    { name: 'Pago de deuda', icon: 'credit-card', color: '#EF4444' },
  ],
  SAVINGS: [
    { name: 'Fondo de emergencia', icon: 'shield', color: '#10B981' },
    { name: 'Vacaciones', icon: 'plane', color: '#3B82F6' },
    { name: 'Educación', icon: 'graduation-cap', color: '#8B5CF6' },
    { name: 'Casa', icon: 'home', color: '#F59E0B' },
    { name: 'Retiro', icon: 'piggy-bank', color: '#EC4899' },
    { name: 'Otros ahorros', icon: 'target', color: '#6B7280' },
  ],
} as const

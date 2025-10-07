export type BudgetPeriod = 'weekly' | 'biweekly' | 'monthly'
export type BudgetType = 'necessary' | 'discretionary'
export type AlertType = 'limit_warning' | 'speed_warning' | 'exceeded'

export interface BudgetCategory {
  id: string
  name: string
  icon: string
  color: string
  type: BudgetType
}

export interface Budget {
  id: string
  categoryId: string
  category: string
  icon: string
  color: string
  limit: number
  spent: number
  period: BudgetPeriod
  type: BudgetType
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Campos adicionales de Supabase
  amount?: number
  spent_amount?: number
  end_date?: string
  start_date?: string
  period_type?: string
  percentage_used?: number
}

export interface BudgetAlert {
  id: string
  budgetId: string
  type: AlertType
  title: string
  message: string
  percentage: number
  projectedSpending?: number
  isRead: boolean
  createdAt: Date
}

export interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  remainingBudget: number
  percentage: number
  status: 'good' | 'warning' | 'danger'
  projectedMonthlySpending: number
  daysRemaining: number
}

export interface BudgetDistribution {
  necessary: number
  discretionary: number
  savings: number
}

export interface BudgetAnalytics {
  currentPeriod: BudgetSummary
  previousPeriod: BudgetSummary
  trend: 'improving' | 'worsening' | 'stable'
  categories: {
    mostSpent: Budget[]
    overBudget: Budget[]
    onTrack: Budget[]
  }
}

// Categorías del esquema de base de datos
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  // Gastos (expense)
  { id: 'alimentacion', name: 'Alimentación', icon: '🍔', color: '#FF6B6B', type: 'necessary' },
  { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#4ECDC4', type: 'necessary' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎬', color: '#45B7D1', type: 'discretionary' },
  { id: 'salud', name: 'Salud', icon: '⚕️', color: '#96CEB4', type: 'necessary' },
  { id: 'educacion', name: 'Educación', icon: '📚', color: '#FECA57', type: 'necessary' },

  // Ingresos (income) - estos también pueden tener presupuestos para controlar ingresos mínimos
  { id: 'salario', name: 'Salario', icon: '💼', color: '#48CAE4', type: 'necessary' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#06FFA5', type: 'discretionary' },
  { id: 'otros_ingresos', name: 'Otros ingresos', icon: '💰', color: '#FFD93D', type: 'discretionary' },
]

export const BUDGET_PERIODS = [
  { value: 'weekly' as BudgetPeriod, label: 'Semanal', days: 7 },
  { value: 'biweekly' as BudgetPeriod, label: 'Quincenal', days: 15 },
  { value: 'monthly' as BudgetPeriod, label: 'Mensual', days: 30 },
]

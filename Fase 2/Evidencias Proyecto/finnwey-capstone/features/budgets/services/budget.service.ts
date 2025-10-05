import { supabase } from '@/lib/supabase'

export interface BudgetService {
  // Operaciones básicas
  createBudget: (budgetData: CreateBudgetData, userId: string) => Promise<Budget>
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<Budget>
  deleteBudget: (id: string) => Promise<void>

  // Consultas
  getBudgets: (userId: string) => Promise<BudgetWithSpending[]>
  getBudgetById: (id: string) => Promise<Budget | null>
  getBudgetSummary: (userId: string) => Promise<BudgetSummary>
  getBudgetAlerts: (userId: string) => Promise<BudgetAlert[]>
  getBudgetTransactions: (budgetId: string) => Promise<any[]>

  // Alertas
  markAlertAsRead: (alertId: string) => Promise<void>
  createBudgetAlert: (alertData: CreateBudgetAlertData) => Promise<BudgetAlert>

  // Utilidades
  checkBudgetLimits: (userId: string, categoryId: string, amount: number) => Promise<BudgetCheckResult>
  getBudgetPeriodDates: (periodType: BudgetPeriodType) => { startDate: string; endDate: string }
}

export interface Budget {
  id: string
  user_id: string
  name: string
  description?: string
  category_id: string
  subcategory_id?: string
  amount: number
  currency_code: string
  period_type: BudgetPeriodType
  start_date: string
  end_date: string
  alert_threshold: number
  warning_threshold: number
  rollover_unused: boolean
  rollover_percentage: number
  auto_adjust: boolean
  auto_adjust_percentage: number
  status: BudgetStatus
  created_at: string
  updated_at: string
}

export interface BudgetWithSpending extends Budget {
  spent_amount: number
  remaining_amount: number
  percentage_used: number
  category_name: string
  category_icon?: string
  category_color?: string
}

export interface BudgetSummary {
  total_budget: number
  total_spent: number
  remaining_budget: number
  percentage: number
  status: 'good' | 'warning' | 'danger'
  projected_monthly_spending: number
  days_remaining: number
}

export interface BudgetAlert {
  id: string
  budget_id: string
  user_id: string
  alert_type: 'warning' | 'exceeded' | 'milestone'
  threshold_percentage: number
  amount_spent: number
  budget_amount: number
  triggered_at: string
  is_acknowledged: boolean
  acknowledged_at?: string
}

export interface CreateBudgetData {
  name: string
  description?: string
  category_id: string
  subcategory_id?: string
  amount: number
  currency_code?: string
  period_type: BudgetPeriodType
  start_date: string
  end_date: string
  alert_threshold?: number
  warning_threshold?: number
  rollover_unused?: boolean
  rollover_percentage?: number
  auto_adjust?: boolean
  auto_adjust_percentage?: number
}

export interface CreateBudgetAlertData {
  budget_id: string
  user_id: string
  alert_type: 'warning' | 'exceeded' | 'milestone'
  threshold_percentage: number
  amount_spent: number
  budget_amount: number
}

export interface BudgetCheckResult {
  isWithinLimit: boolean
  remainingAmount: number
  percentageUsed: number
  alertType?: 'warning' | 'exceeded'
}

export type BudgetPeriodType = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
export type BudgetStatus = 'active' | 'paused' | 'completed' | 'exceeded'

class BudgetServiceImpl implements BudgetService {
  // Crear presupuesto
  async createBudget(budgetData: CreateBudgetData, userId: string): Promise<Budget> {
    if (!userId) {
      throw new Error('userId es requerido para crear un presupuesto')
    }

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...budgetData,
        user_id: userId,
        currency_code: budgetData.currency_code || 'CLP',
        alert_threshold: budgetData.alert_threshold || 0.8,
        warning_threshold: budgetData.warning_threshold || 0.9,
        rollover_unused: budgetData.rollover_unused || false,
        rollover_percentage: budgetData.rollover_percentage || 1.0,
        auto_adjust: budgetData.auto_adjust || false,
        auto_adjust_percentage: budgetData.auto_adjust_percentage || 0.05,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating budget:', error)
      throw new Error(`Error al crear presupuesto: ${error.message}`)
    }

    return data
  }

  // Actualizar presupuesto
  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase.from('budgets').update(updates).eq('id', id).select().single()

    if (error) {
      console.error('Error updating budget:', error)
      throw new Error(`Error al actualizar presupuesto: ${error.message}`)
    }

    return data
  }

  // Eliminar presupuesto
  async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase.from('budgets').delete().eq('id', id)

    if (error) {
      console.error('Error deleting budget:', error)
      throw new Error(`Error al eliminar presupuesto: ${error.message}`)
    }
  }

  // Obtener presupuestos del usuario con gastos calculados
  async getBudgets(userId: string): Promise<BudgetWithSpending[]> {
    const { data, error } = await supabase.from('budgets_with_spending').select('*').eq('user_id', userId).eq('status', 'active').order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching budgets:', error)
      throw new Error(`Error al obtener presupuestos: ${error.message}`)
    }

    return (
      data?.map((budget) => ({
        ...budget,
        spent_amount: budget.spent_amount || 0,
        remaining_amount: budget.remaining_amount || 0,
        percentage_used: budget.percentage_used || 0,
        category_name: budget.category_name,
        category_icon: budget.category_icon,
        category_color: budget.category_color,
      })) || []
    )
  }

  // Obtener presupuesto por ID
  async getBudgetById(id: string): Promise<Budget | null> {
    const { data, error } = await supabase.from('budgets').select('*').eq('id', id).single()

    if (error) {
      console.error('Error fetching budget by id:', error)
      return null
    }

    return data
  }

  // Obtener resumen de presupuestos usando la función SQL
  async getBudgetSummary(userId: string): Promise<BudgetSummary> {
    const { data, error } = await supabase.rpc('get_monthly_budget_summary', {
      p_user_id: userId,
    })

    if (error) {
      console.error('Error fetching budget summary:', error)
      throw new Error(`Error al obtener resumen de presupuestos: ${error.message}`)
    }

    const result = data?.[0] || {
      total_budget: 0,
      total_spent: 0,
      remaining_budget: 0,
      percentage: 0,
      status: 'good',
      projected_monthly_spending: 0,
      days_remaining: 0,
    }

    return {
      total_budget: result.total_budget,
      total_spent: result.total_spent,
      remaining_budget: result.remaining_budget,
      percentage: result.percentage,
      status: result.status as 'good' | 'warning' | 'danger',
      projected_monthly_spending: result.projected_monthly_spending,
      days_remaining: result.days_remaining,
    }
  }

  // Obtener alertas de presupuestos
  async getBudgetAlerts(userId: string): Promise<BudgetAlert[]> {
    const { data, error } = await supabase.from('budget_alerts').select('*').eq('user_id', userId).eq('is_acknowledged', false).order('triggered_at', { ascending: false })

    if (error) {
      console.error('Error fetching budget alerts:', error)
      throw new Error(`Error al obtener alertas: ${error.message}`)
    }

    return data || []
  }

  // Marcar alerta como leída
  async markAlertAsRead(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('budget_alerts')
      .update({
        is_acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId)

    if (error) {
      console.error('Error marking alert as read:', error)
      throw new Error(`Error al marcar alerta como leída: ${error.message}`)
    }
  }

  // Crear alerta de presupuesto
  async createBudgetAlert(alertData: CreateBudgetAlertData): Promise<BudgetAlert> {
    const { data, error } = await supabase.from('budget_alerts').insert(alertData).select().single()

    if (error) {
      console.error('Error creating budget alert:', error)
      throw new Error(`Error al crear alerta: ${error.message}`)
    }

    return data
  }

  // Verificar límites de presupuesto usando la nueva estructura
  async checkBudgetLimits(userId: string, categoryId: string, amount: number): Promise<BudgetCheckResult> {
    const { data, error } = await supabase.from('budgets_with_spending').select('*').eq('user_id', userId).eq('category_id', categoryId).eq('status', 'active').single()

    if (error || !data) {
      return {
        isWithinLimit: true,
        remainingAmount: 0,
        percentageUsed: 0,
      }
    }

    const currentSpent = data.spent_amount || 0
    const newTotalSpent = currentSpent + amount
    const percentageUsed = (newTotalSpent / data.amount) * 100
    const remainingAmount = data.amount - newTotalSpent

    let alertType: 'warning' | 'exceeded' | undefined
    if (percentageUsed >= 100) {
      alertType = 'exceeded'
    } else if (percentageUsed >= data.warning_threshold * 100) {
      alertType = 'warning'
    }

    return {
      isWithinLimit: percentageUsed <= 100,
      remainingAmount,
      percentageUsed,
      alertType,
    }
  }

  // Obtener transacciones de un presupuesto específico (directamente desde transactions)
  async getBudgetTransactions(budgetId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(
        `
        *,
        budgets!inner(*)
      `
      )
      .eq('budgets.id', budgetId)
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('Error fetching budget transactions:', error)
      throw new Error(`Error al obtener transacciones del presupuesto: ${error.message}`)
    }

    return data || []
  }

  // Obtener fechas del período
  getBudgetPeriodDates(periodType: BudgetPeriodType): { startDate: string; endDate: string } {
    const now = new Date()
    const startDate = new Date(now)
    const endDate = new Date(now)

    switch (periodType) {
      case 'weekly':
        // Inicio de semana (lunes)
        const dayOfWeek = now.getDay()
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        startDate.setDate(now.getDate() + daysToMonday)
        endDate.setDate(startDate.getDate() + 6)
        break
      case 'biweekly':
        // Inicio de quincena
        if (now.getDate() <= 15) {
          startDate.setDate(1)
          endDate.setDate(15)
        } else {
          startDate.setDate(16)
          endDate.setDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())
        }
        break
      case 'monthly':
        // Inicio de mes
        startDate.setDate(1)
        endDate.setDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())
        break
      case 'quarterly':
        // Inicio de trimestre
        const quarter = Math.floor(now.getMonth() / 3)
        startDate.setMonth(quarter * 3, 1)
        endDate.setMonth(quarter * 3 + 2, new Date(now.getFullYear(), quarter * 3 + 3, 0).getDate())
        break
      case 'yearly':
        // Inicio de año
        startDate.setMonth(0, 1)
        endDate.setMonth(11, 31)
        break
    }

    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  }
}

export const budgetService = new BudgetServiceImpl()

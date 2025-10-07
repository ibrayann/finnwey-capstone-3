import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface SupabaseBudget {
  id: string
  name: string
  description: string | null
  amount: number
  currency_code: string
  period_type: string
  start_date: string
  end_date: string
  alert_threshold: number
  warning_threshold: number
  status: string
  created_at: string
  updated_at: string
  category_id: string
  category_name: string
  category_type: string
  subcategory_name: string | null
}

export interface SupabaseCategory {
  id: string
  name: string
  description: string | null
  type: string
  is_active: boolean
}

export interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  remainingBudget: number
  percentage: number
  status: 'good' | 'warning' | 'danger'
  daysRemaining: number
}

export function useSupabaseBudgets(userId?: string) {
  const [budgets, setBudgets] = useState<SupabaseBudget[]>([])
  const [categories, setCategories] = useState<SupabaseCategory[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgetData = useCallback(async () => {
    try {
      setLoading(true)

      // ⚠️ SEGURIDAD: Validar userId
      if (!userId) {
        throw new Error('userId es requerido para obtener presupuestos')
      }

      // ✅ FILTRO DE SEGURIDAD: Obtener presupuestos con categorías SOLO del usuario
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select(
          `
          *,
          categories:category_id(name, type),
          subcategories:subcategory_id(name)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      console.log('🔐 Presupuestos filtrados por user_id:', userId)

      if (budgetsError) throw budgetsError

      // Obtener categorías
      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*').eq('is_active', true).order('name')

      if (categoriesError) throw categoriesError

      // Obtener transacciones del mes actual
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      // ✅ SEGURIDAD: Obtener transacciones SOLO del usuario
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(
          `
          *,
          categories:category_id(name, type)
        `
        )
        .eq('user_id', userId)
        .gte('transaction_date', startOfMonth.toISOString().split('T')[0])
        .lte('transaction_date', endOfMonth.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false })

      console.log('🔐 Transacciones filtradas por user_id:', userId)

      if (transactionsError) throw transactionsError

      // Procesar datos de presupuestos
      const processedBudgets =
        budgetsData?.map((budget) => ({
          ...budget,
          category_id: budget.category_id,
          category_name: budget.categories?.name || '',
          category_type: budget.categories?.type || '',
          subcategory_name: budget.subcategories?.name || null,
        })) || []

      setBudgets(processedBudgets)
      setCategories(categoriesData || [])
      setTransactions(transactionsData || [])
    } catch (err) {
      console.error('Error fetching budget data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchBudgetData()
    }
  }, [userId, fetchBudgetData])

  const getBudgetSummary = (): BudgetSummary => {
    const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0)
    const totalSpent = transactions.filter((t) => t.categories?.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount), 0)

    const remainingBudget = totalBudget - totalSpent
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    let status: 'good' | 'warning' | 'danger' = 'good'
    if (percentage >= 90) status = 'danger'
    else if (percentage >= 75) status = 'warning'

    // Calcular días restantes del mes
    const currentDate = new Date()
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const daysRemaining = Math.max(0, Math.ceil((endOfMonth.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)))

    return {
      totalBudget,
      totalSpent,
      remainingBudget,
      percentage,
      status,
      daysRemaining,
    }
  }

  const getActiveBudgets = () => {
    return budgets.filter((budget) => budget.status === 'active')
  }

  const getBudgetByCategory = (categoryId: string) => {
    return budgets.find((budget) => budget.category_id === categoryId)
  }

  const getSpentByCategory = (categoryId: string) => {
    return transactions.filter((t) => t.category_id === categoryId && t.categories?.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount), 0)
  }

  const getUnreadAlerts = () => {
    const alerts: any[] = []

    budgets.forEach((budget) => {
      const spent = getSpentByCategory(budget.category_id)
      const percentage = (spent / Number(budget.amount)) * 100

      if (percentage >= 100) {
        alerts.push({
          type: 'exceeded',
          message: `Has excedido el presupuesto de ${budget.name} por $${(spent - Number(budget.amount)).toLocaleString()}`,
          budgetId: budget.id,
        })
      } else if (percentage >= Number(budget.warning_threshold) * 100) {
        alerts.push({
          type: 'limit_warning',
          message: `Te acercas al límite de ${budget.name} (${percentage.toFixed(1)}%)`,
          budgetId: budget.id,
        })
      }
    })

    return alerts
  }

  return {
    budgets,
    categories,
    transactions,
    loading,
    error,
    getBudgetSummary,
    getActiveBudgets,
    getBudgetByCategory,
    getSpentByCategory,
    getUnreadAlerts,
    refetch: fetchBudgetData,
  }
}

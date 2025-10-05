import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'
import { queryKeys, invalidateQueries } from '@/lib/query-client'

export interface Budget {
  id: string
  user_id: string
  name: string
  description?: string
  category_id: string
  subcategory_id?: string
  amount: number
  currency_code: string
  period_type: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string
  alert_threshold: number
  warning_threshold: number
  rollover_unused: boolean
  rollover_percentage: number
  auto_adjust: boolean
  auto_adjust_percentage: number
  status: 'active' | 'paused' | 'completed' | 'exceeded'
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

// Hook para obtener todos los presupuestos del usuario usando la vista optimizada
export const useBudgets = () => {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: queryKeys.budgets.lists({ userId: user?.id }),
    queryFn: async (): Promise<BudgetWithSpending[]> => {
      if (!user?.id) return []

      const { data, error } = await supabase.from('budgets_with_spending').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching budgets:', error)
        throw error
      }

      return data || []
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

// Hook para obtener resumen de presupuestos usando la función SQL
export const useBudgetSummary = () => {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: [...queryKeys.budgets.all, 'summary', user?.id],
    queryFn: async (): Promise<BudgetSummary> => {
      if (!user?.id) {
        return {
          total_budget: 0,
          total_spent: 0,
          remaining_budget: 0,
          percentage: 0,
          status: 'good',
          projected_monthly_spending: 0,
          days_remaining: 0,
        }
      }

      const { data, error } = await supabase.rpc('get_monthly_budget_summary', {
        p_user_id: user.id,
      })

      if (error) {
        console.error('Error fetching budget summary:', error)
        throw error
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
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  })
}

// Hook para obtener alertas de presupuestos
export const useBudgetAlerts = () => {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: [...queryKeys.budgets.all, 'alerts', user?.id],
    queryFn: async (): Promise<BudgetAlert[]> => {
      if (!user?.id) return []

      const { data, error } = await supabase.from('budget_alerts').select('*').eq('user_id', user.id).eq('is_acknowledged', false).order('triggered_at', { ascending: false })

      if (error) {
        console.error('Error fetching budget alerts:', error)
        throw error
      }

      return data || []
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}

// Hook para crear un presupuesto
export const useCreateBudget = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (budgetData: {
      name: string
      description?: string
      category_id: string
      amount: number
      period_type: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
      start_date: string
      end_date: string
    }) => {
      if (!user?.id) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budgetData,
          user_id: user.id,
          currency_code: 'CLP',
          alert_threshold: 0.8,
          warning_threshold: 0.9,
          rollover_unused: false,
          rollover_percentage: 1.0,
          auto_adjust: false,
          auto_adjust_percentage: 0.05,
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating budget:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      invalidateQueries.budget()
    },
  })
}

// Hook para actualizar un presupuesto
export const useUpdateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Budget> }) => {
      const { data, error } = await supabase.from('budgets').update(updates).eq('id', id).select().single()

      if (error) {
        console.error('Error updating budget:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      invalidateQueries.budget()
    },
  })
}

// Hook para eliminar un presupuesto
export const useDeleteBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id)

      if (error) {
        console.error('Error deleting budget:', error)
        throw error
      }
    },
    onSuccess: () => {
      invalidateQueries.budget()
    },
  })
}

// Hook para marcar alerta como leída
export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('budget_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId)

      if (error) {
        console.error('Error marking alert as read:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.budgets.all, 'alerts'] })
    },
  })
}

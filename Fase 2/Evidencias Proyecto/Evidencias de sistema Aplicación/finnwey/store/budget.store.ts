import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Budget, BudgetAlert, BudgetSummary, BudgetAnalytics, BudgetPeriod, BudgetDistribution, BUDGET_CATEGORIES, AlertType } from '@/types/budget'
import { mockBudgetData } from '@/data/mockBudget'
import { budgetService, BudgetWithSpending } from '@/features/budgets/services/budget.service'
import { useAuthStore } from './auth.store'

interface BudgetState {
  budgets: BudgetWithSpending[]
  alerts: BudgetAlert[]
  monthlyIncome: number
  autoDistribution: BudgetDistribution
  isLoading: boolean
  error: string | null

  // Actions
  createBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  addSpending: (categoryId: string, amount: number) => Promise<void>

  // Analytics
  getBudgetSummary: () => BudgetSummary
  getBudgetAnalytics: () => BudgetAnalytics
  getActiveBudgets: () => BudgetWithSpending[]
  getCategoryBudget: (categoryId: string) => BudgetWithSpending | undefined

  // Alerts
  generateAlerts: () => Promise<void>
  markAlertAsRead: (alertId: string) => Promise<void>
  getUnreadAlerts: () => BudgetAlert[]

  // Data loading
  loadBudgets: () => Promise<void>
  loadAlerts: () => Promise<void>
  loadBudgetSummary: () => Promise<void>

  // Auto distribution
  setMonthlyIncome: (income: number) => void
  updateAutoDistribution: (distribution: BudgetDistribution) => void
  applyAutoDistribution: () => Promise<void>
}

// Función para calcular fechas del período
function getPeriodDates(period: BudgetPeriod): { startDate: Date; endDate: Date } {
  const now = new Date()
  const startDate = new Date(now)
  const endDate = new Date(now)

  switch (period) {
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
  }

  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)

  return { startDate, endDate }
}

// Función para generar alertas basadas en el presupuesto
function createAlert(budget: Budget, type: AlertType): BudgetAlert {
  const percentage = (budget.spent / budget.limit) * 100
  const remaining = budget.limit - budget.spent

  let title = ''
  let message = ''

  switch (type) {
    case 'limit_warning':
      title = '⚠️ Límite del 80% alcanzado'
      message = `Has gastado $${budget.spent.toLocaleString('es-CL')} de $${budget.limit.toLocaleString('es-CL')} en ${budget.category}`
      break
    case 'speed_warning':
      const daysRemaining = Math.ceil((budget.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      const dailySpending = budget.spent / (30 - daysRemaining || 1)
      const projectedSpending = dailySpending * 30
      title = '📊 Proyección de gasto alta'
      message = `A este ritmo gastarás $${Math.round(projectedSpending).toLocaleString('es-CL')} este mes en ${budget.category}`
      break
    case 'exceeded':
      title = '🚨 Presupuesto excedido'
      message = `Has superado tu presupuesto de ${budget.category} por $${Math.abs(remaining).toLocaleString('es-CL')}`
      break
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    budgetId: budget.id,
    type,
    title,
    message,
    percentage,
    isRead: false,
    createdAt: new Date(),
  }
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],
      alerts: [],
      monthlyIncome: 0,
      isLoading: false,
      error: null,
      autoDistribution: {
        necessary: 50, // 50% gastos necesarios
        discretionary: 30, // 30% gastos discrecionales
        savings: 20, // 20% ahorros
      },

      createBudget: async (budgetData) => {
        try {
          set({ isLoading: true, error: null })

          const { user } = useAuthStore.getState()
          if (!user?.id) {
            throw new Error('Usuario no autenticado')
          }

          const { startDate, endDate } = budgetService.getBudgetPeriodDates(budgetData.period_type)

          await budgetService.createBudget(
            {
              ...budgetData,
              start_date: startDate,
              end_date: endDate,
            },
            user.id
          )

          // Recargar presupuestos después de crear
          await get().loadBudgets()
        } catch (error) {
          console.error('Error creating budget:', error)
          set({ error: error instanceof Error ? error.message : 'Error al crear presupuesto' })
        } finally {
          set({ isLoading: false })
        }
      },

      updateBudget: async (id, updates) => {
        try {
          set({ isLoading: true, error: null })

          await budgetService.updateBudget(id, updates)

          // Recargar presupuestos después de actualizar
          await get().loadBudgets()
        } catch (error) {
          console.error('Error updating budget:', error)
          set({ error: error instanceof Error ? error.message : 'Error al actualizar presupuesto' })
        } finally {
          set({ isLoading: false })
        }
      },

      deleteBudget: async (id) => {
        try {
          set({ isLoading: true, error: null })

          await budgetService.deleteBudget(id)

          // Recargar presupuestos después de eliminar
          await get().loadBudgets()
        } catch (error) {
          console.error('Error deleting budget:', error)
          set({ error: error instanceof Error ? error.message : 'Error al eliminar presupuesto' })
        } finally {
          set({ isLoading: false })
        }
      },

      addSpending: async (categoryId, amount) => {
        try {
          set({ isLoading: true, error: null })

          // Verificar límites de presupuesto
          const { user } = useAuthStore.getState()
          if (!user?.id) return

          const budgetCheck = await budgetService.checkBudgetLimits(user.id, categoryId, amount)

          // Si excede el límite, generar alerta
          if (budgetCheck.alertType) {
            const budget = get().getCategoryBudget(categoryId)
            if (budget) {
              await budgetService.createBudgetAlert({
                budget_id: budget.id,
                user_id: user.id,
                alert_type: budgetCheck.alertType,
                threshold_percentage: budgetCheck.percentageUsed,
                amount_spent: budget.spent_amount + amount,
                budget_amount: budget.amount,
              })
            }
          }

          // Recargar datos después de agregar gasto
          await get().loadBudgets()
          await get().loadAlerts()
        } catch (error) {
          console.error('Error adding spending:', error)
          set({ error: error instanceof Error ? error.message : 'Error al agregar gasto' })
        } finally {
          set({ isLoading: false })
        }
      },

      getBudgetSummary: () => {
        const activeBudgets = get().getActiveBudgets()
        const totalBudget = activeBudgets.reduce((sum, budget) => sum + budget.amount, 0)
        const totalSpent = activeBudgets.reduce((sum, budget) => sum + budget.spent_amount, 0)
        const remainingBudget = totalBudget - totalSpent
        const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

        let status: 'good' | 'warning' | 'danger' = 'good'
        if (percentage >= 100) status = 'danger'
        else if (percentage >= 80) status = 'warning'

        // Calcular proyección mensual basada en tendencias
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const daysPassed = Math.ceil((now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24))
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const projectedMonthlySpending = daysPassed > 0 ? (totalSpent / daysPassed) * daysInMonth : totalSpent

        return {
          totalBudget,
          totalSpent,
          remainingBudget,
          percentage,
          status,
          projectedMonthlySpending,
          daysRemaining: daysInMonth - daysPassed,
        }
      },

      getBudgetAnalytics: () => {
        const currentSummary = get().getBudgetSummary()
        const activeBudgets = get().getActiveBudgets()

        // Análisis por categorías
        const mostSpent = [...activeBudgets].sort((a, b) => b.spent - a.spent).slice(0, 3)

        const overBudget = activeBudgets.filter((budget) => budget.spent > budget.limit)
        const onTrack = activeBudgets.filter((budget) => {
          const percentage = (budget.spent / budget.limit) * 100
          return percentage <= 80 && percentage > 0
        })

        return {
          currentPeriod: currentSummary,
          previousPeriod: currentSummary, // TODO: Implementar período anterior
          trend: 'stable' as const,
          categories: {
            mostSpent,
            overBudget,
            onTrack,
          },
        }
      },

      getActiveBudgets: () => {
        const now = new Date()
        return get().budgets.filter((budget) => budget.status === 'active' && now >= new Date(budget.start_date) && now <= new Date(budget.end_date))
      },

      getCategoryBudget: (categoryId) => {
        return get()
          .getActiveBudgets()
          .find((budget) => budget.category_id === categoryId)
      },

      generateAlerts: async () => {
        try {
          const { user } = useAuthStore.getState()
          if (!user?.id) return

          const activeBudgets = get().getActiveBudgets()

          for (const budget of activeBudgets) {
            const percentage = (budget.spent_amount / budget.amount) * 100

            // Alerta al 80% del límite
            if (percentage >= 80 && percentage < 100) {
              await budgetService.createBudgetAlert({
                budget_id: budget.id,
                user_id: user.id,
                alert_type: 'warning',
                threshold_percentage: percentage,
                amount_spent: budget.spent_amount,
                budget_amount: budget.amount,
              })
            }

            // Alerta por presupuesto excedido
            if (percentage >= 100) {
              await budgetService.createBudgetAlert({
                budget_id: budget.id,
                user_id: user.id,
                alert_type: 'exceeded',
                threshold_percentage: percentage,
                amount_spent: budget.spent_amount,
                budget_amount: budget.amount,
              })
            }
          }

          // Recargar alertas después de generar
          await get().loadAlerts()
        } catch (error) {
          console.error('Error generating alerts:', error)
        }
      },

      markAlertAsRead: async (alertId) => {
        try {
          await budgetService.markAlertAsRead(alertId)

          // Actualizar estado local
          set((state) => ({
            alerts: state.alerts.map((alert) => (alert.id === alertId ? { ...alert, isRead: true } : alert)),
          }))
        } catch (error) {
          console.error('Error marking alert as read:', error)
        }
      },

      getUnreadAlerts: () => {
        return get().alerts.filter((alert) => !alert.isRead)
      },

      // Funciones de carga de datos
      loadBudgets: async () => {
        try {
          set({ isLoading: true, error: null })

          const { user } = useAuthStore.getState()
          if (!user?.id) return

          const budgets = await budgetService.getBudgets(user.id)
          set({ budgets })
        } catch (error) {
          console.error('Error loading budgets:', error)
          set({ error: error instanceof Error ? error.message : 'Error al cargar presupuestos' })
        } finally {
          set({ isLoading: false })
        }
      },

      loadAlerts: async () => {
        try {
          const { user } = useAuthStore.getState()
          if (!user?.id) return

          const alerts = await budgetService.getBudgetAlerts(user.id)
          set({ alerts })
        } catch (error) {
          console.error('Error loading alerts:', error)
        }
      },

      loadBudgetSummary: async () => {
        try {
          const { user } = useAuthStore.getState()
          if (!user?.id) return

          const summary = await budgetService.getBudgetSummary(user.id)
          // El resumen se calcula dinámicamente, no se almacena
        } catch (error) {
          console.error('Error loading budget summary:', error)
        }
      },

      setMonthlyIncome: (income) => {
        set({ monthlyIncome: income })
      },

      updateAutoDistribution: (distribution) => {
        set({ autoDistribution: distribution })
      },

      applyAutoDistribution: async () => {
        try {
          const { monthlyIncome, autoDistribution } = get()
          if (monthlyIncome <= 0) return

          const { user } = useAuthStore.getState()
          if (!user?.id) return

          const necessaryBudget = (monthlyIncome * autoDistribution.necessary) / 100
          const discretionaryBudget = (monthlyIncome * autoDistribution.discretionary) / 100

          // Crear presupuestos automáticos para categorías principales
          const mainCategories = [
            { id: 'food', type: 'necessary', portion: 0.3 },
            { id: 'transportation', type: 'necessary', portion: 0.2 },
            { id: 'utilities', type: 'necessary', portion: 0.15 },
            { id: 'health', type: 'necessary', portion: 0.1 },
            { id: 'entertainment', type: 'discretionary', portion: 0.4 },
            { id: 'dining', type: 'discretionary', portion: 0.3 },
            { id: 'shopping', type: 'discretionary', portion: 0.2 },
          ]

          for (const { id, type, portion } of mainCategories) {
            const category = BUDGET_CATEGORIES.find((cat) => cat.id === id)
            if (!category) continue

            const baseBudget = type === 'necessary' ? necessaryBudget : discretionaryBudget
            const limit = Math.round(baseBudget * portion)

            const { startDate, endDate } = budgetService.getBudgetPeriodDates('monthly')

            await budgetService.createBudget(
              {
                name: `Presupuesto ${category.name}`,
                category_id: id,
                amount: limit,
                period_type: 'monthly',
                start_date: startDate,
                end_date: endDate,
              },
              user.id
            )
          }

          // Recargar presupuestos después de crear
          await get().loadBudgets()
        } catch (error) {
          console.error('Error applying auto distribution:', error)
        }
      },
    }),
    {
      name: 'budget-store',
      partialize: (state) => ({
        monthlyIncome: state.monthlyIncome,
        autoDistribution: state.autoDistribution,
        // No persistir budgets ni alerts ya que vienen de Supabase
      }),
    }
  )
)

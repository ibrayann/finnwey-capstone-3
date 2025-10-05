import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GoalsService } from '../services/goals.service'
import { queryKeys, invalidateQueries } from '@/lib/query-client'
import { FinancialGoal, GoalContribution, GoalMilestone, CreateGoalRequest, UpdateGoalRequest, ContributionRequest, SavingsData } from '@/types/savings'
import { useAuthStore } from '@/store/auth.store'

// ========== GOALS HOOKS ==========

/**
 * Hook para obtener todas las goals del usuario
 * ⚠️ SEGURIDAD: Requiere userId obligatoriamente
 */
export const useGoals = (filters?: { status?: string; goal_type?: string; priority?: string; includeRelations?: boolean; userId?: string }) => {
  return useQuery({
    queryKey: queryKeys.goals.list(filters || {}),
    queryFn: async () => {
      console.log('🔄 useGoals - Iniciando query con filtros:', filters)
      return await GoalsService.getGoals(filters)
    },
    enabled: !!filters?.userId, // ✅ Solo ejecutar si hay userId
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  })
}

/**
 * Hook para obtener una goal específica
 */
export const useGoal = (id: string, includeRelations = true) => {
  return useQuery({
    queryKey: queryKeys.goals.detail(id),
    queryFn: async () => {
      return await GoalsService.getGoal(id, includeRelations)
    },
    enabled: !!id,
  })
}

/**
 * Hook para crear una nueva goal
 */
export const useCreateGoal = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (goalData: CreateGoalRequest) => {
      console.log('🚀 useCreateGoal - Creando goal:', goalData)
      if (!user?.id) {
        throw new Error('Usuario no autenticado')
      }
      return await GoalsService.createGoal(goalData, user.id)
    },
    onSuccess: (newGoal) => {
      console.log('🔄 Invalidando queries después de crear goal')
      // Invalidar las queries relacionadas para refrescar los datos
      invalidateQueries.goals()

      // Actualizar el cache optimísticamente
      queryClient.setQueryData(queryKeys.goals.list({}), (oldData: FinancialGoal[] | undefined) => {
        if (!oldData) return [newGoal]
        return [newGoal, ...oldData]
      })
    },
    onError: (error) => {
      console.error('❌ Error en useCreateGoal:', error)
    },
  })
}

/**
 * Hook para actualizar una goal
 */
export const useUpdateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Omit<UpdateGoalRequest, 'id'>) => {
      return await GoalsService.updateGoal(id, updateData)
    },
    onSuccess: (data) => {
      // Invalidar queries específicas
      invalidateQueries.goals()
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(data.id) })
    },
  })
}

/**
 * Hook para eliminar una goal
 */
export const useDeleteGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await GoalsService.deleteGoal(id)
    },
    onSuccess: (id) => {
      // Invalidar queries y remover del cache
      invalidateQueries.goals()
      queryClient.removeQueries({ queryKey: queryKeys.goals.detail(id) })
    },
  })
}

// ========== CONTRIBUTIONS HOOKS ==========

/**
 * Hook para obtener contribuciones de una goal
 */
export const useGoalContributions = (
  goalId: string,
  filters?: {
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }
) => {
  return useQuery({
    queryKey: queryKeys.goals.contributions(goalId),
    queryFn: async () => {
      console.log('🔄 useGoalContributions - Obteniendo contribuciones para goal:', goalId)
      return await GoalsService.getContributions(goalId, filters)
    },
    enabled: !!goalId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  })
}

/**
 * Hook para agregar una contribución a una goal
 */
export const useAddContribution = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contribution: ContributionRequest) => {
      console.log('🚀 useAddContribution - Agregando contribución:', contribution)
      return await GoalsService.addContribution(contribution)
    },
    onSuccess: (newContribution) => {
      console.log('🔄 Invalidando queries después de agregar contribución')
      // Invalidar queries relacionadas
      invalidateQueries.goals()
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.contributions(newContribution.goal_id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.detail(newContribution.goal_id),
      })

      // Actualizar el cache optimísticamente
      queryClient.setQueryData(queryKeys.goals.contributions(newContribution.goal_id), (oldData: GoalContribution[] | undefined) => {
        if (!oldData) return [newContribution]
        return [newContribution, ...oldData]
      })
    },
    onError: (error) => {
      console.error('❌ Error en useAddContribution:', error)
    },
  })
}

// ========== MILESTONES HOOKS ==========

/**
 * Hook para obtener milestones de una goal
 */
export const useGoalMilestones = (goalId: string) => {
  return useQuery({
    queryKey: queryKeys.goals.milestones(goalId),
    queryFn: async () => {
      return await GoalsService.getMilestones(goalId)
    },
    enabled: !!goalId,
  })
}

/**
 * Hook para crear milestones por defecto
 */
export const useCreateDefaultMilestones = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ goalId, targetAmount }: { goalId: string; targetAmount: number }) => {
      return await GoalsService.createDefaultMilestones(goalId, targetAmount)
    },
    onSuccess: (milestones, { goalId }) => {
      // Actualizar el cache
      queryClient.setQueryData(queryKeys.goals.milestones(goalId), milestones)
    },
  })
}

// ========== STATISTICS HOOKS ==========

/**
 * Hook para obtener estadísticas de goals
 * ⚠️ SEGURIDAD: Requiere userId obligatoriamente
 */
export const useGoalsStats = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.goals.stats(),
    queryFn: async () => {
      console.log('📊 useGoalsStats - Calculando estadísticas')
      return await GoalsService.getGoalsStats(userId)
    },
    enabled: !!userId, // ✅ Solo ejecutar si hay userId
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  })
}

// ========== SAVINGS DATA HOOKS ==========

/**
 * Hook para obtener datos completos de savings (compatible con estructura actual)
 */
export const useSavingsData = (userId?: string) => {
  return useQuery({
    queryKey: ['savings', 'data', userId],
    queryFn: async () => {
      console.log('🔄 useSavingsData - Generando datos completos de savings')
      return await GoalsService.generateSavingsData(userId)
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  })
}

// ========== CONVENIENCE HOOKS ==========

/**
 * Hook para obtener goals activas
 */
export const useActiveGoals = (userId?: string) => {
  return useGoals({
    status: 'active',
    includeRelations: true,
    userId,
  })
}

/**
 * Hook para obtener goals completadas
 */
export const useCompletedGoals = (userId?: string) => {
  return useGoals({
    status: 'completed',
    includeRelations: true,
    userId,
  })
}

/**
 * Hook para obtener goals por tipo
 */
export const useGoalsByType = (goalType: string, userId?: string) => {
  return useGoals({
    goal_type: goalType,
    includeRelations: true,
    userId,
  })
}

/**
 * Hook para obtener goals por prioridad
 */
export const useGoalsByPriority = (priority: string, userId?: string) => {
  return useGoals({
    priority,
    includeRelations: true,
    userId,
  })
}

/**
 * Hook para obtener contribuciones recientes de una goal
 */
export const useRecentContributions = (goalId: string, limit = 5) => {
  return useGoalContributions(goalId, { limit })
}

/**
 * Hook para obtener contribuciones de un período específico
 */
export const useContributionsByPeriod = (goalId: string, startDate: string, endDate: string) => {
  return useGoalContributions(goalId, { start_date: startDate, end_date: endDate })
}

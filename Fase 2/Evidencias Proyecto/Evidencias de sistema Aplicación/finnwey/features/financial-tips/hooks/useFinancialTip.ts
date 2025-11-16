import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FinancialTipService, FinancialTip, GenerateTipResponse } from '../services/financial-tip.service'

/**
 * Hook para generar un tip financiero personalizado
 */
export function useGenerateFinancialTip() {
  const queryClient = useQueryClient()

  return useMutation<GenerateTipResponse, Error, { categoryId?: string; budgetId?: string; goalId?: string }>({
    mutationFn: ({ categoryId, budgetId, goalId }) => FinancialTipService.generateTip(categoryId, budgetId, goalId),
    onSuccess: () => {
      // Invalidar cache de tips para refrescar la lista automáticamente
      queryClient.invalidateQueries({ queryKey: ['financial-tips'] })
      // También forzar refetch inmediato para que se actualice la lista
      queryClient.refetchQueries({ queryKey: ['financial-tips'] })
    },
  })
}

/**
 * Hook para obtener tips activos del usuario
 * @param limit - Número máximo de tips a obtener
 * @param categoryId - ID de la categoría para filtrar tips (opcional)
 * @param goalId - ID de la meta financiera para filtrar tips (opcional)
 */
export function useActiveFinancialTips(limit: number = 10, categoryId?: string, goalId?: string) {
  return useQuery({
    queryKey: ['financial-tips', 'active', limit, categoryId, goalId],
    queryFn: () => FinancialTipService.getActiveTips(limit, categoryId, goalId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook para descartar un tip
 */
export function useDismissTip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tipId: string) => FinancialTipService.dismissTip(tipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-tips'] })
    },
  })
}

/**
 * Hook para registrar una acción sobre un tip
 */
export function useTipAction() {
  return useMutation({
    mutationFn: ({ tipId, actionType }: { tipId: string; actionType: 'clicked' | 'applied' | 'dismissed' | 'shared' | 'bookmarked' }) => FinancialTipService.recordTipAction(tipId, actionType),
  })
}

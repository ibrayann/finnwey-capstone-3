import { useQuery } from '@tanstack/react-query'
import { getReportData, ReportPeriod } from '../services/report.service'
import { PeriodData } from '@/types/reports'

/**
 * Hook para obtener datos de reporte por período
 */
export function useReportData(userId: string | undefined, period: ReportPeriod) {
  return useQuery<PeriodData>({
    queryKey: ['reports', userId, period],
    queryFn: () => {
      if (!userId) {
        throw new Error('userId es requerido para obtener reportes')
      }
      return getReportData(userId, period)
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  })
}

/**
 * Hook para obtener datos de reporte para todos los períodos
 */
export function useAllReportData(userId: string | undefined) {
  const dayQuery = useReportData(userId, 'day')
  const weekQuery = useReportData(userId, 'week')
  const monthQuery = useReportData(userId, 'month')

  return {
    day: dayQuery,
    week: weekQuery,
    month: monthQuery,
    isLoading: dayQuery.isLoading || weekQuery.isLoading || monthQuery.isLoading,
    isError: dayQuery.isError || weekQuery.isError || monthQuery.isError,
  }
}


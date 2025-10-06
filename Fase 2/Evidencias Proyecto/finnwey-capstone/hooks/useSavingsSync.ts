import { invalidateQueries } from '@/lib/query-client'
import { useAuthStore } from '@/store/auth.store'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

/**
 * Hook personalizado para sincronizar automáticamente los datos de savings
 * Se ejecuta cuando el usuario cambia o cuando se monta el componente
 */
export const useSavingsSync = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (user?.id) {
      console.log('🔄 useSavingsSync - Sincronizando datos de savings para usuario:', user.id)

      // Invalidar datos de savings para forzar una nueva consulta
      invalidateQueries.savings(user.id)
    }
  }, [user?.id])

  return {
    refreshSavings: () => (user?.id ? invalidateQueries.savings(user.id) : Promise.resolve()),
  }
}

import { useAuthStore } from '@/store/auth.store'
import { useFinanceStore } from '@/store/finance.store'
import { useEffect } from 'react'

/**
 * Hook personalizado para sincronizar automáticamente el store de finanzas con Supabase
 * Se ejecuta cuando el usuario cambia o cuando se monta el componente
 */
export const useFinanceSync = () => {
  const { user } = useAuthStore()
  const { syncWithSupabase, isLoading, lastSyncDate } = useFinanceStore()

  useEffect(() => {
    if (user?.id) {
      console.log('🔄 useFinanceSync - Sincronizando automáticamente para usuario:', user.id)

      // Solo sincronizar si no se ha sincronizado recientemente (últimos 30 segundos)
      const shouldSync = !lastSyncDate || Date.now() - lastSyncDate.getTime() > 30000

      if (shouldSync) {
        syncWithSupabase(user.id).catch((error) => {
          console.error('❌ Error en sincronización automática:', error)
        })
      } else {
        console.log('ℹ️ Sincronización reciente detectada, omitiendo')
      }
    }
  }, [user?.id, syncWithSupabase, lastSyncDate])

  return {
    isLoading,
    lastSyncDate,
    syncWithSupabase: () => (user?.id ? syncWithSupabase(user.id) : Promise.resolve()),
  }
}

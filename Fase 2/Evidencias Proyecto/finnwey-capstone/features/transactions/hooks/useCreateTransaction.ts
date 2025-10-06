import { StorageService } from '@/features/storage/services/storage.service'
import { invalidateQueries } from '@/lib/query-client'
import { supabase } from '@/lib/supabase'
import { useFinanceStore } from '@/store/finance.store'
import { ReceiptData } from '@/types/receipt'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { CreateTransactionInput, TransactionService } from '../services/transaction.service'

export function useCreateTransaction() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { refreshFromSupabase } = useFinanceStore()

  /**
   * Crea una transacción completa: sube imagen, guarda transacción y receipt
   */
  const createTransactionWithReceipt = async (input: CreateTransactionInput, imageUri?: string, receiptData?: ReceiptData): Promise<{ success: boolean; transactionId?: string }> => {
    setIsCreating(true)
    setError(null)

    try {
      console.log('🎯 useCreateTransaction.createTransactionWithReceipt - Iniciando proceso')
      console.log('📝 Input recibido:', JSON.stringify(input, null, 2))
      console.log('🖼️ Image URI:', imageUri)
      console.log('🧾 Receipt Data:', receiptData ? 'Presente' : 'No presente')

      // Obtener usuario actual
      console.log('👤 Obteniendo usuario actual...')
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error('❌ Usuario no autenticado')
        throw new Error('Usuario no autenticado')
      }

      console.log('✅ Usuario autenticado:', user.id)

      let storageUrl: string | undefined

      // 1. Si hay imagen, subirla al storage
      if (imageUri) {
        console.log('📤 Subiendo imagen al storage...')
        storageUrl = await StorageService.uploadReceipt(imageUri, user.id)
        console.log('✅ Imagen subida exitosamente:', storageUrl)
      } else {
        console.log('ℹ️ No hay imagen para subir')
      }

      // 2. Crear la transacción
      console.log('💾 Creando transacción...')
      const transactionId = await TransactionService.createTransaction(
        {
          ...input,
          receiptData,
        },
        user.id
      )

      console.log('✅ Transacción creada con ID:', transactionId)

      // 3. Si hay receipt data y storage URL, crear el registro de receipt
      if (storageUrl && receiptData) {
        console.log('📄 Creando registro de receipt...')
        await TransactionService.createReceipt(transactionId, storageUrl, receiptData)
        console.log('✅ Receipt creado exitosamente')
      } else {
        console.log('ℹ️ No se creó registro de receipt (no hay storage URL o receipt data)')
      }

      console.log('🎉 Proceso completado exitosamente')

      // Invalidar queries para refrescar los datos
      console.log('🔄 Invalidando queries para actualizar la UI...')
      await invalidateQueries.transactions()
      await invalidateQueries.monthlyBalance(user.id)
      console.log('✅ Queries invalidadas: transacciones y balance mensual')

      // Sincronizar el store local con los datos actualizados de Supabase
      console.log('🔄 Sincronizando store local con Supabase...')
      await refreshFromSupabase(user.id)
      console.log('✅ Store local sincronizado exitosamente')

      return {
        success: true,
        transactionId,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear transacción'
      console.error('❌ Error en useCreateTransaction:', errorMessage)
      console.error('❌ Error completo:', err)
      setError(errorMessage)

      return {
        success: false,
      }
    } finally {
      setIsCreating(false)
    }
  }

  const reset = () => {
    setIsCreating(false)
    setError(null)
  }

  return {
    createTransactionWithReceipt,
    isCreating,
    error,
    reset,
  }
}

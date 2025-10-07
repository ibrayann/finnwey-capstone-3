import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys, invalidateQueries } from '@/lib/query-client'

// Tipos de datos basados en el esquema real de Supabase
export interface Transaction {
  id: string
  user_id: string
  transaction_type_id: string
  merchant_name: string
  category_id: string
  subcategory_id: string
  amount: number
  currency_code: string
  transaction_date: string
  description: string
  notes?: string
  is_recurring: boolean
  source: string
  confidence_score?: number
  metadata?: any
  created_at: string
  updated_at: string

  // Relaciones (cuando se incluyan en el select)
  transaction_type?: {
    id: string
    name: string
  }
  category?: {
    id: string
    name: string
  }
  subcategory?: {
    id: string
    name: string
  }
}

export interface CreateTransactionData {
  amount: number
  description: string
  category_id: string
  subcategory_id?: string
  transaction_date: string
  transaction_type_id: string
  merchant_name?: string
  notes?: string
  currency_code?: string
  source?: string
  metadata?: any
}

// Hook para obtener todas las transacciones DEL USUARIO ACTUAL
export const useTransactions = (filters?: { category?: string; type?: string; month?: string; limit?: number; includeRelations?: boolean; userId?: string }) => {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters || {}),
    queryFn: async () => {
      console.log('🔄 useTransactions - Iniciando query con filtros:', filters)

      // ⚠️ IMPORTANTE: Siempre filtrar por user_id para seguridad
      if (!filters?.userId) {
        throw new Error('userId es requerido para obtener transacciones')
      }

      // Construir el select con relaciones si se solicitan
      const selectFields = filters?.includeRelations ? `*, transaction_type:transaction_types(id, name), category:categories(id, name), subcategory:subcategories(id, name)` : '*'

      // ✅ FILTRO DE SEGURIDAD: Solo transacciones del usuario actual
      let query = supabase.from('transactions').select(selectFields).eq('user_id', filters.userId).order('created_at', { ascending: false })

      console.log('🔐 Filtrando por user_id:', filters.userId)

      // Aplicar filtros dinámicamente
      if (filters?.category) {
        query = query.eq('category_id', filters.category)
        console.log('🏷️ Filtro por categoría:', filters.category)
      }

      if (filters?.type) {
        query = query.eq('transaction_type_id', filters.type)
        console.log('🏷️ Filtro por tipo:', filters.type)
      }

      if (filters?.month) {
        const startDate = `${filters.month}-01`
        const endDate = `${filters.month}-31`
        query = query.gte('transaction_date', startDate).lte('transaction_date', endDate)
        console.log('📅 Filtro por mes:', filters.month, 'desde', startDate, 'hasta', endDate)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
        console.log('📊 Límite aplicado:', filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error en useTransactions:', error)
        throw new Error(`Error al obtener transacciones: ${error.message}`)
      }

      console.log('✅ useTransactions - Transacciones obtenidas:', data?.length || 0)

      // @ts-ignore - Ignorar errores de tipo de Supabase para obtener receipts
      // Obtener receipts para las transacciones
      if (data && data.length > 0) {
        // @ts-ignore
        const transactionIds = data.map((t) => t.id)
        const { data: receipts, error: receiptsError } = await supabase.from('receipts').select('*').in('transaction_id', transactionIds)

        if (!receiptsError && receipts) {
          console.log('✅ Receipts obtenidos:', receipts.length)
          // @ts-ignore
          // Mapear receipts a transacciones
          const transactionsWithReceipts = data.map((transaction) => {
            // @ts-ignore
            const receipt = receipts.find((r) => r.transaction_id === transaction.id)
            if (receipt) {
              return {
                // @ts-ignore
                ...transaction,
                metadata: {
                  // @ts-ignore
                  ...(transaction.metadata || {}),
                  hasReceipt: true,
                  receiptImage: receipt.storage_url,
                  receiptId: receipt.id,
                },
              }
            }
            return transaction
          })
          return transactionsWithReceipts as unknown as Transaction[]
        }
      }

      return data as unknown as Transaction[]
    },
    enabled: !!filters?.userId, // Solo ejecutar si tenemos userId
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
  })
}

// Hook para obtener una transacción específica
export const useTransaction = (id: string, includeRelations = true) => {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id),
    queryFn: async () => {
      const selectFields = includeRelations ? `*, transaction_type:transaction_types(id, name), category:categories(id, name), subcategory:subcategories(id, name)` : '*'

      const { data, error } = await supabase.from('transactions').select(selectFields).eq('id', id).single()

      if (error) {
        throw new Error(error.message)
      }

      return data as unknown as Transaction
    },
    enabled: !!id,
  })
}

// Hook para obtener el receipt de una transacción específica
export const useTransactionReceipt = (transactionId: string) => {
  return useQuery({
    queryKey: ['receipts', transactionId],
    queryFn: async () => {
      console.log('📄 Buscando receipt para transacción:', transactionId)

      const { data, error } = await supabase.from('receipts').select('*').eq('transaction_id', transactionId).single()

      if (error) {
        // Si no hay receipt, retornar null en lugar de error
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No hay receipt para esta transacción')
          return null
        }
        console.error('❌ Error al obtener receipt:', error)
        throw new Error(error.message)
      }

      console.log('✅ Receipt encontrado:', data.id)
      return data
    },
    enabled: !!transactionId,
    staleTime: 10 * 60 * 1000, // 10 minutos (los receipts no cambian frecuentemente)
  })
}

// Hook para crear una nueva transacción
export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionData: CreateTransactionData) => {
      console.log('🚀 useCreateTransaction - Creando transacción:', transactionData)

      const { data, error } = await supabase.from('transactions').insert([transactionData]).select('*').single()

      if (error) {
        console.error('❌ Error al crear transacción:', error)
        throw new Error(`Error al crear transacción: ${error.message}`)
      }

      console.log('✅ Transacción creada exitosamente:', data)
      return data as Transaction
    },
    onSuccess: (newTransaction) => {
      console.log('🔄 Invalidando queries después de crear transacción')
      // Invalidar las queries relacionadas para refrescar los datos
      invalidateQueries.transactions()
      invalidateQueries.monthlyBalance(newTransaction.user_id)

      // Actualizar el cache optimísticamente
      queryClient.setQueryData(queryKeys.transactions.list({}), (oldData: Transaction[] | undefined) => {
        if (!oldData) return [newTransaction]
        return [newTransaction, ...oldData]
      })
    },
    onError: (error) => {
      console.error('❌ Error en useCreateTransaction:', error)
    },
  })
}

// Hook para actualizar una transacción
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateTransactionData>) => {
      const { data, error } = await supabase.from('transactions').update(updateData).eq('id', id).select().single()

      if (error) {
        throw new Error(error.message)
      }

      return data as unknown as Transaction
    },
    onSuccess: (data) => {
      // Invalidar queries específicas
      invalidateQueries.transactions()
      invalidateQueries.monthlyBalance(data.user_id)
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.detail(data.id) })
    },
  })
}

// Hook para eliminar una transacción
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Obtener el user_id antes de eliminar
      const { data: transaction } = await supabase.from('transactions').select('user_id').eq('id', id).single()

      const { error } = await supabase.from('transactions').delete().eq('id', id)

      if (error) {
        throw new Error(error.message)
      }

      return { id, userId: transaction?.user_id }
    },
    onSuccess: ({ id, userId }) => {
      // Invalidar queries y remover del cache
      invalidateQueries.transactions()
      if (userId) {
        invalidateQueries.monthlyBalance(userId)
      }
      queryClient.removeQueries({ queryKey: queryKeys.transactions.detail(id) })
    },
  })
}

// Hook para obtener estadísticas de transacciones
export const useTransactionStats = (month?: string) => {
  return useQuery({
    queryKey: ['transactions', 'stats', month],
    queryFn: async () => {
      console.log('📊 useTransactionStats - Calculando estadísticas para:', month)

      let query = supabase.from('transactions').select(`amount, transaction_type:transaction_types(name)`)

      if (month) {
        const startDate = `${month}-01`
        const endDate = `${month}-31`
        query = query.gte('transaction_date', startDate).lte('transaction_date', endDate)
        console.log('📅 Filtro por mes:', month, 'desde', startDate, 'hasta', endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error en useTransactionStats:', error)
        throw new Error(`Error al obtener estadísticas: ${error.message}`)
      }

      const stats = data.reduce(
        (acc, transaction) => {
          const type = (transaction.transaction_type as any)?.name
          if (type === 'income') {
            acc.totalIncome += transaction.amount
          } else if (type === 'expense') {
            acc.totalExpenses += transaction.amount
          }
          return acc
        },
        { totalIncome: 0, totalExpenses: 0 }
      )

      const result = {
        ...stats,
        netAmount: stats.totalIncome - stats.totalExpenses,
        transactionCount: data.length,
      }

      console.log('✅ Estadísticas calculadas:', result)
      return result
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  })
}

// Hook para obtener estadísticas del mes actual
export const useCurrentMonthStats = () => {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  return useTransactionStats(currentMonth)
}

// Hook para obtener transacciones recientes (últimas 5) DEL USUARIO ACTUAL
export const useRecentTransactions = (limit = 5, userId?: string) => {
  return useTransactions({
    limit,
    includeRelations: true,
    userId, // ✅ Requerir userId
  })
}

// Hook para obtener transacciones del mes actual
export const useCurrentMonthTransactions = () => {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  return useTransactions({
    month: currentMonth,
    includeRelations: true,
  })
}

// Hook para obtener transacciones de un mes específico
export const useTransactionsByMonth = (year: number, month: number) => {
  const monthString = `${year}-${String(month + 1).padStart(2, '0')}` // YYYY-MM
  return useTransactions({
    month: monthString,
    includeRelations: true,
  })
}

// Hook para obtener transacciones por categoría
export const useTransactionsByCategory = (categoryId: string, limit?: number) => {
  return useTransactions({
    category: categoryId,
    limit,
    includeRelations: true,
  })
}

// Hook para obtener transacciones por tipo
export const useTransactionsByType = (typeId: string, limit?: number) => {
  return useTransactions({
    type: typeId,
    limit,
    includeRelations: true,
  })
}

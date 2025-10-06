import { supabase } from '@/lib/supabase'
import { create } from 'zustand'

export interface Transaction {
  id: string
  amount: number
  title: string
  description: string
  type: 'income' | 'expense'
  category: string
  subcategory: string
  date: Date
  notes?: string
  hasReceipt: boolean
  receiptImage?: string
  isRecurring: boolean
  icon?: string
}

interface FinanceState {
  balance: number
  transferLimit: number
  spent: number
  income: number
  spending: number
  transactions: Transaction[]
  isLoading: boolean
  lastSyncDate: Date | null
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void
  syncWithSupabase: (userId: string) => Promise<void>
  refreshFromSupabase: (userId: string) => Promise<void>
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  balance: 0,
  transferLimit: 0,
  spent: 0,
  income: 0,
  spending: 0,
  transactions: [],
  isLoading: false,
  lastSyncDate: null,

  addTransaction: (transaction) =>
    set((state) => {
      const newTransaction = {
        ...transaction,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date(),
      }

      // Actualizar balance basado en el tipo de transacción
      const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount
      const newBalance = state.balance + balanceChange

      // Actualizar gastos o ingresos según el tipo
      const newSpending = transaction.type === 'expense' ? state.spending + transaction.amount : state.spending
      const newIncome = transaction.type === 'income' ? state.income + transaction.amount : state.income

      return {
        transactions: [newTransaction, ...state.transactions],
        balance: newBalance,
        spending: newSpending,
        income: newIncome,
      }
    }),

  /**
   * Sincroniza el store local con los datos de Supabase
   */
  syncWithSupabase: async (userId: string) => {
    console.log('🔄 FinanceStore - Sincronizando con Supabase para usuario:', userId)
    set({ isLoading: true })

    try {
      // Obtener balance mensual desde la vista
      const { data: monthlyBalance, error: balanceError } = await supabase
        .from('monthly_balance_summary')
        .select('*')
        .eq('user_id', userId)
        .order('month_year', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (balanceError) {
        console.error('❌ Error obteniendo balance mensual:', balanceError)
        throw balanceError
      }

      // Obtener transacciones recientes
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(
          `
          id,
          amount,
          merchant_name,
          description,
          transaction_date,
          notes,
          transaction_type:transaction_types(name),
          category:categories(name),
          subcategory:subcategories(name)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionsError) {
        console.error('❌ Error obteniendo transacciones:', transactionsError)
        throw transactionsError
      }

      // Mapear transacciones al formato local
      const mappedTransactions: Transaction[] = (transactions || []).map((t: any) => ({
        id: t.id,
        amount: t.amount,
        title: t.merchant_name,
        description: t.description,
        type: t.transaction_type?.name === 'income' ? 'income' : 'expense',
        category: t.category?.name || 'Otros',
        subcategory: t.subcategory?.name || 'General',
        date: new Date(t.transaction_date),
        notes: t.notes,
        hasReceipt: false, // TODO: Verificar si tiene receipt
        isRecurring: false,
      }))

      // Actualizar estado con datos de Supabase
      const newState = {
        balance: monthlyBalance?.net_balance || 0,
        transferLimit: monthlyBalance?.total_income || 0,
        spent: monthlyBalance?.total_expenses || 0,
        income: monthlyBalance?.total_income || 0,
        spending: monthlyBalance?.total_expenses || 0,
        transactions: mappedTransactions,
        isLoading: false,
        lastSyncDate: new Date(),
      }

      console.log('✅ FinanceStore - Sincronización exitosa:', {
        balance: newState.balance,
        transactions: newState.transactions.length,
        lastSync: newState.lastSyncDate,
      })

      set(newState)
    } catch (error) {
      console.error('❌ Error en syncWithSupabase:', error)
      set({ isLoading: false })
      throw error
    }
  },

  /**
   * Refresca los datos desde Supabase sin mantener transacciones locales
   */
  refreshFromSupabase: async (userId: string) => {
    console.log('🔄 FinanceStore - Refrescando desde Supabase para usuario:', userId)
    await get().syncWithSupabase(userId)
  },
}))

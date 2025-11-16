import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'

export interface MonthlyBalance {
  month_year: Date | string // En la vista es TIMESTAMPTZ, pero lo convertiremos a string
  user_id: string
  total_income: number
  total_expenses: number
  net_balance: number
  transaction_count: number
  first_transaction_date: string | null
  last_transaction_date: string | null
}

export const useMonthlyBalance = () => {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['monthly-balance', user?.id],
    queryFn: async (): Promise<MonthlyBalance | null> => {
      if (!user?.id) return null

      try {
        // Usar la vista monthly_balance_summary existente
        const { data, error } = await supabase.from('monthly_balance_summary').select('*').eq('user_id', user.id).order('month_year', { ascending: false }).limit(1).maybeSingle() // Usar maybeSingle() en lugar de single() para evitar error cuando no hay datos

        if (error) {
          console.error('Error fetching monthly balance:', error)
          return getDefaultBalance(user)
        }

        // Si no hay datos, retornar balance por defecto
        if (!data) {
          console.log('📊 No monthly balance data found, returning default balance')
          return getDefaultBalance(user)
        }

        const balance: MonthlyBalance = {
          month_year: data.month_year ? data.month_year.toString() : new Date().toISOString(),
          user_id: data.user_id,
          total_income: Number(data.total_income) || 0,
          total_expenses: Number(data.total_expenses) || 0,
          net_balance: Number(data.net_balance) || 0,
          transaction_count: Number(data.transaction_count) || 0,
          first_transaction_date: data.first_transaction_date ? data.first_transaction_date.toString() : null,
          last_transaction_date: data.last_transaction_date ? data.last_transaction_date.toString() : null,
        }

        console.log('📊 Monthly Balance Response:', {
          balance,
          user_id: user.id,
          timestamp: new Date().toISOString(),
        })

        return balance
      } catch (error) {
        console.error('Error in useMonthlyBalance:', error)
        return getDefaultBalance(user)
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
  })
}

// Función para generar balance por defecto
const getDefaultBalance = (user: any): MonthlyBalance => {
  const currentMonth = new Date()
  const monthYear = currentMonth.toISOString() // Usar formato ISO para consistencia con la vista

  return {
    month_year: monthYear,
    user_id: user.id,
    total_income: 0,
    total_expenses: 0,
    net_balance: 0,
    transaction_count: 0,
    first_transaction_date: null,
    last_transaction_date: null,
  }
}

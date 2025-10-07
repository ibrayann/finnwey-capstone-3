import { useMonthlyBalance } from '@/features/shared/hooks/useMonthlyBalance'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useFinanceSync } from '@/hooks/useFinanceSync'
import { useFinanceStore } from '@/store/finance.store'
import { Feather, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function FinancialOverview() {
  const { balance, transferLimit, spent } = useFinanceStore()
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const { isDarkMode } = useTheme()
  const { data: monthlyBalance } = useMonthlyBalance()

  // Sincronización automática del store con Supabase
  const { isLoading: isSyncing } = useFinanceSync()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible)
  }

  // Usar datos de Supabase como fuente principal, con fallback al store local
  const currentBalance = monthlyBalance?.net_balance ?? balance
  const currentIncome = monthlyBalance?.total_income ?? transferLimit
  const currentExpenses = monthlyBalance?.total_expenses ?? spent
  const expensePercentage = currentIncome > 0 ? Math.min((currentExpenses / currentIncome) * 100, 100) : 0

  return (
    <View className="p-4">
      <Text className="text-lg mb-2 text-white font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
        Seguimiento de tus objetivos financieros
      </Text>

      <View className="rounded-2xl px-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            {isBalanceVisible ? (
              <Text className="text-4xl font-bold text-white ml-1" style={{ textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                {formatCurrency(currentBalance)}
              </Text>
            ) : (
              <View className="flex-row ml-1">
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
                  <View key={index} className="w-6 h-8 mx-1 roaunded-lg bg-gray-500 overflow-hidden">
                    <View className="w-full h-full bg-gray-600 -rotate-45 -translate-x-2" />
                  </View>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity onPress={toggleBalanceVisibility} className="bg-white/15 rounded-full p-2">
            <Feather name={isBalanceVisible ? 'eye' : 'eye-off'} size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/90 font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              Ingresos vs Gastos
            </Text>
            <Text className="text-white font-semibold" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              {isBalanceVisible ? formatCurrency(currentIncome) : '••••••••'}
            </Text>
          </View>

          <View className="bg-white/25 h-3 rounded-full overflow-hidden shadow-sm">
            <View className="bg-white h-full rounded-full shadow-sm" style={{ width: `${expensePercentage}%` }} />
            <View className="absolute right-0 top-0 w-1 h-3 bg-white/50 rounded-full" />
          </View>

          <Text className="text-white/90 mt-2 font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
            Gastado {isBalanceVisible ? formatCurrency(currentExpenses) : '••••••••'}
          </Text>
        </View>

        <View className="flex-row justify-between mt-8">
          <TouchableOpacity className="items-center" onPress={() => router.push('/dashboard/add-transaction')}>
            <View className="w-14 h-14 bg-white/25 rounded-full items-center justify-center mb-2 shadow-sm">
              <Ionicons name="add-circle-outline" size={24} color="white" />
            </View>
            <Text className="text-white text-xs font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              Registrar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center" onPress={() => router.push('/dashboard/savings')}>
            <View className="w-14 h-14 bg-white/25 rounded-full items-center justify-center mb-2 shadow-sm">
              <Ionicons name="flag" size={24} color="white" />
            </View>
            <Text className="text-white text-xs font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              Metas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center" onPress={() => router.push('/dashboard/budget')}>
            <View className="w-14 h-14 bg-white/25 rounded-full items-center justify-center mb-2 shadow-sm">
              <Ionicons name="wallet-outline" size={24} color="white" />
            </View>
            <Text className="text-white text-xs font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              Presupuesto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center" onPress={() => router.push('/dashboard/report')}>
            <View className="w-14 h-14 bg-white/25 rounded-full items-center justify-center mb-2 shadow-sm">
              <Ionicons name="bar-chart-outline" size={24} color="white" />
            </View>
            <Text className="text-white text-xs font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              Reportes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

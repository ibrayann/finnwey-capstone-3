import { View, Text, Pressable } from 'react-native'
import { useFinanceStore } from '@/store/finance.store'
import { Feather, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useMonthlyBalance } from '@/features/shared/hooks/useMonthlyBalance'

export default function FinancialOverview() {
  const { balance, transferLimit, spent } = useFinanceStore()
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const { isDarkMode } = useTheme()
  const { data: monthlyBalance } = useMonthlyBalance()

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
                {monthlyBalance ? formatCurrency(monthlyBalance.net_balance) : balance.toLocaleString('es-CL', { minimumFractionDigits: 2 })}
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
          <Pressable onPress={toggleBalanceVisibility} className="bg-white/15 rounded-full p-2">
            <Feather name={isBalanceVisible ? 'eye' : 'eye-off'} size={24} color="white" />
          </Pressable>
        </View>

        <View className="mt-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/90 font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              Ingresos vs Gastos
            </Text>
            <Text className="text-white font-semibold" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              {isBalanceVisible ? (monthlyBalance ? `$${monthlyBalance.total_income.toLocaleString('es-CL')}` : `$${transferLimit.toLocaleString('es-CL')}`) : '••••••••'}
            </Text>
          </View>

          <View className="bg-white/25 h-3 rounded-full overflow-hidden shadow-sm">
            <View
              className="bg-white h-full rounded-full shadow-sm"
              style={{ width: `${monthlyBalance ? Math.min((monthlyBalance.total_expenses / monthlyBalance.total_income) * 100, 100) : (spent / transferLimit) * 100}%` }}
            />
            <View className="absolute right-0 top-0 w-1 h-3 bg-white/50 rounded-full" />
          </View>

          <Text className="text-white/90 mt-2 font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
            Gastado {isBalanceVisible ? (monthlyBalance ? `$${monthlyBalance.total_expenses.toLocaleString('en-US')}` : `$${spent.toLocaleString('en-US')}`) : '••••••••'}
          </Text>
        </View>

        <View className="flex-row justify-between mt-8">
          <Pressable className="items-center" onPress={() => router.push('/dashboard/add-transaction')}>
            <View className="w-14 h-14 bg-white/25 rounded-full items-center justify-center mb-2 shadow-sm">
              <Ionicons name="add-circle-outline" size={24} color="white" />
            </View>
            <Text className="text-white text-xs font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              Registrar
            </Text>
          </Pressable>

          <Pressable className="items-center" onPress={() => router.push('/dashboard/savings')}>
            <View className="w-14 h-14 bg-white/25 rounded-full items-center justify-center mb-2 shadow-sm">
              <Ionicons name="flag" size={24} color="white" />
            </View>
            <Text className="text-white text-xs font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              Metas
            </Text>
          </Pressable>

          <Pressable className="items-center" onPress={() => router.push('/dashboard/budget')}>
            <View className="w-14 h-14 bg-white/25 rounded-full items-center justify-center mb-2 shadow-sm">
              <Ionicons name="wallet-outline" size={24} color="white" />
            </View>
            <Text className="text-white text-xs font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              Presupuesto
            </Text>
          </Pressable>

          <Pressable className="items-center" onPress={() => router.push('/dashboard/report')}>
            <View className="w-14 h-14 bg-white/25 rounded-full items-center justify-center mb-2 shadow-sm">
              <Ionicons name="bar-chart-outline" size={24} color="white" />
            </View>
            <Text className="text-white text-xs font-medium" style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
              Reportes
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useMonthlyBalance } from '@/features/shared/hooks/useMonthlyBalance'

export default function WalletSummary() {
  const { isDarkMode } = useTheme()
  const { data: balance, isLoading, error } = useMonthlyBalance()

  // Console log para debug
  console.log('🔍 WalletSummary Debug:', {
    balance,
    isLoading,
    error,
    hasData: !!balance,
    timestamp: new Date().toISOString(),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resumen de cuenta</Text>
        </View>
        <View className="flex-row gap-x-4">
          <View className={`flex-1 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} items-center justify-center`}>
            <ActivityIndicator size="small" color={isDarkMode ? '#4CAF50' : '#4CAF50'} />
          </View>
          <View className={`flex-1 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} items-center justify-center`}>
            <ActivityIndicator size="small" color={isDarkMode ? '#22c55e' : '#22c55e'} />
          </View>
        </View>
      </View>
    )
  }

  // Manejar caso cuando hay error en la consulta (fuera de loading)
  if (error) {
    console.error('WalletSummary Error:', error)
    return (
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resumen de cuenta</Text>
        </View>
        <View className={`rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} items-center`}>
          <Text className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>Error al cargar datos</Text>
        </View>
      </View>
    )
  }

  // Si no hay balance o es null, mostrar valores por defecto
  if (!balance) {
    return (
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resumen de cuenta</Text>
          <TouchableOpacity>
            <Text className={isDarkMode ? 'text-green-400' : 'text-[#4CAF50]'}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-x-4">
          <View className={`flex-1 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <View className="w-12 h-12 bg-[#4CAF50] dark:bg-green-600 rounded-full items-center justify-center mb-2">
              <Feather name="trending-up" size={20} color="white" />
            </View>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ingresos</Text>
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(0)}</Text>
          </View>

          <View className={`flex-1 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <View className="w-12 h-12 bg-[#22c55e] rounded-full items-center justify-center mb-2">
              <Feather name="trending-down" size={20} color="white" />
            </View>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gastos</Text>
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(0)}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resumen de cuenta</Text>
        <TouchableOpacity>
          <Text className={isDarkMode ? 'text-green-400' : 'text-[#4CAF50]'}>Ver todas</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-x-4">
        <View className={`flex-1 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <View className="w-12 h-12 bg-[#4CAF50] dark:bg-green-600 rounded-full items-center justify-center mb-2">
            <Feather name="trending-up" size={20} color="white" />
          </View>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ingresos</Text>
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(balance.total_income)}</Text>
        </View>

        <View className={`flex-1 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <View className="w-12 h-12 bg-[#22c55e] rounded-full items-center justify-center mb-2">
            <Feather name="trending-down" size={20} color="white" />
          </View>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gastos</Text>
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(balance.total_expenses)}</Text>
        </View>
      </View>
    </View>
  )
}

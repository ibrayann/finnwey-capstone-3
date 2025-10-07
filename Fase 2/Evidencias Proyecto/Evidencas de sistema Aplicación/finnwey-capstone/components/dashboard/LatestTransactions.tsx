import { View, Text, TouchableOpacity, Image, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useRecentTransactions, Transaction } from '@/hooks/queries/useTransactions'
import { useAuthStore } from '@/store/auth.store'

export default function LatestTransactions() {
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const { user } = useAuthStore()

  // ✅ SEGURIDAD: Obtener transacciones recientes del usuario actual
  const { data: transactions = [], isLoading, error } = useRecentTransactions(5, user?.id)

  const renderTransaction = (transaction: Transaction) => {
    const transactionDate = new Date(transaction.transaction_date)
    const isExpense = transaction.transaction_type?.name === 'expense'

    return (
      <View key={transaction.id} className={`flex-row items-center py-4 p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <View className="flex-row items-center gap-3 flex-1 min-w-0">
          <View className={`w-12 h-12 rounded-full items-center justify-center overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex-shrink-0`}>
            <Text className="text-2xl">💰</Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`} numberOfLines={1} ellipsizeMode="tail">
              {transaction.merchant_name || transaction.description}
            </Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} numberOfLines={1} ellipsizeMode="tail">
              {transactionDate.toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'short',
              })}{' '}
              •{' '}
              {transactionDate.toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        <View className="flex-shrink-0 ml-3">
          <Text className={`text-lg font-semibold text-right ${isExpense ? 'text-red-500' : 'text-[#4CAF50] dark:text-green-400'}`}>
            {isExpense ? '-' : '+'}${transaction.amount.toLocaleString('es-CL')}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className={`flex-1 rounded-t-3xl -mt-5 px-5 pt-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-row items-center justify-between mb-4">
        <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Últimas transacciones</Text>
        <Pressable onPress={() => router.push('/(protected)/(tabs)/dashboard/transactions')}>
          <Text className={isDarkMode ? 'text-green-400' : 'text-[#4CAF50]'}>Ver todas</Text>
        </Pressable>
      </View>

      <View className="gap-2">
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color={isDarkMode ? '#4CAF50' : '#4CAF50'} />
            <Text className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cargando transacciones...</Text>
          </View>
        ) : error ? (
          <View className="py-8 items-center">
            <Text className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>Error al cargar transacciones</Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Intenta nuevamente</Text>
          </View>
        ) : transactions.length === 0 ? (
          <View className="py-8 items-center">
            <Text className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay transacciones recientes</Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Agrega tu primera transacción</Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <Pressable key={transaction.id} onPress={() => router.push(`/(protected)/(tabs)/dashboard/transactions/${transaction.id}`)}>
              {renderTransaction(transaction)}
            </Pressable>
          ))
        )}
      </View>
    </View>
  )
}

import { View, Text, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'

interface TransactionItemProps {
  title: string
  time: string
  amount: number
  imageUrl?: string
}

function TransactionItem({ title, time, amount, imageUrl }: TransactionItemProps) {
  const { isDarkMode } = useTheme()
  const isIncome = amount > 0

  return (
    <View className={`flex-row items-center rounded-2xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      <View className={`w-12 h-12 rounded-full overflow-hidden mr-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons name="card-outline" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
          </View>
        )}
      </View>

      <View className="flex-1">
        <Text className={`text-[17px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</Text>
        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{time}</Text>
      </View>

      <Text className={`text-lg font-semibold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}${Math.abs(amount).toLocaleString()}
      </Text>
    </View>
  )
}

export default TransactionItem

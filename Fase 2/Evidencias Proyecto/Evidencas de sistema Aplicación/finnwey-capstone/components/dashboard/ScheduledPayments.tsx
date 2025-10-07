import { View, Text, TouchableOpacity, Image } from 'react-native'
import { useTheme } from '@/features/shared/hooks/useTheme'

interface ScheduledPayment {
  id: string
  description: string
  amount: number
  type: 'expense' | 'income'
  date: {
    day: string
    month: string
  }
  time: string
  icon?: string
}

export default function ScheduledPayments() {
  const { isDarkMode } = useTheme()
  const payments: ScheduledPayment[] = [
    {
      id: '1',
      description: 'Freelance Salary',
      amount: 750,
      type: 'income',
      date: {
        day: '02',
        month: 'Jan',
      },
      time: '09.45 am',
      icon: '💰',
    },
    {
      id: '2',
      description: 'Behance Premium',
      amount: 150,
      type: 'expense',
      date: {
        day: '12',
        month: 'Jan',
      },
      time: '09.40 pm',
      icon: '🎨',
    },
  ]

  const renderPayment = (payment: ScheduledPayment) => (
    <View key={payment.id} className={`flex-row items-center rounded-3xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <View className={`w-16 h-16 rounded-2xl items-center justify-center mr-4 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <Text className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{payment.date.day}</Text>
        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{payment.date.month}</Text>
      </View>

      <View className="flex-1">
        <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{payment.description}</Text>
        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{payment.time}</Text>
      </View>

      <Text className={`text-lg font-semibold ${payment.type === 'expense' ? 'text-red-500' : 'text-[#4CAF50] dark:text-green-400'}`}>
        {payment.type === 'expense' ? '-' : '+'}${payment.amount}
      </Text>
    </View>
  )

  return (
    <View className="mt-6 px-5 pb-28">
      <View className="flex-row items-center justify-between mb-4">
        <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pagos programados</Text>
        <TouchableOpacity>
          <Text className={isDarkMode ? 'text-green-400' : 'text-[#4CAF50]'}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      {payments.map(renderPayment)}
    </View>
  )
}

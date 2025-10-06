import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native/'
import { useTheme } from '@/features/shared/hooks/useTheme'

interface IncomeAnalyticsProps {
  totalIncome: number
  percentageChange: number
  data: { x: string; y: number }[]
}

function IncomeAnalytics({ totalIncome, percentageChange, data }: IncomeAnalyticsProps) {
  const { isDarkMode } = useTheme()
  const screenWidth = Dimensions.get('window').width
  const chartWidth = screenWidth - 60

  return (
    <View className={`rounded-2xl p-4 border pb-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className={`text-[17px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Análisis de Ingresos</Text>
        <TouchableOpacity>
          <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>•••</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <Text className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ingreso Total</Text>
        <View className="flex-row items-center gap-3">
          <Text className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${totalIncome.toLocaleString()}</Text>
          <View className={`px-2 py-1 rounded-full ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
            <Text className="text-green-500 text-sm font-medium">+{percentageChange}%</Text>
          </View>
        </View>
      </View>

      <View className="h-28">
        <VictoryChart width={chartWidth} height={120} padding={{ top: 5, bottom: 20, left: 35, right: 10 }} domainPadding={{ x: 8 }} theme={VictoryTheme.material}>
          <VictoryAxis
            tickFormat={(t) => t}
            style={{
              axis: {
                stroke: isDarkMode ? '#374151' : '#e5e7eb',
                strokeWidth: 0.5,
              },
              tickLabels: {
                fill: isDarkMode ? '#9ca3af' : '#9ca3af',
                fontSize: 8,
              },
              grid: { stroke: 'transparent' },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `$${t / 1000}k`}
            style={{
              axis: {
                stroke: isDarkMode ? '#374151' : '#e5e7eb',
                strokeWidth: 0.5,
              },
              tickLabels: {
                fill: isDarkMode ? '#9ca3af' : '#9ca3af',
                fontSize: 8,
              },
              grid: {
                stroke: isDarkMode ? '#374151' : '#f3f4f6',
                strokeWidth: 0.5,
                strokeDasharray: '4',
              },
            }}
          />
          <VictoryBar
            data={data}
            style={{
              data: {
                fill: isDarkMode ? '#4ade80' : '#4CAF50',
                width: 25,
              },
            }}
            cornerRadius={{ top: 4 }}
            animate={{
              duration: 500,
              onLoad: { duration: 500 },
            }}
          />
        </VictoryChart>
      </View>
    </View>
  )
}

export default IncomeAnalytics

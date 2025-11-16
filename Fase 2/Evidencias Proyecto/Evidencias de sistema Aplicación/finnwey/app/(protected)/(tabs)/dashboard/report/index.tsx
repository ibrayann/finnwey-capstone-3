import { View, Text, TouchableOpacity, ScrollView, StatusBar, Modal, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Circle } from 'react-native-svg'
import { useState, useMemo } from 'react'
import IncomeAnalytics from './components/IncomeAnalytics'
import TransactionItem from './components/TransactionItem'
import DownloadModal from './components/DownloadModal'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useReportData } from '@/features/reports'
import { useAuthStore } from '@/store/auth.store'
import { PeriodData } from '@/types/reports'

const initialTabs = [
  { id: 1, label: 'Día', selected: true },
  { id: 2, label: 'Semana', selected: false },
  { id: 3, label: 'Mes', selected: false },
]

// Datos por defecto cuando no hay datos disponibles
const defaultPeriodData: PeriodData = {
  period: 'day',
  label: 'Hoy',
  dateRange: { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
  summary: {
    income: { amount: 0, currency: 'CLP', trend: 'stable', percentageChange: 0 },
    spending: { amount: 0, currency: 'CLP', trend: 'stable', percentageChange: 0 },
    balance: { amount: 0, currency: 'CLP' },
  },
  budget: {
    totalBudget: 0,
    spent: 0,
    remaining: 0,
    categories: [],
  },
  transactions: {
    total: 0,
    recent: [],
  },
  analytics: {
    chartType: 'line',
    data: [],
    insights: [{ type: 'trend', message: 'No hay datos disponibles para este período', value: 0 }],
  },
}

interface ProgressCircleProps {
  percentage: number
  color: string
  size?: number
}

// Componente para el círculo de progreso
const ProgressCircle = ({ percentage, color, size = 48 }: ProgressCircleProps) => {
  const { isDarkMode } = useTheme()
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Círculo de fondo */}
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={isDarkMode ? '#374151' : '#E5E7EB'} strokeWidth={strokeWidth} fill="transparent" />
      {/* Círculo de progreso */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="transparent"
        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
      />
    </Svg>
  )
}

export default function ReportScreen() {
  const [tabs, setTabs] = useState(initialTabs)
  const [showOptions, setShowOptions] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const { isDarkMode } = useTheme()
  const { user } = useAuthStore()

  const handleTabPress = (tabId: number) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => ({
        ...tab,
        selected: tab.id === tabId,
      }))
    )
  }

  // Obtener el período actual
  const getCurrentPeriod = (): 'day' | 'week' | 'month' => {
    const selectedTab = tabs.find((tab) => tab.selected)
    if (selectedTab?.label === 'Día') return 'day'
    if (selectedTab?.label === 'Semana') return 'week'
    return 'month'
  }

  const currentPeriod = getCurrentPeriod()
  const { data: currentPeriodData, isLoading, isError, error } = useReportData(user?.id, currentPeriod)

  // Usar datos por defecto si no hay datos o está cargando
  const periodData: PeriodData = useMemo(() => {
    if (isLoading || !currentPeriodData) {
      return defaultPeriodData
    }
    return currentPeriodData
  }, [currentPeriodData, isLoading])

  // Mostrar loading
  if (isLoading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <ActivityIndicator size="large" color={isDarkMode ? '#4CAF50' : '#4CAF50'} />
        <Text className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando reporte...</Text>
      </View>
    )
  }

  // Mostrar error
  if (isError) {
    return (
      <View className={`flex-1 items-center justify-center px-5 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <Ionicons name="alert-circle-outline" size={48} color={isDarkMode ? '#ef4444' : '#dc2626'} />
        <Text className={`mt-4 text-center text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Error al cargar reporte
        </Text>
        <Text className={`mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
        </Text>
        <TouchableOpacity
          className={`mt-6 px-6 py-3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
          onPress={() => {
            // El hook se refrescará automáticamente
          }}
        >
          <Text className={isDarkMode ? 'text-white' : 'text-gray-900'}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-5 pt-1 pb-0">
          {/* Title and ellipsis */}
          <View className="flex-row justify-between items-center py-3 mb-6">
            <Text className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reporte de gastos</Text>
            <View>
              <TouchableOpacity className={`size-10 items-center justify-center rounded-full shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} onPress={() => setShowOptions(true)}>
                <Ionicons name="ellipsis-horizontal" size={20} color={isDarkMode ? '#ffffff' : '#1f2937'} />
              </TouchableOpacity>

              <Modal visible={showOptions} transparent={true} animationType="fade" onRequestClose={() => setShowOptions(false)}>
                <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setShowOptions(false)}>
                  <View className={`absolute top-36 right-5 rounded-xl shadow-lg py-2 w-52 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      onPress={() => {
                        setShowOptions(false)
                      }}
                    >
                      <Ionicons name="share-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Compartir reporte</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      onPress={() => {
                        setShowOptions(false)
                        setShowDownloadModal(true)
                      }}
                    >
                      <Ionicons name="download-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Descargar PDF</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      onPress={() => {
                        setShowOptions(false)
                      }}
                    >
                      <Ionicons name="settings-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Configuración</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
          </View>

          {/* Tabs */}
          <View className={`flex-row py-1 rounded-full px-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                className={`flex-1 py-2.5 px-4 rounded-full ${tab.selected ? (isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-white border border-gray-100') : ''}`}
                onPress={() => handleTabPress(tab.id)}
              >
                <Text className={`text-center ${tab.selected ? (isDarkMode ? 'text-green-400' : 'text-[#4CAF50]') : isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <View className="px-5 mt-6 pb-24">
          {/* Cards */}
          <View className="flex-row gap-4 mb-6">
            {/* Income Card */}
            <View className={`flex-1 p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <View className="flex-row justify-between items-center mb-3">
                <View className="bg-[#4CAF50] dark:bg-green-600 p-2 rounded-full">
                  <Ionicons name="arrow-down-outline" size={20} color="white" />
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={18} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
                </TouchableOpacity>
              </View>
              <Text className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ingresos</Text>
              <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${periodData.summary.income.amount.toLocaleString()}
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons
                  name={periodData.summary.income.trend === 'up' ? 'trending-up' : periodData.summary.income.trend === 'down' ? 'trending-down' : 'remove'}
                  size={14}
                  color={periodData.summary.income.trend === 'up' ? '#22C55E' : periodData.summary.income.trend === 'down' ? '#EF4444' : '#9ca3af'}
                />
                <Text
                  className={`text-xs ml-1 ${
                    periodData.summary.income.trend === 'up' ? 'text-green-500' : periodData.summary.income.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`}
                >
                  {periodData.summary.income.percentageChange > 0 ? '+' : ''}
                  {periodData.summary.income.percentageChange}%
                </Text>
              </View>
            </View>

            {/* Spending Card */}
            <View className={`flex-1 p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <View className="flex-row justify-between items-center mb-3">
                <View className="bg-green-500 p-2 rounded-full">
                  <Ionicons name="arrow-up-outline" size={20} color="white" />
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-horizontal" size={18} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
                </TouchableOpacity>
              </View>
              <Text className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gastos</Text>
              <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${periodData.summary.spending.amount.toLocaleString()}
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons
                  name={periodData.summary.spending.trend === 'up' ? 'trending-up' : periodData.summary.spending.trend === 'down' ? 'trending-down' : 'remove'}
                  size={14}
                  color={periodData.summary.spending.trend === 'up' ? '#EF4444' : periodData.summary.spending.trend === 'down' ? '#22C55E' : '#9ca3af'}
                />
                <Text
                  className={`text-xs ml-1 ${
                    periodData.summary.spending.trend === 'up' ? 'text-red-500' : periodData.summary.spending.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                  }`}
                >
                  {periodData.summary.spending.percentageChange > 0 ? '+' : ''}
                  {periodData.summary.spending.percentageChange}%
                </Text>
              </View>
            </View>
          </View>

          {/* Balance Card */}
          <View className={`p-4 rounded-2xl border mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Balance</Text>
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${periodData.summary.balance.amount.toLocaleString()}
                </Text>
              </View>
              <View className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <Ionicons name="wallet-outline" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
              </View>
            </View>
          </View>

          {/* Budget Overview */}
          <View className={`p-6 rounded-2xl border mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-[17px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Resumen {currentPeriod === 'day' ? 'diario' : currentPeriod === 'week' ? 'semanal' : 'mensual'}
              </Text>
              <TouchableOpacity>
                <Text className={isDarkMode ? 'text-green-400' : 'text-[#4CAF50]'}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {/* Progress Circles */}
            {periodData.budget.categories.length > 0 ? (
              <>
                <View className="flex-row justify-between mb-8">
                  {periodData.budget.categories.slice(0, 3).map((item, index) => (
                    <View key={item.id || index} className="items-center">
                      <ProgressCircle percentage={item.percentage} color={item.color} />
                      <Text className={`text-sm font-medium mt-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Budget Items */}
                <View className="gap-5">
                  {periodData.budget.categories.map((item, index) => (
                    <View key={item.id || index} className="flex-row justify-between items-center">
                      <View className="flex-row items-center flex-1">
                        <View style={{ backgroundColor: item.color }} className="w-2.5 h-2.5 rounded-full mr-3" />
                        <Text className={`text-[15px] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}</Text>
                      </View>
                      <View className="flex-row items-center gap-4">
                        <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{item.percentage}%</Text>
                        <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${item.amount.toLocaleString()}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View className="py-8 items-center">
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay datos de categorías para este período</Text>
              </View>
            )}
          </View>

          {/* Transactions */}
          <View className={` mb-8 `}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`text-[17px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Últimas Transacciones</Text>
              <TouchableOpacity>
                <Text className={isDarkMode ? 'text-green-400' : 'text-[#4CAF50]'}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {periodData.transactions.recent.length > 0 ? (
              <View className="gap-4">
                {periodData.transactions.recent.slice(0, 2).map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    title={transaction.title}
                    time={new Date(transaction.date).toLocaleString('es-CL')}
                    amount={Math.abs(transaction.amount)}
                  />
                ))}
              </View>
            ) : (
              <View className="py-4">
                <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay transacciones para este período</Text>
              </View>
            )}
          </View>

          {/* Income Analytics */}
          <IncomeAnalytics
            totalIncome={periodData.summary.income.amount}
            percentageChange={periodData.summary.income.percentageChange}
            data={periodData.analytics.data}
          />

          {/* Insights Banner */}
          <View className={`p-6 rounded-2xl mt-8 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
            <View className="flex-row items-center mb-4">
              <View className={`rounded-full p-3 mr-4 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <Ionicons name="bulb-outline" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
              </View>
              <Text className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Insights del Período</Text>
            </View>
            <View className="space-y-3">
              {periodData.analytics.insights.map((insight, index) => (
                <View key={index} className="flex-row items-start">
                  <View
                    className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                      insight.type === 'peak' ? 'bg-orange-500' : insight.type === 'trend' ? 'bg-blue-500' : insight.type === 'anomaly' ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  />
                  <Text className={`text-sm flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{insight.message}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Premium Banner */}
          <View className={`p-6 rounded-2xl mt-6 flex-row items-center ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
            <View className={`rounded-full p-3 mr-4 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <Ionicons name="stats-chart" size={24} color={isDarkMode ? '#4ade80' : '#4CAF50'} />
            </View>
            <View className="flex-1">
              <Text className={`text-lg font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>¿Buscas una forma de rastrear tus ingresos en detalle?</Text>
              <Text className={`text-xs mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Obtén control total de tus finanzas rastreando tus ingresos sin esfuerzo. Monitorea cada detalle, mantente organizado y toma decisiones financieras más inteligentes con facilidad.
              </Text>
              <TouchableOpacity className={`py-3 px-6 rounded-full self-start ${isDarkMode ? 'bg-green-600' : 'bg-[#4CAF50]'}`}>
                <Text className="text-white font-medium">Probar Premium Ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <DownloadModal visible={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
    </ScrollView>
  )
}

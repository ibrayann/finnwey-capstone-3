import { View, Text, TouchableOpacity, ScrollView, StatusBar, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Circle } from 'react-native-svg'
import { useState } from 'react'
import IncomeAnalytics from './components/IncomeAnalytics'
import TransactionItem from './components/TransactionItem'
import DownloadModal from './components/DownloadModal'
import { useTheme } from '@/features/shared/hooks/useTheme'
// import { mockReportData } from '@/data/mockReports'
import { PeriodData } from '@/types/reports'

const initialTabs = [
  { id: 1, label: 'Día', selected: true },
  { id: 2, label: 'Semana', selected: false },
  { id: 3, label: 'Mes', selected: false },
]

// TODO: Datos estáticos temporales - reemplazar con datos reales de Supabase
const reportData = {
  periods: {
    day: {
      period: 'day' as const,
      label: 'Hoy',
      dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
      summary: {
        income: { amount: 5000, currency: 'CLP', trend: 'up' as const, percentageChange: 12 },
        spending: { amount: 2500, currency: 'CLP', trend: 'down' as const, percentageChange: -8 },
        balance: { amount: 2500, currency: 'CLP' },
      },
      budget: {
        totalBudget: 2500,
        spent: 2500,
        remaining: 0,
        categories: [
          { id: '1', name: 'food', label: 'Comida', percentage: 35, amount: 875, color: '#FF6384', icon: 'restaurant', limit: 1000, status: 'good' as const },
          { id: '2', name: 'transport', label: 'Transporte', percentage: 25, amount: 625, color: '#36A2EB', icon: 'car', limit: 800, status: 'good' as const },
          { id: '3', name: 'other', label: 'Otros', percentage: 40, amount: 1000, color: '#FFCE56', icon: 'ellipsis-horizontal', limit: 1500, status: 'good' as const },
        ],
      },
      transactions: {
        total: 2,
        recent: [
          { id: '1', title: 'Supermercado', description: '', amount: -150, type: 'expense' as const, category: 'food', date: new Date().toISOString(), icon: 'cart', merchant: '', location: '' },
          { id: '2', title: 'Salario', description: '', amount: 2000, type: 'income' as const, category: 'salary', date: new Date().toISOString(), icon: 'cash', merchant: '', location: '' },
        ],
      },
      analytics: {
        chartType: 'line' as const,
        data: [
          { x: '1', y: 10, label: 'H1' },
          { x: '2', y: 20, label: 'H2' },
          { x: '3', y: 15, label: 'H3' },
          { x: '4', y: 25, label: 'H4' },
          { x: '5', y: 20, label: 'H5' },
          { x: '6', y: 30, label: 'H6' },
          { x: '7', y: 25, label: 'H7' },
        ],
        insights: [
          { type: 'peak' as const, message: 'Mayor gasto del día: $150 en Supermercado', value: 150 },
          { type: 'trend' as const, message: 'Tus gastos están bajo control', value: 0 },
        ],
      },
    },
    week: {
      period: 'week' as const,
      label: 'Esta semana',
      dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
      summary: {
        income: { amount: 35000, currency: 'CLP', trend: 'up' as const, percentageChange: 15 },
        spending: { amount: 17500, currency: 'CLP', trend: 'down' as const, percentageChange: -5 },
        balance: { amount: 17500, currency: 'CLP' },
      },
      budget: {
        totalBudget: 17500,
        spent: 17500,
        remaining: 0,
        categories: [
          { id: '1', name: 'food', label: 'Comida', percentage: 30, amount: 5250, color: '#FF6384', icon: 'restaurant', limit: 6000, status: 'good' as const },
          { id: '2', name: 'transport', label: 'Transporte', percentage: 20, amount: 3500, color: '#36A2EB', icon: 'car', limit: 4000, status: 'good' as const },
          { id: '3', name: 'other', label: 'Otros', percentage: 50, amount: 8750, color: '#FFCE56', icon: 'ellipsis-horizontal', limit: 10000, status: 'good' as const },
        ],
      },
      transactions: {
        total: 2,
        recent: [
          { id: '1', title: 'Supermercado', description: '', amount: -450, type: 'expense' as const, category: 'food', date: new Date().toISOString(), icon: 'cart', merchant: '', location: '' },
          { id: '2', title: 'Salario Semanal', description: '', amount: 15000, type: 'income' as const, category: 'salary', date: new Date().toISOString(), icon: 'cash', merchant: '', location: '' },
        ],
      },
      analytics: {
        chartType: 'line' as const,
        data: [
          { x: '1', y: 100, label: 'L' },
          { x: '2', y: 150, label: 'M' },
          { x: '3', y: 120, label: 'M' },
          { x: '4', y: 180, label: 'J' },
          { x: '5', y: 140, label: 'V' },
          { x: '6', y: 200, label: 'S' },
          { x: '7', y: 170, label: 'D' },
        ],
        insights: [
          { type: 'peak' as const, message: 'Mayor gasto de la semana: Compras', value: 450 },
          { type: 'trend' as const, message: 'Gastos estables esta semana', value: 0 },
        ],
      },
    },
    month: {
      period: 'month' as const,
      label: 'Este mes',
      dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
      summary: {
        income: { amount: 150000, currency: 'CLP', trend: 'up' as const, percentageChange: 20 },
        spending: { amount: 75000, currency: 'CLP', trend: 'down' as const, percentageChange: -10 },
        balance: { amount: 75000, currency: 'CLP' },
      },
      budget: {
        totalBudget: 75000,
        spent: 75000,
        remaining: 0,
        categories: [
          { id: '1', name: 'food', label: 'Comida', percentage: 28, amount: 21000, color: '#FF6384', icon: 'restaurant', limit: 25000, status: 'good' as const },
          { id: '2', name: 'transport', label: 'Transporte', percentage: 22, amount: 16500, color: '#36A2EB', icon: 'car', limit: 20000, status: 'good' as const },
          { id: '3', name: 'other', label: 'Otros', percentage: 50, amount: 37500, color: '#FFCE56', icon: 'ellipsis-horizontal', limit: 50000, status: 'good' as const },
        ],
      },
      transactions: {
        total: 2,
        recent: [
          { id: '1', title: 'Supermercado', description: '', amount: -1800, type: 'expense' as const, category: 'food', date: new Date().toISOString(), icon: 'cart', merchant: '', location: '' },
          { id: '2', title: 'Salario Mensual', description: '', amount: 80000, type: 'income' as const, category: 'salary', date: new Date().toISOString(), icon: 'cash', merchant: '', location: '' },
        ],
      },
      analytics: {
        chartType: 'line' as const,
        data: [
          { x: '1', y: 400, label: 'S1' },
          { x: '2', y: 600, label: 'S2' },
          { x: '3', y: 500, label: 'S3' },
          { x: '4', y: 700, label: 'S4' },
        ],
        insights: [
          { type: 'peak' as const, message: 'Mayor gasto del mes: Renta', value: 1800 },
          { type: 'trend' as const, message: 'Ahorraste 50% de tus ingresos', value: 50 },
          { type: 'goal' as const, message: '¡Excelente control de gastos!', value: 0 },
        ],
      },
    },
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

  const handleTabPress = (tabId: number) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => ({
        ...tab,
        selected: tab.id === tabId,
      }))
    )
  }

  // Obtener el período actual
  const getCurrentPeriod = () => {
    const selectedTab = tabs.find((tab) => tab.selected)
    if (selectedTab?.label === 'Día') return 'day'
    if (selectedTab?.label === 'Semana') return 'week'
    return 'month'
  }

  const currentPeriod = getCurrentPeriod()
  const currentPeriodData: PeriodData = reportData.periods[currentPeriod as keyof typeof reportData.periods]

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
              <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${currentPeriodData.summary.income.amount.toLocaleString()}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons
                  name={currentPeriodData.summary.income.trend === 'up' ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={currentPeriodData.summary.income.trend === 'up' ? '#22C55E' : '#EF4444'}
                />
                <Text className={`text-xs ml-1 ${currentPeriodData.summary.income.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {currentPeriodData.summary.income.percentageChange > 0 ? '+' : ''}
                  {currentPeriodData.summary.income.percentageChange}%
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
              <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${currentPeriodData.summary.spending.amount.toLocaleString()}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons
                  name={currentPeriodData.summary.spending.trend === 'up' ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={currentPeriodData.summary.spending.trend === 'up' ? '#EF4444' : '#22C55E'}
                />
                <Text className={`text-xs ml-1 ${currentPeriodData.summary.spending.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                  {currentPeriodData.summary.spending.percentageChange > 0 ? '+' : ''}
                  {currentPeriodData.summary.spending.percentageChange}%
                </Text>
              </View>
            </View>
          </View>

          {/* Balance Card */}
          <View className={`p-4 rounded-2xl border mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Balance</Text>
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${currentPeriodData.summary.balance.amount.toLocaleString()}</Text>
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
            <View className="flex-row justify-between mb-8">
              {currentPeriodData.budget.categories.map((item, index) => (
                <View key={index} className="items-center">
                  <ProgressCircle percentage={item.percentage} color={item.color} />
                  <Text className={`text-sm font-medium mt-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* Budget Items */}
            <View className="gap-5">
              {currentPeriodData.budget.categories.map((item, index) => (
                <View key={index} className="flex-row justify-between items-center">
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
          </View>

          {/* Transactions */}
          <View className={` mb-8 `}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`text-[17px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Últimas Transacciones</Text>
              <TouchableOpacity>
                <Text className={isDarkMode ? 'text-green-400' : 'text-[#4CAF50]'}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-4">
              {currentPeriodData.transactions.recent.slice(0, 2).map((transaction) => (
                <TransactionItem key={transaction.id} title={transaction.title} time={new Date(transaction.date).toLocaleString('es-CL')} amount={Math.abs(transaction.amount)} />
              ))}
            </View>
          </View>

          {/* Income Analytics */}
          <IncomeAnalytics totalIncome={currentPeriodData.summary.income.amount} percentageChange={currentPeriodData.summary.income.percentageChange} data={currentPeriodData.analytics.data} />

          {/* Insights Banner */}
          <View className={`p-6 rounded-2xl mt-8 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
            <View className="flex-row items-center mb-4">
              <View className={`rounded-full p-3 mr-4 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <Ionicons name="bulb-outline" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
              </View>
              <Text className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Insights del Período</Text>
            </View>
            <View className="space-y-3">
              {currentPeriodData.analytics.insights.map((insight, index) => (
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

import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView, useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Budget } from '@/types/budget'

interface BudgetDetailTabsProps {
  budget: Budget | undefined
  category: any
  transactions: any[]
  insights: any[]
  isBalanceVisible: boolean
  onToggleBalance: () => void
  onConfigureBudget: () => void
}

const TABS = [
  { id: 1, key: 'general', label: 'Resumen', selected: true },
  { id: 2, key: 'history', label: 'Historial', selected: false },
  { id: 3, key: 'insights', label: 'IA Insights', selected: false },
]

export default function BudgetDetailTabs({ budget, category, transactions, insights, isBalanceVisible, onToggleBalance, onConfigureBudget }: BudgetDetailTabsProps) {
  const [tabs, setTabs] = useState(TABS)
  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === 'dark'

  const handleTabPress = (tabId: number) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => ({
        ...tab,
        selected: tab.id === tabId,
      }))
    )
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444' // Rojo - peligro
    if (percentage >= 75) return '#f59e0b' // Amarillo - advertencia
    return '#10b981' // Verde - bien
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return '#ef4444'
      case 'tip':
        return '#3b82f6'
      case 'achievement':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning-outline'
      case 'tip':
        return 'bulb-outline'
      case 'achievement':
        return 'trophy-outline'
      default:
        return 'information-circle-outline'
    }
  }

  // Obtener el tab activo
  const getActiveTab = () => {
    const selectedTab = tabs.find((tab) => tab.selected)
    return selectedTab?.key || 'general'
  }

  const activeTab = getActiveTab()

  // Usar los campos correctos de Supabase
  const percentage = budget ? ((budget.spent_amount || 0) / (budget.amount || 1)) * 100 : 0
  const daysRemaining = budget && budget.end_date ? Math.max(0, Math.ceil((new Date(budget.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0

  const renderGeneralInfo = () => (
    <View>
      {budget ? (
        <>
          {/* Progreso Principal */}
          <View className="mb-6">
            <View className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <View className="flex-row justify-between items-center mb-3">
                <View className={`p-2 rounded-full`} style={{ backgroundColor: getStatusColor(percentage) }}>
                  <Ionicons name="trending-up-outline" size={20} color="white" />
                </View>
                <View className="flex-row items-center">
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progreso</Text>
                  <Text className={`text-lg font-bold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{percentage.toFixed(1)}%</Text>
                </View>
              </View>
              <Text className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gastado</Text>
              <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{isBalanceVisible ? `$${budget?.spent_amount?.toLocaleString() || '0'}` : '$•••••'}</Text>
              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>De {isBalanceVisible ? `$${budget?.amount?.toLocaleString() || '0'}` : '$•••••'}</Text>
              <View className="mt-3">
                <View className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <View
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: getStatusColor(percentage),
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </>
      ) : (
        /* Card de configuración inicial */
        <View className="mb-6">
          <View className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <View className="items-center">
              <View className="w-16 h-16 bg-[#166534] dark:bg-green-600 rounded-full items-center justify-center mb-4">
                <Ionicons name="wallet-outline" size={32} color="white" />
              </View>
              <Text className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configurar Presupuesto</Text>
              <Text className={`text-sm text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Establece un límite de gasto para {category.name} y mantén el control de tus finanzas
              </Text>
              <Pressable onPress={onConfigureBudget} className="bg-[#166534] dark:bg-green-600 px-8 py-4 rounded-full">
                <Text className="text-white font-semibold text-lg">Configurar para Comenzar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Cards de métricas - Solo mostrar si hay presupuesto */}
      {budget && (
        <View className="mb-6">
          <View className="flex-row gap-4">
            <View className={`flex-1 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <View className="w-12 h-12 bg-red-500 rounded-full items-center justify-center mb-2">
                <Ionicons name="wallet-outline" size={20} color="white" />
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Restante</Text>
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isBalanceVisible ? `$${budget ? ((budget.amount || 0) - (budget.spent_amount || 0)).toLocaleString() : '0'}` : '$•••••'}
              </Text>
            </View>

            <View className={`flex-1 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mb-2">
                <Ionicons name="calendar-outline" size={20} color="white" />
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Días restantes</Text>
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{daysRemaining}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Información de la categoría */}
      <View className="mb-6">
        <Text className={`text-[17px] font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Información de la Categoría</Text>

        {/* Grid de cards */}
        <View className="flex-row flex-wrap gap-3 justify-between">
          {/* Tipo de categoría */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className={`p-3 rounded-full mb-2`} style={{ backgroundColor: category.type === 'necessary' ? '#ef4444' : '#3b82f6' }}>
                <Ionicons name="flag-outline" size={20} color="white" />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Tipo</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>{category.type === 'necessary' ? 'Necesario' : 'Discrecional'}</Text>
          </View>

          {/* Estado del presupuesto */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className={`p-3 rounded-full mb-2`} style={{ backgroundColor: getStatusColor(percentage) }}>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Estado</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>{percentage >= 90 ? 'Crítico' : percentage >= 75 ? 'Advertencia' : 'Bien'}</Text>
          </View>

          {/* Promedio diario */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-2">
                <Ionicons name="calculator-outline" size={20} color={isDarkMode ? '#4ADE80' : '#22C55E'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Promedio diario</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>
              {isBalanceVisible ? `$${budget ? Math.round((budget.spent_amount || 0) / 30) : 0}` : '$•••••'}
            </Text>
          </View>
        </View>
      </View>

      {/* Botón para mostrar/ocultar - Solo mostrar si hay presupuesto */}
      {budget && (
        <View className={`p-6 rounded-2xl border mb-36 pb-28 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <Pressable onPress={onToggleBalance} className="flex-row items-center justify-center py-2">
            <Ionicons name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <Text className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{isBalanceVisible ? 'Ocultar montos' : 'Mostrar montos'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  )

  const renderHistory = () => (
    <View className="flex-1">
      <View className="mb-6">
        <Text className={`text-[17px] font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Historial de Transacciones</Text>

        <View className="space-y-3">
          {transactions.map((transaction) => (
            <View key={transaction.id} className={`rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full items-center justify-center mr-3">
                    <Ionicons name="arrow-down" size={16} color="#ef4444" />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{transaction.description}</Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {transaction.date.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <Text className="text-red-600 dark:text-red-400 font-semibold">-${transaction.amount.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )

  const renderInsights = () => (
    <View>
      {/* Recomendaciones Premium */}
      <View className="mb-6">
        <Text className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recomendaciones IA</Text>

        <View className="bg-purple-500 rounded-3xl p-6 relative overflow-hidden">
          {/* Overlay de premium */}
          <View className="absolute top-4 right-4 bg-white/20 rounded-full px-3 py-1">
            <Text className="text-white text-sm font-semibold">PREMIUM</Text>
          </View>

          {/* Contenido de la tarjeta */}
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
              <Ionicons name="bulb-outline" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold mb-1">Optimiza tu Presupuesto</Text>
              <Text className="text-white/80 text-sm">Recibe recomendaciones personalizadas para mantener tu presupuesto bajo control</Text>
            </View>
          </View>

          {/* Características premium */}
          <View className="space-y-2 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-2">Análisis de patrones de gasto</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-2">Alertas predictivas</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-2">Sugerencias de optimización</Text>
            </View>
          </View>

          {/* Botón de upgrade */}
          <Pressable className="bg-white/20 rounded-2xl p-4 flex-row items-center justify-center">
            <Ionicons name="star" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Actualizar a Premium</Text>
          </Pressable>
        </View>
      </View>

      {/* Insights básicos */}
      <View className="mb-6">
        <Text className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Insights Básicos</Text>

        <View className="space-y-3">
          {insights.map((insight) => (
            <View key={insight.id} className={`rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <View className="flex-row items-start">
                <View className="w-8 h-8 bg-white dark:bg-gray-600 rounded-full items-center justify-center mr-3 mt-1">
                  <Ionicons name={getInsightIcon(insight.type) as any} size={16} color={getInsightColor(insight.type)} />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {insight.type === 'warning' ? 'Advertencia' : insight.type === 'tip' ? 'Consejo' : insight.type === 'achievement' ? 'Logro' : 'Información'}
                  </Text>
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{insight.message}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralInfo()
      case 'history':
        return renderHistory()
      case 'insights':
        return renderInsights()
      default:
        return renderGeneralInfo()
    }
  }

  return (
    <View className="flex-1">
      {/* Tab Navigation */}
      <View className="px-6 pt-6 pb-4">
        <View className={`flex-row py-1 rounded-full px-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              className={`flex-1 py-2.5 px-4 rounded-full ${tab.selected ? (isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-white border border-gray-100') : ''}`}
              onPress={() => handleTabPress(tab.id)}
            >
              <Text className={`text-center ${tab.selected ? (isDarkMode ? 'text-green-400' : 'text-[#4CAF50]') : isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      <View className="flex-1 px-6 pt-2">{renderTabContent()}</View>
    </View>
  )
}

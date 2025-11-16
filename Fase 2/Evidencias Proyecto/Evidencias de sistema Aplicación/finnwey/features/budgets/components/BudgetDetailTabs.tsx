import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Pressable, ScrollView, useColorScheme, ActivityIndicator, Alert, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Budget } from '@/types/budget'
import { useGenerateFinancialTip, useActiveFinancialTips } from '@/features/financial-tips'
import FinancialTipsList from '@/features/financial-tips/components/FinancialTipsList'
import FinancialTipDetail from '@/features/financial-tips/components/FinancialTipDetail'
import { FinancialTip } from '@/features/financial-tips/services/financial-tip.service'

interface BudgetDetailTabsProps {
  budget: Budget | undefined
  category: any
  transactions: any[]
  insights: any[]
  isBalanceVisible: boolean
  onToggleBalance: () => void
  onConfigureBudget: () => void
  onFloatingButtonStateChange?: (state: { show: boolean; isGenerating: boolean; onPress: () => void }) => void
}

const TABS = [
  { id: 1, key: 'general', label: 'Resumen', selected: true },
  { id: 2, key: 'history', label: 'Historial', selected: false },
  { id: 3, key: 'insights', label: 'IA Insights', selected: false },
]

export default function BudgetDetailTabs({ budget, category, transactions, insights, isBalanceVisible, onToggleBalance, onConfigureBudget, onFloatingButtonStateChange }: BudgetDetailTabsProps) {
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

  const renderHistory = () => {
    return (
      <View>
        <View className="pb-4">
          <Text className={`text-[17px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Historial de Transacciones</Text>
        </View>
        {transactions.length === 0 ? (
          <View className="py-8 items-center">
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay transacciones registradas</Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <View
              key={transaction.id?.toString() || Math.random().toString()}
              className={`mb-3 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full items-center justify-center mr-3">
                    <Ionicons name="arrow-down" size={16} color="#ef4444" />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{transaction.description}</Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {transaction.date?.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }) || 'Sin fecha'}
                    </Text>
                  </View>
                </View>
                <Text className="text-red-600 dark:text-red-400 font-semibold">-${transaction.amount?.toLocaleString() || '0'}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    )
  }

  const { mutate: generateTip, isPending: isGeneratingTip } = useGenerateFinancialTip()
  // Filtrar tips por la categoría actual
  const categoryId = category?.id
  const { data: activeTips, isLoading: isLoadingTips } = useActiveFinancialTips(10, categoryId)
  const router = useRouter()
  const [selectedTip, setSelectedTip] = useState<FinancialTip | null>(null)
  const [isDetailVisible, setIsDetailVisible] = useState(false)

  const handleGenerateTip = useCallback(() => {
    // Pasar la categoría actual para generar el tip específico
    const categoryId = category?.id
    const budgetId = budget?.id

    generateTip(
      { categoryId, budgetId },
      {
        onSuccess: (response) => {
          if (!response.success) {
            console.error('❌ Error al generar tip:', response.error)
          }
          // La lista se actualizará automáticamente gracias a invalidateQueries
        },
        onError: (error) => {
          console.error('❌ Error al generar tip:', error)
        },
      }
    )
  }, [category?.id, budget?.id, generateTip])

  const handleTipPress = (tip: FinancialTip) => {
    setSelectedTip(tip)
    setIsDetailVisible(true)
  }

  const handleCloseDetail = () => {
    setIsDetailVisible(false)
    setSelectedTip(null)
  }

  // Notificar al padre sobre el estado del botón flotante
  useEffect(() => {
    if (onFloatingButtonStateChange) {
      const shouldShow = !!(activeTab === 'insights' && activeTips && activeTips.length > 0)
      onFloatingButtonStateChange({
        show: shouldShow,
        isGenerating: isGeneratingTip,
        onPress: handleGenerateTip,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeTips?.length, isGeneratingTip, handleGenerateTip])

  const renderInsights = () => {
    const hasTips = activeTips && activeTips.length > 0

    // Si hay consejos guardados, mostrar lista
    if (hasTips) {
      return (
        <View className="flex-1">
          {/* Lista de consejos con indicador de carga */}
          <View className="flex-1">
            <FinancialTipsList onTipPress={handleTipPress} limit={10} isGeneratingNew={isGeneratingTip} categoryId={categoryId} nested={true} />
          </View>

          {/* Modal de detalle */}
          <FinancialTipDetail tip={selectedTip} visible={isDetailVisible} onClose={handleCloseDetail} />
        </View>
      )
    }

    // Si NO hay consejos, mostrar solo el botón para generar
    return (
      <View className="flex-1 justify-center items-center px-6 pt-2">
        <View className="w-full max-w-md">
          {/* Icono principal */}
          <View className="items-center mb-8">
            <View className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <Ionicons name="bulb-outline" size={48} color={isDarkMode ? '#A78BFA' : '#8B5CF6'} />
            </View>
            <Text className={`text-2xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recomendaciones IA</Text>
            <Text className={`text-base text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Recibe consejos financieros personalizados basados en tu comportamiento y situación actual
            </Text>
          </View>

          {/* Botón principal */}
          <Pressable
            onPress={handleGenerateTip}
            disabled={isGeneratingTip}
            className={`rounded-2xl p-5 flex-row items-center justify-center mb-4 ${isGeneratingTip ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-300') : isDarkMode ? 'bg-purple-600' : 'bg-purple-500'}`}
          >
            {isGeneratingTip ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold text-lg ml-3">Analizando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles-outline" size={24} color="white" />
                <Text className="text-white font-semibold text-lg ml-3">Recibir consejo financiero</Text>
              </>
            )}
          </Pressable>

          {/* Información adicional */}
          <View className={`rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <View className="flex-row items-start mb-3">
              <Ionicons name="information-circle-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Text className={`text-sm ml-2 flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                El análisis incluye tu perfil financiero, presupuestos, metas, transacciones recientes y patrones de gasto
              </Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

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
    <View className="flex-1" style={{ position: 'relative' }}>
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
      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {renderTabContent()}
      </ScrollView>
    </View>
  )
}

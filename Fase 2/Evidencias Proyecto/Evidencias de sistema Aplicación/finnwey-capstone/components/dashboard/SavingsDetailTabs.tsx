import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView, useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { FinancialGoal, GoalContribution } from '@/types/savings'
import ContributionsHistory from './ContributionsHistory'

interface SavingsDetailTabsProps {
  goal: FinancialGoal
  contributions: GoalContribution[]
  isLoadingContributions: boolean
}

const TABS = [
  { id: 1, key: 'general', label: 'Información', selected: true },
  { id: 2, key: 'history', label: 'Historial', selected: false },
  { id: 3, key: 'tips', label: 'IA Tips', selected: false },
]

export default function SavingsDetailTabs({ goal, contributions, isLoadingContributions }: SavingsDetailTabsProps) {
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

  const labelPriority = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Baja'
      case 'medium':
        return 'Media'
      case 'high':
        return 'Alta'
      default:
        return 'Media'
    }
  }

  const labelStatus = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'paused':
        return 'Pausado'
      case 'completed':
        return 'Completado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Activo'
    }
  }

  const labelGoalType = (goalType: string) => {
    switch (goalType) {
      case 'savings':
        return 'Ahorro'
      case 'debt_payoff':
        return 'Pagar Deudas'
      case 'investment':
        return 'Inversión'
      case 'emergency_fund':
        return 'Fondo de Emergencia'
      case 'purchase':
        return 'Compra'
      case 'other':
        return 'Otro'
      default:
        return 'Otro'
    }
  }

  // Obtener el tab activo
  const getActiveTab = () => {
    const selectedTab = tabs.find((tab) => tab.selected)
    return selectedTab?.key || 'general'
  }

  const activeTab = getActiveTab()

  const renderGeneralInfo = () => (
    <View>
      {/* Progreso Principal - Siguiendo el patrón del reporte */}
      <View className="mb-6">
        <View className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <View className="flex-row justify-between items-center mb-3">
            <View className="bg-[#4CAF50] dark:bg-green-600 p-2 rounded-full">
              <Ionicons name="trending-up-outline" size={20} color="white" />
            </View>
            <View className="flex-row items-center">
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progreso</Text>
              <Text className={`text-lg font-bold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{Math.round(goal.progress_percentage)}%</Text>
            </View>
          </View>
          <Text className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ahorrado</Text>
          <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${goal.current_amount.toLocaleString('es-CL')}</Text>
          <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>De ${goal.target_amount.toLocaleString('es-CL')}</Text>
          <View className="mt-3">
            <View className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <View className="bg-[#4CAF50] h-2 rounded-full" style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }} />
            </View>
          </View>
        </View>
      </View>

      {/* Cards de métricas - Siguiendo el patrón de WalletSummary */}
      <View className="mb-6">
        <View className="flex-row gap-4">
          <View className={`flex-1 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mb-2">
              <Ionicons name="calculator-outline" size={20} color="white" />
            </View>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Falta por ahorrar</Text>
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${(goal.target_amount - goal.current_amount).toLocaleString('es-CL')}</Text>
          </View>

          <View className={`flex-1 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mb-2">
              <Ionicons name="repeat-outline" size={20} color="white" />
            </View>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contribución mensual</Text>
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${goal.auto_save_amount.toLocaleString('es-CL')}</Text>
          </View>
        </View>
      </View>

      {/* Información del objetivo - Cards individuales */}
      <View className="mb-6">
        <Text className={`text-[17px] font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Información del Objetivo</Text>

        {/* Grid de cards - 3 columnas */}
        <View className="flex-row flex-wrap gap-3 justify-between">
          {/* Fecha de inicio */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-2">
                <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Fecha de inicio</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>
              {new Date(goal.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Fecha objetivo */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mb-2">
                <Ionicons name="flag-outline" size={20} color={isDarkMode ? '#FB923C' : '#F97316'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Fecha objetivo</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>
              {new Date(goal.target_date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Tipo de objetivo */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-2">
                <Ionicons name="star-outline" size={20} color={isDarkMode ? '#A78BFA' : '#8B5CF6'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Tipo de objetivo</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>{labelGoalType(goal.goal_type)}</Text>
          </View>

          {/* Estado */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-2">
                <Ionicons name="checkmark-circle-outline" size={20} color={isDarkMode ? '#4ADE80' : '#22C55E'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Estado</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>{labelStatus(goal.status)}</Text>
          </View>

          {/* Prioridad */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View
                className={`bg-${goal.priority === 'high' ? 'red' : goal.priority === 'medium' ? 'yellow' : 'green'}-100 dark:bg-${
                  goal.priority === 'high' ? 'red' : goal.priority === 'medium' ? 'yellow' : 'green'
                }-900/30 p-3 rounded-full mb-2`}
              >
                <Ionicons name="flag-outline" size={20} color={goal.priority === 'high' ? '#EF4444' : goal.priority === 'medium' ? '#F59E0B' : '#22C55E'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Prioridad</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>{labelPriority(goal.priority)}</Text>
          </View>

          {/* Información adicional */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full mb-2">
                <Ionicons name="information-circle-outline" size={20} color={isDarkMode ? '#818CF8' : '#6366F1'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Más info</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>Pronto</Text>
          </View>
        </View>
      </View>

      {/* Descripción - Siguiendo el patrón del reporte */}
      {goal.description && (
        <View className={`p-6 rounded-2xl border mb-36   pb-28 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-[17px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Descripción</Text>
          </View>
          <Text className={`text-base leading-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{goal.description}</Text>
        </View>
      )}

      {/* Auto-ahorro - Siguiendo el patrón del reporte */}
      {goal.auto_save_enabled && (
        <View className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-[17px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Auto-Ahorro</Text>
            <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
              <Text className="text-green-800 dark:text-green-300 font-semibold text-sm">Activo</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-4">
              <Ionicons name="repeat-outline" size={20} color="white" />
            </View>
            <View>
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ahorro Automático</Text>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cada {goal.auto_save_frequency}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )

  const renderHistory = () => (
    <View className="flex-1">
      <ContributionsHistory contributions={contributions} isLoading={isLoadingContributions} />
    </View>
  )

  const renderAITips = () => (
    <View>
      {/* Recomendaciones Premium */}
      <View className="mb-6">
        <Text className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Recomendaciones IA</Text>

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
              <Text className="text-white text-xl font-bold mb-1">Optimiza tu Ahorro</Text>
              <Text className="text-white/80 text-sm">Recibe recomendaciones personalizadas para alcanzar tu meta más rápido</Text>
            </View>
          </View>

          {/* Características premium */}
          <View className="space-y-2 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-2">Análisis de gastos inteligente</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-2">Sugerencias de inversión</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-2">Alertas de oportunidades</Text>
            </View>
          </View>

          {/* Botón de upgrade */}
          <Pressable className="bg-white/20 rounded-2xl p-4 flex-row items-center justify-center">
            <Ionicons name="star" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Actualizar a Premium</Text>
          </Pressable>
        </View>
      </View>

      {/* Tips básicos */}
      <View className="mb-6">
        <Text className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Tips Básicos</Text>

        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="trending-up-outline" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
            <Text className="text-blue-800 dark:text-blue-300 font-medium ml-2">Acelera tu progreso</Text>
          </View>
          <Text className="text-blue-700 dark:text-blue-200 text-sm">Si aumentas tu contribución mensual en un 20%, alcanzarás tu meta más rápido.</Text>
        </View>

        <View className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#4ADE80' : '#22C55E'} />
            <Text className="text-green-800 dark:text-green-300 font-medium ml-2">Mantén la consistencia</Text>
          </View>
          <Text className="text-green-700 dark:text-green-200 text-sm">Contribuciones regulares son más efectivas que grandes aportes esporádicos.</Text>
        </View>

        <View className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="shield-outline" size={20} color={isDarkMode ? '#FB923C' : '#F97316'} />
            <Text className="text-orange-800 dark:text-orange-300 font-medium ml-2">Protege tu meta</Text>
          </View>
          <Text className="text-orange-700 dark:text-orange-200 text-sm">Considera crear un fondo de emergencia separado para evitar usar este dinero.</Text>
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
      case 'tips':
        return renderAITips()
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

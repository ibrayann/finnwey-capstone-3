import { View, Text, Pressable, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useActiveFinancialTips } from '../hooks/useFinancialTip'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { FinancialTip } from '../services/financial-tip.service'
import { useState } from 'react'

interface FinancialTipsListProps {
  onTipPress: (tip: FinancialTip) => void
  limit?: number
  isGeneratingNew?: boolean
  categoryId?: string
  goalId?: string
  nested?: boolean // Si está dentro de un ScrollView, usar map en lugar de FlatList
}

export default function FinancialTipsList({ onTipPress, limit = 20, isGeneratingNew = false, categoryId, goalId, nested = false }: FinancialTipsListProps) {
  const { isDarkMode } = useTheme()
  const { data: tips, isLoading, error, refetch, isRefetching } = useActiveFinancialTips(limit, categoryId, goalId)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return isDarkMode ? '#ef4444' : '#dc2626'
      case 'high':
        return isDarkMode ? '#f59e0b' : '#d97706'
      case 'medium':
        return isDarkMode ? '#3b82f6' : '#2563eb'
      case 'low':
        return isDarkMode ? '#6b7280' : '#4b5563'
      default:
        return isDarkMode ? '#6b7280' : '#4b5563'
    }
  }

  const getTipTypeIcon = (tipType: string) => {
    switch (tipType) {
      case 'budget':
        return 'wallet-outline'
      case 'goal':
        return 'flag-outline'
      case 'warning':
        return 'alert-circle-outline'
      case 'achievement':
        return 'trophy-outline'
      case 'recommendation':
        return 'bulb-outline'
      default:
        return 'information-circle-outline'
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <ActivityIndicator size="large" color={isDarkMode ? '#8B5CF6' : '#8B5CF6'} />
        <Text className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Cargando consejos...
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center py-8 px-4">
        <Ionicons name="alert-circle-outline" size={48} color={isDarkMode ? '#ef4444' : '#dc2626'} />
        <Text className={`mt-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Error al cargar los consejos
        </Text>
        <Pressable
          onPress={() => refetch()}
          className={`mt-4 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-purple-900' : 'bg-purple-600'}`}
        >
          <Text className="text-white font-semibold">Reintentar</Text>
        </Pressable>
      </View>
    )
  }

  if (!tips || tips.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-8 px-4">
        <View className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
          <Ionicons name="bulb-outline" size={48} color={isDarkMode ? '#A78BFA' : '#8B5CF6'} />
        </View>
        <Text className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          No hay consejos aún
        </Text>
        <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Genera tu primer consejo financiero personalizado desde el tab de IA Insights
        </Text>
      </View>
    )
  }

  // Agregar item de carga al inicio si se está generando un nuevo consejo
  const listData = isGeneratingNew 
    ? [{ id: 'loading', isPlaceholder: true }, ...(tips || [])]
    : tips || []

  // Función para renderizar un item
  const renderItem = (item: any) => {
    // Renderizar item de carga
    if (item.isPlaceholder) {
      return (
        <View key="loading" className={`mb-3 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-row items-center flex-1">
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <ActivityIndicator size="small" color={isDarkMode ? '#A78BFA' : '#8B5CF6'} />
              </View>
              <View className="flex-1">
                <View className={`h-4 rounded mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '70%' }} />
                <View className={`h-3 rounded mb-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '100%' }} />
                <View className={`h-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '85%' }} />
              </View>
            </View>
          </View>
          <View className="flex-row items-center mt-2">
            <View className={`px-2 py-1 rounded-full mr-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <View className={`h-3 w-12 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
            </View>
            <View className={`px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <View className={`h-3 w-16 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
            </View>
          </View>
        </View>
      )
    }

    // Renderizar item normal
    return (
      <Pressable
        key={item.id}
        onPress={() => onTipPress(item)}
        className={`mb-3 rounded-2xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center mr-3`}
              style={{ backgroundColor: getPriorityColor(item.priority) + '20' }}
            >
              <Ionicons
                name={getTipTypeIcon(item.tipType) as any}
                size={20}
                color={getPriorityColor(item.priority)}
              />
            </View>
            <View className="flex-1">
              <Text
                className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text
                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                numberOfLines={2}
              >
                {item.content}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDarkMode ? '#9ca3af' : '#6b7280'}
          />
        </View>
        <View className="flex-row items-center mt-2 flex-wrap">
          {item.isNew && (
            <View className={`px-2 py-1 rounded-full mr-2 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <Text className={`text-xs font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                ✨ Nuevo
              </Text>
            </View>
          )}
          <View
            className={`px-2 py-1 rounded-full mr-2`}
            style={{ backgroundColor: getPriorityColor(item.priority) + '20' }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: getPriorityColor(item.priority) }}
            >
              {item.priority === 'urgent' ? 'Urgente' : item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Media' : 'Baja'}
            </Text>
          </View>
          <View className={`px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {item.tipType === 'budget' ? 'Presupuesto' : item.tipType === 'goal' ? 'Meta' : item.tipType === 'warning' ? 'Alerta' : item.tipType === 'achievement' ? 'Logro' : 'Recomendación'}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }

  // Si está dentro de un ScrollView, usar map en lugar de FlatList
  if (nested) {
    return (
      <View style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
        {listData.map((item) => renderItem(item))}
      </View>
    )
  }

  // Si no está anidado, usar FlatList normalmente
  return (
    <FlatList
      data={listData}
      keyExtractor={(item: any) => item.id || Math.random().toString()}
      renderItem={({ item }: any) => renderItem(item)}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={isDarkMode ? '#8B5CF6' : '#8B5CF6'}
        />
      }
      contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
    />
  )
}


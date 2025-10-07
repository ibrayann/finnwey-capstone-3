import React from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { GoalContribution } from '@/types/savings'

interface ContributionsHistoryProps {
  contributions: GoalContribution[]
  onLoadMore?: () => void
  isLoading?: boolean
}

export default function ContributionsHistory({ contributions, onLoadMore, isLoading = false }: ContributionsHistoryProps) {
  const { isDarkMode } = useTheme()

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'manual':
        return 'hand-left-outline'
      case 'automatic':
        return 'refresh-outline'
      case 'transfer':
        return 'swap-horizontal-outline'
      case 'windfall':
        return 'gift-outline'
      default:
        return 'add-circle-outline'
    }
  }

  const getSourceColor = (type: string) => {
    switch (type) {
      case 'manual':
        return '#4CAF50'
      case 'automatic':
        return '#2196F3'
      case 'transfer':
        return '#FF9800'
      case 'windfall':
        return '#9C27B0'
      default:
        return '#9E9E9E'
    }
  }

  const getSourceLabel = (type: string) => {
    switch (type) {
      case 'manual':
        return 'Manual'
      case 'automatic':
        return 'Auto-ahorro'
      case 'transfer':
        return 'Transferencia'
      case 'windfall':
        return 'Bonificación'
      default:
        return 'Otro'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return 'Ayer'
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`
    } else {
      return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'America/Santiago', // Zona horaria de Chile
      })
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Santiago', // Zona horaria de Chile
    })
  }

  if (contributions.length === 0) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4">
        <View className="items-center">
          <View className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center mb-4">
            <Ionicons name="time-outline" size={32} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
          </View>
          <Text className="text-gray-600 dark:text-gray-300 text-lg font-semibold mb-2">Sin contribuciones aún</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm text-center">Cuando agregues dinero a esta meta, aparecerá aquí el historial de aportes.</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-gray-800 dark:text-white text-lg font-semibold">Historial de Contribuciones</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm">
          {contributions.length} aporte{contributions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {contributions.map((contribution, index) => (
          <View key={contribution.id} className="mb-3">
            <View className="flex-row items-center">
              {/* Icono de fuente */}
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${getSourceColor(contribution.type)}20` }}>
                <Ionicons name={getSourceIcon(contribution.type) as any} size={20} color={getSourceColor(contribution.type)} />
              </View>

              {/* Información de la contribución */}
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-gray-800 dark:text-white font-semibold">${contribution.amount.toLocaleString()}</Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">{formatDate(contribution.created_at)}</Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-gray-600 dark:text-gray-300 text-sm mr-2">{getSourceLabel(contribution.type)}</Text>
                    {contribution.notes && (
                      <>
                        <Text className="text-gray-400 dark:text-gray-500 text-xs">•</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs ml-2 flex-1" numberOfLines={1}>
                          {contribution.notes}
                        </Text>
                      </>
                    )}
                  </View>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs">{formatTime(contribution.created_at)}</Text>
                </View>
              </View>
            </View>

            {/* Separador */}
            {index < contributions.length - 1 && <View className="border-b border-gray-100 dark:border-gray-700 mt-3" />}
          </View>
        ))}

        {/* Botón de cargar más */}
        {onLoadMore && (
          <Pressable onPress={onLoadMore} disabled={isLoading} className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-3 items-center mt-3">
            <Text className="text-gray-600 dark:text-gray-300 font-medium">{isLoading ? 'Cargando...' : 'Cargar más'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
}

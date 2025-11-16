import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useUserPermissions } from '@/features/auth'

interface ProtectedFeatureProps {
  children: React.ReactNode
  feature: 'ai' | 'budgets' | 'goals' | 'advanced'
  fallbackMessage?: string
}

export function ProtectedFeature({ children, feature, fallbackMessage }: ProtectedFeatureProps) {
  const { isDarkMode } = useTheme()
  const { canAccessAdvancedFeatures, canAccessAI, canAccessBudgets, canAccessGoals } = useUserPermissions()

  const canAccess = () => {
    switch (feature) {
      case 'ai':
        return canAccessAI
      case 'budgets':
        return canAccessBudgets
      case 'goals':
        return canAccessGoals
      case 'advanced':
        return canAccessAdvancedFeatures
      default:
        return false
    }
  }

  const getFeatureName = () => {
    switch (feature) {
      case 'ai':
        return 'Inteligencia Artificial'
      case 'budgets':
        return 'Presupuestos'
      case 'goals':
        return 'Metas Financieras'
      case 'advanced':
        return 'Funciones Avanzadas'
      default:
        return 'Esta función'
    }
  }

  if (canAccess()) {
    return <>{children}</>
  }

  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className={`w-full max-w-sm rounded-3xl p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        {/* Icono */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full items-center justify-center mb-4">
            <Ionicons name="lock-closed" size={32} color="white" />
          </View>
          <Text className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getFeatureName()} Bloqueada</Text>
        </View>

        {/* Mensaje */}
        <View className="mb-8">
          <Text className={`text-center text-lg leading-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {fallbackMessage || `Para acceder a ${getFeatureName().toLowerCase()}, necesitas completar tu perfil financiero. Esto nos ayuda a personalizar tu experiencia.`}
          </Text>
        </View>

        {/* Botón */}
        <Pressable
          className="bg-green-500 py-4 rounded-2xl"
          onPress={() => router.push('/(protected)/complete-profile/phase-1')}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text className="text-center text-lg font-semibold text-white">Completar Perfil</Text>
        </Pressable>

        {/* Información adicional */}
        <View className="mt-6">
          <Text className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Solo te tomará 3 minutos</Text>
        </View>
      </View>
    </View>
  )
}

import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'

interface CompleteInfoCardProps {
  onPress?: () => void
  title?: string
  description?: string
  buttonText?: string
}

export function CompleteInfoCard({
  onPress,
  title = 'Completa tu información',
  description = 'Para empezar a ordenarte mejor, necesitamos conocer algunos detalles de tu perfil financiero',
  buttonText = 'Completar perfil',
}: CompleteInfoCardProps) {
  const { isDarkMode } = useTheme()

  return (
    <View className="px-4 mt-6 mb-4">
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-3xl p-6 relative overflow-hidden`}>
        {/* Icono de información */}
        <View className={`absolute top-4 right-4 ${isDarkMode ? 'bg-white/20' : 'bg-[#4CAF50]/20'} rounded-full px-3 py-1`}>
          <Ionicons name="information-circle" size={20} color={isDarkMode ? 'white' : '#4CAF50'} />
        </View>

        {/* Contenido de la tarjeta */}
        <View className="flex-row items-center mb-4">
          <View className={`w-12 h-12 ${isDarkMode ? 'bg-white/20' : 'bg-[#4CAF50]/20'} rounded-full items-center justify-center mr-4`}>
            <Ionicons name="person-circle-outline" size={24} color={isDarkMode ? 'white' : '#4CAF50'} />
          </View>
          <View className="flex-1">
            <Text className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-xl font-bold mb-1`}>{title}</Text>
            <Text className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-sm`}>{description}</Text>
          </View>
        </View>

        {/* Elementos a completar */}
        <View className="space-y-2 mb-6">
          <View className="flex-row items-center">
            <Ionicons name="ellipse-outline" size={16} color={isDarkMode ? 'white' : '#6b7280'} />
            <Text className={`${isDarkMode ? 'text-white/90' : 'text-gray-700'} text-sm ml-2`}>Información personal básica</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="ellipse-outline" size={16} color={isDarkMode ? 'white' : '#6b7280'} />
            <Text className={`${isDarkMode ? 'text-white/90' : 'text-gray-700'} text-sm ml-2`}>Metas financieras</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="ellipse-outline" size={16} color={isDarkMode ? 'white' : '#6b7280'} />
            <Text className={`${isDarkMode ? 'text-white/90' : 'text-gray-700'} text-sm ml-2`}>Preferencias de ahorro</Text>
          </View>
        </View>

        {/* Botón de acción */}
        <Pressable className={`${isDarkMode ? 'bg-white/20' : 'bg-[#4CAF50]'} rounded-2xl p-4 flex-row items-center justify-center`} onPress={onPress}>
          <Ionicons name="arrow-forward" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">{buttonText}</Text>
        </Pressable>
      </View>
    </View>
  )
}

import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '@/features/shared/hooks/useTheme'

export const DarkModeExample: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <View className="bg-white dark:bg-gray-800 p-5 rounded-xl m-4 border border-gray-200 dark:border-gray-700">
      <Text className="text-gray-900 dark:text-white text-lg font-bold mb-2">Ejemplo de Dark Mode</Text>

      <Text className="text-gray-600 dark:text-gray-300 text-sm mb-4">Tema actual: {isDarkMode ? 'Oscuro' : 'Claro'}</Text>

      <TouchableOpacity onPress={toggleTheme} className="bg-blue-600 dark:bg-blue-500 p-3 rounded-lg items-center">
        <Text className="text-white font-semibold">Cambiar Tema</Text>
      </TouchableOpacity>
    </View>
  )
}

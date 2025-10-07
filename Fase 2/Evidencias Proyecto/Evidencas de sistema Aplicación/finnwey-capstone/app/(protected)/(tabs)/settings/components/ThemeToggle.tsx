import { View, Text, Switch, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <Pressable onPress={toggleTheme} className="flex-row items-center px-4 py-3.5 bg-white dark:bg-gray-800">
      <View className="flex-row items-center flex-1">
        <View className={`w-12 h-12 items-center justify-center mr-3 rounded-full ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
          <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={24} color={isDarkMode ? '#ffffff' : '#4CAF50'} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-normal text-gray-900 dark:text-white">Modo Oscuro</Text>
          <Text className="text-sm mt-0.5 text-gray-600 dark:text-gray-300">{isDarkMode ? 'Activado' : 'Desactivado'}</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{
            false: '#e5e7eb',
            true: '#4CAF50',
          }}
          thumbColor={isDarkMode ? '#ffffff' : '#6b7280'}
        />
      </View>
    </Pressable>
  )
}

export default ThemeToggle

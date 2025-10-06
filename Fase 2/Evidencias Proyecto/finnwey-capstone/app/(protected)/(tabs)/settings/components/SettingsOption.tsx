import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'

interface SettingsOptionProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
  onPress: () => void
  showBadge?: boolean
  badgeText?: string
  disabled?: boolean
  destructive?: boolean
}

function SettingsOption({ icon, title, subtitle, onPress, showBadge, badgeText, disabled = false, destructive = false }: SettingsOptionProps) {
  const { isDarkMode } = useTheme()

  const getIconColor = () => {
    if (disabled) return isDarkMode ? '#9ca3af' : '#6b7280'
    if (destructive) return '#ef4444' // Red color for destructive actions
    return isDarkMode ? '#ffffff' : '#4CAF50'
  }

  const getBackgroundColor = () => {
    if (disabled) return 'bg-gray-100 dark:bg-gray-700'
    if (destructive) return 'bg-red-100 dark:bg-red-900/30'
    return 'bg-green-100 dark:bg-green-900/30'
  }

  const getTextColor = () => {
    if (disabled) return 'text-gray-500 dark:text-gray-400'
    if (destructive) return 'text-red-600 dark:text-red-400'
    return 'text-gray-900 dark:text-white'
  }

  const getSubtitleColor = () => {
    if (disabled) return 'text-gray-400 dark:text-gray-500'
    if (destructive) return 'text-red-500 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-300'
  }

  return (
    <Pressable onPress={disabled ? undefined : onPress} className={`flex-row items-center px-4 py-3.5 ${disabled ? 'opacity-70' : ''} bg-white dark:bg-gray-800`}>
      <View className="flex-row items-center flex-1">
        <View className={`w-12 h-12 items-center justify-center mr-3 rounded-full ${getBackgroundColor()}`}>
          <Ionicons name={icon} size={24} color={getIconColor()} />
        </View>
        <View className="flex-1">
          <Text className={`text-lg font-normal ${getTextColor()}`}>{title}</Text>
          {subtitle && <Text className={`text-sm mt-0.5 ${getSubtitleColor()}`}>{subtitle}</Text>}
        </View>
        <View className="flex-row items-center">
          {showBadge && (
            <View className={`px-2.5 py-1 rounded-full mr-2 ${disabled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-green-100 dark:bg-green-900/30'}`}>
              <Text className={`text-sm ${disabled ? 'text-gray-500 dark:text-gray-400' : 'text-green-600 dark:text-white'}`}>{badgeText}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={disabled ? (isDarkMode ? '#9ca3af' : '#9ca3af') : isDarkMode ? '#ffffff' : '#6b7280'} />
        </View>
      </View>
    </Pressable>
  )
}

export default SettingsOption

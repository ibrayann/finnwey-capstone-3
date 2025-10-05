import React from 'react'
import { TouchableOpacity, Text, useColorScheme, ActivityIndicator } from 'react-native'

interface PrimaryButtonProps {
  title: string
  onPress: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export const PrimaryButton = ({ title, onPress, disabled = false, variant = 'primary', loading = false }: PrimaryButtonProps) => {
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  const getButtonStyle = () => {
    if (variant === 'primary') {
      return disabled ? 'bg-[#4CAF50]/50' : 'bg-[#4CAF50]'
    }
    return isDark ? 'border-gray-600' : 'border-gray-200'
  }

  const getTextStyle = () => {
    if (variant === 'primary') {
      return 'text-white'
    }
    return isDark ? 'text-white' : 'text-black'
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`py-4 rounded-full border-gray-600 flex-row items-center justify-center mb-3 ${getButtonStyle()} ${variant === 'secondary' ? 'border' : ''}`}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' ? 'white' : isDark ? 'white' : 'black'} /> : <Text className={`text-lg font-medium ${getTextStyle()}`}>{title}</Text>}
    </TouchableOpacity>
  )
}

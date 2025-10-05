import React from 'react'
import { TouchableOpacity, Text, useColorScheme } from 'react-native'
import { AntDesign } from '@expo/vector-icons'

interface BackButtonProps {
  onPress: () => void
  title: string
}

export const BackButton = ({ onPress, title }: BackButtonProps) => {
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  return (
    <TouchableOpacity onPress={onPress} className="py-2 flex-row items-center justify-center">
      <AntDesign name="arrow-left" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 8 }} />
      <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{title}</Text>
    </TouchableOpacity>
  )
}

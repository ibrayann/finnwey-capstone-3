import React from 'react'
import { TouchableOpacity, Text, useColorScheme } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

interface SocialButtonProps {
  icon: keyof typeof FontAwesome.glyphMap
  title: string
  onPress: () => void
  iconColor?: string
}

export const SocialButton = ({ icon, title, onPress, iconColor }: SocialButtonProps) => {
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`border py-4 rounded-full flex-row items-center justify-center ${isDark ? 'border-gray-600' : 'border-gray-200'} disabled:opacity-50`}
      disabled={true}
    >
      <FontAwesome name={icon} size={20} color={iconColor || (isDark ? '#ffffff' : '#000000')} style={{ marginRight: 8 }} />
      <Text className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'}`}>{'Próximamente'}</Text>
    </TouchableOpacity>
  )
}

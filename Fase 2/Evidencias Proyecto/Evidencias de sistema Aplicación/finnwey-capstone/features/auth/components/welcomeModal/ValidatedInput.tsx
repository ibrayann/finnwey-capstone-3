import React from 'react'
import { View, Text, TouchableOpacity, TextInput, useColorScheme } from 'react-native'
import { AntDesign, Ionicons } from '@expo/vector-icons'

interface ValidatedInputProps {
  label: string
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  error?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'phone-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  icon: keyof typeof AntDesign.glyphMap
  showPasswordToggle?: boolean
  showPassword?: boolean
  onTogglePassword?: () => void
}

export const ValidatedInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  icon,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
}: ValidatedInputProps) => {
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  return (
    <View className="mb-2">
      <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
      <View className={`flex-row items-center rounded-full px-4 h-14 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} ${error ? 'border border-red-500' : ''}`}>
        <AntDesign name={icon} size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
        <TextInput
          className="flex-1 h-full ml-3"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
          style={{ color: isDark ? '#ffffff' : '#000000' }}
        />
        {showPasswordToggle && (
          <TouchableOpacity onPress={onTogglePassword}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1 ml-4">{error}</Text>}
    </View>
  )
}

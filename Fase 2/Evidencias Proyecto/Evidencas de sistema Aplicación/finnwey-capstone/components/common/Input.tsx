import React, { ReactNode } from 'react'
import { View, TextInput, Text, TextInputProps } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { twMerge } from 'tailwind-merge'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  icon?: keyof typeof MaterialIcons.glyphMap
  rightElement?: ReactNode
}

export const Input = ({ label, error, icon, rightElement, className, ...props }: InputProps) => {
  return (
    <View className="w-full">
      {label && <Text className="mb-2 font-medium text-text-light dark:text-text-dark">{label}</Text>}
      <View className={twMerge('flex-row items-center rounded-xl px-4 bg-gray-100 dark:bg-[#1e2021]', error && 'border border-red-500', className)}>
        {icon && <MaterialIcons name={icon} size={20} color="#9CA3AF" style={{ marginRight: 8 }} />}
        <TextInput className="flex-1 p-4 bg-transparent text-text-light dark:text-text-dark" placeholderTextColor="#9CA3AF" {...props} />
        {rightElement}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  )
}

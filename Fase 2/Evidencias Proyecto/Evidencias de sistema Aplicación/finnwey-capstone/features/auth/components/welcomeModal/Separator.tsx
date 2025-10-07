import React from 'react'
import { View, Text, useColorScheme } from 'react-native'

export const Separator = () => {
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  return (
    <View className="flex-row items-center justify-center my-8">
      <View className={`flex-1 h-[1px] ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
      <Text className={`mx-4 text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>o</Text>
      <View className={`flex-1 h-[1px] ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
    </View>
  )
}

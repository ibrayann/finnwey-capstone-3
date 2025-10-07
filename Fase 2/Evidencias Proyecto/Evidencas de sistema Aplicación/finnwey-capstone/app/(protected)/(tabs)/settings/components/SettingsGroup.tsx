import { View, Text } from 'react-native'

interface SettingsGroupProps {
  title: string
  children: React.ReactNode
}

function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <View className="mt-6">
      <Text className="px-4 mb-2 text-base font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</Text>
      <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">{children}</View>
    </View>
  )
}

export default SettingsGroup

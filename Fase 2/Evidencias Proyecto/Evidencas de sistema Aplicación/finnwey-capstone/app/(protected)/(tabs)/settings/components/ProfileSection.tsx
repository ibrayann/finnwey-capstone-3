import { View, Text, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

interface ProfileSectionProps {
  name: string
  email: string
}

function ProfileSection({ name, email }: ProfileSectionProps) {
  return (
    <View className="px-4 py-4">
      <Text className="text-black dark:text-white text-2xl font-semibold mb-6">Configuración</Text>
      <TouchableOpacity onPress={() => router.push('/settings/edit-profile')} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <View className="flex-row items-center gap-x-4">
          <Image source={{ uri: 'https://via.placeholder.com/50' }} className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30" />
          <View className="flex-1">
            <Text className="text-black dark:text-white text-xl font-semibold">¡Hola, {name}!</Text>
            <Text className="text-gray-500 dark:text-gray-300 text-base">{email}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default ProfileSection

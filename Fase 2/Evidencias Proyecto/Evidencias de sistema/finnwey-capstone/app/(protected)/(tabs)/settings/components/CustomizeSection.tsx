import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface CustomizeSectionProps {
  onPress: () => void
}

function CustomizeSection({ onPress }: CustomizeSectionProps) {
  return (
    <View className="mx-4 mt-6 bg-background-light rounded-2xl shadow-sm overflow-hidden">
      <Pressable onPress={onPress} className="flex-row items-center p-4">
        <View className="flex-1 flex-row items-center">
          <View className="mr-4 bg-green-50 rounded-full p-2 w-12 h-12 items-center justify-center">
            <Ionicons name="person-outline" size={24} color="#4CAF50" />
          </View>
          <View className="flex-1 pr-4">
            <Text className="text-lg font-semibold">Personaliza tu Experiencia</Text>
            <Text className="text-base text-muted-foreground mt-1">Administra tu perfil, notificaciones y preferencias en un solo lugar.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9e9e9e" />
        </View>
      </Pressable>
    </View>
  )
}

export default CustomizeSection

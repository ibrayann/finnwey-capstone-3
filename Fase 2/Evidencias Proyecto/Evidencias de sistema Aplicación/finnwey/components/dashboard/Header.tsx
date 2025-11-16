import { View, Text, Image, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '@/store/auth.store'

export default function Header() {
  const { user, profile } = useAuthStore()
  
  // Obtener el nombre del usuario, priorizando profile.full_name, luego user.full_name, o un valor por defecto
  const userName = profile?.full_name || user?.full_name || 'Usuario'
  
  // Extraer solo el primer nombre si hay espacio
  const firstName = userName.split(' ')[0]

  return (
    <View className="px-4 mt-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-3">
          <View>
            <Text className="text-xl font-bold text-white" style={{ textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
              Hola, {firstName}
            </Text>
          </View>
        </View>
        {/* <TouchableOpacity className="bg-white/25 rounded-full p-2 shadow-sm">
          <Feather name="more-vertical" size={24} color="#fff" />
        </TouchableOpacity> */}
      </View>
    </View>
  )
}

import { View, Text, Image, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'

export default function Header() {
  return (
    <View className="px-4 mt-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-3">
          <View>
            <Text className="text-xl font-bold text-white" style={{ textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
              Hi, Brayan
            </Text>
          </View>
        </View>
        <TouchableOpacity className="bg-white/25 rounded-full p-2 shadow-sm">
          <Feather name="more-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

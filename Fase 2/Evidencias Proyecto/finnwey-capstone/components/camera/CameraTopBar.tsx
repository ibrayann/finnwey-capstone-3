import { View, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { FlashMode } from 'expo-camera'

interface CameraTopBarProps {
  flash: FlashMode
  onToggleFlash: () => void
}

export function CameraTopBar({ flash, onToggleFlash }: CameraTopBarProps) {
  return (
    <View className="absolute top-14 left-0 right-0 px-4">
      <View className="flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-14 h-14 rounded-full bg-white/30 items-center justify-center">
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onToggleFlash} className={`w-14 h-14 rounded-full items-center justify-center ${flash === 'on' ? 'bg-[#4CAF50]' : 'bg-white/30'}`}>
          <Ionicons name={flash === 'on' ? 'flash' : 'flash-off'} size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CameraTopBar

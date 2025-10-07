import { View, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CameraType } from 'expo-camera'

interface CameraControlsProps {
  onTakePicture: () => void
  facing: CameraType
  onFlipCamera: () => void
  onSelectFromGallery: () => void
}

export function CameraControls({ onTakePicture, facing, onFlipCamera, onSelectFromGallery }: CameraControlsProps) {
  return (
    <View className="absolute bottom-14 left-0 right-0">
      <View className="flex-row justify-center items-center">
        {/* Botón de galería */}
        <TouchableOpacity onPress={onSelectFromGallery} className="w-14 h-14 rounded-full bg-white/30 items-center justify-center mx-4">
          <Ionicons name="images" size={28} color="white" />
        </TouchableOpacity>

        {/* Botón de captura */}
        <TouchableOpacity onPress={onTakePicture} className="w-20 h-20 rounded-full bg-white items-center justify-center mx-4">
          <View className="w-16 h-16 rounded-full bg-[#4CAF50]" />
        </TouchableOpacity>

        {/* Botón de cambio de cámara */}
        <TouchableOpacity onPress={onFlipCamera} className="w-14 h-14 rounded-full bg-white/30 items-center justify-center mx-4">
          <Ionicons name="camera-reverse" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CameraControls

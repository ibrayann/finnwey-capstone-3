import { View, Text } from 'react-native'

export function CameraFrame() {
  return (
    <View className="absolute bottom-40 left-0 right-0">
      <View className="mx-6 bg-black/30 rounded-full px-3 py-2">
        <Text className="text-white/80 text-center text-sm font-medium">Asegúrate de que la foto sea nítida y clara</Text>
      </View>
    </View>
  )
}

export default CameraFrame

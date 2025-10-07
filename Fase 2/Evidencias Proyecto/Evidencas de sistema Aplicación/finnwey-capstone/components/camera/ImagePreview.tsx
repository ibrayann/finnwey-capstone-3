import { View, Image, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

interface ImagePreviewProps {
  imageUri: string
  onDiscard: () => void
  onSave: () => void
}

export function ImagePreview({ imageUri, onDiscard, onSave }: ImagePreviewProps) {
  const handleConfirmImage = () => {
    console.log('🎯 Confirmando imagen escaneada')
    console.log('📸 URI de la imagen:', imageUri)
    console.log('🚀 Navegando al registro de gastos...')

    // Navegar al registro de gastos con la imagen escaneada
    router.push({
      pathname: '/(protected)/(tabs)/dashboard/add-transaction',
      params: { scannedImage: imageUri },
    })
  }

  const handleSelectFromGallery = async () => {
    try {
      console.log('🖼️ Abriendo galería de imágenes...')

      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert('Permisos Requeridos', 'Necesitamos acceso a tu galería para seleccionar imágenes de boletas.', [{ text: 'OK' }])
        return
      }

      // Abrir galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0]
        console.log('🖼️ Imagen seleccionada de galería:', selectedImage.uri)

        // Navegar al registro de gastos con la imagen seleccionada
        router.push({
          pathname: '/(protected)/(tabs)/dashboard/add-transaction',
          params: { scannedImage: selectedImage.uri },
        })
      }
    } catch (error) {
      console.error('❌ Error al seleccionar imagen de galería:', error)
      Alert.alert('Error', 'No se pudo seleccionar la imagen de la galería.')
    }
  }

  return (
    <View className="flex-1 relative">
      <Image source={{ uri: imageUri }} className="flex-1" resizeMode="contain" />

      {/* Botón de cerrar */}
      <View className="absolute top-14 left-0 right-0 px-4">
        <TouchableOpacity onPress={onDiscard} className="w-12 h-12 rounded-full bg-white/30 items-center justify-center">
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Botón de galería (esquina inferior izquierda) */}
      <View className="absolute bottom-14 left-6">
        <TouchableOpacity onPress={handleSelectFromGallery} className="w-12 h-12 rounded-full bg-white/30 items-center justify-center">
          <Ionicons name="images" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Botón de confirmar (esquina inferior derecha) */}
      <View className="absolute bottom-14 right-6">
        <TouchableOpacity onPress={handleConfirmImage} className="w-12 h-12 rounded-full bg-white/30 items-center justify-center">
          <Ionicons name="checkmark" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ImagePreview

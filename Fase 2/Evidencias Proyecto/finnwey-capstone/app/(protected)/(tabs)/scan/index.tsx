import { View, Text, TouchableOpacity, StatusBar, Image, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useNavigation } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera'
import { useState, useRef, useEffect } from 'react'
import { CameraControls, CameraTopBar, CameraFrame, ImagePreview } from '@/components/camera'
import * as ImagePicker from 'expo-image-picker'
import { useScanReceipt } from '@/features/receipt'
import { useCreateTransaction } from '@/features/transactions'

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>('back')
  const [flash, setFlash] = useState<FlashMode>('off')
  const [permission, requestPermission] = useCameraPermissions()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)

  const cameraRef = useRef<CameraView>(null)
  const navigation = useNavigation()
  const { scanReceipt, isScanning, scannedData, error } = useScanReceipt()
  const { createTransactionWithReceipt, isCreating } = useCreateTransaction()

  // Ocultar el tab bar cuando se monta este componente
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      tabBarStyle: { display: 'none' },
    })

    return () => {
      navigation.setOptions({
        tabBarStyle: undefined,
      })
    }
  }, [navigation])

  // Efecto para mantener el zoom cuando se cambia la cámara

  const handleCameraReady = () => {
    console.log('Cámara lista para usar')
    setIsCameraReady(true)
    // Establecer zoom inicial
  }

  const handleTakePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        console.log('📸 Tomando foto...')
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        })

        if (photo && photo.uri) {
          console.log('✅ Foto tomada exitosamente:', photo.uri)
          console.log('📱 Dimensiones:', photo.width, 'x', photo.height)
          setCapturedImage(photo.uri)
        }
      } catch (error) {
        console.error('❌ Error al tomar la foto:', error)
      }
    }
  }

  const discardImage = () => {
    setCapturedImage(null)
  }

  const saveImage = async () => {
    if (!capturedImage) return

    try {
      console.log('🔍 Iniciando escaneo de boleta...')

      // Escanear la boleta usando la Edge Function
      const data = await scanReceipt(capturedImage)

      console.log('✅ Datos escaneados:', data)

      // Mostrar opciones al usuario
      Alert.alert(
        '✅ Boleta Escaneada',
        `Comercio: ${data.merchantName || 'N/A'}\nTotal: $${data.totalAmount?.toLocaleString('es-CL') || '0'}\nCategoría: ${data.category || 'N/A'}\n\n¿Qué deseas hacer?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              setCapturedImage(null)
            },
          },
          {
            text: 'Guardar Directamente',
            onPress: async () => {
              await handleSaveTransaction(data, capturedImage)
            },
          },
          {
            text: 'Editar Antes',
            onPress: () => {
              // Navegar a la pantalla de agregar transacción para editar
              setCapturedImage(null)
              router.push({
                pathname: '/(protected)/(tabs)/dashboard/add-transaction',
                params: {
                  fromScan: 'true',
                  merchantName: data.merchantName || '',
                  amount: data.totalAmount?.toString() || '',
                  category: data.category || '',
                  subcategory: data.subcategory || '',
                  date: data.transactionDate || new Date().toISOString().split('T')[0],
                  notes: `Boleta #${data.receiptNumber || 'N/A'}\n${data.merchantAddress || ''}`.trim(),
                  imageUri: capturedImage,
                },
              })
            },
          },
        ]
      )
    } catch (error) {
      console.error('❌ Error al escanear:', error)
      Alert.alert('Error al Escanear', error instanceof Error ? error.message : 'No se pudo procesar la boleta. Por favor, intenta nuevamente.', [
        {
          text: 'Reintentar',
          onPress: () => saveImage(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setCapturedImage(null),
        },
      ])
    }
  }

  const handleSaveTransaction = async (receiptData: any, imageUri: string) => {
    try {
      console.log('💾 Guardando transacción completa...')

      // Validar datos mínimos
      if (!receiptData.merchantName || !receiptData.totalAmount) {
        throw new Error('Faltan datos esenciales de la boleta')
      }

      // Crear la transacción con imagen y receipt
      const result = await createTransactionWithReceipt(
        {
          merchantName: receiptData.merchantName,
          amount: receiptData.totalAmount,
          category: receiptData.category || 'Compras',
          subcategory: receiptData.subcategory || 'Imprevistos',
          transactionDate: receiptData.transactionDate || new Date().toISOString().split('T')[0],
          transactionType: 'expense', // Las boletas escaneadas siempre son gastos
          notes: `Boleta #${receiptData.receiptNumber || 'N/A'}\n${receiptData.merchantAddress || ''}`.trim(),
          receiptData: receiptData,
        },
        imageUri,
        receiptData
      )

      if (result.success) {
        console.log('✅ Transacción guardada exitosamente')
        setCapturedImage(null)

        Alert.alert('¡Éxito!', `Gasto de $${receiptData.totalAmount?.toLocaleString('es-CL')} guardado correctamente en ${receiptData.merchantName}`, [
          {
            text: 'Ver Dashboard',
            onPress: () => router.push('/(protected)/(tabs)/dashboard'),
          },
          {
            text: 'Escanear Otra',
            onPress: () => {
              // Ya estamos en la pantalla de scan
            },
          },
        ])
      } else {
        throw new Error('No se pudo guardar la transacción')
      }
    } catch (error) {
      console.error('❌ Error al guardar transacción:', error)
      Alert.alert('Error al Guardar', error instanceof Error ? error.message : 'No se pudo guardar la transacción. Por favor, intenta nuevamente.', [
        {
          text: 'Reintentar',
          onPress: () => handleSaveTransaction(receiptData, imageUri),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setCapturedImage(null),
        },
      ])
    }
  }

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off')
  }

  const handleSelectFromGallery = async () => {
    try {
      console.log('🖼️ Abriendo galería de imágenes...')

      // Solicitar permisos de galería
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
        setCapturedImage(selectedImage.uri)
      }
    } catch (error) {
      console.error('❌ Error al seleccionar imagen de galería:', error)
      Alert.alert('Error', 'No se pudo seleccionar la imagen de la galería.')
    }
  }

  if (!permission) {
    return (
      <View className="flex-1 bg-gray-500 items-center justify-center">
        <Text className="text-white text-lg">Solicitando permiso de cámara...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-gray-500 items-center justify-center px-6">
        <View className="items-center">
          <View className="w-20 h-20 bg-white/20 dark:bg-green-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="camera-outline" size={40} color="white dark:text-green-600" />
          </View>
          <Text className="text-white dark:text-black text-2xl font-medium text-center mb-2">Acceso a la Cámara</Text>
          <Text className="text-white/70 dark:text-gray-600 text-lg text-center mb-8">Necesitamos acceso a tu cámara para escanear documentos y boletas</Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-[#4CAF50] dark:bg-green-600 px-8 py-4 rounded-full shadow-lg"
            style={{
              shadowColor: '#4CAF50',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text className="text-white font-semibold text-lg">Permitir Acceso</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 overflow-hidden rounded-2xl">
          {capturedImage ? (
            <>
              <ImagePreview imageUri={capturedImage} onDiscard={discardImage} onSave={saveImage} />

              {/* Overlay de loading durante el escaneo o guardado */}
              {(isScanning || isCreating) && (
                <View className="absolute inset-0 bg-black/80 items-center justify-center z-50">
                  <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 items-center shadow-2xl">
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text className="text-gray-900 dark:text-white text-xl font-semibold mt-4">{isScanning ? 'Escaneando Boleta' : 'Guardando Transacción'}</Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-base mt-2 text-center">{isScanning ? 'Extrayendo información con IA...' : 'Subiendo imagen y guardando datos...'}</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <CameraView ref={cameraRef} facing={facing} flash={flash} style={{ flex: 1 }} ratio="16:9" onCameraReady={handleCameraReady}>
              <View className="flex-1 bg-transparent">
                <CameraFrame />

                <CameraTopBar flash={flash} onToggleFlash={toggleFlash} />

                <CameraControls
                  onTakePicture={handleTakePicture}
                  facing={facing}
                  onFlipCamera={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
                  onSelectFromGallery={handleSelectFromGallery}
                />
              </View>
            </CameraView>
          )}
        </View>
      </SafeAreaView>
    </View>
  )
}

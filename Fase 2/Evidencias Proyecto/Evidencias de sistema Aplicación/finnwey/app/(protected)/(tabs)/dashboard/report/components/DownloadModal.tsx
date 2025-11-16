import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Modal } from '@/components/common/Modal'
import { useState } from 'react'
import { CircularProgressBase } from 'react-native-circular-progress-indicator'
import { useTheme } from '@/features/shared/hooks/useTheme'

interface DownloadModalProps {
  visible: boolean
  onClose: () => void
}

function DownloadModal({ visible, onClose }: DownloadModalProps) {
  const { isDarkMode } = useTheme()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadedSize, setDownloadedSize] = useState(0)

  const totalSize = 2900 // 2.9 MB en KB

  const simulateDownload = () => {
    setIsDownloading(true)
    setIsError(false)
    let currentProgress = 0
    setDownloadedSize(0)

    const interval = setInterval(() => {
      currentProgress += 2
      setProgress(currentProgress)

      // Calcular el tamaño descargado basado en el progreso
      const downloaded = Math.round((currentProgress / 100) * totalSize)
      setDownloadedSize(downloaded)

      if (currentProgress >= 100) {
        clearInterval(interval)
        setIsDownloading(false)
        setIsSuccess(true)
      }
    }, 40)
  }

  if (isError) {
    return (
      <Modal visible={visible} onClose={onClose}>
        <View className="flex flex-col items-center">
          <View className="bg-red-100 rounded-full p-4 mb-6">
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
          </View>

          <Text className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Error de descarga</Text>

          <Text className={`text-center mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Ha ocurrido un error al descargar el archivo. Por favor, verifica tu conexión a internet e intenta nuevamente.
          </Text>

          <View className="w-full flex flex-col gap-4">
            <TouchableOpacity className="bg-[#4CAF50] dark:bg-green-600 py-4 rounded-full flex-row items-center justify-center" onPress={simulateDownload}>
              <Text className="text-white text-lg font-medium">Reintentar</Text>
            </TouchableOpacity>

            <TouchableOpacity className={`border py-4 rounded-full flex-row items-center justify-center ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} onPress={onClose}>
              <Text className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  if (isSuccess) {
    return (
      <Modal visible={visible} onClose={onClose}>
        <View className="flex flex-col items-center">
          <View className="bg-green-500 rounded-full p-4 mb-6">
            <Ionicons name="checkmark" size={48} color="white" />
          </View>

          <Text className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>¡Descarga exitosa!</Text>

          <Text className={`text-center mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Tu PDF ha sido descargado exitosamente. Puedes verlo en la carpeta de descargas de tu dispositivo.
          </Text>

          <View className="w-full flex flex-col gap-4">
            <TouchableOpacity
              className="bg-[#4CAF50] dark:bg-green-600 py-4 rounded-full flex-row items-center justify-center"
              onPress={() => {
                // Aquí iría la lógica para abrir el PDF
                setIsSuccess(false)
                setIsDownloading(false)
                setIsError(false)
                onClose()
              }}
            >
              <Text className="text-white text-lg font-medium">Abrir PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity className={`border py-4 rounded-full flex-row items-center justify-center ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} onPress={onClose}>
              <Text className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  if (isDownloading) {
    return (
      <Modal visible={visible} onClose={onClose}>
        <View className="flex flex-col items-center">
          <View className="mb-6">
            <CircularProgressBase
              value={progress}
              radius={40}
              activeStrokeColor={isDarkMode ? '#4ade80' : '#4CAF50'}
              inActiveStrokeColor={isDarkMode ? '#374151' : '#E5E7EB'}
              inActiveStrokeOpacity={0.2}
              activeStrokeWidth={6}
              inActiveStrokeWidth={6}
            >
              <Text className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{progress}%</Text>
            </CircularProgressBase>
          </View>

          <Text className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Preparando archivo...</Text>
          <Text className={`text-center mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            1 Archivo • {downloadedSize.toLocaleString()} KB de {totalSize.toLocaleString()} KB
          </Text>

          <TouchableOpacity className={`border py-4 rounded-full flex-row items-center justify-center w-full mt-6 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} onPress={onClose}>
            <Text className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={visible} onClose={onClose}>
      <View className="flex flex-col items-center">
        <View className={`rounded-full p-6 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <Ionicons name="document-text" size={48} color="#ef4444" />
        </View>

        <Text className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Daily Report • PDF • 2,9 MB</Text>

        <Text className={`text-center mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Tu reporte ha sido generado exitosamente y está listo para descargar. Haz clic en el botón de abajo para guardar el PDF en tu dispositivo.
        </Text>

        <View className="w-full flex flex-col gap-4">
          <TouchableOpacity className="bg-[#4CAF50] dark:bg-green-600 py-4 rounded-full flex-row items-center justify-center" onPress={simulateDownload}>
            <Text className="text-white text-lg font-medium">Descargar PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity className={`border py-4 rounded-full flex-row items-center justify-center ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} onPress={onClose}>
            <Text className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default DownloadModal

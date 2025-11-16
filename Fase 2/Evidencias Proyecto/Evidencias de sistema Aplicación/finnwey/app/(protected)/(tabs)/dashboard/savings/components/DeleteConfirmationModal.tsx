import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Modal } from '@/components/common/Modal'
import { useTheme } from '@/features/shared/hooks/useTheme'

interface DeleteConfirmationModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  selectedCount: number
  goalNames?: string[]
}

function DeleteConfirmationModal({ visible, onClose, onConfirm, selectedCount, goalNames }: DeleteConfirmationModalProps) {
  const { isDarkMode } = useTheme()

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal visible={visible} onClose={onClose}>
      <View className="flex flex-col items-center">
        {/* Icono de advertencia */}
        <View className="bg-red-100 dark:bg-red-900/30 rounded-full p-6 mb-6">
          <Ionicons name="warning" size={48} color="#EF4444" />
        </View>

        {/* Título principal */}
        <Text className={`text-2xl font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          ¿Eliminar {selectedCount} {selectedCount === 1 ? 'objetivo' : 'objetivos'}?
        </Text>

        {/* Advertencia principal */}
        <Text className={`text-center mb-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Esta acción es <Text className="font-bold text-red-500">irreversible</Text> y eliminará permanentemente:
        </Text>

        {/* Lista de consecuencias */}
        <View className="w-full mb-6 px-4">
          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <Text className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Text className="font-semibold">Todo el historial de ahorros</Text> asociado a {selectedCount === 1 ? 'este objetivo' : 'estos objetivos'}
              </Text>
            </View>

            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <Text className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Text className="font-semibold">Progreso y estadísticas</Text> acumuladas
              </Text>
            </View>

            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <Text className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Text className="font-semibold">Metas y fechas objetivo</Text> configuradas
              </Text>
            </View>

            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <Text className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Text className="font-semibold">Notas y recordatorios</Text> personalizados
              </Text>
            </View>
          </View>
        </View>

        {/* Objetivos a eliminar */}
        {goalNames && goalNames.length > 0 && (
          <View className="w-full mb-6 px-4">
            <Text className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>OBJETIVOS A ELIMINAR:</Text>
            <View className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {goalNames.slice(0, 3).map((name, index) => (
                <Text key={index} className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  • {name}
                </Text>
              ))}
              {goalNames.length > 3 && <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>... y {goalNames.length - 3} más</Text>}
            </View>
          </View>
        )}

        {/* Advertencia final */}
        <View className={`w-full mb-8 px-4 py-3 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#EF4444" className="mt-0.5 mr-2" />
            <Text className={`flex-1 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
              <Text className="font-semibold">No podrás recuperar esta información.</Text> Asegúrate de que realmente quieres eliminar {selectedCount === 1 ? 'este objetivo' : 'estos objetivos'}.
            </Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View className="w-full flex flex-col gap-3">
          {/* Botón de eliminar */}
          <TouchableOpacity className="bg-red-500 dark:bg-red-600 py-4 rounded-full flex-row items-center justify-center" onPress={handleConfirm}>
            <Ionicons name="trash" size={20} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              Sí, eliminar {selectedCount} {selectedCount === 1 ? 'objetivo' : 'objetivos'}
            </Text>
          </TouchableOpacity>

          {/* Botón de cancelar */}
          <TouchableOpacity className={`border-2 py-4 rounded-full flex-row items-center justify-center ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} onPress={onClose}>
            <Ionicons name="close" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text className={`text-lg font-medium ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default DeleteConfirmationModal

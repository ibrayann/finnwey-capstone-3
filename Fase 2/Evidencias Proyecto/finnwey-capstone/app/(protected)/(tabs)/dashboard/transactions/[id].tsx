import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import Svg, { Circle } from 'react-native-svg'
import { useTransaction, useDeleteTransaction } from '@/hooks/queries/useTransactions'
import { useTheme } from '@/features/shared/hooks/useTheme'
import TransactionDetailTabs from '@/components/dashboard/TransactionDetailTabs'
import EditTransactionModal from '@/components/dashboard/EditTransactionModal'

export default function TransactionDetailScreen() {
  const { isDarkMode } = useTheme()
  const { id } = useLocalSearchParams()

  // Usar el hook de Supabase para obtener la transacción
  const { data: transaction, isLoading, error } = useTransaction(id as string, true)
  const deleteTransactionMutation = useDeleteTransaction()

  const [showOptions, setShowOptions] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Estados de carga y error
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium">Cargando...</Text>
            <View className="w-12 h-12" />
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 mt-4 rounded-t-3xl px-4 pt-4 items-center justify-center">
            <Text className="text-gray-800 dark:text-white text-center mt-8">Cargando transacción...</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  if (error || !transaction) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium">Detalle de Transacción</Text>
            <View className="w-12 h-12" />
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 mt-4 rounded-t-3xl px-4 pt-4">
            <Text className="text-gray-800 dark:text-white text-center mt-8">{error ? 'Error al cargar la transacción' : 'Transacción no encontrada'}</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  const handleEdit = () => {
    setShowOptions(false)
    setShowEditModal(true)
  }

  const handleDelete = () => {
    setShowOptions(false)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteTransactionMutation.mutateAsync(transaction.id)
      setShowDeleteModal(false)
      Alert.alert('Éxito', 'Transacción eliminada correctamente', [{ text: 'OK', onPress: () => router.back() }])
    } catch (error) {
      console.error('Error al eliminar transacción:', error)
      Alert.alert('Error', 'No se pudo eliminar la transacción. Inténtalo de nuevo.')
    }
  }

  const handleEditSuccess = () => {
    // Refrescar los datos después de editar
    // El hook useTransaction ya se actualizará automáticamente por la invalidación de queries
  }

  const transactionType = transaction.transaction_type?.name || 'expense'
  const isExpense = transactionType === 'expense'

  // Calcular porcentaje (para efectos visuales, usando el monto como "progreso")
  // Esto es solo para mostrar el círculo, no tiene lógica real de porcentaje
  const displayPercentage = 100 // Siempre completo para transacciones individuales

  const getStatusColor = () => {
    return isExpense ? '#ef4444' : '#10b981' // Rojo para gasto, verde para ingreso
  }

  return (
    <View className="flex-1 bg-[#166534] dark:bg-gray-900">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-1">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-medium">Detalle de Transacción</Text>
            <View>
              <TouchableOpacity onPress={() => setShowOptions(true)} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                <Ionicons name="ellipsis-horizontal" size={20} color="white" />
              </TouchableOpacity>

              <Modal visible={showOptions} transparent={true} animationType="fade" onRequestClose={() => setShowOptions(false)}>
                <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setShowOptions(false)}>
                  <View className={`absolute top-20 right-4 rounded-xl shadow-lg py-2 w-52 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <TouchableOpacity className="flex-row items-center px-4 py-3" onPress={handleEdit}>
                      <Ionicons name="create-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Editar transacción</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      onPress={() => {
                        setShowOptions(false)
                        Alert.alert('Próximamente', 'La función de compartir estará disponible pronto')
                      }}
                    >
                      <Ionicons name="share-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Compartir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center px-4 py-3" onPress={handleDelete}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      <Text className="ml-3 text-red-500">Eliminar transacción</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
          </View>

          {/* Información de la transacción */}
          <View className="px-6 py-2">
            <View className="items-center">
              {/* Icono con círculo de progreso */}
              <View className="w-24 h-24 items-center justify-center mb-4">
                <Svg width="100%" height="100%" viewBox="0 0 128 128">
                  {/* Círculo de progreso */}
                  <Circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={getStatusColor()}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - Math.min(displayPercentage, 100) / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 64 64)"
                  />
                </Svg>
                {/* Fondo del círculo e icono */}
                <View className="absolute bg-white dark:bg-gray-700 rounded-full w-18 h-18 items-center justify-center shadow-sm">
                  <Ionicons name={isExpense ? 'trending-down' : 'trending-up'} size={36} color={getStatusColor()} />
                </View>
              </View>

              {/* Nombre del comercio/descripción */}
              <Text className="text-white text-2xl font-bold text-center mb-1">{transaction.merchant_name || transaction.description}</Text>
              <Text className="text-white/60 text-base text-center mb-4">
                {new Date(transaction.transaction_date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Contenido principal con tabs */}
          <View className="bg-white dark:bg-gray-800 mt-2 rounded-t-3xl min-h-screen">
            <TransactionDetailTabs transaction={transaction} />
          </View>
        </ScrollView>

        {/* Modal de Edición */}
        <EditTransactionModal visible={showEditModal} onClose={() => setShowEditModal(false)} transaction={transaction} onSuccess={handleEditSuccess} />

        {/* Modal de Eliminación */}
        <Modal visible={showDeleteModal} transparent={true} animationType="slide" onRequestClose={() => setShowDeleteModal(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <View className={`bg-white dark:bg-gray-800 rounded-t-3xl p-6`}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-black dark:text-white text-xl font-medium">Eliminar Transacción</Text>
                <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
              </View>

              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-red-500/20 rounded-full items-center justify-center mb-4">
                  <Ionicons name="warning" size={32} color="#ef4444" />
                </View>
                <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer.</Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-gray-500 rounded-xl py-4" onPress={() => setShowDeleteModal(false)}>
                  <Text className="text-white text-center font-semibold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-red-500 rounded-xl py-4" onPress={confirmDelete} disabled={deleteTransactionMutation.isPending}>
                  <Text className="text-white text-center font-semibold">{deleteTransactionMutation.isPending ? 'Eliminando...' : 'Eliminar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  )
}

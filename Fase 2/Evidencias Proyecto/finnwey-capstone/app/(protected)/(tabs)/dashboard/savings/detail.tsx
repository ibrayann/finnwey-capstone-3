import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import Svg, { Circle } from 'react-native-svg'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useGoal, useGoalContributions } from '@/features/goals'
import { FinancialGoal, GoalContribution, ContributionRequest, UpdateGoalRequest } from '@/types/savings'
import AddMoneyModal from '@/components/dashboard/AddMoneyModal'
import EditGoalModal from '@/components/dashboard/EditGoalModal'
import SavingsDetailTabs from '@/components/dashboard/SavingsDetailTabs'

export default function GoalDetailScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>()
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
  const [showEditGoalModal, setShowEditGoalModal] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const { isDarkMode } = useTheme()

  // Usar los hooks de Supabase para obtener datos reales
  const { data: financialGoal, isLoading: isLoadingGoal, error: goalError } = useGoal(goalId || '', true)
  const { data: contributions, isLoading: isLoadingContributions, error: contributionsError } = useGoalContributions(goalId || '')

  // Mostrar loading mientras se cargan los datos
  if (isLoadingGoal) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium">Detalle del Objetivo</Text>
            <View className="w-12 h-12" />
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 mt-4 rounded-t-3xl px-4 pt-4 items-center justify-center">
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text className="text-gray-600 dark:text-gray-300 mt-4">Cargando objetivo...</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  // Mostrar error si hay problemas
  if (goalError) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium">Detalle del Objetivo</Text>
            <View className="w-12 h-12" />
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 mt-4 rounded-t-3xl px-4 pt-4 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text className="text-gray-600 dark:text-gray-300 mt-4 text-center">Error al cargar el objetivo</Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm">{goalError.message}</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  const handleUpdateGoal = async (updateRequest: UpdateGoalRequest) => {
    try {
      // Simular actualización de objetivo
      console.log('Updating goal:', updateRequest)

      // En una app real, aquí harías la llamada al backend
      // Por ahora solo cerramos el modal
    } catch (error) {
      console.error('Error updating goal:', error)
      throw error
    }
  }

  if (!financialGoal) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium">Detalle del Objetivo</Text>
            <View className="w-12 h-12" />
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 mt-4 rounded-t-3xl px-4 pt-4">
            <Text className="text-gray-800 dark:text-white text-center mt-8">Objetivo no encontrado</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  const progressPercentage = financialGoal?.progress_percentage || 0

  return (
    <View className="flex-1 bg-[#166534] dark:bg-gray-900">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-1">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-medium">Detalle del Objetivo</Text>
            <View>
              <TouchableOpacity onPress={() => setShowOptions(true)} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                <Ionicons name="ellipsis-horizontal" size={20} color="white" />
              </TouchableOpacity>

              <Modal visible={showOptions} transparent={true} animationType="fade" onRequestClose={() => setShowOptions(false)}>
                <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setShowOptions(false)}>
                  <View className={`absolute top-20 right-4 rounded-xl shadow-lg py-2 w-52 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      onPress={() => {
                        setShowOptions(false)
                        setShowAddMoneyModal(true)
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Agregar dinero</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      onPress={() => {
                        setShowOptions(false)
                        setShowEditGoalModal(true)
                      }}
                    >
                      <Ionicons name="create-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Editar objetivo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      onPress={() => {
                        setShowOptions(false)
                        // TODO: Implementar eliminación de objetivo
                        console.log('Delete goal')
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Eliminar objetivo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      onPress={() => {
                        setShowOptions(false)
                        // TODO: Implementar compartir objetivo
                        console.log('Share goal')
                      }}
                    >
                      <Ionicons name="share-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Compartir objetivo</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
          </View>

          {/* Información del objetivo */}
          <View className="px-6 py-2">
            <View className="items-center">
              {/* Icono más pequeño con círculo de progreso */}
              <View className="w-24 h-24 items-center justify-center mb-4">
                <Svg width="100%" height="100%" viewBox="0 0 128 128">
                  {/* Círculo de progreso (verde) */}
                  <Circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#4CAF50"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 64 64)"
                  />
                </Svg>
                {/* Fondo del círculo e icono */}
                <View className="absolute bg-white dark:bg-gray-700 rounded-full w-18 h-18 items-center justify-center shadow-sm">
                  <Ionicons name={financialGoal?.icon as any} size={36} color={isDarkMode ? '#ffffff' : financialGoal?.color} />
                </View>
              </View>

              {/* Nombre del objetivo */}
              <Text className="text-white text-2xl font-bold text-center mb-1">{financialGoal?.name}</Text>
              <Text className="text-white/60 text-base text-center mb-4">{financialGoal?.days_left} Días Restantes</Text>
            </View>
          </View>

          {/* Contenido principal con tabs */}
          <View className="bg-white dark:bg-gray-800 mt-2 rounded-t-3xl min-h-screen">
            <SavingsDetailTabs goal={financialGoal} contributions={contributions || []} isLoadingContributions={isLoadingContributions} />
          </View>
        </ScrollView>

        {/* Modales */}
        <AddMoneyModal
          visible={showAddMoneyModal}
          onClose={() => setShowAddMoneyModal(false)}
          goalId={goalId || ''}
          goalName={financialGoal?.name || ''}
          currentAmount={financialGoal?.current_amount || 0}
          targetAmount={financialGoal?.target_amount || 0}
          currency="USD"
        />

        <EditGoalModal visible={showEditGoalModal} onClose={() => setShowEditGoalModal(false)} goal={financialGoal} onUpdateGoal={handleUpdateGoal} />
      </SafeAreaView>
    </View>
  )
}

import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import Svg, { Circle } from 'react-native-svg'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { FinancialGoal } from '@/types/savings'
import DeleteConfirmationModal from './components/DeleteConfirmationModal'
import { useAuthStore } from '@/store/auth.store'
import { useSavingsData } from '@/features/goals'

export default function AllSavingsScreen() {
  const { user } = useAuthStore()
  const { data: savingsData, isLoading, error } = useSavingsData(user?.id)
  const navigation = useNavigation()
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [showOptions, setShowOptions] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const { isDarkMode } = useTheme()

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

  // Funciones para manejar la selección
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    if (!isSelectionMode) {
      setSelectedGoals([])
    }
  }

  const toggleGoalSelection = (goalId: string) => {
    setSelectedGoals((prev) => (prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]))
  }

  const deleteSelectedGoals = () => {
    // En una implementación real, aquí se eliminarían los objetivos
    console.log('Eliminando objetivos:', selectedGoals)
    setSelectedGoals([])
    setIsSelectionMode(false)
  }

  // Funciones para manejar opciones del modal
  const handleCreateGoal = () => {
    setShowOptionsModal(false)
    router.push('/dashboard/savings/add-goal')
  }

  const handleExportData = () => {
    setShowOptionsModal(false)
    Alert.alert('Exportar Datos', 'Función de exportación próximamente disponible')
  }

  // Mostrar loading
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="text-white mt-4">Cargando objetivos...</Text>
      </View>
    )
  }

  // Mostrar error
  if (error || !savingsData) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-white text-lg mt-4 text-center">Error al cargar los objetivos</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-white/20 px-6 py-3 rounded-full">
          <Text className="text-white font-semibold">Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const GoalCard = ({ goal }: { goal: FinancialGoal }) => {
    const progressPercentage = goal.progress_percentage
    const isSelected = selectedGoals.includes(goal.id)

    // Parámetros para el círculo SVG
    const size = 64
    const radius = 28
    const center = size / 2
    const strokeWidth = 3
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference * (1 - progressPercentage / 100)

    return (
      <TouchableOpacity
        className={`bg-white dark:bg-gray-800 rounded-3xl p-5 w-full border shadow-sm relative ${
          isSelectionMode ? (isSelected ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700') : 'border-gray-200 dark:border-gray-700'
        }`}
        style={{ minHeight: 200 }}
        onPress={() => {
          if (isSelectionMode) {
            toggleGoalSelection(goal.id)
          } else {
            router.push(`/dashboard/savings/detail?goalId=${goal.id}`)
          }
        }}
      >
        {/* Checkbox en modo selección */}
        {isSelectionMode && (
          <View className="absolute top-3 right-3 z-10">
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
          </View>
        )}

        {/* Icono con círculo de progreso */}
        <View className="items-start mb-3 relative">
          <View className="w-16 h-16 items-center justify-center">
            <Svg width={size} height={size}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#4CAF50"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90, ${center}, ${center})`}
              />
            </Svg>

            <View className="absolute bg-gray-50 dark:bg-gray-700 rounded-full w-12 h-12 items-center justify-center shadow-sm">
              <Ionicons name={goal.icon as any} size={24} color={isDarkMode ? '#ffffff' : goal.color} />
            </View>
          </View>
        </View>

        {/* Nombre y días restantes */}
        <View className="items-start">
          <Text className="text-gray-800 dark:text-white text-lg font-semibold mb-1 line-clamp-1">{goal.name}</Text>
          <Text className="text-gray-500 dark:text-gray-300 text-sm mb-2">{goal.days_left} Días Restantes</Text>

          {/* Prioridad */}
          <View className="flex-row items-center mb-3">
            <View className={`w-2 h-2 rounded-full mr-2 ${goal.priority === 'high' ? 'bg-orange-500' : goal.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
            <Text className="text-gray-500 dark:text-gray-300 text-xs capitalize">{goal.priority}</Text>
          </View>
        </View>

        {/* Monto actual y objetivo */}
        <View className="items-start relative w-full">
          <Text className="text-gray-800 dark:text-white text-2xl font-bold">{isBalanceVisible ? `$${goal.current_amount.toLocaleString()}` : '$•••••'}</Text>
          <Text className="text-gray-500 dark:text-gray-300">De {isBalanceVisible ? `$${goal.target_amount.toLocaleString()}` : '$•••••'}</Text>

          {/* Contribución mensual */}
          {goal.auto_save_enabled && <Text className="text-gray-400 dark:text-gray-400 text-xs mt-1">${goal.auto_save_amount.toLocaleString()}/mes</Text>}

          <View className="absolute right-0 bottom-1 h-2 w-2 rounded-full" style={{ backgroundColor: isBalanceVisible ? '#4CAF50' : '#ccc' }} />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View className="flex-1 bg-[#166534] dark:bg-gray-900">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="flex-row justify-between items-center px-4 py-2">
          <TouchableOpacity
            onPress={() => {
              if (isSelectionMode) {
                toggleSelectionMode()
              } else {
                router.back()
              }
            }}
            className="w-12 h-12 bg-white/10 rounded-full items-center justify-center"
          >
            <Ionicons name={isSelectionMode ? 'close' : 'arrow-back'} size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-medium">{isSelectionMode ? `Seleccionados (${selectedGoals.length})` : 'Todos los Objetivos'}</Text>
          <TouchableOpacity
            className="w-12 h-12 bg-white/10 rounded-full items-center justify-center"
            onPress={() => {
              if (isSelectionMode) {
                setShowDeleteConfirmation(true)
              } else {
                setShowOptionsModal(true)
              }
            }}
          >
            <Ionicons name={isSelectionMode ? 'trash' : 'add'} size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="px-6 py-4">
          <Text className="text-white/60 text-lg">Total Ahorrado</Text>
          <View className="mt-2 relative">
            <Text className="text-white text-5xl font-bold">{isBalanceVisible ? `$ ${savingsData.summary.totalSaved.toLocaleString()}` : '$ ••••••'}</Text>
            <TouchableOpacity className="absolute right-0 bottom-1" onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
              <Ionicons name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'} size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Información adicional */}
          <View className="mt-4 flex-row justify-between items-center">
            <View>
              <Text className="text-white/60 text-sm">Progreso Total</Text>
              <Text className="text-white text-lg font-semibold">{savingsData.summary.totalProgress.toFixed(1)}%</Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center">
                <Ionicons name={savingsData.summary.trend === 'up' ? 'trending-up' : 'trending-down'} size={16} color={savingsData.summary.trend === 'up' ? '#4ADE80' : '#EF4444'} />
                <Text className={`text-sm ml-1 ${savingsData.summary.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {savingsData.summary.percentageChange > 0 ? '+' : ''}
                  {savingsData.summary.percentageChange}%
                </Text>
              </View>
              <Text className="text-white/60 text-xs">vs mes anterior</Text>
            </View>
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 mt-4 flex-1 rounded-t-3xl px-4 pt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-black dark:text-white text-xl font-medium">{isSelectionMode ? 'Selecciona objetivos' : `Todos los Objetivos (${savingsData.goals.length})`}</Text>
            {isSelectionMode && (
              <TouchableOpacity onPress={() => toggleSelectionMode()}>
                <Text className="text-green-600 dark:text-green-400 font-medium">Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView className="flex-1 px-0" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap justify-between pb-24">
              {savingsData.goals.map((goal) => (
                <View key={goal.id} style={{ width: '48%', marginBottom: 12 }}>
                  <GoalCard goal={goal} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Botón flotante de eliminar en modo selección */}
        {isSelectionMode && selectedGoals.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowDeleteConfirmation(true)}
            className="absolute bottom-10 left-1/2 -ml-[70px] w-[150px] h-[48px] bg-red-500 dark:bg-red-600 rounded-full flex-row items-center justify-center shadow-lg z-10"
            style={{
              shadowColor: isDarkMode ? '#dc2626' : '#ef4444',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">Eliminar ({selectedGoals.length})</Text>
          </TouchableOpacity>
        )}

        {/* Modal de Opciones */}
        <Modal visible={showOptionsModal} transparent animationType="fade" onRequestClose={() => setShowOptionsModal(false)}>
          <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowOptionsModal(false)}>
            <View className={`mx-6 w-full max-w-sm rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="p-6">
                <Text className={`text-xl font-semibold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Opciones de Objetivos</Text>

                <TouchableOpacity className="flex-row items-center py-4 px-4 rounded-xl mb-3 bg-green-50 dark:bg-green-900/20" onPress={handleCreateGoal}>
                  <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center mr-4">
                    <Ionicons name="add" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-green-800 dark:text-green-200 font-semibold text-base">Crear Nuevo Objetivo</Text>
                    <Text className="text-green-600 dark:text-green-300 text-sm">Agregar una nueva meta de ahorro</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center py-4 px-4 rounded-xl bg-gray-50 dark:bg-gray-700" onPress={handleExportData}>
                  <View className="w-10 h-10 bg-gray-500 rounded-full items-center justify-center mr-4">
                    <Ionicons name="download-outline" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 dark:text-gray-200 font-semibold text-base">Exportar Datos</Text>
                    <Text className="text-gray-600 dark:text-gray-300 text-sm">Descargar reporte de objetivos</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity className={`py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} onPress={() => setShowOptionsModal(false)}>
                <Text className={`text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal de opciones */}
        <Modal visible={showOptions} transparent={true} animationType="fade" onRequestClose={() => setShowOptions(false)}>
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setShowOptions(false)}>
            <View className={`absolute top-36 right-5 rounded-xl shadow-lg py-2 w-52 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <TouchableOpacity
                className="flex-row items-center px-4 py-3"
                onPress={() => {
                  setShowOptions(false)
                  toggleSelectionMode()
                }}
              >
                <Ionicons name="trash-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Borrar varios</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmationModal
          visible={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={deleteSelectedGoals}
          selectedCount={selectedGoals.length}
          goalNames={savingsData.goals.filter((goal) => selectedGoals.includes(goal.id)).map((goal) => goal.name)}
        />
      </SafeAreaView>
    </View>
  )
}

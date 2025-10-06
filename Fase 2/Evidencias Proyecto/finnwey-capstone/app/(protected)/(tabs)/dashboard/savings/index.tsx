import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import Svg, { Circle } from 'react-native-svg'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useSavingsData, useActiveGoals } from '@/features/goals'
import { FinancialGoal } from '@/types/savings'
import { useAuthStore } from '@/store/auth.store'

export default function SavingsScreen() {
  const navigation = useNavigation()
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const { isDarkMode } = useTheme()
  const { user } = useAuthStore()

  // ✅ SEGURIDAD: Obtener datos con userId
  const { data: savingsData, isLoading: isLoadingSavings, error: savingsError } = useSavingsData(user?.id)
  const { data: activeGoals, isLoading: isLoadingGoals, error: goalsError } = useActiveGoals(user?.id)

  // Funciones para manejar opciones
  const handleCreateGoal = () => {
    setShowOptionsModal(false)
    router.push('/dashboard/savings/add-goal')
  }

  const handleViewAllGoals = () => {
    setShowOptionsModal(false)
    router.push('/dashboard/savings/all' as any)
  }

  const handleExportData = () => {
    setShowOptionsModal(false)
    Alert.alert('Exportar Datos', 'Función de exportación próximamente disponible')
  }

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

  // Mostrar loading mientras se cargan los datos
  if (isLoadingSavings || isLoadingGoals) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium">Objetivos de Ahorro</Text>
            <View className="w-12 h-12" />
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 mt-4 rounded-t-3xl px-4 pt-4 items-center justify-center">
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text className="text-gray-600 dark:text-gray-300 mt-4">Cargando objetivos...</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  // Mostrar error si hay problemas
  if (savingsError || goalsError) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium">Objetivos de Ahorro</Text>
            <View className="w-12 h-12" />
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 mt-4 rounded-t-3xl px-4 pt-4 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text className="text-gray-600 dark:text-gray-300 mt-4 text-center">Error al cargar los objetivos</Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm">{savingsError?.message || goalsError?.message}</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  const GoalCard = ({ goal }: { goal: FinancialGoal }) => {
    const progressPercentage = goal.progress_percentage || 0

    // Parámetros para el círculo SVG
    const size = 64 // Tamaño del círculo exterior (16 * 4)
    const radius = 28 // Radio del círculo (ligeramente menor que size/2)
    const center = size / 2
    const strokeWidth = 3
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference * (1 - progressPercentage / 100)

    return (
      <TouchableOpacity
        className="bg-white dark:bg-gray-800 rounded-3xl p-5 w-full border border-gray-200 dark:border-gray-700 shadow-sm"
        style={{ minHeight: 200 }}
        onPress={() => router.push(`/dashboard/savings/detail?goalId=${goal.id}`)}
      >
        {/* Icono con círculo de progreso */}
        <View className="items-start mb-3 relative">
          <View className="w-16 h-16 items-center justify-center">
            <Svg width={size} height={size}>
              {/* Círculo de progreso (verde) */}
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

            {/* Fondo del círculo e icono */}
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
            <View className={`w-2 h-2 rounded-full mr-2 ${goal.priority === 'high' ? 'bg-red-500' : goal.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
            <Text className="text-gray-500 dark:text-gray-300 text-xs capitalize">{goal.priority}</Text>
          </View>
        </View>

        {/* Monto actual y objetivo */}
        <View className="items-start relative w-full">
          <Text className="text-gray-800 dark:text-white text-2xl font-bold">{isBalanceVisible ? `$${goal.current_amount?.toLocaleString() || 0}` : '$•••••'}</Text>
          <Text className="text-gray-500 dark:text-gray-300">De {isBalanceVisible ? `$${goal.target_amount.toLocaleString()}` : '$•••••'}</Text>

          {/* Contribución mensual */}
          <Text className="text-gray-400 dark:text-gray-400 text-xs mt-1">${goal.auto_save_amount?.toLocaleString() || 0}/mes</Text>

          <View className="absolute right-0 bottom-1 h-2 w-2 rounded-full" style={{ backgroundColor: isBalanceVisible ? '#4CAF50' : '#ccc' }} />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View className="flex-1 bg-[#166534] dark:bg-gray-900">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="flex-row justify-between items-center px-4 py-2">
          <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-medium">Objetivos de Ahorro</Text>
          <TouchableOpacity onPress={() => setShowOptionsModal(true)} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="px-6 py-4">
          <Text className="text-white/60 text-lg">Total Ahorrado</Text>
          <View className="mt-2 relative">
            <Text className="text-white text-5xl font-bold">{isBalanceVisible ? `$ ${savingsData?.summary.totalSaved.toLocaleString() || 0}` : '$ ••••••'}</Text>
            <TouchableOpacity className="absolute right-0 bottom-1" onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
              <Ionicons name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'} size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Información adicional */}
          <View className="mt-4 flex-row justify-between items-center">
            <View>
              <Text className="text-white/60 text-sm">Progreso Total</Text>
              <Text className="text-white text-lg font-semibold">{savingsData?.summary.totalProgress.toFixed(1) || 0}%</Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center">
                <Ionicons name={savingsData?.summary.trend === 'up' ? 'trending-up' : 'trending-down'} size={16} color={savingsData?.summary.trend === 'up' ? '#4ADE80' : '#EF4444'} />
                <Text className={`text-sm ml-1 ${savingsData?.summary.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {savingsData?.summary.percentageChange && savingsData.summary.percentageChange > 0 ? '+' : ''}
                  {savingsData?.summary.percentageChange || 0}%
                </Text>
              </View>
              <Text className="text-white/60 text-xs">vs mes anterior</Text>
            </View>
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 mt-4 flex-1 rounded-t-3xl px-4 pt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-black dark:text-white text-xl font-medium">Objetivos de Ahorro</Text>
            <TouchableOpacity onPress={() => router.push('/dashboard/savings/all' as any)}>
              <Text className="text-gray-600 dark:text-gray-300">Ver Todos</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-2xl p-3">
              <View className="flex-row items-center mb-1">
                <Ionicons name="trending-up-outline" size={16} color={isDarkMode ? '#4ADE80' : '#22C55E'} />
                <Text className="text-green-700 dark:text-green-300 text-xs ml-1">Ahorro Mensual</Text>
              </View>
              <Text className="text-green-800 dark:text-green-200 font-semibold">${savingsData?.summary.monthlySavings.toLocaleString() || 0}</Text>
            </View>

            <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3">
              <View className="flex-row items-center mb-1">
                <Ionicons name="calendar-outline" size={16} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text className="text-blue-700 dark:text-blue-300 text-xs ml-1">Promedio Diario</Text>
              </View>
              <Text className="text-blue-800 dark:text-blue-200 font-semibold">${savingsData?.summary.averageDailySavings.toLocaleString() || 0}</Text>
            </View>
          </View>

          {/* Insights Banner */}
          {savingsData?.analytics.insights && savingsData.analytics.insights.length > 0 && (
            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="bulb-outline" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text className="text-blue-800 dark:text-blue-300 font-medium ml-2">Insights</Text>
              </View>
              <View className="space-y-2">
                {savingsData.analytics.insights.slice(0, 2).map((insight: any, index: number) => (
                  <View key={index} className="flex-row items-start">
                    <View
                      className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                        insight.type === 'achievement' ? 'bg-green-500' : insight.type === 'milestone' ? 'bg-blue-500' : insight.type === 'reminder' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                    />
                    <Text className="text-blue-700 dark:text-blue-200 text-sm flex-1">{insight.message}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <ScrollView className="flex-1 px-0" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap justify-between pb-24">
              {activeGoals?.slice(0, 4).map((goal: FinancialGoal) => (
                <View key={goal.id} style={{ width: '48%', marginBottom: 12 }}>
                  <GoalCard goal={goal} />
                </View>
              ))}

              {/* Indicador de más objetivos */}
              {activeGoals && activeGoals.length > 4 && (
                <View style={{ width: '48%', marginBottom: 12 }}>
                  <TouchableOpacity
                    onPress={() => router.push('/dashboard/savings/all' as any)}
                    className="bg-gray-50 dark:bg-gray-700 rounded-3xl p-5 w-full border border-gray-200 dark:border-gray-600 shadow-sm items-center justify-center"
                    style={{ minHeight: 200 }}
                  >
                    <View className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full items-center justify-center mb-3">
                      <Ionicons name="ellipsis-horizontal" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    </View>
                    <Text className="text-gray-600 dark:text-gray-300 text-lg font-semibold text-center mb-2">Ver {activeGoals.length - 4} más</Text>
                    <Text className="text-gray-400 dark:text-gray-400 text-sm text-center">Objetivos adicionales</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

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

                <TouchableOpacity className="flex-row items-center py-4 px-4 rounded-xl mb-3 bg-blue-50 dark:bg-blue-900/20" onPress={handleViewAllGoals}>
                  <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-4">
                    <Ionicons name="list" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-blue-800 dark:text-blue-200 font-semibold text-base">Ver Todos los Objetivos</Text>
                    <Text className="text-blue-600 dark:text-blue-300 text-sm">Gestionar todos tus objetivos</Text>
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
      </SafeAreaView>
    </View>
  )
}

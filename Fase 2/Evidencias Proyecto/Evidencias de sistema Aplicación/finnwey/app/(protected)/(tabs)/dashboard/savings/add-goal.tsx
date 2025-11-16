import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Platform, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useNavigation } from 'expo-router'
import { useEffect, useState, useMemo } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import Svg, { Circle } from 'react-native-svg'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useCreateGoal } from '@/features/goals'
import { CreateGoalRequest } from '@/types/savings'

const GOAL_ICONS = ['🚗', '✈️', '🏠', '💻', '📚', '💰', '🎓', '🏥', '🎮', '👕']

const GOAL_TYPES = [
  { key: 'savings', label: 'Ahorro General', icon: '💰' },
  { key: 'emergency_fund', label: 'Fondo de Emergencia', icon: '🚨' },
  { key: 'investment', label: 'Inversión', icon: '📈' },
  { key: 'debt_payoff', label: 'Pagar Deudas', icon: '💳' },
  { key: 'purchase', label: 'Compra Específica', icon: '🛒' },
  { key: 'other', label: 'Otro', icon: '🎯' },
]

const PRIORITIES = [
  { key: 'low', label: 'Baja', color: '#10B981' },
  { key: 'medium', label: 'Media', color: '#F59E0B' },
  { key: 'high', label: 'Alta', color: '#EF4444' },
]

const FREQUENCIES = [
  { key: 'daily', label: 'Diario' },
  { key: 'weekly', label: 'Semanal' },
  { key: 'monthly', label: 'Mensual' },
]

export default function AddGoalScreen() {
  const [goalName, setGoalName] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState('💰')
  const [isEditingName, setIsEditingName] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [goalType, setGoalType] = useState('savings')
  const [priority, setPriority] = useState('medium')
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const [autoSaveAmount, setAutoSaveAmount] = useState('')
  const [autoSaveFrequency, setAutoSaveFrequency] = useState('monthly')
  const [reminderFrequency, setReminderFrequency] = useState('weekly')
  const [milestoneAlerts, setMilestoneAlerts] = useState(true)
  const [selectedBank, setSelectedBank] = useState('Mi Cuenta Principal')
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const navigation = useNavigation()
  const { isDarkMode } = useTheme()

  // Hook para crear goal
  const createGoalMutation = useCreateGoal()

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

  const formatDate = (date: Date) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const onDateChange = (_: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  // Calcular la simulación
  const simulation = useMemo(() => {
    const targetAmount = parseFloat(amount.replace(/\./g, ''))
    const contribution = parseFloat(autoSaveAmount.replace(/\./g, ''))
    const targetDate = new Date(date)
    const today = new Date()
    const monthsUntilTarget = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth())

    let totalContributions = 0
    if (autoSaveEnabled) {
      switch (autoSaveFrequency) {
        case 'daily':
          totalContributions = contribution * 30 * monthsUntilTarget
          break
        case 'weekly':
          totalContributions = contribution * 4 * monthsUntilTarget
          break
        case 'monthly':
          totalContributions = contribution * monthsUntilTarget
          break
      }
    }

    const progressPercentage = Math.min((totalContributions / targetAmount) * 100, 100)
    const isAchievable = totalContributions >= targetAmount
    const timeToTarget = isAchievable ? monthsUntilTarget : Math.ceil(targetAmount / (contribution * (autoSaveFrequency === 'daily' ? 30 : autoSaveFrequency === 'weekly' ? 4 : 1)))

    return {
      progressPercentage,
      isAchievable,
      timeToTarget,
      totalContributions,
    }
  }, [amount, autoSaveAmount, date, autoSaveFrequency, autoSaveEnabled])

  const handleCreateGoal = async () => {
    try {
      // Validar campos requeridos
      if (!goalName.trim()) {
        Alert.alert('Error', 'El nombre del objetivo es requerido')
        return
      }

      if (!amount || parseFloat(amount.replace(/\./g, '')) <= 0) {
        Alert.alert('Error', 'El monto objetivo debe ser mayor a 0')
        return
      }

      if (date <= new Date()) {
        Alert.alert('Error', 'La fecha objetivo debe ser en el futuro')
        return
      }

      // Mostrar modal de confirmación
      setShowConfirmationModal(true)
    } catch (error) {
      console.error('Error validating goal:', error)
      Alert.alert('Error', 'No se pudo validar el objetivo. Inténtalo de nuevo.')
    }
  }

  const confirmCreateGoal = async () => {
    try {
      setShowConfirmationModal(false)

      const createGoalRequest: CreateGoalRequest = {
        name: goalName.trim(),
        description: description.trim() || '',
        target_amount: parseFloat(amount.replace(/\./g, '')),
        currency_code: 'USD',
        target_date: date.toISOString().split('T')[0], // Solo la fecha, sin hora
        priority: priority as 'low' | 'medium' | 'high',
        goal_type: goalType as any,
        auto_save_enabled: autoSaveEnabled,
        auto_save_amount: parseFloat(autoSaveAmount.replace(/\./g, '')) || 0,
        auto_save_frequency: autoSaveFrequency as 'daily' | 'weekly' | 'monthly',
        reminder_frequency: reminderFrequency as 'none' | 'daily' | 'weekly' | 'monthly',
        milestone_alerts: milestoneAlerts,
      }

      console.log('Creating goal:', createGoalRequest)

      // Crear el goal usando Supabase
      await createGoalMutation.mutateAsync(createGoalRequest)

      Alert.alert('¡Éxito!', 'Tu objetivo de ahorro ha sido creado correctamente.', [
        {
          text: 'Ver Objetivos',
          onPress: () => router.push('/dashboard/savings'),
        },
      ])
    } catch (error) {
      console.error('Error creating goal:', error)
      Alert.alert('Error', 'No se pudo crear el objetivo. Inténtalo de nuevo.')
    }
  }

  const getGoalColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      savings: '#4CAF50',
      emergency_fund: '#10B981',
      investment: '#EF4444',
      debt_payoff: '#F97316',
      purchase: '#8B5CF6',
      other: '#6B7280',
    }
    return colorMap[type] || '#6B7280'
  }

  return (
    <View className="flex-1 bg-[#1e3a8a] dark:bg-gray-900">
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-semibold">Agregar Nuevo Objetivo</Text>
          <TouchableOpacity
            onPress={handleCreateGoal}
            className="w-12 h-12 bg-[#4CAF50] dark:bg-green-600 rounded-full items-center justify-center"
            disabled={createGoalMutation.isPending}
            style={{ opacity: createGoalMutation.isPending ? 0.7 : 1 }}
          >
            {createGoalMutation.isPending ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="checkmark" size={24} color="white" />}
          </TouchableOpacity>
        </View>

        <View className="px-6 py-4">
          <View className="items-center">
            <TouchableOpacity onPress={() => setShowIconPicker(true)} className="w-28 h-28 bg-white dark:bg-gray-700 rounded-full items-center justify-center mb-4">
              <Text className="text-[#1e3a8a] dark:text-white text-5xl">{selectedIcon}</Text>
              <View className="absolute bottom-0 right-0 bg-[#4CAF50] dark:bg-green-600 rounded-full p-2">
                <Ionicons name="pencil" size={16} color="white" />
              </View>
            </TouchableOpacity>

            <View className="flex-row items-center">
              {isEditingName ? (
                <TextInput value={goalName} onChangeText={setGoalName} onBlur={() => setIsEditingName(false)} autoFocus className="text-white text-2xl font-semibold text-center" />
              ) : (
                <TouchableOpacity onPress={() => setIsEditingName(true)} className="flex-row items-center">
                  <Text className="text-white text-2xl font-semibold">{goalName}</Text>
                  <TouchableOpacity className="ml-2">
                    <Ionicons name="pencil" size={20} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View className="flex-1 bg-white dark:bg-gray-800 rounded-t-[32px] px-6 pt-6">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="w-full">
              <Text className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Establecer Meta de Ahorro</Text>
              <Text className="text-gray-500 dark:text-gray-300 mb-6">Agrega rápidamente fondos a tu saldo de cuenta.</Text>

              {/* Amount Section */}
              <View className="mb-8">
                <View className="bg-gray-100 dark:bg-gray-700 rounded-2xl py-6 px-4">
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    className="text-gray-800 dark:text-white text-4xl text-center font-bold"
                    keyboardType="numeric"
                    placeholderTextColor={isDarkMode ? '#9ca3af' : 'gray'}
                  />
                </View>
              </View>

              {/* Description Section */}
              <View className="mb-8">
                <Text className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Descripción</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe tu objetivo..."
                  multiline
                  numberOfLines={3}
                  className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 text-gray-800 dark:text-white"
                  placeholderTextColor={isDarkMode ? '#9ca3af' : 'gray'}
                />
              </View>

              {/* Date Section */}
              <Text className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Establecer Fecha</Text>
              <View className="mb-8">
                <TouchableOpacity onPress={() => setShowDatePicker(true)} className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 flex-row justify-between items-center">
                  <Text className="text-gray-800 dark:text-white text-xl">{formatDate(date)}</Text>
                  <Ionicons name="calendar-outline" size={24} color={isDarkMode ? '#9ca3af' : 'gray'} />
                </TouchableOpacity>
              </View>

              {/* Saving From Section */}
              <Text className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Ahorrar Desde</Text>
              <View className="mb-8">
                <TouchableOpacity className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    🏦
                    <Text className="text-gray-800 dark:text-white text-xl ml-2">{selectedBank}</Text>
                  </View>
                  <View className="bg-[#4CAF50] dark:bg-green-600 rounded-full p-2">
                    <Ionicons name="checkmark" size={20} color="white" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Goal Type Section */}
              <View className="mb-8">
                <Text className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Tipo de Objetivo</Text>
                <View className="flex-row flex-wrap gap-2">
                  {GOAL_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      onPress={() => setGoalType(type.key)}
                      className={`px-4 py-3 rounded-2xl border flex-row items-center ${
                        goalType === type.key ? 'bg-[#4CAF50] border-[#4CAF50]' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <Text className="text-lg mr-2">{type.icon}</Text>
                      <Text className={`text-sm font-medium ${goalType === type.key ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{type.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Priority Section */}
              <View className="mb-8">
                <Text className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Prioridad</Text>
                <View className="flex-row gap-2">
                  {PRIORITIES.map((priorityOption) => (
                    <TouchableOpacity
                      key={priorityOption.key}
                      onPress={() => setPriority(priorityOption.key)}
                      className={`flex-1 py-3 rounded-2xl border items-center ${
                        priority === priorityOption.key ? 'bg-[#4CAF50] border-[#4CAF50]' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <View className={`w-3 h-3 rounded-full mb-1`} style={{ backgroundColor: priorityOption.color }} />
                      <Text className={`text-sm font-medium ${priority === priorityOption.key ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{priorityOption.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Auto-save Section */}
              <View className="mb-8">
                <Text className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Auto-Ahorro</Text>

                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-gray-600 dark:text-gray-300">Habilitar auto-ahorro</Text>
                  <TouchableOpacity
                    onPress={() => setAutoSaveEnabled(!autoSaveEnabled)}
                    className={`w-12 h-6 rounded-full ${autoSaveEnabled ? 'bg-[#4CAF50]' : 'bg-gray-300 dark:bg-gray-600'} justify-center`}
                  >
                    <View className={`w-5 h-5 bg-white rounded-full ${autoSaveEnabled ? 'ml-7' : 'ml-1'}`} />
                  </TouchableOpacity>
                </View>

                {autoSaveEnabled && (
                  <>
                    <View className="mb-4">
                      <Text className="text-gray-600 dark:text-gray-300 text-sm mb-2">Frecuencia</Text>
                      <View className="flex-row gap-2">
                        {FREQUENCIES.map((freq) => (
                          <TouchableOpacity
                            key={freq.key}
                            onPress={() => setAutoSaveFrequency(freq.key)}
                            className={`px-4 py-2 rounded-full ${autoSaveFrequency === freq.key ? 'bg-[#4CAF50]' : 'bg-gray-100 dark:bg-gray-700'}`}
                          >
                            <Text className={`text-sm ${autoSaveFrequency === freq.key ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{freq.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 mb-4">
                      <Text className="text-gray-600 dark:text-gray-300 mb-2">¿Cuánto puedes ahorrar por periodo?</Text>
                      <TextInput
                        value={autoSaveAmount}
                        onChangeText={setAutoSaveAmount}
                        className="text-gray-800 dark:text-white text-2xl font-bold"
                        keyboardType="numeric"
                        placeholderTextColor={isDarkMode ? '#9ca3af' : 'gray'}
                      />
                    </View>
                  </>
                )}
              </View>

              {/* Simulation Section */}
              <View className="mb-8">
                <Text className="text-gray-800 dark:text-white text-lg mb-4">Simulación de Ahorro</Text>
                <View className="items-center">
                  <View className="relative w-48 h-48 mb-4">
                    <Svg width="100%" height="100%" viewBox="0 0 100 100">
                      {/* Círculo de fondo */}
                      <Circle cx="50" cy="50" r="45" stroke={isDarkMode ? '#374151' : '#E5E7EB'} strokeWidth="10" fill="none" />
                      {/* Círculo de progreso */}
                      <Circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke={simulation.isAchievable ? '#4CAF50' : '#EF4444'}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - simulation.progressPercentage / 100)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </Svg>
                    <View className="absolute inset-0 items-center justify-center">
                      <Text className="text-3xl font-bold text-gray-800 dark:text-white">{Math.round(simulation.progressPercentage)}%</Text>
                    </View>
                  </View>

                  <View className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 w-full">
                    {simulation.isAchievable ? (
                      <Text className="text-center text-green-600 dark:text-green-400">
                        ¡Alcanzarás tu meta en {simulation.timeToTarget} {simulation.timeToTarget === 1 ? 'mes' : 'meses'}!
                      </Text>
                    ) : (
                      <Text className="text-center text-red-600 dark:text-red-400">
                        Necesitarás {simulation.timeToTarget} {simulation.timeToTarget === 1 ? 'mes' : 'meses'} para alcanzar tu meta
                      </Text>
                    )}
                    <Text className="text-center text-gray-500 dark:text-gray-300 mt-2">Total ahorrado: ${Math.round(simulation.totalContributions).toLocaleString()}</Text>
                  </View>
                </View>
              </View>

              {/* Notifications Section */}
              <View className="mb-8">
                <Text className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Notificaciones</Text>

                <View className="mb-4">
                  <Text className="text-gray-600 dark:text-gray-300 text-sm mb-2">Frecuencia de recordatorios</Text>
                  <View className="flex-row gap-2">
                    {[
                      { key: 'none', label: 'Nunca' },
                      { key: 'daily', label: 'Diario' },
                      { key: 'weekly', label: 'Semanal' },
                      { key: 'monthly', label: 'Mensual' },
                    ].map((freq) => (
                      <TouchableOpacity
                        key={freq.key}
                        onPress={() => setReminderFrequency(freq.key)}
                        className={`px-4 py-2 rounded-full ${reminderFrequency === freq.key ? 'bg-[#4CAF50]' : 'bg-gray-100 dark:bg-gray-700'}`}
                      >
                        <Text className={`text-sm ${reminderFrequency === freq.key ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{freq.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600 dark:text-gray-300">Alertas de hitos</Text>
                  <TouchableOpacity
                    onPress={() => setMilestoneAlerts(!milestoneAlerts)}
                    className={`w-12 h-6 rounded-full ${milestoneAlerts ? 'bg-[#4CAF50]' : 'bg-gray-300 dark:bg-gray-600'} justify-center`}
                  >
                    <View className={`w-5 h-5 bg-white rounded-full ${milestoneAlerts ? 'ml-7' : 'ml-1'}`} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botón de crear objetivo removido - ahora está en el header */}
            </View>
          </ScrollView>
        </View>

        {/* Modal de Confirmación */}
        <Modal visible={showConfirmationModal} transparent animationType="fade" onRequestClose={() => setShowConfirmationModal(false)}>
          <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowConfirmationModal(false)}>
            <View className={`mx-6 w-full max-w-sm rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="p-6">
                <View className="items-center mb-4">
                  <View className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full items-center justify-center mb-4">
                    <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                  </View>
                  <Text className={`text-xl font-semibold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Confirmar Objetivo</Text>
                  <Text className={`text-sm text-center mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>¿Estás seguro de que quieres crear este objetivo de ahorro?</Text>
                </View>

                {/* Resumen del objetivo */}
                <View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-2xl mr-2">{selectedIcon}</Text>
                    <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{goalName}</Text>
                  </View>
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Meta: ${parseFloat(amount.replace(/\./g, '')).toLocaleString()}</Text>
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fecha objetivo: {formatDate(date)}</Text>
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tipo: {GOAL_TYPES.find((t) => t.key === goalType)?.label}</Text>
                  {autoSaveEnabled && (
                    <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Auto-ahorro: ${parseFloat(autoSaveAmount.replace(/\./g, '')).toLocaleString()} {autoSaveFrequency === 'daily' ? 'diario' : autoSaveFrequency === 'weekly' ? 'semanal' : 'mensual'}
                    </Text>
                  )}
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600" onPress={() => setShowConfirmationModal(false)}>
                    <Text className={`text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-3 rounded-xl bg-[#4CAF50] dark:bg-green-600"
                    onPress={confirmCreateGoal}
                    disabled={createGoalMutation.isPending}
                    style={{ opacity: createGoalMutation.isPending ? 0.7 : 1 }}
                  >
                    {createGoalMutation.isPending ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white font-medium ml-2">Creando...</Text>
                      </View>
                    ) : (
                      <Text className="text-white font-medium text-center">Crear Objetivo</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <Modal transparent visible={showDatePicker} animationType="fade">
            <TouchableOpacity className="flex-1 bg-black/50 justify-end" activeOpacity={1} onPress={() => setShowDatePicker(false)}>
              <View className="bg-white dark:bg-gray-800 p-4">
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                  maximumDate={new Date(2030, 11, 31)}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Icon Picker Modal */}
        <Modal visible={showIconPicker} transparent animationType="slide" onRequestClose={() => setShowIconPicker(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white dark:bg-gray-800 rounded-t-[32px] p-6">
              <View className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-6" />
              <Text className="text-gray-800 dark:text-white text-xl font-semibold mb-4">Selecciona un ícono</Text>
              <View className="flex-row flex-wrap justify-between">
                {GOAL_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => {
                      setSelectedIcon(icon)
                      setShowIconPicker(false)
                    }}
                    className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center m-2"
                  >
                    <Text className="text-3xl">{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  )
}

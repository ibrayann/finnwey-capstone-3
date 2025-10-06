import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Pressable, Modal, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { FinancialGoal, UpdateGoalRequest } from '@/types/savings'

interface EditGoalModalProps {
  visible: boolean
  onClose: () => void
  goal: FinancialGoal
  onUpdateGoal: (updateRequest: UpdateGoalRequest) => void
}

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
  { key: 'none', label: 'Nunca' },
  { key: 'daily', label: 'Diario' },
  { key: 'weekly', label: 'Semanal' },
  { key: 'monthly', label: 'Mensual' },
]

export default function EditGoalModal({ visible, onClose, goal, onUpdateGoal }: EditGoalModalProps) {
  const [name, setName] = useState(goal.name)
  const [description, setDescription] = useState(goal.description)
  const [targetAmount, setTargetAmount] = useState(goal.target_amount.toString())
  const [targetDate, setTargetDate] = useState(goal.target_date)
  const [priority, setPriority] = useState(goal.priority)
  const [goalType, setGoalType] = useState(goal.goal_type)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(goal.auto_save_enabled)
  const [autoSaveAmount, setAutoSaveAmount] = useState(goal.auto_save_amount.toString())
  const [autoSaveFrequency, setAutoSaveFrequency] = useState(goal.auto_save_frequency)
  const [reminderFrequency, setReminderFrequency] = useState(goal.reminder_frequency)
  const [milestoneAlerts, setMilestoneAlerts] = useState(goal.milestone_alerts)
  const [isLoading, setIsLoading] = useState(false)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    if (visible) {
      setName(goal.name)
      setDescription(goal.description)
      setTargetAmount(goal.target_amount.toString())
      setTargetDate(goal.target_date)
      setPriority(goal.priority)
      setGoalType(goal.goal_type)
      setAutoSaveEnabled(goal.auto_save_enabled)
      setAutoSaveAmount(goal.auto_save_amount.toString())
      setAutoSaveFrequency(goal.auto_save_frequency)
      setReminderFrequency(goal.reminder_frequency)
      setMilestoneAlerts(goal.milestone_alerts)
    }
  }, [visible, goal])

  const handleUpdateGoal = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del objetivo es requerido')
      return
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      Alert.alert('Error', 'El monto objetivo debe ser mayor a 0')
      return
    }

    setIsLoading(true)
    try {
      const updateRequest: UpdateGoalRequest = {
        id: goal.id,
        name: name.trim(),
        description: description.trim() || undefined,
        target_amount: parseFloat(targetAmount),
        target_date: targetDate,
        priority,
        goal_type: goalType,
        auto_save_enabled: autoSaveEnabled,
        auto_save_amount: parseFloat(autoSaveAmount) || 0,
        auto_save_frequency: autoSaveFrequency,
        reminder_frequency: reminderFrequency,
        milestone_alerts: milestoneAlerts,
      }

      await onUpdateGoal(updateRequest)
      onClose()
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el objetivo. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl h-[95%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-1">
              <Text className="text-gray-800 dark:text-white text-xl font-semibold">Editar Objetivo</Text>
              <Text className="text-gray-500 dark:text-gray-300 text-sm mt-1">{goal.name}</Text>
            </View>
            <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center">
              <Ionicons name="close" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
            {/* Información básica */}
            <View className="mb-6">
              <Text className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Información Básica</Text>

              {/* Nombre */}
              <View className="mb-4">
                <Text className="text-gray-600 dark:text-gray-300 text-sm mb-2">Nombre del objetivo</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej: Fondo de Emergencia"
                  className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-gray-800 dark:text-white"
                  placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                />
              </View>

              {/* Descripción */}
              <View className="mb-4">
                <Text className="text-gray-600 dark:text-gray-300 text-sm mb-2">Descripción</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe tu objetivo..."
                  multiline
                  numberOfLines={3}
                  className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-gray-800 dark:text-white"
                  placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                />
              </View>

              {/* Monto objetivo */}
              <View className="mb-4">
                <Text className="text-gray-600 dark:text-gray-300 text-sm mb-2">Monto objetivo</Text>
                <TextInput
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="0"
                  keyboardType="numeric"
                  className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-gray-800 dark:text-white text-lg font-semibold"
                  placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                />
              </View>

              {/* Fecha objetivo */}
              <View className="mb-4">
                <Text className="text-gray-600 dark:text-gray-300 text-sm mb-2">Fecha objetivo</Text>
                <TextInput value={formatDate(targetDate)} editable={false} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-gray-800 dark:text-white" />
              </View>
            </View>

            {/* Tipo de objetivo */}
            <View className="mb-6">
              <Text className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Tipo de Objetivo</Text>
              <View className="flex-row flex-wrap gap-2">
                {GOAL_TYPES.map((type) => (
                  <Pressable
                    key={type.key}
                    onPress={() => setGoalType(type.key as any)}
                    className={`px-4 py-3 rounded-xl border flex-row items-center ${
                      goalType === type.key ? 'bg-[#4CAF50] border-[#4CAF50]' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <Text className="text-base mr-2">{type.icon}</Text>
                    <Text className={`text-sm font-medium ${goalType === type.key ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{type.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Prioridad */}
            <View className="mb-6">
              <Text className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Prioridad</Text>
              <View className="flex-row gap-2">
                {PRIORITIES.map((priorityOption) => (
                  <Pressable
                    key={priorityOption.key}
                    onPress={() => setPriority(priorityOption.key as any)}
                    className={`flex-1 py-3 rounded-xl border items-center ${
                      priority === priorityOption.key ? 'bg-[#4CAF50] border-[#4CAF50]' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <View className={`w-2 h-2 rounded-full mb-1`} style={{ backgroundColor: priorityOption.color }} />
                    <Text className={`text-sm font-medium ${priority === priorityOption.key ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{priorityOption.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Auto-ahorro */}
            <View className="mb-6">
              <Text className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Auto-Ahorro</Text>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-600 dark:text-gray-300">Habilitar auto-ahorro</Text>
                <Pressable onPress={() => setAutoSaveEnabled(!autoSaveEnabled)} className={`w-12 h-6 rounded-full ${autoSaveEnabled ? 'bg-[#4CAF50]' : 'bg-gray-300 dark:bg-gray-600'} justify-center`}>
                  <View className={`w-5 h-5 bg-white rounded-full ${autoSaveEnabled ? 'ml-7' : 'ml-1'}`} />
                </Pressable>
              </View>

              {autoSaveEnabled && (
                <>
                  <View className="mb-4">
                    <Text className="text-gray-600 dark:text-gray-300 text-sm mb-2">Monto automático</Text>
                    <TextInput
                      value={autoSaveAmount}
                      onChangeText={setAutoSaveAmount}
                      placeholder="0"
                      keyboardType="numeric"
                      className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-gray-800 dark:text-white"
                      placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-600 dark:text-gray-300 text-sm mb-2">Frecuencia</Text>
                    <View className="flex-row gap-2">
                      {FREQUENCIES.slice(1).map((freq) => (
                        <Pressable
                          key={freq.key}
                          onPress={() => setAutoSaveFrequency(freq.key as any)}
                          className={`px-4 py-2 rounded-full ${autoSaveFrequency === freq.key ? 'bg-[#4CAF50]' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                          <Text className={`text-sm ${autoSaveFrequency === freq.key ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{freq.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Notificaciones */}
            <View className="mb-6">
              <Text className="text-gray-800 dark:text-white text-lg font-semibold mb-4">Notificaciones</Text>

              <View className="mb-4">
                <Text className="text-gray-600 dark:text-gray-300 text-sm mb-2">Frecuencia de recordatorios</Text>
                <View className="flex-row gap-2">
                  {FREQUENCIES.map((freq) => (
                    <Pressable
                      key={freq.key}
                      onPress={() => setReminderFrequency(freq.key as any)}
                      className={`px-4 py-2 rounded-full ${reminderFrequency === freq.key ? 'bg-[#4CAF50]' : 'bg-gray-100 dark:bg-gray-700'}`}
                    >
                      <Text className={`text-sm ${reminderFrequency === freq.key ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{freq.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 dark:text-gray-300">Alertas de hitos</Text>
                <Pressable onPress={() => setMilestoneAlerts(!milestoneAlerts)} className={`w-12 h-6 rounded-full ${milestoneAlerts ? 'bg-[#4CAF50]' : 'bg-gray-300 dark:bg-gray-600'} justify-center`}>
                  <View className={`w-5 h-5 bg-white rounded-full ${milestoneAlerts ? 'ml-7' : 'ml-1'}`} />
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Pressable
              onPress={handleUpdateGoal}
              disabled={isLoading}
              className={`rounded-xl py-4 items-center justify-center ${isLoading ? 'bg-gray-300 dark:bg-gray-600' : 'bg-[#4CAF50] dark:bg-green-600'}`}
            >
              <Text className={`text-lg font-semibold ${isLoading ? 'text-gray-500 dark:text-gray-400' : 'text-white'}`}>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

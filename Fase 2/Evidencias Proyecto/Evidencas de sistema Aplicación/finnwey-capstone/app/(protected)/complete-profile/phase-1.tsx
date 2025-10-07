import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView, Alert, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useOnboardingUserStore } from '@/store/onboarding-user.store'

export default function Phase1() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { incomeRange, financialGoal, expenseTracking, financialComfort, setPhase1Data, setCurrentPhase } = useOnboardingUserStore()

  const [showIncomePicker, setShowIncomePicker] = useState(false)
  const [showFinancialGoalPicker, setShowFinancialGoalPicker] = useState(false)
  const [showExpenseTrackingPicker, setShowExpenseTrackingPicker] = useState(false)
  const [showFinancialComfortPicker, setShowFinancialComfortPicker] = useState(false)

  const incomeRanges = [
    { id: 'under-300k', label: 'Menos de $300.000' },
    { id: '300k-500k', label: '$300.000 - $500.000' },
    { id: '500k-800k', label: '$500.000 - $800.000' },
    { id: '800k-1.2m', label: '$800.000 - $1.200.000' },
    { id: 'over-1.2m', label: 'Más de $1.200.000' },
  ]

  const financialGoals = [
    { id: 'save', label: 'Ahorrar', icon: '💰' },
    { id: 'pay-debt', label: 'Pagar deudas', icon: '💳' },
    { id: 'organize', label: 'Organizar mis gastos', icon: '📊' },
    { id: 'invest', label: 'Invertir en el futuro', icon: '📈' },
    { id: 'other', label: 'Otro', icon: '🎯' },
  ]

  const expenseTrackingOptions = [
    { id: 'none', label: 'No los registro', icon: '❌' },
    { id: 'paper-excel', label: 'En papel/Excel', icon: '📝' },
    { id: 'other-app', label: 'En otra app', icon: '📱' },
    { id: 'manual-phone', label: 'Manualmente en mi celular', icon: '📲' },
  ]

  const financialComfortLevels = [
    { id: 'very-insecure', label: 'Muy inseguro', description: 'Necesito guía paso a paso' },
    { id: 'insecure', label: 'Inseguro', description: 'Prefiero explicaciones simples' },
    { id: 'neutral', label: 'Neutro', description: 'Me siento cómodo con lo básico' },
    { id: 'secure', label: 'Seguro', description: 'Entiendo conceptos avanzados' },
    { id: 'very-secure', label: 'Muy seguro', description: 'Experto en finanzas' },
  ]

  const handleNext = () => {
    if (incomeRange && financialGoal && expenseTracking && financialComfort) {
      setCurrentPhase(2)
      router.push('/complete-profile/phase-2')
    } else {
      Alert.alert('Información requerida', 'Por favor completa todas las preguntas para continuar')
    }
  }

  const isFormValid = incomeRange && financialGoal && expenseTracking && financialComfort

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-8">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </Pressable>
          <View className="flex-row gap-2">
            <View className="w-3 h-3 bg-green-500 rounded-full" />
            <View className="w-3 h-3 bg-gray-300 rounded-full" />
            <View className="w-3 h-3 bg-gray-300 rounded-full" />
          </View>
          <View className="w-6" />
        </View>

        {/* Título */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Fase 1: Conocimiento Básico</Text>
          <Text className="text-gray-600 dark:text-gray-300 text-lg">Paso 1 de 3 • Solo te tomará 3 minutos conocerte mejor</Text>
        </View>

        {/* Formulario */}
        <View className="gap-8">
          {/* Rango de ingreso mensual */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">💰 ¿En qué rango se encuentra tu ingreso mensual?</Text>

            <Pressable
              className={`p-4 rounded-2xl border-2 ${incomeRange ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowIncomePicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${incomeRange ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {incomeRange ? incomeRanges.find((r) => r.id === incomeRange)?.label : 'Selecciona tu rango de ingreso'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={incomeRange ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>

          {/* Objetivo financiero principal */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">🎯 ¿Cuál es tu principal objetivo financiero en este momento?</Text>

            <Pressable
              className={`p-4 rounded-2xl border-2 ${financialGoal ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowFinancialGoalPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${financialGoal ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {financialGoal ? financialGoals.find((g) => g.id === financialGoal)?.label : 'Selecciona tu objetivo financiero'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={financialGoal ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>

          {/* Registro de gastos */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">📊 ¿Cómo registras actualmente tus gastos?</Text>

            <Pressable
              className={`p-4 rounded-2xl border-2 ${expenseTracking ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowExpenseTrackingPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${expenseTracking ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {expenseTracking ? expenseTrackingOptions.find((e) => e.id === expenseTracking)?.label : 'Selecciona cómo registras gastos'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={expenseTracking ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>

          {/* Comodidad con temas financieros */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">🧠 ¿Qué tan cómodo te sientes con temas financieros?</Text>

            <Pressable
              className={`p-4 rounded-2xl border-2 ${financialComfort ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowFinancialComfortPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${financialComfort ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {financialComfort ? financialComfortLevels.find((f) => f.id === financialComfort)?.label : 'Selecciona tu nivel de comodidad'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={financialComfort ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Botón siguiente */}
        <Pressable className={`mt-8 rounded-2xl py-4 px-6 ${isFormValid ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} onPress={handleNext} disabled={!isFormValid}>
          <Text className={`text-center text-lg font-semibold ${isFormValid ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>Siguiente</Text>
        </Pressable>
      </ScrollView>

      {/* Modal para Rango de Ingreso */}
      <Modal visible={showIncomePicker} transparent={true} animationType="fade" onRequestClose={() => setShowIncomePicker(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Selecciona tu rango de ingreso</Text>
              <Pressable onPress={() => setShowIncomePicker(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </Pressable>
            </View>

            <View className="gap-3">
              {incomeRanges.map((range) => (
                <Pressable
                  key={range.id}
                  className={`p-4 rounded-2xl border-2 ${incomeRange === range.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                  onPress={() => {
                    setPhase1Data({ incomeRange: range.id })
                    setShowIncomePicker(false)
                  }}
                >
                  <Text className={`font-semibold text-lg ${incomeRange === range.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>{range.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Objetivo Financiero */}
      <Modal visible={showFinancialGoalPicker} transparent={true} animationType="fade" onRequestClose={() => setShowFinancialGoalPicker(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Selecciona tu objetivo financiero</Text>
              <Pressable onPress={() => setShowFinancialGoalPicker(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </Pressable>
            </View>

            <View className="gap-3">
              {financialGoals.map((goal) => (
                <Pressable
                  key={goal.id}
                  className={`p-4 rounded-2xl border-2 ${financialGoal === goal.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                  onPress={() => {
                    setPhase1Data({ financialGoal: goal.id })
                    setShowFinancialGoalPicker(false)
                  }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">{goal.icon}</Text>
                    <Text className={`font-semibold text-lg ${financialGoal === goal.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>{goal.label}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Registro de Gastos */}
      <Modal visible={showExpenseTrackingPicker} transparent={true} animationType="fade" onRequestClose={() => setShowExpenseTrackingPicker(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Selecciona cómo registras gastos</Text>
              <Pressable onPress={() => setShowExpenseTrackingPicker(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </Pressable>
            </View>

            <View className="gap-3">
              {expenseTrackingOptions.map((option) => (
                <Pressable
                  key={option.id}
                  className={`p-4 rounded-2xl border-2 ${expenseTracking === option.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                  onPress={() => {
                    setPhase1Data({ expenseTracking: option.id })
                    setShowExpenseTrackingPicker(false)
                  }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">{option.icon}</Text>
                    <Text className={`font-semibold text-lg ${expenseTracking === option.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {option.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Comodidad Financiera */}
      <Modal visible={showFinancialComfortPicker} transparent={true} animationType="fade" onRequestClose={() => setShowFinancialComfortPicker(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Selecciona tu nivel de comodidad</Text>
              <Pressable onPress={() => setShowFinancialComfortPicker(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </Pressable>
            </View>

            <View className="gap-3">
              {financialComfortLevels.map((level) => (
                <Pressable
                  key={level.id}
                  className={`p-4 rounded-2xl border-2 ${financialComfort === level.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                  onPress={() => {
                    setPhase1Data({ financialComfort: level.id })
                    setShowFinancialComfortPicker(false)
                  }}
                >
                  <Text className={`font-semibold text-lg mb-1 ${financialComfort === level.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {level.label}
                  </Text>
                  <Text className={`text-sm ${financialComfort === level.id ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>{level.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView, TextInput, Alert, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useOnboardingUserStore } from '@/store/onboarding-user.store'

export default function Phase2() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { age, situation, housing, incomeType, setPhase2Data, setCurrentPhase } = useOnboardingUserStore()

  const [showSituationPicker, setShowSituationPicker] = useState(false)
  const [showHousingPicker, setShowHousingPicker] = useState(false)
  const [showIncomeTypePicker, setShowIncomeTypePicker] = useState(false)

  const situations = [
    { id: 'study', label: 'Estudio', icon: '📚', description: 'Soy estudiante' },
    { id: 'work', label: 'Trabajo', icon: '💼', description: 'Trabajo tiempo completo' },
    { id: 'both', label: 'Ambos', icon: '🎓💼', description: 'Estudio y trabajo' },
    { id: 'other', label: 'Otro', icon: '🤔', description: 'Otra situación' },
  ]

  const housingOptions = [
    { id: 'parents', label: 'Con mis padres', icon: '🏠', description: 'Vivo en casa familiar' },
    { id: 'rent', label: 'Arriendo', icon: '🔑', description: 'Arriendo un lugar' },
    { id: 'own', label: 'Casa propia', icon: '🏡', description: 'Tengo mi propia casa' },
    { id: 'shared', label: 'Compartida', icon: '👥', description: 'Comparto con amigos/roommates' },
  ]

  const incomeTypes = [
    { id: 'fixed', label: 'Sueldo fijo', icon: '💰', description: 'Salario mensual estable' },
    { id: 'freelance', label: 'Freelance', icon: '🎯', description: 'Trabajo por proyectos' },
    { id: 'business', label: 'Negocio propio', icon: '🏢', description: 'Tengo mi propio negocio' },
    { id: 'other', label: 'Otro', icon: '💡', description: 'Otra fuente de ingresos' },
  ]

  const handleNext = () => {
    if (age && situation && housing && incomeType) {
      // Validar que la edad sea un número válido
      const ageNum = parseInt(age)
      if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
        Alert.alert('Edad inválida', 'Por favor ingresa una edad válida entre 13 y 120 años')
        return
      }
      setCurrentPhase(3)
      router.push('/complete-profile/phase-3')
    } else {
      Alert.alert('Información requerida', 'Por favor completa todas las preguntas para continuar')
    }
  }

  const handleBack = () => {
    router.back()
  }

  const isFormValid = age && situation && housing && incomeType

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4 mb-8">
          <Pressable onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </Pressable>
          <View className="flex-row gap-2">
            <View className="w-3 h-3 bg-green-500 rounded-full" />
            <View className="w-3 h-3 bg-green-500 rounded-full" />
            <View className="w-3 h-3 bg-gray-300 rounded-full" />
          </View>
          <View className="w-6" />
        </View>

        {/* Título */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Fase 2: Perfil y Contexto</Text>
          <Text className="text-gray-600 dark:text-gray-300 text-lg">Paso 2 de 3 • Solo te tomará 2 minutos conocerte mejor</Text>
        </View>

        {/* Formulario */}
        <View className="gap-8">
          {/* Edad */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">👤 ¿Cuántos años tienes?</Text>
            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl py-3 px-4">
              <TextInput
                className="text-gray-800 dark:text-white text-2xl font-bold text-center"
                placeholder="25"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                value={age}
                onChangeText={(text) => setPhase2Data({ age: text.replace(/\D/g, '') })}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-2 ml-2">Ingresa solo números</Text>
          </View>

          {/* Situación principal */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">🎓 ¿Cuál describe mejor tu situación actual?</Text>
            <Pressable
              className={`p-4 rounded-2xl border-2 ${situation ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowSituationPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${situation ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {situation ? situations.find((s) => s.id === situation)?.label : 'Selecciona tu situación actual'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={situation ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>

          {/* Vivienda */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">🏠 ¿Vives con tus padres, arriendas, tienes casa propia o compartes con amigos?</Text>
            <Pressable
              className={`p-4 rounded-2xl border-2 ${housing ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowHousingPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${housing ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {housing ? housingOptions.find((h) => h.id === housing)?.label : 'Selecciona tu tipo de vivienda'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={housing ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>

          {/* Tipo de ingreso principal */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">💼 ¿Cómo recibes la mayor parte de tus ingresos?</Text>
            <Pressable
              className={`p-4 rounded-2xl border-2 ${incomeType ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowIncomeTypePicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${incomeType ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {incomeType ? incomeTypes.find((t) => t.id === incomeType)?.label : 'Selecciona tu tipo de ingreso'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={incomeType ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Botones */}
        <View className="flex-row gap-4 mb-8 mt-8">
          <Pressable className="flex-1 rounded-2xl py-4 px-6 border-2 border-gray-300 dark:border-gray-600" onPress={handleBack}>
            <Text className="text-center text-lg font-semibold text-gray-600 dark:text-gray-300">Atrás</Text>
          </Pressable>

          <Pressable className={`flex-1 rounded-2xl py-4 px-6 ${isFormValid ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} onPress={handleNext} disabled={!isFormValid}>
            <Text className={`text-center text-lg font-semibold ${isFormValid ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>Siguiente</Text>
          </Pressable>
        </View>

        {/* Modal del Select de Situación */}
        <Modal visible={showSituationPicker} transparent={true} animationType="fade" onRequestClose={() => setShowSituationPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Selecciona tu situación actual</Text>
                <Pressable onPress={() => setShowSituationPicker(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </Pressable>
              </View>

              <View className="gap-3">
                {situations.map((situationOption) => (
                  <Pressable
                    key={situationOption.id}
                    className={`p-4 rounded-2xl border-2 ${situation === situationOption.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    onPress={() => {
                      setPhase2Data({ situation: situationOption.id })
                      setShowSituationPicker(false)
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{situationOption.icon}</Text>
                      <View className="flex-1">
                        <Text className={`font-semibold text-lg mb-1 ${situation === situationOption.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {situationOption.label}
                        </Text>
                        <Text className={`text-sm ${situation === situationOption.id ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>{situationOption.description}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal del Select de Vivienda */}
        <Modal visible={showHousingPicker} transparent={true} animationType="fade" onRequestClose={() => setShowHousingPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Selecciona tu tipo de vivienda</Text>
                <Pressable onPress={() => setShowHousingPicker(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </Pressable>
              </View>

              <View className="gap-3">
                {housingOptions.map((option) => (
                  <Pressable
                    key={option.id}
                    className={`p-4 rounded-2xl border-2 ${housing === option.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    onPress={() => {
                      setPhase2Data({ housing: option.id })
                      setShowHousingPicker(false)
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{option.icon}</Text>
                      <View className="flex-1">
                        <Text className={`font-semibold text-lg mb-1 ${housing === option.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {option.label}
                        </Text>
                        <Text className={`text-sm ${housing === option.id ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>{option.description}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal del Select de Tipo de Ingreso */}
        <Modal visible={showIncomeTypePicker} transparent={true} animationType="fade" onRequestClose={() => setShowIncomeTypePicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Selecciona tu tipo de ingreso</Text>
                <Pressable onPress={() => setShowIncomeTypePicker(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </Pressable>
              </View>

              <View className="gap-3">
                {incomeTypes.map((type) => (
                  <Pressable
                    key={type.id}
                    className={`p-4 rounded-2xl border-2 ${incomeType === type.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    onPress={() => {
                      setPhase2Data({ incomeType: type.id })
                      setShowIncomeTypePicker(false)
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{type.icon}</Text>
                      <View className="flex-1">
                        <Text className={`font-semibold text-lg mb-1 ${incomeType === type.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {type.label}
                        </Text>
                        <Text className={`text-sm ${incomeType === type.id ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>{type.description}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  )
}

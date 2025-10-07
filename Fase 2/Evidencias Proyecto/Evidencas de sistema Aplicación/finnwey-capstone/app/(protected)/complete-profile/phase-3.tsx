import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView, Alert, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useOnboardingUserStore } from '@/store/onboarding-user.store'

export default function Phase3() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { eatingOut, shopping, paymentMethod, financialInterests, subscriptions, setPhase3Data, markAsCompleted, getAllData } = useOnboardingUserStore()

  const [showEatingOutPicker, setShowEatingOutPicker] = useState(false)
  const [showShoppingPicker, setShowShoppingPicker] = useState(false)
  const [showPaymentPicker, setShowPaymentPicker] = useState(false)
  const [showInterestsPicker, setShowInterestsPicker] = useState(false)
  const [showSubscriptionsPicker, setShowSubscriptionsPicker] = useState(false)
  const [showChallengeModal, setShowChallengeModal] = useState(false)

  const eatingOutFrequencies = [
    { id: 'never', label: 'Nunca', icon: '❌', description: 'Siempre cocino en casa' },
    { id: '1-2-week', label: '1-2 veces por semana', icon: '🍽️', description: 'Ocasionalmente' },
    { id: '3-5-week', label: '3-5 veces por semana', icon: '🍕', description: 'Frecuentemente' },
    { id: 'daily', label: 'Diario', icon: '🌮', description: 'Todos los días' },
  ]

  const shoppingPlaces = [
    { id: 'supermarket', label: 'Supermercado', icon: '🛒', description: 'Mayoría de compras' },
    { id: 'online', label: 'Tiendas online', icon: '📱', description: 'Compras digitales' },
    { id: 'physical', label: 'Tiendas físicas', icon: '🏪', description: 'Compras presenciales' },
    { id: 'both', label: 'Ambos', icon: '🔄', description: 'Combinación de ambos' },
  ]

  const paymentMethods = [
    { id: 'cash', label: 'Efectivo', icon: '💵', description: 'Pago en efectivo' },
    { id: 'credit', label: 'Tarjeta de crédito', icon: '💳', description: 'Pago con crédito' },
    { id: 'debit', label: 'Tarjeta de débito', icon: '🏦', description: 'Pago con débito' },
    { id: 'wallet', label: 'Wallet', icon: '📱', description: 'Pago digital' },
    { id: 'other', label: 'Otro', icon: '💡', description: 'Otros métodos' },
  ]

  const financialInterestsOptions = [
    { id: 'save', label: 'Ahorrar', icon: '💰', description: 'Construir ahorros' },
    { id: 'invest', label: 'Invertir', icon: '📈', description: 'Hacer crecer mi dinero' },
    { id: 'reduce-debt', label: 'Reducir deudas', icon: '💳', description: 'Pagar lo que debo' },
    { id: 'plan-expenses', label: 'Planificar gastos', icon: '📊', description: 'Mejor organización' },
    { id: 'all', label: 'Todo', icon: '🎯', description: 'Mejorar en todo' },
  ]

  const subscriptionTypes = [
    { id: 'streaming', label: 'Streaming', icon: '📺', description: 'Netflix, Spotify, etc.' },
    { id: 'apps', label: 'Apps', icon: '📱', description: 'Aplicaciones premium' },
    { id: 'gym', label: 'Gimnasio', icon: '💪', description: 'Membresías fitness' },
    { id: 'others', label: 'Otros', icon: '🔧', description: 'Otros servicios' },
  ]

  const handleNext = () => {
    if (eatingOut && shopping && paymentMethod && financialInterests && subscriptions) {
      // Console.log con toda la información recopilada de las 3 fases
      const allData = getAllData()
      console.log('🎯 PERFIL COMPLETADO - TODAS LAS PROPIEDADES:')
      console.log('=============================================')
      console.log('📊 FASE 1 - Conocimiento Básico:')
      console.log('   - Rango de ingreso:', allData.incomeRange || 'No disponible')
      console.log('   - Objetivo financiero:', allData.financialGoal || 'No disponible')
      console.log('   - Registro de gastos:', allData.expenseTracking || 'No disponible')
      console.log('   - Comodidad financiera:', allData.financialComfort || 'No disponible')
      console.log('')
      console.log('👤 FASE 2 - Perfil y Contexto:')
      console.log('   - Edad:', allData.age || 'No disponible')
      console.log('   - Situación principal:', allData.situation || 'No disponible')
      console.log('   - Vivienda:', allData.housing || 'No disponible')
      console.log('   - Tipo de ingreso:', allData.incomeType || 'No disponible')
      console.log('')
      console.log('🍽️ FASE 3 - Hábitos y Preferencias:')
      console.log('   - Frecuencia comida fuera:', allData.eatingOut || 'No disponible')
      console.log('   - Lugar de compras:', allData.shopping || 'No disponible')
      console.log('   - Método de pago:', allData.paymentMethod || 'No disponible')
      console.log('   - Intereses financieros:', allData.financialInterests || 'No disponible')
      console.log('   - Suscripciones:', allData.subscriptions || 'No disponible')
      console.log('=============================================')

      // Verificar si todas las fases están completadas
      const { isAllPhasesCompleted, getPhase1Progress, getPhase2Progress, getPhase3Progress } = useOnboardingUserStore.getState()

      console.log('🔍 VERIFICACIÓN DETALLADA DEL PROGRESO:')
      console.log('📊 Fase 1 - Campos:', {
        incomeRange: allData.incomeRange || '❌',
        financialGoal: allData.financialGoal || '❌',
        expenseTracking: allData.expenseTracking || '❌',
        financialComfort: allData.financialComfort || '❌',
      })
      console.log('📊 Fase 2 - Campos:', {
        age: allData.age || '❌',
        situation: allData.situation || '❌',
        housing: allData.housing || '❌',
        incomeType: allData.incomeType || '❌',
      })
      console.log('📊 Fase 3 - Campos:', {
        eatingOut: allData.eatingOut || '❌',
        shopping: allData.shopping || '❌',
        paymentMethod: allData.paymentMethod || '❌',
        financialInterests: allData.financialInterests || '❌',
        subscriptions: allData.subscriptions || '❌',
      })

      if (isAllPhasesCompleted()) {
        markAsCompleted()
        console.log('✅ Estado del onboarding: COMPLETADO al 100%')
        console.log('📅 Completado en:', new Date().toLocaleString())
      } else {
        console.log('⚠️ Estado del onboarding: En progreso (faltan campos)')
        console.log('📊 Progreso Fase 1:', getPhase1Progress(), '%')
        console.log('📊 Progreso Fase 2:', getPhase2Progress(), '%')
        console.log('📊 Progreso Fase 3:', getPhase3Progress(), '%')
      }

      // Mostrar el challenge de consciencia
      setShowChallengeModal(true)
    } else {
      Alert.alert('Información requerida', 'Por favor completa todas las preguntas para continuar')
    }
  }

  const isFormValid = eatingOut && shopping && paymentMethod && financialInterests && subscriptions

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
            <View className="w-3 h-3 bg-green-500 rounded-full" />
            <View className="w-3 h-3 bg-green-500 rounded-full" />
          </View>
          <View className="w-6" />
        </View>

        {/* Título */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Fase 3: Hábitos y Preferencias</Text>
          <Text className="text-gray-600 dark:text-gray-300 text-lg">Paso 3 de 3 • Últimos detalles para personalizar tu experiencia</Text>
        </View>

        {/* Formulario */}
        <View className="gap-8">
          {/* Alimentación y restaurantes */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">🍽️ ¿Con qué frecuencia compras comida fuera de casa?</Text>
            <Pressable
              className={`p-4 rounded-2xl border-2 ${eatingOut ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowEatingOutPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${eatingOut ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {eatingOut ? eatingOutFrequencies.find((f) => f.id === eatingOut)?.label : 'Selecciona la frecuencia'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={eatingOut ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>

          {/* Compras y consumo */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">🛍️ ¿Dónde realizas la mayor parte de tus compras?</Text>
            <Pressable
              className={`p-4 rounded-2xl border-2 ${shopping ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowShoppingPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${shopping ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {shopping ? shoppingPlaces.find((p) => p.id === shopping)?.label : 'Selecciona dónde compras'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={shopping ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>

          {/* Pagos y medios */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">📱 ¿Cómo sueles pagar tus compras?</Text>
            <Pressable
              className={`p-4 rounded-2xl border-2 ${paymentMethod ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowPaymentPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${paymentMethod ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {paymentMethod ? paymentMethods.find((m) => m.id === paymentMethod)?.label : 'Selecciona tu método de pago'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={paymentMethod ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>

          {/* Intereses financieros */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">💡 ¿Qué te interesa mejorar o conocer más sobre tu dinero?</Text>
            <Pressable
              className={`p-4 rounded-2xl border-2 ${financialInterests ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowInterestsPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${financialInterests ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {financialInterests ? financialInterestsOptions.find((i) => i.id === financialInterests)?.label : 'Selecciona tu interés principal'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={financialInterests ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>

          {/* Suscripciones y servicios recurrentes (Opcional) */}
          <View>
            <Text className="text-gray-700 dark:text-gray-200 text-xl font-semibold mb-4">💳 ¿Tienes servicios o apps que pagas recurrentemente?</Text>
            {/* <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">(Opcional, para personalización más avanzada)</Text> */}
            <Pressable
              className={`p-4 rounded-2xl border-2 ${subscriptions ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
              onPress={() => setShowSubscriptionsPicker(true)}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${subscriptions ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {subscriptions ? subscriptionTypes.find((s) => s.id === subscriptions)?.label : 'Selecciona el tipo de suscripción'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={subscriptions ? '#059669' : '#6B7280'} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Challenge Preview */}
        <View className={'mt-8 mb-6 rounded-3xl p-6 bg-gradient-to-r from-green-600 to-emerald-700'}>
          <View className="items-center">
            <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🕵️ Detectives de Tu Propia Plata</Text>
            <Text className={`text-center text-lg leading-6 ${isDarkMode ? 'text-white/90' : 'text-gray-700'}`}>
              Después de completar esto, te daremos un challenge especial para que descubras exactamente dónde va tu dinero
            </Text>
          </View>
        </View>

        {/* Botones */}
        <View className="flex-row gap-4 mb-8">
          <Pressable className={`flex-1 rounded-2xl py-4 px-6 ${isFormValid ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} onPress={handleNext} disabled={!isFormValid}>
            <Text className={`text-center text-lg font-semibold ${isFormValid ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>¡Completar Perfil!</Text>
          </Pressable>
        </View>

        {/* Modal del Select de Frecuencia de Comida Fuera */}
        <Modal visible={showEatingOutPicker} transparent={true} animationType="fade" onRequestClose={() => setShowEatingOutPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>¿Con qué frecuencia comes fuera?</Text>
                <Pressable onPress={() => setShowEatingOutPicker(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </Pressable>
              </View>

              <View className="gap-3">
                {eatingOutFrequencies.map((frequency) => (
                  <Pressable
                    key={frequency.id}
                    className={`p-4 rounded-2xl border-2 ${eatingOut === frequency.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    onPress={() => {
                      setPhase3Data({ eatingOut: frequency.id })
                      setShowEatingOutPicker(false)
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{frequency.icon}</Text>
                      <View className="flex-1">
                        <Text className={`font-semibold text-lg mb-1 ${eatingOut === frequency.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {frequency.label}
                        </Text>
                        <Text className={`text-sm ${eatingOut === frequency.id ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>{frequency.description}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal del Select de Lugar de Compras */}
        <Modal visible={showShoppingPicker} transparent={true} animationType="fade" onRequestClose={() => setShowShoppingPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>¿Dónde realizas tus compras?</Text>
                <Pressable onPress={() => setShowShoppingPicker(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </Pressable>
              </View>

              <View className="gap-3">
                {shoppingPlaces.map((place) => (
                  <Pressable
                    key={place.id}
                    className={`p-4 rounded-2xl border-2 ${shopping === place.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    onPress={() => {
                      setPhase3Data({ shopping: place.id })
                      setShowShoppingPicker(false)
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{place.icon}</Text>
                      <View className="flex-1">
                        <Text className={`font-semibold text-lg mb-1 ${shopping === place.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {place.label}
                        </Text>
                        <Text className={`text-sm ${shopping === place.id ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>{place.description}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal del Select de Método de Pago */}
        <Modal visible={showPaymentPicker} transparent={true} animationType="fade" onRequestClose={() => setShowPaymentPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>¿Cómo sueles pagar?</Text>
                <Pressable onPress={() => setShowPaymentPicker(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </Pressable>
              </View>

              <View className="gap-3">
                {paymentMethods.map((method) => (
                  <Pressable
                    key={method.id}
                    className={`p-4 rounded-2xl border-2 ${paymentMethod === method.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    onPress={() => {
                      setPhase3Data({ paymentMethod: method.id })
                      setShowPaymentPicker(false)
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{method.icon}</Text>
                      <View className="flex-1">
                        <Text className={`font-semibold text-lg mb-1 ${paymentMethod === method.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {method.label}
                        </Text>
                        <Text className={`text-sm ${paymentMethod === method.id ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>{method.description}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal del Select de Intereses Financieros */}
        <Modal visible={showInterestsPicker} transparent={true} animationType="fade" onRequestClose={() => setShowInterestsPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>¿Qué te interesa mejorar?</Text>
                <Pressable onPress={() => setShowInterestsPicker(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </Pressable>
              </View>

              <View className="gap-3">
                {financialInterestsOptions.map((interest) => (
                  <Pressable
                    key={interest.id}
                    className={`p-4 rounded-2xl border-2 ${financialInterests === interest.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    onPress={() => {
                      setPhase3Data({ financialInterests: interest.id })
                      setShowInterestsPicker(false)
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{interest.icon}</Text>
                      <View className="flex-1">
                        <Text className={`font-semibold text-lg mb-1 ${financialInterests === interest.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {interest.label}
                        </Text>
                        <Text className={`text-sm ${financialInterests === interest.id ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>{interest.description}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal del Select de Suscripciones */}
        <Modal visible={showSubscriptionsPicker} transparent={true} animationType="fade" onRequestClose={() => setShowSubscriptionsPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>¿Qué tipo de suscripciones tienes?</Text>
                <Pressable onPress={() => setShowSubscriptionsPicker(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </Pressable>
              </View>

              <View className="gap-3">
                {subscriptionTypes.map((type) => (
                  <Pressable
                    key={type.id}
                    className={`p-4 rounded-2xl border-2 ${subscriptions === type.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    onPress={() => {
                      setPhase3Data({ subscriptions: type.id })
                      setShowSubscriptionsPicker(false)
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{type.icon}</Text>
                      <View className="flex-1">
                        <Text className={`font-semibold text-lg mb-1 ${subscriptions === type.id ? 'text-green-700 dark:text-green-200' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {type.label}
                        </Text>
                        <Text className={`text-sm ${subscriptions === type.id ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>{type.description}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal del Challenge de Consciencia */}
        <Modal visible={showChallengeModal} transparent={true} animationType="fade" onRequestClose={() => setShowChallengeModal(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Header del Modal */}
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-green-500 rounded-full items-center justify-center mb-4">
                  <Text className="text-3xl">🕵️</Text>
                </View>
                <Text className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>¡Challenge de Consciencia!</Text>
                <Text className={`text-center text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>Descubre exactamente dónde va tu dinero</Text>
              </View>

              {/* Explicación del Challenge */}
              <View className="mb-6">
                <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📋 Instrucciones:</Text>

                <View className="space-y-3">
                  <View className="flex-row items-start">
                    <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
                      <Text className="text-white text-sm font-bold">1</Text>
                    </View>
                    <Text className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Text className="font-semibold">Por 3 días:</Text> Cada vez que gastes algo, solo toma una foto del comprobante
                    </Text>
                  </View>

                  <View className="flex-row items-start">
                    <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
                      <Text className="text-white text-sm font-bold">2</Text>
                    </View>
                    <Text className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Text className="font-semibold">No calcules nada:</Text> Solo registra, sin analizar
                    </Text>
                  </View>

                  <View className="flex-row items-start">
                    <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-0.5">
                      <Text className="text-white text-sm font-bold">3</Text>
                    </View>
                    <Text className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Text className="font-semibold">Al 4to día:</Text> ¡Sorpresa! Veamos qué descubriste sobre ti mismo
                    </Text>
                  </View>
                </View>
              </View>

              {/* Botones */}
              <View className="flex-row gap-3">
                <Pressable className="flex-1 rounded-2xl py-3 px-4 border-2 border-gray-300 dark:border-gray-600" onPress={() => setShowChallengeModal(false)}>
                  <Text className={`text-center font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Más tarde</Text>
                </Pressable>

                <Pressable
                  className="flex-1 rounded-2xl py-3 px-4 bg-green-500"
                  onPress={() => {
                    setShowChallengeModal(false)
                    router.push('/(protected)/(tabs)/dashboard')
                  }}
                >
                  <Text className="text-center font-semibold text-white">¡Empezar!</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  )
}

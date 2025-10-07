import { View, Text, Pressable, ScrollView, TouchableOpacity } from 'react-native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

type Plan = 'free' | 'premium-monthly' | 'premium-yearly'

export default function SubscriptionPlan() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('free')
  const { isDarkMode } = useTheme()

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <View className="px-4 py-4">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
            </TouchableOpacity>

            <Text className="text-[28px] font-semibold text-black dark:text-white mb-4">Elige el Plan Perfecto para Ti</Text>
            <Text className="text-gray-400 dark:text-gray-300 mt-1 text-base">Desbloquea funciones premium diseñadas para tus necesidades.</Text>
          </View>

          <View className="h-[200px]">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-4" className="flex-row">
              {/* Plan Gratuito */}
              <Pressable
                className={`w-[280px] p-4 rounded-3xl ${selectedPlan === 'free' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}
                onPress={() => setSelectedPlan('free')}
              >
                <View className="flex-row items-center justify-between">
                  <View className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 items-center justify-center">
                    <MaterialIcons name="sync" size={24} color={isDarkMode ? '#ffffff' : '#4CAF50'} />
                  </View>
                  <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                    <Text className="text-green-600 dark:text-green-400 text-sm font-medium">Activo Ahora</Text>
                  </View>
                </View>
                <View className="mt-4">
                  <Text className="text-2xl font-semibold text-black dark:text-white">Plan Gratuito</Text>
                  <Text className="text-gray-500 dark:text-gray-300 text-sm mt-2">Perfecto para comenzar y explorar las funciones básicas.</Text>
                  <Text className="text-[28px] font-bold text-[#4CAF50] dark:text-green-400 mt-3">$0</Text>
                </View>
              </Pressable>

              {/* Plan Premium Mensual */}
              <Pressable
                className={`w-[280px] p-4 rounded-3xl ${selectedPlan === 'premium-monthly' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}
                onPress={() => setSelectedPlan('premium-monthly')}
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 items-center justify-center">
                    <MaterialIcons name="analytics" size={24} color={isDarkMode ? '#ffffff' : '#4CAF50'} />
                  </View>
                </View>
                <View className="mt-4">
                  <Text className="text-2xl font-semibold text-black dark:text-white">Plan Premium</Text>
                  <Text className="text-gray-500 dark:text-gray-300 text-sm mt-2">Control total sobre tus finanzas con funciones avanzadas.</Text>
                  <Text className="text-[28px] font-bold text-[#4CAF50] dark:text-green-400 mt-3">
                    $3,500 <Text className="text-gray-500 dark:text-gray-300 text-base">mensual</Text>
                  </Text>
                </View>
              </Pressable>

              {/* Plan Premium Anual */}
              <Pressable
                className={`w-[280px] p-4 rounded-3xl ${selectedPlan === 'premium-yearly' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'}`}
                onPress={() => setSelectedPlan('premium-yearly')}
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 items-center justify-center">
                    <MaterialIcons name="star" size={24} color={isDarkMode ? '#ffffff' : '#4CAF50'} />
                  </View>
                </View>
                <View className="mt-4">
                  <Text className="text-2xl font-semibold text-black dark:text-white">Plan Anual</Text>
                  <Text className="text-gray-500 dark:text-gray-300 text-sm mt-2">Ahorra más con nuestra suscripción anual.</Text>
                  <Text className="text-[28px] font-bold text-[#4CAF50] dark:text-green-400 mt-3">
                    $35,000 <Text className="text-gray-500 dark:text-gray-300 text-base">anual</Text>
                  </Text>
                </View>
              </Pressable>
            </ScrollView>
          </View>

          <View className="px-4">
            <Text className="text-xl font-semibold mb-6 text-black dark:text-white">
              Características del Plan {selectedPlan === 'free' ? 'Gratuito' : selectedPlan === 'premium-monthly' ? 'Premium' : 'Anual'}:
            </Text>

            <View className="gap-4">
              {selectedPlan === 'free' ? (
                <>
                  <Feature number={1} title="Funciones Básicas" description="Herramientas esenciales para gestionar tu cuenta." />
                  <Feature number={2} title="Reportes Limitados" description="Acceso a informes y análisis básicos." />
                  <Feature number={3} title="Soporte Comunitario" description="Ayuda a través de nuestro foro comunitario." />
                </>
              ) : (
                <>
                  <Feature number={1} title="Todas las Funciones Gratuitas" description="Todo lo incluido en el Plan Gratuito." />
                  <Feature number={2} title="Análisis Avanzado" description="Insights financieros detallados y predicciones." />
                  <Feature number={3} title="Soporte Prioritario" description="Atención al cliente 24/7." />
                  <Feature number={4} title="Categorías Personalizadas" description="Crea categorías ilimitadas." />
                </>
              )}
            </View>
          </View>

          <View className="px-4 py-4 pb-10">
            <TouchableOpacity className="bg-[#4CAF50] dark:bg-green-600 py-4 rounded-full flex-row items-center justify-center">
              <Text className="text-white text-center font-semibold text-lg">Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Feature({ number, title, description }: { number: number; title: string; description: string }) {
  const { isDarkMode } = useTheme()

  return (
    <View className="flex-row items-start">
      <View className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 items-center justify-center mr-3">
        <Text className="text-[#4CAF50] dark:text-green-400 font-semibold">{number}</Text>
      </View>
      <View>
        <Text className="text-lg font-semibold text-black dark:text-white">{title}</Text>
        <Text className="text-gray-400 dark:text-gray-300 text-sm mt-1">{description}</Text>
      </View>
    </View>
  )
}

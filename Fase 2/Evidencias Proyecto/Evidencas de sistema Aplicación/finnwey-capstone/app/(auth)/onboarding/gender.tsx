import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, useColorScheme, Pressable, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { AntDesign } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useOnboardingStore } from '@/store/onboarding.store'
import { useAuthStore } from '@/store/auth.store'
import { supabase } from '@/lib/supabase'

export default function GenderScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const { genderId, setField, nextStep, createCompleteUserProfile } = useOnboardingStore()
  const { loadProfile } = useAuthStore()
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  // Cargar géneros desde Supabase
  const [genders, setGenders] = useState([{ id: '', name: 'Cargando...', is_active: true }])

  React.useEffect(() => {
    loadGenders()
  }, [])

  const loadGenders = async () => {
    try {
      const { data, error } = await supabase.from('genders').select('*').eq('is_active', true).order('name')

      if (error) throw error
      setGenders(data || [])
    } catch (error) {
      console.error('Error cargando géneros:', error)
      // Fallback con datos estáticos
      setGenders([
        { id: '1', name: 'Femenino', is_active: true },
        { id: '2', name: 'Masculino', is_active: true },
        { id: '3', name: 'No Binario', is_active: true },
        { id: '4', name: 'Otro', is_active: true },
        { id: '5', name: 'Prefiero no decirlo', is_active: true },
      ])
    }
  }

  const handleGenderSelect = (id: string) => {
    setField('genderId', id)
  }

  const handleBack = () => {
    router.back()
  }

  const handleContinue = async () => {
    if (!genderId) return

    try {
      setIsLoading(true)

      console.log('🚀 Finalizando onboarding - Guardando género:', genderId)

      // Guardar el género seleccionado
      setField('genderId', genderId)

      // Crear perfil completo de usuario usando el store
      await createCompleteUserProfile()

      // Refrescar el perfil para obtener los datos actualizados
      await loadProfile()

      // Ir al Dashboard básico
      router.push('/(protected)/(tabs)/dashboard')
    } catch (error) {
      console.error('Error creando perfil de usuario:', error)
      // Continuar de todas formas al dashboard
      router.push('/(protected)/(tabs)/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <View className="flex-1 px-6">
        {/* Header con botón de retroceso */}
        <TouchableOpacity onPress={handleBack} className={`h-12 w-12 rounded-full items-center justify-center mt-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <AntDesign name="arrow-left" size={24} color={isDark ? '#ffffff' : '#000000'} />
        </TouchableOpacity>

        {/* Título y subtítulo */}
        <View className="mt-6">
          <Text className={`text-[34px] font-semibold ${isDark ? 'text-white' : 'text-black'}`}>¿Cómo te identificas?</Text>
          <Text className={`text-xl mt-2 ${isDark ? 'text-gray-300' : 'text-gray-400'}`}>Esta información nos ayuda a personalizar tu experiencia.</Text>
        </View>

        {/* Lista de géneros */}
        <ScrollView className="flex-1 mt-8">
          {genders.map((gender) => (
            <Pressable
              key={gender.id}
              onPress={() => handleGenderSelect(gender.id)}
              className={`flex-row items-center px-4 py-4 rounded-2xl mb-2 ${genderId === gender.id ? 'bg-[#4CAF50]/20 border-2 border-[#4CAF50]/50' : isDark ? 'bg-gray-700/70' : 'bg-gray-50'}`}
            >
              <View className="h-8 w-8 rounded-full bg-gray-300 items-center justify-center mr-3">
                <AntDesign name="user" size={16} color={isDark ? '#ffffff' : '#000000'} />
              </View>
              <Text className={`flex-1 text-lg ${isDark ? 'text-white' : 'text-black'}`}>{gender.name}</Text>
              {genderId === gender.id && (
                <View className="h-6 w-6 rounded-full bg-[#4CAF50] items-center justify-center">
                  <AntDesign name="check" size={16} color="white" />
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* Botón de continuar */}
        {genderId && (
          <View className="py-4">
            <Pressable
              onPress={handleContinue}
              disabled={isLoading}
              className="bg-[#4CAF50] py-4 rounded-full items-center"
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : isLoading ? 0.5 : 1,
                },
              ]}
            >
              {isLoading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white text-lg font-medium">Guardando...</Text>
                </View>
              ) : (
                <Text className="text-white text-lg font-medium">Continuar</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, useColorScheme, Pressable, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { AntDesign } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useOnboardingStore } from '@/store/onboarding.store'
import { useCountriesWithFlags } from '@/features/shared/hooks/useCountries'

export default function CountryScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const { countryCode, setField, nextStep } = useOnboardingStore()
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  // Obtener países desde Supabase con React Query
  const {
    data: countries,
    isLoading,
    error,
  } = useCountriesWithFlags({
    search: searchQuery || undefined,
  })

  const handleCountrySelect = (code: string) => {
    setField('countryCode', code)
  }

  const filteredCountries = countries?.filter((country) => country.name.toLowerCase().includes(searchQuery.toLowerCase())) || []

  const handleBack = () => {
    router.back()
  }

  const handleContinue = () => {
    if (countryCode) {
      nextStep()
      router.push('/(auth)/onboarding/region')
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
          <Text className={`text-[34px] font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Selecciona tu país de residencia</Text>
          <Text className={`text-xl mt-2 ${isDark ? 'text-gray-300' : 'text-gray-400'}`}>Elige el país donde actualmente vives o resides.</Text>
        </View>

        {/* Barra de búsqueda */}
        <View className="mt-8">
          <View className={`flex-row items-center rounded-full px-4 h-14 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <AntDesign name="search" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
            <TextInput
              placeholder="Buscar país..."
              className="flex-1 ml-2 text-base"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              style={{ color: isDark ? '#ffffff' : '#000000' }}
            />
          </View>
        </View>

        {/* Lista de países */}
        <ScrollView className="flex-1 mt-4">
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#000000'} />
              <Text className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Cargando países...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center py-20">
              <AntDesign name="exclamation-circle" size={48} color={isDark ? '#ef4444' : '#dc2626'} />
              <Text className={`mt-4 text-lg text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Error al cargar países</Text>
              <Text className={`mt-2 text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Por favor, verifica tu conexión</Text>
            </View>
          ) : filteredCountries.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <AntDesign name="search" size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className={`mt-4 text-lg text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No se encontraron países</Text>
              <Text className={`mt-2 text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Intenta con otro término de búsqueda</Text>
            </View>
          ) : (
            filteredCountries.map((country) => (
              <Pressable
                key={country.id}
                onPress={() => handleCountrySelect(country.code)}
                className={`flex-row items-center px-4 py-4 rounded-2xl mb-2 ${
                  countryCode === country.code ? 'bg-[#4CAF50]/20 border-2 border-[#4CAF50]/50' : isDark ? 'bg-gray-700/70' : 'bg-gray-50'
                }`}
              >
                <Text className="text-2xl mr-3">{country.flag}</Text>
                <Text className={`flex-1 text-lg ${isDark ? 'text-white' : 'text-black'}`}>{country.name}</Text>
                {countryCode === country.code && (
                  <View className="h-6 w-6 rounded-full bg-[#4CAF50] items-center justify-center">
                    <AntDesign name="check" size={16} color="white" />
                  </View>
                )}
              </Pressable>
            ))
          )}
        </ScrollView>

        {/* Botón de continuar */}
        {countryCode && (
          <View className="py-4">
            <Pressable
              onPress={handleContinue}
              className="bg-[#4CAF50] py-4 rounded-full items-center"
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text className="text-white text-lg font-medium">Continuar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

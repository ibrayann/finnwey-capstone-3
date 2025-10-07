import React from 'react'
import { View, Text, TouchableOpacity, TextInput, useColorScheme, Pressable } from 'react-native'
import { router } from 'expo-router'
import { AntDesign } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { countries } from '@/features/shared/hooks/useCountries'
import { useOnboardingStore } from '@/store/onboarding.store'

export default function PhoneScreen() {
  const { phoneNumber, countryCode, setField, nextStep, previousStep } = useOnboardingStore()
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  const selectedCountry = countries.find((country) => country.code === countryCode) || countries[0]

  const handleBack = () => {
    previousStep()
    router.back()
  }

  const handlePhoneChange = (text: string) => {
    // Solo permitir números y limitar a 9 dígitos
    const cleaned = text.replace(/[^0-9]/g, '')
    if (cleaned.length <= 9) {
      setField('phoneNumber', cleaned)
    }
  }

  const isValidPhone = phoneNumber.length === 9

  const handleContinue = () => {
    if (isValidPhone) {
      nextStep()
      router.push({
        pathname: '/(auth)/onboarding/verify',
        params: {
          phoneNumber: `${selectedCountry.phoneCode}${phoneNumber}`,
        },
      })
    }
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-1 px-6">
        {/* Header con botón de retroceso */}
        <TouchableOpacity onPress={handleBack} className={`h-12 w-12 rounded-full items-center justify-center mt-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <AntDesign name="arrow-left" size={24} color={isDark ? '#ffffff' : '#000000'} />
        </TouchableOpacity>

        {/* Título y subtítulo */}
        <View className="mt-6">
          <Text className={`text-[34px] font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Ingresa tu número telefónico</Text>
          <Text className={`text-xl mt-2 ${isDark ? 'text-gray-300' : 'text-gray-400'}`}>Te enviaremos un código de verificación.</Text>
        </View>

        {/* Input de teléfono */}
        <View className="mt-8">
          <View className={`flex-row items-center rounded-full px-4 h-14 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <View className="flex-row items-center">
              <Text className="text-lg">{selectedCountry.flag}</Text>
              <Text className={`text-lg ml-2 ${isDark ? 'text-white' : 'text-black'}`}>{selectedCountry.phoneCode}</Text>
              <View className={`h-6 w-[1px] mx-3 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
            </View>
            <TextInput
              placeholder="9 8863 0022"
              className="flex-1 text-lg"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={() => {
                if (isValidPhone) {
                  handleContinue()
                }
              }}
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              maxLength={9}
              style={{
                height: '100%',
                textAlignVertical: 'center',
                includeFontPadding: false,
                paddingVertical: 0,
                color: isDark ? '#ffffff' : '#000000',
                lineHeight: 20,
              }}
            />
          </View>
        </View>

        {/* Espacio flexible */}
        <View className="flex-1" />

        {/* Botón de continuar */}
        <View className="py-4">
          <Pressable
            onPress={handleContinue}
            disabled={!isValidPhone}
            className={`py-4 rounded-full items-center ${isValidPhone ? 'bg-[#4CAF50]' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            style={({ pressed }) => [
              {
                opacity: pressed && isValidPhone ? 0.7 : !isValidPhone ? 0.5 : 1,
              },
            ]}
          >
            <Text className={`text-lg font-medium ${isValidPhone ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>Continuar</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

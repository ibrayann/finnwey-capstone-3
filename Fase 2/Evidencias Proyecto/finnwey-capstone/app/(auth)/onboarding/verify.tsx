import React, { useRef } from 'react'
import { View, Text, TouchableOpacity, TextInput, useColorScheme, Pressable } from 'react-native'
import { router } from 'expo-router'
import { AntDesign } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useOnboardingStore } from '@/store/onboarding.store'

export default function VerifyScreen() {
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null])
  const { verificationCode, phoneNumber, setField, previousStep, nextStep, reset } = useOnboardingStore()
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  const handleBack = () => {
    previousStep()
    router.back()
  }

  const handleOtpChange = (value: string, index: number) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = verificationCode.split('')
      newOtp[index] = value
      setField('verificationCode', newOtp.join(''))

      // Auto focus next input
      if (value !== '' && index < 3) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !verificationCode[index]) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const isValidCode = verificationCode.length === 4

  const handleContinue = () => {
    if (isValidCode) {
      // Aquí iría la lógica de verificación
      router.push('/onboarding/signup')
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
          <Text className={`text-[34px] font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Ingresa el código OTP para verificar tu identidad</Text>
          <Text className={`text-xl mt-2 ${isDark ? 'text-gray-300' : 'text-gray-400'}`}>Te hemos enviado un código al {phoneNumber}</Text>
        </View>

        {/* Input de OTP */}
        <View className="mt-8 flex-row justify-between">
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} className={`w-[70px] h-[50px] rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <TextInput
                ref={(ref) => {
                  inputRefs.current[index] = ref
                }}
                className="flex-1 text-center text-2xl"
                value={verificationCode[index] || ''}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={1}
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                style={{
                  height: '100%',
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                  paddingVertical: 0,
                  color: isDark ? '#ffffff' : '#000000',
                  lineHeight: 28,
                }}
              />
            </View>
          ))}
        </View>

        {/* Espacio flexible */}
        <View className="flex-1" />

        {/* Botón de continuar */}
        <View className="py-4">
          <Pressable
            onPress={handleContinue}
            disabled={!isValidCode}
            className={`py-4 rounded-full items-center ${isValidCode ? 'bg-[#4CAF50]' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            style={({ pressed }) => [
              {
                opacity: pressed && isValidCode ? 0.7 : !isValidCode ? 0.5 : 1,
              },
            ]}
          >
            <Text className={`text-lg font-medium ${isValidCode ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>Continuar</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

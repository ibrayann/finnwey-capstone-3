import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, TextInput, Pressable, useColorScheme, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { AntDesign } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useOnboardingStore } from '@/store/onboarding.store'
import { useAuthStore } from '@/store/auth.store'
import { supabase } from '@/lib/supabase'

export default function EmailVerifyScreen() {
  const [otpCode, setOtpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  const { email, setField, nextStep } = useOnboardingStore()
  // Ya no necesitamos initializeAuth, el store se encarga automáticamente

  // Cooldown para reenvío de email
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleBack = () => {
    router.back()
  }

  const handleOtpChange = (value: string) => {
    // Solo permitir números y máximo 6 dígitos
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtpCode(value)
    }
  }

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código de 6 dígitos')
      return
    }

    try {
      setIsLoading(true)

      // Verificar el código OTP con Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otpCode,
        type: 'email',
      })

      if (error) {
        throw error
      }

      if (data.session) {
        // Usuario verificado exitosamente (useAuth ya sincronizó automáticamente)
        nextStep()
        router.push('/(auth)/onboarding/notifications')
      } else {
        Alert.alert('Error', 'No se pudo verificar el código. Intenta nuevamente.')
      }
    } catch (error: any) {
      console.error('Error verificando email:', error)

      let errorMessage = 'Error al verificar el código'

      if (error.message.includes('expired')) {
        errorMessage = 'El código ha expirado. Solicita uno nuevo.'
      } else if (error.message.includes('invalid')) {
        errorMessage = 'Código inválido. Verifica el número ingresado.'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Demasiados intentos. Espera un momento antes de intentar nuevamente.'
      } else if (error.message) {
        errorMessage = error.message
      }

      Alert.alert('Error de Verificación', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return

    try {
      setIsLoading(true)
      setResendCooldown(60) // 60 segundos de cooldown

      // Reenviar email de verificación
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        throw error
      }

      Alert.alert('Email Reenviado', 'Se ha enviado un nuevo código de verificación a tu email.')
    } catch (error: any) {
      console.error('Error reenviando email:', error)

      let errorMessage = 'Error al reenviar el email'

      if (error.message.includes('rate limit')) {
        errorMessage = 'Demasiados intentos. Espera un momento antes de solicitar otro email.'
      } else if (error.message) {
        errorMessage = error.message
      }

      Alert.alert('Error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isValidCode = otpCode.length === 6

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-1 px-6">
        {/* Header con botón de retroceso */}
        <TouchableOpacity onPress={handleBack} className={`h-12 w-12 rounded-full items-center justify-center mt-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <AntDesign name="arrow-left" size={24} color={isDark ? '#ffffff' : '#000000'} />
        </TouchableOpacity>

        {/* Título y subtítulo */}
        <View className="mt-6">
          <Text className={`text-[34px] font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Verifica tu email</Text>
          <Text className={`text-xl mt-2 ${isDark ? 'text-gray-300' : 'text-gray-400'}`}>
            Hemos enviado un código de 6 dígitos a{'\n'}
            <Text className="font-medium text-[#4CAF50]">{email}</Text>
          </Text>
        </View>

        {/* Input de código OTP */}
        <View className="mt-8">
          <Text className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Código de verificación</Text>
          <View className={`rounded-2xl px-4 h-14 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <TextInput
              className="flex-1 text-center text-2xl font-mono"
              value={otpCode}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              style={{
                height: '100%',
                textAlignVertical: 'center',
                includeFontPadding: false,
                paddingVertical: 0,
                color: isDark ? '#ffffff' : '#000000',
                letterSpacing: 8,
              }}
            />
          </View>
        </View>

        {/* Botón de reenvío */}
        <View className="mt-6">
          <Pressable
            onPress={handleResendEmail}
            disabled={resendCooldown > 0 || isLoading}
            className={`py-3 rounded-full items-center ${resendCooldown > 0 || isLoading ? (isDark ? 'bg-gray-700' : 'bg-gray-200') : 'bg-transparent border border-[#4CAF50]'}`}
          >
            <Text className={`text-base font-medium ${resendCooldown > 0 || isLoading ? (isDark ? 'text-gray-400' : 'text-gray-500') : 'text-[#4CAF50]'}`}>
              {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
            </Text>
          </Pressable>
        </View>

        {/* Espacio flexible */}
        <View className="flex-1" />

        {/* Botón de verificar */}
        <View className="py-4">
          <Pressable
            onPress={handleVerify}
            disabled={!isValidCode || isLoading}
            className={`py-4 rounded-full items-center ${isValidCode && !isLoading ? 'bg-[#4CAF50]' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            style={({ pressed }) => [
              {
                opacity: pressed && isValidCode && !isLoading ? 0.7 : !isValidCode || isLoading ? 0.5 : 1,
              },
            ]}
          >
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Verificando...</Text>
              </View>
            ) : (
              <Text className={`text-lg font-medium ${isValidCode ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>Verificar</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

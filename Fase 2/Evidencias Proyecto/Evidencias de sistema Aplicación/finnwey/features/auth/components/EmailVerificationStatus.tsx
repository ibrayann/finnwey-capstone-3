import React, { useState, useEffect } from 'react'
import { View, Text, Pressable, useColorScheme, ActivityIndicator } from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { useAuthStore } from '@/store/auth.store'
import { supabase } from '@/lib/supabase'

interface EmailVerificationStatusProps {
  email: string
  onVerified?: () => void
  onResend?: () => void
}

export default function EmailVerificationStatus({ email, onVerified, onResend }: EmailVerificationStatusProps) {
  const [isVerified, setIsVerified] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0)
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'
  const { checkEmailVerification } = useAuthStore()

  // Verificar estado de verificación
  useEffect(() => {
    checkVerificationStatus()
  }, [])

  // Cooldown para reenvío
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const checkVerificationStatus = async () => {
    try {
      setIsChecking(true)
      const verified = await checkEmailVerification()
      setIsVerified(verified)

      if (verified && onVerified) {
        onVerified()
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return

    try {
      setResendCooldown(60) // 60 segundos de cooldown

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        throw error
      }

      if (onResend) {
        onResend()
      }
    } catch (error: any) {
      console.error('Error reenviando email:', error)
    }
  }

  if (isChecking) {
    return (
      <View className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <View className="flex-row items-center gap-3">
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Verificando estado del email...</Text>
        </View>
      </View>
    )
  }

  if (isVerified) {
    return (
      <View className={`p-4 rounded-2xl ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
        <View className="flex-row items-center gap-3">
          <AntDesign name="check-circle" size={20} color="#4CAF50" />
          <Text className={`text-base font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>Email verificado exitosamente</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={`p-4 rounded-2xl ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
      <View className="flex-row items-center gap-3 mb-3">
        <AntDesign name="exclamation-circle" size={20} color="#F59E0B" />
        <Text className={`text-base font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>Email pendiente de verificación</Text>
      </View>

      <Text className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Hemos enviado un código de verificación a {email}</Text>

      <View className="flex-row gap-2">
        <Pressable onPress={checkVerificationStatus} className={`flex-1 py-2 px-4 rounded-full items-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <Text className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Verificar estado</Text>
        </Pressable>

        <Pressable
          onPress={handleResendEmail}
          disabled={resendCooldown > 0}
          className={`flex-1 py-2 px-4 rounded-full items-center ${resendCooldown > 0 ? (isDark ? 'bg-gray-700' : 'bg-gray-200') : 'bg-[#4CAF50]'}`}
        >
          <Text className={`text-sm font-medium ${resendCooldown > 0 ? (isDark ? 'text-gray-400' : 'text-gray-500') : 'text-white'}`}>
            {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

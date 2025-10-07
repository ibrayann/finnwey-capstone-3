import React from 'react'
import { View, Text, useColorScheme } from 'react-native'
import { ValidatedInput } from './ValidatedInput'
import { PrimaryButton } from './PrimaryButton'
import { BackButton } from './BackButton'

interface ResetPasswordFormProps {
  email: string
  error?: string
  onEmailChange: (text: string) => void
  onReset: () => void
  onBack: () => void
  isFormValid: boolean
  isLoading?: boolean
}

export const ResetPasswordForm = ({ email, error, onEmailChange, onReset, onBack, isFormValid, isLoading = false }: ResetPasswordFormProps) => {
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  return (
    <>
      <View className="mb-6">
        <Text className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recuperar contraseña</Text>
        <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Ingresa tu correo electrónico para recuperar tu contraseña</Text>
      </View>

      <ValidatedInput
        label="Correo electrónico"
        placeholder="ejemplo@correo.com"
        value={email}
        onChangeText={onEmailChange}
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
        icon="mail"
      />

      <PrimaryButton title="Recuperar contraseña" onPress={onReset} disabled={!isFormValid} loading={isLoading} />
      <BackButton onPress={onBack} title="Volver" />
    </>
  )
}

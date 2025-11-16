import React from 'react'
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native'
import { z } from 'zod'
import { ValidatedInput } from './ValidatedInput'
import { PrimaryButton } from './PrimaryButton'
import { BackButton } from './BackButton'

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Ingresa un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(50, 'La contraseña no puede tener más de 50 caracteres'),
})

type LoginFormType = z.infer<typeof loginSchema>

interface LoginFormProps {
  email: string
  password: string
  showPassword: boolean
  errors: Partial<Record<keyof LoginFormType, string>>
  onEmailChange: (text: string) => void
  onPasswordChange: (text: string) => void
  onTogglePassword: () => void
  onForgotPassword: () => void
  onLogin: () => void
  onBack: () => void
  isFormValid: boolean
  isLoading?: boolean
}

export const LoginForm = ({
  email,
  password,
  showPassword,
  errors,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onForgotPassword,
  onLogin,
  onBack,
  isFormValid,
  isLoading = false,
}: LoginFormProps) => {
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  return (
    <>
      <View className="mb-6">
        <Text className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Iniciar sesión</Text>
        <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Ingresa tus credenciales para continuar</Text>
      </View>

      <ValidatedInput
        label="Correo electrónico"
        placeholder="ejemplo@correo.com"
        value={email}
        onChangeText={onEmailChange}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        icon="mail"
      />

      <ValidatedInput
        label="Contraseña"
        placeholder="Ingresa tu contraseña"
        value={password}
        onChangeText={onPasswordChange}
        error={errors.password}
        secureTextEntry={!showPassword}
        icon="lock"
        showPasswordToggle={true}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
      />

      <TouchableOpacity onPress={onForgotPassword} className="mb-6">
        <Text className="text-[#4CAF50] text-sm text-right">¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <PrimaryButton title="Iniciar sesión" onPress={onLogin} disabled={!isFormValid} loading={isLoading} />
      <BackButton onPress={onBack} title="Volver" />
    </>
  )
}

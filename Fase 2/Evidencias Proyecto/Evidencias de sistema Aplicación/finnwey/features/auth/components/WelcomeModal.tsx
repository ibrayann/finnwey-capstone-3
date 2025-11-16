import { useState, useMemo } from 'react'
import { View, useColorScheme, Alert } from 'react-native'
import { router } from 'expo-router'
import { Modal } from '@/components/common/Modal'
import { ErrorModal } from '@/components/common/ErrorModal'
import { z } from 'zod'
import { PrimaryButton } from '@/features/auth/components/welcomeModal/PrimaryButton'
import { Separator } from '@/features/auth/components/welcomeModal/Separator'
import { SocialButton } from '@/features/auth/components/welcomeModal/SocialButton'
import { LoginForm } from '@/features/auth/components/welcomeModal/LoginForm'
import { ResetPasswordForm } from '@/features/auth/components/welcomeModal/ResetPasswordForm'
import { useAuthStore } from '@/store/auth.store'

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Ingresa un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(50, 'La contraseña no puede tener más de 50 caracteres'),
})

const resetPasswordSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Ingresa un correo válido'),
})

type LoginFormType = z.infer<typeof loginSchema>
type ResetPasswordType = z.infer<typeof resetPasswordSchema>

interface WelcomeModalProps {
  visible: boolean
  onClose: () => void
}

// Componente principal del modal
export const WelcomeModal = ({ visible, onClose }: WelcomeModalProps) => {
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormType, string>>>({})
  const [resetErrors, setResetErrors] = useState<Partial<Record<keyof ResetPasswordType, string>>>({})
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  // Hook de autenticación desde el store
  const { login, resetPassword, user, isLoading } = useAuthStore()

  const validateField = (field: keyof LoginFormType, value: string) => {
    try {
      loginSchema.shape[field].parse(value)
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.errors[0].message }))
      }
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    validateField('email', value)
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    validateField('password', value)
  }

  const handleRegister = () => {
    onClose()
    router.push('/(auth)/onboarding/signup')
  }

  const isFormValid = useMemo(() => {
    try {
      loginSchema.parse({ email, password })
      return true
    } catch (error) {
      return false
    }
  }, [email, password])

  const isResetFormValid = useMemo(() => {
    try {
      resetPasswordSchema.parse({ email: resetEmail })
      return true
    } catch (error) {
      return false
    }
  }, [resetEmail])

  const handleLogin = async () => {
    if (!showLoginForm) {
      setShowLoginForm(true)
      return
    }

    try {
      const validatedData = loginSchema.parse({ email, password })

      // Usar React Query para hacer login
      await login({
        email: validatedData.email,
        password: validatedData.password,
      })

      console.log('✅ Login completado en modal, navegando...')

      // Si el login es exitoso, cerrar el modal
      onClose()

      // Dar un pequeño delay para que el estado se actualice
      setTimeout(() => {
        router.push('/(protected)/(tabs)/dashboard')
      }, 100)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof LoginFormType, string>> = {}
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof LoginFormType
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      } else {
        // Error de autenticación - mostrar modal personalizado
        setErrorMessage('Las credenciales no son válidas. Por favor, verifica tu correo y contraseña.')
        setShowErrorModal(true)
      }
    }
  }

  const handleResetPassword = async () => {
    try {
      const validatedData = resetPasswordSchema.parse({ email: resetEmail })

      // Usar el store para resetear contraseña
      await resetPassword(validatedData.email)

      // Mostrar mensaje de éxito y volver al login
      Alert.alert('Email enviado', 'Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.')
      setShowResetPassword(false)
      setResetEmail('')
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ResetPasswordType, string>> = {}
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof ResetPasswordType
          newErrors[path] = err.message
        })
        setResetErrors(newErrors)
      } else {
        // Error de reset de contraseña - mostrar modal personalizado
        setErrorMessage(error instanceof Error ? error.message : 'Error desconocido')
        setShowErrorModal(true)
      }
    }
  }

  const handleBackToLogin = () => {
    setShowLoginForm(false)
    setEmail('')
    setPassword('')
    setErrors({})
  }

  const handleBackToReset = () => {
    setShowResetPassword(false)
    setResetEmail('')
    setResetErrors({})
  }

  const handleForgotPassword = () => {
    setShowResetPassword(true)
    setPassword('')
  }

  return (
    <Modal visible={visible} onClose={onClose}>
      <View className={`flex flex-col gap-3 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {showLoginForm ? (
          showResetPassword ? (
            <ResetPasswordForm
              email={resetEmail}
              error={resetErrors.email}
              onEmailChange={(value) => {
                setResetEmail(value)
                try {
                  resetPasswordSchema.shape.email.parse(value)
                  setResetErrors((prev) => ({ ...prev, email: undefined }))
                } catch (error) {
                  if (error instanceof z.ZodError) {
                    setResetErrors((prev) => ({ ...prev, email: error.errors[0].message }))
                  }
                }
              }}
              onReset={handleResetPassword}
              onBack={handleBackToReset}
              isFormValid={isResetFormValid}
              isLoading={isLoading}
            />
          ) : (
            <LoginForm
              email={email}
              password={password}
              showPassword={showPassword}
              errors={errors}
              onEmailChange={handleEmailChange}
              onPasswordChange={handlePasswordChange}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onForgotPassword={handleForgotPassword}
              onLogin={handleLogin}
              onBack={handleBackToLogin}
              isFormValid={isFormValid}
              isLoading={isLoading}
            />
          )
        ) : (
          <>
            <PrimaryButton title="Comenzar" onPress={handleRegister} />
            <PrimaryButton title="Iniciar sesión" onPress={handleLogin} variant="secondary" />
            <Separator />
            <SocialButton icon="google" title="Continuar con Google" onPress={() => {}} iconColor="#DB4437" />
            <SocialButton icon="apple" title="Continuar con Apple" onPress={() => {}} />
          </>
        )}
      </View>

      {/* Modal de error personalizado */}
      <ErrorModal visible={showErrorModal} onClose={() => setShowErrorModal(false)} message={errorMessage} />
    </Modal>
  )
}

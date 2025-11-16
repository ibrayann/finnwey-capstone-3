import React, { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, Pressable, useColorScheme, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useOnboardingStore } from '@/store/onboarding.store'
import { useAuthStore } from '@/store/auth.store'

export default function SignUpScreen() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  const { firstName, lastName, email, password, acceptedTerms, setField, nextStep, clearSensitiveData } = useOnboardingStore()
  const { register } = useAuthStore()

  const handleBack = () => {
    router.back()
  }

  const handleContinue = async () => {
    if (!isValidForm) return

    try {
      setIsLoading(true)

      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden')
        setIsLoading(false)
        return
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Por favor ingresa un email válido')
        setIsLoading(false)
        return
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres')
        setIsLoading(false)
        return
      }

      // Crear nombre completo
      const fullName = `${firstName.trim()} ${lastName.trim()}`

      // Registrar usuario con Supabase (nuevo formato)
      await register({
        email: email.trim(),
        password: password,
        full_name: fullName,
      })

      // Limpiar datos sensibles del onboarding store
      clearSensitiveData()

      // Si el registro es exitoso, ir al onboarding geográfico
      router.push('/(auth)/onboarding/country')
    } catch (error: any) {
      console.error('Error en el registro:', error)

      // Mostrar mensaje de error específico
      let errorMessage = 'Ocurrió un error durante el registro'

      if (error.message.includes('already registered')) {
        errorMessage = 'Este email ya está registrado. Intenta iniciar sesión.'
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'El formato del email no es válido'
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres'
      } else if (error.message.includes('verifica tu email')) {
        errorMessage = 'Por favor verifica tu email para completar el registro'
      } else if (error.message) {
        errorMessage = error.message
      }

      Alert.alert('Error de Registro', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return firstName.trim() !== '' && lastName.trim() !== '' && email.trim() !== '' && password.trim() !== '' && password === confirmPassword && acceptedTerms
  }

  const isValidForm = isFormValid()
  const isButtonLoading = isLoading

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-1 px-6">
        {/* Header con botón de retroceso */}
        <TouchableOpacity onPress={handleBack} className={`h-12 w-12 rounded-full items-center justify-center mt-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <AntDesign name="arrow-left" size={24} color={isDark ? '#ffffff' : '#000000'} />
        </TouchableOpacity>

        {/* Título y subtítulo */}
        <View className="mt-6">
          <Text className={`text-[34px] font-semibold ${isDark ? 'text-white' : 'text-black'}`}>¡Regístrate ahora y comienza tu viaje!</Text>
          <Text className={`text-xl mt-2 ${isDark ? 'text-gray-300' : 'text-gray-400'}`}>Elige el país donde vives actualmente.</Text>
        </View>

        {/* Formulario */}
        <View className="mt-8 gap-4">
          {/* Nombre */}
          <View className={`flex-row items-center rounded-full px-4 h-14 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <AntDesign name="user" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
            <TextInput
              placeholder="Nombre"
              className="flex-1 ml-3"
              value={firstName}
              returnKeyType="next"
              onChangeText={(text) => setField('firstName', text)}
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              style={{
                height: '100%',
                textAlignVertical: 'center',
                includeFontPadding: false,
                paddingVertical: 0,
                color: isDark ? '#ffffff' : '#000000',
              }}
            />
          </View>

          {/* Apellido */}
          <View className={`flex-row items-center rounded-full px-4 h-14 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <AntDesign name="user" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
            <TextInput
              placeholder="Apellido"
              className="flex-1 ml-3"
              value={lastName}
              returnKeyType="next"
              onChangeText={(text) => setField('lastName', text)}
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              style={{
                height: '100%',
                textAlignVertical: 'center',
                includeFontPadding: false,
                paddingVertical: 0,
                color: isDark ? '#ffffff' : '#000000',
              }}
            />
          </View>

          {/* Email */}
          <View className={`flex-row items-center rounded-full px-4 h-14 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <AntDesign name="mail" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
            <TextInput
              placeholder="Email"
              className="flex-1 ml-3"
              value={email}
              onChangeText={(text) => setField('email', text)}
              returnKeyType="next"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              style={{
                height: '100%',
                textAlignVertical: 'center',
                includeFontPadding: false,
                paddingVertical: 0,
                color: isDark ? '#ffffff' : '#000000',
              }}
            />
          </View>

          {/* Contraseña */}
          <View className={`flex-row items-center rounded-full px-4 h-14 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <AntDesign name="lock" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
            <TextInput
              placeholder="Contraseña"
              className="flex-1 ml-3"
              returnKeyType="next"
              value={password}
              onChangeText={(text) => setField('password', text)}
              secureTextEntry={!showPassword}
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              style={{
                height: '100%',
                textAlignVertical: 'center',
                includeFontPadding: false,
                paddingVertical: 0,
                color: isDark ? '#ffffff' : '#000000',
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
            </TouchableOpacity>
          </View>

          {/* Confirmar Contraseña */}
          <View className={`flex-row items-center rounded-full px-4 h-14 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <AntDesign name="lock" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
            <TextInput
              placeholder="Confirmar Contraseña"
              className="flex-1 ml-3"
              returnKeyType="done"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              style={{
                height: '100%',
                textAlignVertical: 'center',
                includeFontPadding: false,
                paddingVertical: 0,
                color: isDark ? '#ffffff' : '#000000',
              }}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Términos y condiciones */}
        <View className="mt-6 flex-row items-start gap-3">
          <Pressable
            onPress={() => setField('acceptedTerms', !acceptedTerms)}
            className={`h-6 w-6 rounded-full border-2 items-center justify-center ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
          >
            {acceptedTerms && <AntDesign name="check" size={16} color="#4CAF50" />}
          </Pressable>
          <Text className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-400'}`}>
            Al presionar continuar, he leído y acepto registrarme en <Text className="text-[#4CAF50]">Finnwey</Text> para recibir actualizaciones.
          </Text>
        </View>

        {/* Espacio flexible */}
        <View className="flex-1" />

        {/* Botón de continuar */}
        <View className="py-4">
          <Pressable
            onPress={handleContinue}
            disabled={!isValidForm || isButtonLoading}
            className={`py-4 rounded-full items-center ${isButtonLoading ? 'bg-[#4CAF50]' : isValidForm ? 'bg-[#4CAF50]' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            style={({ pressed }) => [
              {
                opacity: pressed && isValidForm && !isButtonLoading ? 0.7 : !isValidForm || isButtonLoading ? 0.5 : 1,
              },
            ]}
          >
            {isButtonLoading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-lg font-medium text-white">Creando cuenta...</Text>
              </View>
            ) : (
              <Text className={`text-lg font-medium ${isValidForm ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>Comenzar</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

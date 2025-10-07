import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '@/store/auth.store'
import { useState, useEffect } from 'react'

export default function EditProfile() {
  const { isDarkMode } = useTheme()
  const { user, profile, updateProfile, isLoading } = useAuthStore()

  // Estado local del formulario
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Cargar datos del perfil al montar
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '')
      setEmail(user.email || '')
    }
    if (profile) {
      setPhone(profile.phone || '')
    }
  }, [user, profile])

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'El nombre es requerido')
      return
    }

    try {
      setIsSaving(true)
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      })
      Alert.alert('Éxito', 'Perfil actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta nuevamente.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading && !user) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color={isDarkMode ? '#4CAF50' : '#4CAF50'} />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">Cargando perfil...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
            </TouchableOpacity>

            <Text className="text-xl font-semibold text-black dark:text-white">Editar Perfil</Text>

            <TouchableOpacity className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
              <Ionicons name="ellipsis-horizontal" size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Photo Section */}
        <View className="items-center mb-8">
          <View className="relative">
            <Image source={{ uri: 'https://via.placeholder.com/120' }} className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30" />
            <TouchableOpacity className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#4CAF50] dark:bg-green-600 items-center justify-center">
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="mt-3">
            <Text className="text-[#4CAF50] dark:text-green-400 font-medium">Editar Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="px-4 gap-4 mb-8">
          {/* Name Field */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color={isDarkMode ? '#ffffff' : '#4CAF50'} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">Nombre</Text>
                <TextInput
                  className="text-black dark:text-white text-base font-medium"
                  placeholder="Ingresa tu nombre"
                  placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>
          </View>

          {/* Email Field */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                <Ionicons name="mail-outline" size={20} color={isDarkMode ? '#ffffff' : '#4CAF50'} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">Correo Electrónico</Text>
                <TextInput
                  className="text-black dark:text-white text-base font-medium opacity-60"
                  placeholder="Ingresa tu correo"
                  placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                  value={email}
                  editable={false}
                  keyboardType="email-address"
                />
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">El email no se puede cambiar</Text>
              </View>
            </View>
          </View>

          {/* Phone Field */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                <Ionicons name="call-outline" size={20} color={isDarkMode ? '#ffffff' : '#4CAF50'} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">Número de Teléfono</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity className="flex-row items-center mr-2">
                    <Text className="text-black dark:text-white font-medium">+1</Text>
                    <Ionicons name="chevron-down" size={16} color={isDarkMode ? '#ffffff' : '#000000'} />
                  </TouchableOpacity>
                  <TextInput
                    className="text-black dark:text-white text-base font-medium flex-1"
                    placeholder="Ingresa tu teléfono"
                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Date of Birth Field */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#ffffff' : '#4CAF50'} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">Fecha de Nacimiento</Text>
                <TextInput className="text-black dark:text-white text-base font-medium" placeholder="DD/MM/YYYY" placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'} defaultValue="09/08/1997" />
              </View>
            </View>
          </View>

          {/* Address Field */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <View className="flex-row items-start">
              <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3 mt-1">
                <Ionicons name="location-outline" size={20} color={isDarkMode ? '#ffffff' : '#4CAF50'} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">Dirección</Text>
                <TextInput
                  className="text-black dark:text-white text-base font-medium"
                  placeholder="Ingresa tu dirección"
                  placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                  defaultValue="789 Oakwood Drive, Springdale, FL 32003"
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View className="px-4 pb-8">
          <TouchableOpacity
            className={`py-4 rounded-full flex-row items-center justify-center ${isSaving ? 'bg-gray-400 dark:bg-gray-600' : 'bg-[#4CAF50] dark:bg-green-600'}`}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-center font-semibold text-lg ml-2">Guardando...</Text>
              </>
            ) : (
              <Text className="text-white text-center font-semibold text-lg">Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

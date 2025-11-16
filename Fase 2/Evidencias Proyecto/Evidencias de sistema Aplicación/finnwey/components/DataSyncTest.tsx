import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useAuthStore } from '@/store/auth.store'

export function DataSyncTest() {
  const { user, session, profile, loadProfile } = useAuthStore()

  return (
    <View className="p-4 bg-gray-100 m-4 rounded-lg">
      <Text className="text-lg font-bold mb-4">🔍 Test de Sincronización de Datos</Text>

      {/* AuthStore Data */}
      <View className="mb-4">
        <Text className="font-semibold">📱 Auth:</Text>
        <Text>Autenticado: {session ? '✅' : '❌'}</Text>
        <Text>Usuario ID: {user?.id || 'N/A'}</Text>
        <Text>Email: {user?.email || 'N/A'}</Text>
        <Text>Onboarding: {user?.hasCompletedOnboarding ? '✅' : '❌'}</Text>
        <Text>Preferences: {user?.hasCompletedPreferences ? '✅' : '❌'}</Text>
      </View>

      {/* Profile Data */}
      <View className="mb-4">
        <Text className="font-semibold">👤 Profile from Supabase:</Text>
        <Text>Phone: {profile?.phone || 'N/A'}</Text>
        <Text>Gender ID: {profile?.gender_id || 'N/A'}</Text>
        <Text>Country ID: {profile?.country_id || 'N/A'}</Text>
        <Text>City ID: {profile?.city_id || 'N/A'}</Text>
        <Text>Onboarding: {profile?.onboarding_completed ? '✅' : '❌'}</Text>
        <Text>Preferences: {profile?.preferences_completed ? '✅' : '❌'}</Text>
      </View>

      {/* Refresh Button */}
      <Pressable
        className="bg-blue-500 py-2 px-4 rounded"
        onPress={async () => {
          console.log('🔄 Refrescando datos...')
          await loadProfile()
        }}
      >
        <Text className="text-white text-center font-semibold">🔄 Refrescar Datos</Text>
      </Pressable>
    </View>
  )
}

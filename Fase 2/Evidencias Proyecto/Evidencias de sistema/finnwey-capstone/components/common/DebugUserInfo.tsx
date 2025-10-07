import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/auth.store'
import { useState } from 'react'
import { useTheme } from '@/features/shared/hooks/useTheme'

/**
 * Componente de debug para ver información del usuario actual
 * Solo visible en desarrollo
 */
export function DebugUserInfo() {
  const { user, session, isAuthenticated, profile, isLoading } = useAuthStore()
  const { isDarkMode } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  // Solo mostrar en desarrollo
  if (__DEV__ !== true) return null

  return (
    <View className="absolute bottom-20 right-4 z-50">
      {/* Toggle Button */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="bg-purple-600 dark:bg-purple-700 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name={isExpanded ? 'close' : 'bug'} size={24} color="white" />
      </TouchableOpacity>

      {/* Debug Panel */}
      {isExpanded && (
        <View
          className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700"
          style={{
            width: 340,
            maxHeight: 500,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                <Ionicons name="bug" size={20} color={isDarkMode ? '#a78bfa' : '#7c3aed'} />
                <Text className="text-lg font-bold text-purple-600 dark:text-purple-400 ml-2">Debug Mode</Text>
              </View>
              <View className={`px-2 py-1 rounded-full ${isLoading ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <Text className={`text-xs font-medium ${isLoading ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400'}`}>{isLoading ? 'Cargando' : 'Listo'}</Text>
              </View>
            </View>

            {/* Authentication Status */}
            <View className="mb-4">
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Estado Auth</Text>
              <View className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Autenticado:</Text>
                  <Text className={`text-sm font-semibold ${isAuthenticated ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{isAuthenticated ? '✓ Sí' : '✗ No'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">Session:</Text>
                  <Text className={`text-sm font-semibold ${session ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{session ? '✓ Activa' : '✗ No'}</Text>
                </View>
              </View>
            </View>

            {/* User Info */}
            {user && (
              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Usuario (Store)</Text>
                <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 space-y-2">
                  <View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">ID:</Text>
                    <Text className="text-xs font-mono text-gray-900 dark:text-gray-100" numberOfLines={1}>
                      {user.id}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Email:</Text>
                    <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Nombre:</Text>
                    <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.full_name}</Text>
                  </View>
                  <View className="flex-row justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                    <View>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">Onboarding:</Text>
                      <Text className={`text-xs font-semibold ${user.hasCompletedOnboarding ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {user.hasCompletedOnboarding ? '✓ Completo' : '⚠ Pendiente'}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">Preferencias:</Text>
                      <Text className={`text-xs font-semibold ${user.hasCompletedPreferences ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {user.hasCompletedPreferences ? '✓ Completo' : '⚠ Pendiente'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Profile Info */}
            {profile && (
              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Perfil (DB)</Text>
                <View className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-600 dark:text-gray-400">Teléfono:</Text>
                    <Text className="text-xs font-medium text-gray-900 dark:text-gray-100">{profile.phone || 'N/A'}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-600 dark:text-gray-400">País ID:</Text>
                    <Text className="text-xs font-medium text-gray-900 dark:text-gray-100">{profile.country_id ? profile.country_id.slice(0, 8) + '...' : 'N/A'}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-600 dark:text-gray-400">Ciudad ID:</Text>
                    <Text className="text-xs font-medium text-gray-900 dark:text-gray-100">{profile.city_id ? profile.city_id.slice(0, 8) + '...' : 'N/A'}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-600 dark:text-gray-400">Ingreso:</Text>
                    <Text className="text-xs font-medium text-gray-900 dark:text-gray-100">{profile.exact_income ? `$${profile.exact_income}` : 'N/A'}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-600 dark:text-gray-400">Hogar:</Text>
                    <Text className="text-xs font-medium text-gray-900 dark:text-gray-100">{profile.household_size} personas</Text>
                  </View>
                  <View className="pt-2 border-t border-purple-200 dark:border-purple-800">
                    <Text className="text-xs text-gray-500 dark:text-gray-400">Creado:</Text>
                    <Text className="text-xs font-mono text-gray-900 dark:text-gray-100">{new Date(profile.created_at).toLocaleString('es-ES')}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Session Info */}
            {session && (
              <View className="mb-2">
                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">Sesión</Text>
                <View className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-2">
                  <View>
                    <Text className="text-xs text-gray-600 dark:text-gray-400">Access Token:</Text>
                    <Text className="text-xs font-mono text-gray-900 dark:text-gray-100" numberOfLines={1}>
                      {session.access_token.slice(0, 20)}...
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-600 dark:text-gray-400">Expira:</Text>
                    <Text className="text-xs font-medium text-gray-900 dark:text-gray-100">{session.expires_at ? new Date(session.expires_at * 1000).toLocaleTimeString('es-ES') : 'N/A'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* No Auth State */}
            {!isAuthenticated && !isLoading && (
              <View className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 items-center">
                <Ionicons name="alert-circle-outline" size={32} color={isDarkMode ? '#fca5a5' : '#ef4444'} />
                <Text className="text-sm font-semibold text-red-600 dark:text-red-400 mt-2">No hay usuario autenticado</Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">Inicia sesión para ver la información del usuario</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

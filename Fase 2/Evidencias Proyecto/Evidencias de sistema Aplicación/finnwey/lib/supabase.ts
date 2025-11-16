import 'react-native-url-polyfill/auto'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key)
  },
}

export const supabaseUrl = 'https://vvzmlchzfurkpvkefyrg.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2em1sY2h6ZnVya3B2a2VmeXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Mjg2OTUsImV4cCI6MjA3NDQwNDY5NX0.-nTz1S_gfkKKPHcgaAuC7lVFhxCASGNIXIZzRYVM__o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Configuración mejorada para manejar reconexiones
    flowType: 'pkce',
  },
  // Configuración global para mejor manejo de errores
  global: {
    headers: {
      'x-client-info': 'finnwey-mobile',
    },
  },
  // Configuración de realtime (si se usa)
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

/**
 * Helper para limpiar la sesión si hay problemas de conexión
 * Útil cuando la base de datos se reactiva después de estar pausada
 * Esta función limpia localmente sin hacer peticiones de red
 */
export async function clearAuthSession() {
  try {
    console.log('🔄 Limpiando sesión de autenticación...')

    // Limpiar el storage local primero (sin hacer peticiones de red)
    try {
      // Limpiar todas las claves relacionadas con auth
      const keys = ['supabase.auth.token', 'sb-vvzmlchzfurkpvkefyrg-auth-token', 'supabase.auth.refresh_token']

      for (const key of keys) {
        try {
          await ExpoSecureStoreAdapter.removeItem(key)
        } catch (e) {
          // Ignorar errores si la clave no existe
        }
      }
    } catch (storageError) {
      console.warn('⚠️ Error limpiando storage local:', storageError)
    }

    // Intentar signOut solo si hay conexión, pero no fallar si no hay
    try {
      // Usar un timeout corto para no bloquear
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))

      await Promise.race([supabase.auth.signOut(), timeoutPromise])
    } catch (signOutError) {
      // Ignorar errores de signOut si no hay conexión
      console.warn('⚠️ No se pudo hacer signOut remoto (puede ser por falta de conexión):', signOutError)
    }

    console.log('✅ Sesión limpiada exitosamente')
  } catch (error) {
    console.error('❌ Error limpiando sesión:', error)
    // No lanzar el error, solo limpiar localmente
  }
}

/**
 * Helper para verificar la conexión con Supabase
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('count').limit(1)
    return !error
  } catch (error) {
    console.error('❌ Error verificando conexión:', error)
    return false
  }
}

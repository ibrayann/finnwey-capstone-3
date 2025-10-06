import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

/**
 * Usuario simplificado para el estado global
 */
export interface User {
  id: string
  email: string
  full_name: string
  hasCompletedOnboarding: boolean
  hasCompletedPreferences: boolean
}

/**
 * Perfil completo del usuario desde la BD
 */
export interface UserProfile {
  id: string
  full_name: string
  email: string
  phone: string | null
  gender_id: string | null
  country_id: string | null
  city_id: string | null
  employment_status_id: string | null
  education_level_id: string | null
  marital_status_id: string | null
  income_range_id: string | null
  exact_income: number | null
  household_size: number
  onboarding_completed: boolean
  preferences_completed: boolean
  onboarding_completed_at: string | null
  preferences_completed_at: string | null
  created_at: string
  updated_at: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  full_name: string
}

/**
 * Store de autenticación - TODO EN UNO
 * Maneja estado + funciones + listener de auth
 */
interface AuthState {
  // Estado
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  session: Session | null
  profile: UserProfile | null

  // Funciones de autenticación
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>

  // Funciones de perfil
  loadProfile: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  completeOnboarding: () => Promise<void>
  completePreferences: () => Promise<void>

  // Helpers internos
  initSession: () => Promise<void>
  setupAuthListener: () => () => void
}

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  session: null,
  profile: null,
}

/**
 * Store de autenticación - Enfoque simple y directo
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Inicializar sesión al cargar la app
       */
      initSession: async () => {
        const state = get()

        // Si ya hay sesión, no hacer nada
        if (state.session && state.user) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) throw error

          if (session) {
            console.log('🔄 Inicializando sesión desde Supabase')

            // Obtener perfil
            const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle()

            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Usuario',
              hasCompletedOnboarding: profile?.onboarding_completed || false,
              hasCompletedPreferences: profile?.preferences_completed || false,
            }

            set({
              isAuthenticated: true,
              user,
              session,
              profile: profile as UserProfile,
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('❌ Error inicializando sesión:', error)
          set({ isLoading: false })
        }
      },

      /**
       * Configurar listener de cambios de auth
       */
      setupAuthListener: () => {
        console.log('🎧 Registrando listener de auth')

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔄 Auth state changed:', event)

          if (event === 'SIGNED_OUT') {
            console.log('👋 Cerrando sesión')
            set({
              isAuthenticated: false,
              user: null,
              session: null,
              profile: null,
            })
          } else if (event === 'TOKEN_REFRESHED' && session) {
            console.log('🔄 Token actualizado')
            set({ session })
          }
        })

        return () => {
          console.log('🔇 Desregistrando listener de auth')
          subscription.unsubscribe()
        }
      },

      /**
       * Login
       */
      login: async (credentials: LoginCredentials) => {
        console.log('🔄 Login - Iniciando sesión')
        set({ isLoading: true })

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error) throw error
          if (!data.session || !data.user) throw new Error('No se recibió sesión')

          // Obtener perfil
          const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).maybeSingle()

          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: profile?.full_name || data.user.user_metadata?.full_name || 'Usuario',
            hasCompletedOnboarding: profile?.onboarding_completed || false,
            hasCompletedPreferences: profile?.preferences_completed || false,
          }

          set({
            isAuthenticated: true,
            user,
            session: data.session,
            profile: profile as UserProfile,
            isLoading: false,
          })

          console.log('✅ Login exitoso')
        } catch (error: any) {
          console.error('❌ Error en login:', error)
          set({ isLoading: false })
          throw new Error(error.message)
        }
      },

      /**
       * Register
       */
      register: async (registerData: RegisterData) => {
        console.log('🔄 Register - Registrando usuario')
        set({ isLoading: true })

        try {
          const { data, error } = await supabase.auth.signUp({
            email: registerData.email,
            password: registerData.password,
            options: {
              data: {
                full_name: registerData.full_name,
              },
            },
          })

          if (error) throw error
          if (!data.user) throw new Error('No se recibió usuario')

          // Si hay sesión, obtener perfil
          let profile: UserProfile | null = null
          if (data.session) {
            const { data: profileData } = await supabase.from('users').select('*').eq('id', data.user.id).maybeSingle()

            profile = profileData as UserProfile
          }

          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: registerData.full_name,
            hasCompletedOnboarding: profile?.onboarding_completed || false,
            hasCompletedPreferences: profile?.preferences_completed || false,
          }

          set({
            isAuthenticated: !!data.session,
            user,
            session: data.session,
            profile,
            isLoading: false,
          })

          console.log('✅ Register exitoso')
        } catch (error: any) {
          console.error('❌ Error en register:', error)
          set({ isLoading: false })
          throw new Error(error.message)
        }
      },

      /**
       * Logout
       */
      logout: async () => {
        console.log('🔄 Logout - Cerrando sesión')

        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error

          // El listener se encargará de limpiar el estado
          console.log('✅ Logout exitoso')
        } catch (error: any) {
          console.error('❌ Error en logout:', error)
          // Limpiar de todas formas
          set({
            isAuthenticated: false,
            user: null,
            session: null,
            profile: null,
          })
          throw new Error(error.message)
        }
      },

      /**
       * Reset Password
       */
      resetPassword: async (email: string) => {
        console.log('🔄 Reset Password - Enviando email de recuperación:', email)

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'exp://localhost:8081/--/reset-password',
          })

          if (error) throw error
          console.log('✅ Email de recuperación enviado')
        } catch (error: any) {
          console.error('❌ Error en resetPassword:', error)
          throw new Error(error.message)
        }
      },

      /**
       * Cargar perfil completo
       */
      loadProfile: async () => {
        const { user } = get()
        if (!user?.id) return

        try {
          const { data: profile, error } = await supabase.from('users').select('*').eq('id', user.id).single()

          if (error) throw error

          set({ profile: profile as UserProfile })
        } catch (error) {
          console.error('❌ Error cargando perfil:', error)
        }
      },

      /**
       * Actualizar perfil
       */
      updateProfile: async (profileData: Partial<UserProfile>) => {
        const { user, session } = get()
        if (!user?.id) throw new Error('Usuario no autenticado')

        try {
          const updateData = {
            ...profileData,
            id: user.id,
            updated_at: new Date().toISOString(),
          }

          const { data, error } = await supabase.from('users').upsert(updateData).select('*').single()

          if (error) throw error

          // Actualizar estado local
          const updatedProfile = data as UserProfile
          set({
            profile: updatedProfile,
            user: {
              ...user,
              full_name: updatedProfile.full_name || user.full_name,
              hasCompletedOnboarding: updatedProfile.onboarding_completed,
              hasCompletedPreferences: updatedProfile.preferences_completed,
            },
          })

          console.log('✅ Perfil actualizado')
        } catch (error: any) {
          console.error('❌ Error actualizando perfil:', error)
          throw new Error(error.message)
        }
      },

      /**
       * Completar onboarding
       */
      completeOnboarding: async () => {
        await get().updateProfile({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
      },

      /**
       * Completar preferencias
       */
      completePreferences: async () => {
        await get().updateProfile({
          preferences_completed: true,
          preferences_completed_at: new Date().toISOString(),
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // No persistir funciones
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

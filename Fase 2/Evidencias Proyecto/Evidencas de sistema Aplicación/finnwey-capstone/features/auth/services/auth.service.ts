import { supabase } from '@/lib/supabase'
import { LoginCredentials, RegisterData, UserProfile, UpdateProfileData, AuthResponse, User } from '../types/auth.types'
import { Session } from '@supabase/supabase-js'

/**
 * Servicio para manejar autenticación y perfil de usuario con Supabase
 */
export class AuthService {
  // ========== AUTENTICACIÓN ==========

  /**
   * Iniciar sesión con email y contraseña
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔄 AuthService.login - Iniciando sesión:', credentials.email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      console.error('❌ Error en login:', error)
      throw new Error(error.message)
    }

    if (!data.session || !data.user) {
      throw new Error('No se recibió sesión del servidor')
    }

    // Obtener perfil completo
    const profile = await this.getUserProfile(data.user.id)

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      full_name: profile?.full_name || data.user.user_metadata?.full_name || 'Usuario',
      hasCompletedOnboarding: profile?.onboarding_completed || false,
      hasCompletedPreferences: profile?.preferences_completed || false,
    }

    console.log('✅ Login exitoso:', user.email)

    return {
      user,
      session: data.session,
      profile,
    }
  }

  /**
   * Registrar nuevo usuario
   */
  static async register(registerData: RegisterData): Promise<AuthResponse> {
    console.log('🔄 AuthService.register - Registrando usuario:', registerData.email)

    const { data, error } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
      options: {
        data: {
          full_name: registerData.full_name,
        },
      },
    })

    if (error) {
      console.error('❌ Error en registro:', error)
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('No se recibió usuario del servidor')
    }

    // Si hay sesión, obtener perfil
    let profile: UserProfile | null = null
    if (data.session) {
      profile = await this.getUserProfile(data.user.id)
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      full_name: registerData.full_name,
      hasCompletedOnboarding: profile?.onboarding_completed || false,
      hasCompletedPreferences: profile?.preferences_completed || false,
    }

    console.log('✅ Registro exitoso:', user.email)

    return {
      user,
      session: data.session!,
      profile,
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<void> {
    console.log('🔄 AuthService.logout - Cerrando sesión')

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('❌ Error en logout:', error)
      throw new Error(error.message)
    }

    console.log('✅ Logout exitoso')
  }

  /**
   * Obtener sesión actual
   */
  static async getSession(): Promise<Session | null> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Error obteniendo sesión:', error)
      throw new Error(error.message)
    }

    return session
  }

  /**
   * Verificar si el email está confirmado
   */
  static async checkEmailVerification(): Promise<boolean> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error('❌ Error verificando email:', error)
        return false
      }

      return user?.email_confirmed_at !== null
    } catch (error) {
      console.error('❌ Error verificando email:', error)
      return false
    }
  }

  /**
   * Recuperar contraseña
   */
  static async resetPassword(email: string): Promise<void> {
    console.log('🔄 AuthService.resetPassword - Enviando email de recuperación:', email)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'exp://localhost:8081/--/reset-password',
    })

    if (error) {
      console.error('❌ Error en resetPassword:', error)
      throw new Error(error.message)
    }

    console.log('✅ Email de recuperación enviado')
  }

  /**
   * Actualizar contraseña
   */
  static async updatePassword(newPassword: string): Promise<void> {
    console.log('🔄 AuthService.updatePassword - Actualizando contraseña')

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('❌ Error actualizando contraseña:', error)
      throw new Error(error.message)
    }

    console.log('✅ Contraseña actualizada')
  }

  // ========== PERFIL DE USUARIO ==========

  /**
   * Obtener perfil completo del usuario desde la base de datos
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    console.log('🔄 AuthService.getUserProfile - Obteniendo perfil:', userId)

    const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle()

    if (error) {
      console.error('❌ Error obteniendo perfil:', error)
      throw new Error(error.message)
    }

    if (!data) {
      console.log('ℹ️ No se encontró perfil de usuario - usuario nuevo')
      return null
    }

    console.log('✅ Perfil obtenido exitosamente')
    return data as UserProfile
  }

  /**
   * Actualizar perfil del usuario
   */
  static async updateUserProfile(userId: string, profileData: UpdateProfileData): Promise<UserProfile> {
    console.log('🔄 AuthService.updateUserProfile - Actualizando perfil:', userId)

    const updateData = {
      ...profileData,
      id: userId,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('users').upsert(updateData).select('*').single()

    if (error) {
      console.error('❌ Error actualizando perfil:', error)
      throw new Error(error.message)
    }

    console.log('✅ Perfil actualizado exitosamente')
    return data as UserProfile
  }

  /**
   * Crear perfil completo del usuario (usado en onboarding)
   */
  static async createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    console.log('🔄 AuthService.createUserProfile - Creando perfil completo:', userId)

    const fullProfileData = {
      id: userId,
      ...profileData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('users').upsert(fullProfileData).select('*').single()

    if (error) {
      console.error('❌ Error creando perfil:', error)
      throw new Error(error.message)
    }

    console.log('✅ Perfil creado exitosamente')
    return data as UserProfile
  }

  /**
   * Marcar onboarding como completado
   */
  static async completeOnboarding(userId: string): Promise<UserProfile> {
    console.log('🔄 AuthService.completeOnboarding - Marcando onboarding completo:', userId)

    return await this.updateUserProfile(userId, {
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
  }

  /**
   * Marcar preferencias como completadas
   */
  static async completePreferences(userId: string): Promise<UserProfile> {
    console.log('🔄 AuthService.completePreferences - Marcando preferencias completas:', userId)

    return await this.updateUserProfile(userId, {
      preferences_completed: true,
      preferences_completed_at: new Date().toISOString(),
    })
  }

  // ========== HELPERS ==========

  /**
   * Convertir datos de sesión a objeto User simplificado
   */
  static sessionToUser(session: Session, profile: UserProfile | null): User {
    return {
      id: session.user.id,
      email: session.user.email || '',
      full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Usuario',
      hasCompletedOnboarding: profile?.onboarding_completed || false,
      hasCompletedPreferences: profile?.preferences_completed || false,
    }
  }
}


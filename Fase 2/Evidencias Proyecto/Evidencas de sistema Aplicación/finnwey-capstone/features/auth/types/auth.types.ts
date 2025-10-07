import { Session, User as SupabaseUser } from '@supabase/supabase-js'

/**
 * Perfil completo del usuario en la base de datos
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
 * Datos para login
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Datos para registro
 */
export interface RegisterData {
  email: string
  password: string
  full_name: string
}

/**
 * Datos para actualizar perfil
 */
export type UpdateProfileData = Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  user: User
  session: Session
  profile: UserProfile | null
}


import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

type OnboardingStep = 'signup' | 'phone' | 'verify' | 'pin'

interface OnboardingState {
  step: OnboardingStep
  firstName: string
  lastName: string
  email: string
  password: string
  acceptedTerms: boolean
  countryCode: string
  regionId: string
  cityId: string
  phoneNumber: string
  genderId: string
  verificationCode: string
  pin: string
  hasFaceIdEnabled: boolean
  setField: (field: keyof Omit<OnboardingState, 'setField' | 'reset' | 'nextStep' | 'previousStep' | 'clearSensitiveData'>, value: any) => void
  reset: () => void
  nextStep: () => void
  previousStep: () => void
  clearSensitiveData: () => void
  createCompleteUserProfile: () => Promise<void>
}

const initialState = {
  step: 'signup' as OnboardingStep,
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  acceptedTerms: false,
  countryCode: '',
  regionId: '',
  cityId: '',
  phoneNumber: '',
  genderId: '',
  verificationCode: '',
  pin: '',
  hasFaceIdEnabled: false,
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,

  setField: (field, value) => set((state) => ({ ...state, [field]: value })),

  reset: () => set(initialState),

  nextStep: () =>
    set((state) => ({
      ...state,
      step: state.step === 'signup' ? 'phone' : state.step === 'phone' ? 'verify' : state.step === 'verify' ? 'pin' : state.step,
    })),

  previousStep: () =>
    set((state) => ({
      ...state,
      step: state.step === 'pin' ? 'verify' : state.step === 'verify' ? 'phone' : state.step === 'phone' ? 'signup' : state.step,
    })),

  clearSensitiveData: () =>
    set((state) => ({
      ...state,
      password: '',
      verificationCode: '',
      pin: '',
    })),

  createCompleteUserProfile: async () => {
    try {
      const state = get()

      // Verificar que tenemos todos los datos necesarios
      if (!state.firstName || !state.lastName || !state.email || !state.genderId) {
        throw new Error('Datos faltantes para completar el perfil')
      }

      console.log('🔄 Creando perfil completo de usuario...')
      console.log('📊 Datos del onboarding:', {
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        countryCode: state.countryCode,
        cityId: state.cityId,
        phoneNumber: state.phoneNumber,
        genderId: state.genderId,
      })

      // Obtener usuario autenticado actual
      const { data: authUser } = await supabase.auth.getUser()

      if (!authUser.user) {
        throw new Error('Usuario no autenticado')
      }

      // Obtener IDs reales de las tablas si tenemos los datos
      let countryId = null,
        cityId = null

      if (state.countryCode) {
        const { data: countryData } = await supabase.from('countries').select('id').eq('code', state.countryCode).single()

        countryId = countryData?.id
        console.log('🌍 País encontrado:', countryData)
      }

      if (state.cityId) {
        // cityId ya viene como UUID desde el onboarding
        cityId = state.cityId
        console.log('🏙️ Ciudad ID:', cityId)
      }

      // Crear/actualizar perfil completo en Supabase
      const userProfileData = {
        id: authUser.user.id,
        full_name: `${state.firstName} ${state.lastName}`,
        email: state.email,
        phone: state.phoneNumber || null,
        gender_id: state.genderId,
        country_id: countryId,
        city_id: cityId,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log('💾 Datos para crear usuario:', userProfileData)

      const { error } = await supabase.from('users').upsert(userProfileData)

      if (error) {
        console.error('❌ Error creando perfil:', error)
        throw error
      }

      console.log('✅ Usuario creado/actualizado exitosamente en Supabase')

      // Limpiarlos datos sensibles del onboarding
      set((currentState) => ({
        ...currentState,
        password: '',
        verificationCode: '',
        pin: '',
      }))
    } catch (error) {
      console.error('Error creando perfil completo:', error)
      throw error
    }
  },
}))

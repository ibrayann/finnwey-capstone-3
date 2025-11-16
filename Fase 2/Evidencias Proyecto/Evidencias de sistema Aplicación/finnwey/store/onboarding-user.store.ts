import { create } from 'zustand'
import { useAuthStore } from './auth.store'
import { supabase } from '@/lib/supabase'

interface OnboardingUserData {
  // Fase 1 - Conocimiento Básico
  incomeRange: string
  financialGoal: string
  expenseTracking: string
  financialComfort: string

  // Fase 2 - Perfil y Contexto
  age: string
  situation: string
  housing: string
  incomeType: string

  // Fase 3 - Hábitos y Preferencias
  eatingOut: string
  shopping: string
  paymentMethod: string
  financialInterests: string
  subscriptions: string

  // Estado del onboarding
  currentPhase: number
  isCompleted: boolean
  completedAt?: Date
}

interface OnboardingUserStore extends OnboardingUserData {
  // Acciones para Fase 1
  setPhase1Data: (data: Partial<Pick<OnboardingUserData, 'incomeRange' | 'financialGoal' | 'expenseTracking' | 'financialComfort'>>) => void

  // Acciones para Fase 2
  setPhase2Data: (data: Partial<Pick<OnboardingUserData, 'age' | 'situation' | 'housing' | 'incomeType'>>) => void

  // Acciones para Fase 3
  setPhase3Data: (data: Partial<Pick<OnboardingUserData, 'eatingOut' | 'shopping' | 'paymentMethod' | 'financialInterests' | 'subscriptions'>>) => void

  // Acciones generales
  setCurrentPhase: (phase: number) => void
  markAsCompleted: () => void
  resetOnboarding: () => void

  // Getters útiles
  getPhase1Progress: () => number
  getPhase2Progress: () => number
  getPhase3Progress: () => number
  getOverallProgress: () => number
  isAllPhasesCompleted: () => boolean
  getAllData: () => OnboardingUserData
}

const initialState: OnboardingUserData = {
  // Fase 1
  incomeRange: '',
  financialGoal: '',
  expenseTracking: '',
  financialComfort: '',

  // Fase 2
  age: '',
  situation: '',
  housing: '',
  incomeType: '',

  // Fase 3
  eatingOut: '',
  shopping: '',
  paymentMethod: '',
  financialInterests: '',
  subscriptions: '',

  // Estado
  currentPhase: 1,
  isCompleted: false,
}

export const useOnboardingUserStore = create<OnboardingUserStore>((set, get) => ({
  ...initialState,

  // Acciones para Fase 1
  setPhase1Data: (data) => set((state) => ({ ...state, ...data })),

  // Acciones para Fase 2
  setPhase2Data: (data) => set((state) => ({ ...state, ...data })),

  // Acciones para Fase 3
  setPhase3Data: (data) => set((state) => ({ ...state, ...data })),

  // Acciones generales
  setCurrentPhase: (phase) => set({ currentPhase: phase }),

  markAsCompleted: async () => {
    try {
      // Obtener datos del usuario autenticado
      const { data: authUser } = await supabase.auth.getUser()

      if (!authUser.user) {
        throw new Error('Usuario no autenticado')
      }

      const state = get()
      const userId = authUser.user.id

      // Mapear datos a campos de Supabase
      const updateData: any = {
        preferences_completed: true,
        preferences_completed_at: new Date().toISOString(),
      }

      // Mapear campos específicos si están disponibles
      if (state.age) {
        // Calcular fecha de nacimiento aproximada (asumiendo edad actual)
        const currentYear = new Date().getFullYear()
        const birthYear = currentYear - parseInt(state.age)
        updateData.date_of_birth = `${birthYear}-01-01` // Aproximación
      }

      // Actualizar en Supabase usando el store
      await useAuthStore.getState().updateProfile(updateData)

      // Recargar el perfil para actualizar el estado
      await useAuthStore.getState().loadProfile()

      // Guardar preferencias en user_preferences_cache
      const preferencesData = {
        user_id: userId,
        financial_profile: {
          // Fase 1 - Conocimiento Básico
          income_range: state.incomeRange || null,
          financial_goal: state.financialGoal || null,
          expense_tracking: state.expenseTracking || null,
          financial_comfort: state.financialComfort || null,
          // Fase 2 - Perfil y Contexto
          age: state.age || null,
          situation: state.situation || null,
          housing: state.housing || null,
          income_type: state.incomeType || null,
          // Fase 3 - Hábitos y Preferencias
          eating_out_frequency: state.eatingOut || null,
          shopping_preferences: state.shopping || null,
          payment_method_preference: state.paymentMethod || null,
          financial_interests: state.financialInterests || null,
          subscriptions: state.subscriptions || null,
        },
        spending_patterns: {
          eating_out: state.eatingOut || null,
          shopping: state.shopping || null,
          payment_method: state.paymentMethod || null,
        },
        financial_goals_summary: {
          primary_goal: state.financialGoal || null,
          interests: state.financialInterests || null,
        },
        behavioral_insights: {
          expense_tracking_habit: state.expenseTracking || null,
          financial_comfort_level: state.financialComfort || null,
        },
        ai_personalization_data: {
          completed_at: new Date().toISOString(),
          phases_completed: {
            phase_1: !!state.incomeRange && !!state.financialGoal && !!state.expenseTracking && !!state.financialComfort,
            phase_2: !!state.age && !!state.situation && !!state.housing && !!state.incomeType,
            phase_3: !!state.eatingOut && !!state.shopping && !!state.paymentMethod && !!state.financialInterests && !!state.subscriptions,
          },
        },
        last_updated: new Date().toISOString(),
        cache_version: 1,
      }

      // Guardar o actualizar en user_preferences_cache
      const { error: cacheError } = await supabase.from('user_preferences_cache').upsert(preferencesData, {
        onConflict: 'user_id',
      })

      if (cacheError) {
        console.error('❌ Error guardando preferencias en cache:', cacheError)
        // Continuar aunque falle el guardado del cache
      } else {
        console.log('✅ Preferencias guardadas en user_preferences_cache')
      }

      // Actualizar estado local
      set({
        isCompleted: true,
        completedAt: new Date(),
        currentPhase: 3,
      })

      console.log('✅ Perfil completado y preferencias guardadas')
    } catch (error) {
      console.error('❌ Error en markAsCompleted:', error)
      // Actualizar estado local de todas formas
      set({
        isCompleted: true,
        completedAt: new Date(),
        currentPhase: 3,
      })
    }
  },

  resetOnboarding: () => set(initialState),

  // Getters útiles
  getPhase1Progress: () => {
    const state = get()
    const fields = [state.incomeRange, state.financialGoal, state.expenseTracking, state.financialComfort]
    const completed = fields.filter((field) => field !== '').length
    return (completed / fields.length) * 100
  },

  getPhase2Progress: () => {
    const state = get()
    const fields = [state.age, state.situation, state.housing, state.incomeType]
    const completed = fields.filter((field) => field !== '').length
    return (completed / fields.length) * 100
  },

  getPhase3Progress: () => {
    const state = get()
    const fields = [state.eatingOut, state.shopping, state.paymentMethod, state.financialInterests, state.subscriptions]
    const completed = fields.filter((field) => field !== '').length
    return (completed / fields.length) * 100
  },

  getOverallProgress: () => {
    const state = get()
    const phase1Progress = state.getPhase1Progress()
    const phase2Progress = state.getPhase2Progress()
    const phase3Progress = state.getPhase3Progress()
    return (phase1Progress + phase2Progress + phase3Progress) / 3
  },

  isAllPhasesCompleted: () => {
    const state = get()
    const phase1Progress = state.getPhase1Progress()
    const phase2Progress = state.getPhase2Progress()
    const phase3Progress = state.getPhase3Progress()
    return phase1Progress === 100 && phase2Progress === 100 && phase3Progress === 100
  },

  getAllData: () => {
    const state = get()
    const {
      setPhase1Data,
      setPhase2Data,
      setPhase3Data,
      setCurrentPhase,
      markAsCompleted,
      resetOnboarding,
      getPhase1Progress,
      getPhase2Progress,
      getPhase3Progress,
      getOverallProgress,
      getAllData,
      ...data
    } = state
    return data
  },
}))

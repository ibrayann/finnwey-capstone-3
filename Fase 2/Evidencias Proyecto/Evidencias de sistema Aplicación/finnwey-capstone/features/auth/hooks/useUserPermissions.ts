import { useAuthStore } from '@/store/auth.store'

/**
 * Hook simple para verificar permisos del usuario
 * Lee directamente desde el store
 */
export function useUserPermissions() {
  const profile = useAuthStore((state) => state.profile)

  return {
    canAccessAdvancedFeatures: profile?.preferences_completed === true,
    canAccessAI: profile?.preferences_completed === true,
    canAccessBudgets: profile?.preferences_completed === true,
    canAccessGoals: profile?.preferences_completed === true,
    needsCompleteProfile: profile?.onboarding_completed === true && profile?.preferences_completed === false,
    hasCompletedOnboarding: profile?.onboarding_completed === true,
    hasCompletedPreferences: profile?.preferences_completed === true,
  }
}

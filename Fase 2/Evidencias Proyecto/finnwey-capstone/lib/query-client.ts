import { QueryClient } from '@tanstack/react-query'

// Configuración del QueryClient para React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos" (5 minutos)
      staleTime: 5 * 60 * 1000,
      // Tiempo que los datos se mantienen en cache (10 minutos)
      gcTime: 10 * 60 * 1000,
      // Reintentos automáticos en caso de error
      retry: 3,
      // Refetch automático cuando la ventana vuelve a estar activa
      refetchOnWindowFocus: true,
      // Refetch automático cuando se reconecta la red
      refetchOnReconnect: true,
    },
    mutations: {
      // Reintentos para mutaciones
      retry: 1,
    },
  },
})

// Configuraciones específicas para diferentes tipos de datos
export const queryKeys = {
  // Claves para transacciones
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
  },

  // Claves para presupuestos
  budgets: {
    all: ['budgets'] as const,
    lists: () => [...queryKeys.budgets.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.budgets.lists(), filters] as const,
    details: () => [...queryKeys.budgets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.budgets.details(), id] as const,
  },

  // Claves para goals financieros
  goals: {
    all: ['goals'] as const,
    lists: () => [...queryKeys.goals.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.goals.lists(), filters] as const,
    details: () => [...queryKeys.goals.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.goals.details(), id] as const,
    contributions: (goalId: string) => [...queryKeys.goals.detail(goalId), 'contributions'] as const,
    milestones: (goalId: string) => [...queryKeys.goals.detail(goalId), 'milestones'] as const,
    stats: () => [...queryKeys.goals.all, 'stats'] as const,
  },

  // Claves para reportes
  reports: {
    all: ['reports'] as const,
    analytics: () => [...queryKeys.reports.all, 'analytics'] as const,
    monthly: (month: string) => [...queryKeys.reports.analytics(), 'monthly', month] as const,
    yearly: (year: string) => [...queryKeys.reports.analytics(), 'yearly', year] as const,
  },

  // Claves para perfiles de usuario
  profiles: {
    all: ['profiles'] as const,
    current: () => [...queryKeys.profiles.all, 'current'] as const,
  },

  // Claves para autenticación
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    profile: (userId: string) => [...queryKeys.auth.all, 'profile', userId] as const,
  },

  // Claves para balance mensual
  balance: {
    all: ['monthly-balance'] as const,
    current: (userId: string) => [...queryKeys.balance.all, userId] as const,
  },
} as const

// Funciones helper para invalidar queries
export const invalidateQueries = {
  // Invalidar todas las transacciones
  transactions: () => queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),

  // Invalidar todas las transacciones de una lista específica
  transactionList: (filters?: Record<string, any>) => queryClient.invalidateQueries({ queryKey: queryKeys.transactions.lists() }),

  // Invalidar un presupuesto específico
  budget: (id?: string) => queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all }),

  // Invalidar todas las goals financieras
  goals: () => queryClient.invalidateQueries({ queryKey: queryKeys.goals.all }),

  // Invalidar una goal específica
  goal: (id?: string) => queryClient.invalidateQueries({ queryKey: queryKeys.goals.all }),

  // Invalidar todos los reportes
  reports: () => queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),

  // Invalidar perfil del usuario actual
  profile: () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles.current() }),

  // Invalidar datos de autenticación
  auth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),

  // Invalidar sesión
  session: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() }),

  // Invalidar perfil de usuario específico
  userProfile: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(userId) }),

  // Invalidar balance mensual
  monthlyBalance: (userId?: string) => {
    if (userId) {
      return queryClient.invalidateQueries({ queryKey: queryKeys.balance.current(userId) })
    }
    return queryClient.invalidateQueries({ queryKey: queryKeys.balance.all })
  },
}

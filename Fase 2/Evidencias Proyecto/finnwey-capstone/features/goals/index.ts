// Exportaciones principales de la feature de goals
export { GoalsService } from './services/goals.service'
export * from './hooks/useGoals'

// Re-exportar tipos relacionados
export type { FinancialGoal, GoalContribution, GoalMilestone, CreateGoalRequest, UpdateGoalRequest, ContributionRequest, SavingsData, SavingsSummary } from '@/types/savings'

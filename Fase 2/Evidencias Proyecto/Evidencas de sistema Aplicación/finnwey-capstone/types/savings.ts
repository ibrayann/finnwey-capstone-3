// Tipos para la estructura de datos de ahorros y objetivos financieros
// Basado en el esquema de base de datos DATABASE_SCHEMA.md

export interface SavingsData {
  userId: string
  savingsId: string
  generatedAt: string
  summary: SavingsSummary
  goals: FinancialGoal[]
  analytics: SavingsAnalytics
  transactions: SavingsTransactions
  metadata: SavingsMetadata
}

export interface SavingsSummary {
  totalSaved: number
  totalTarget: number
  totalProgress: number
  currency: string
  percentageChange: number
  trend: 'up' | 'down' | 'stable'
  monthlySavings: number
  averageDailySavings: number
}

// Meta financiera según esquema de base de datos
export interface FinancialGoal {
  id: string
  user_id: string
  name: string
  description: string
  target_amount: number
  current_amount: number
  currency_code: string
  target_date: string
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  goal_type: 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund' | 'purchase' | 'other'

  // Auto-save settings
  auto_save_enabled: boolean
  auto_save_amount: number
  auto_save_frequency: 'daily' | 'weekly' | 'monthly'

  // Notifications
  reminder_frequency: 'none' | 'daily' | 'weekly' | 'monthly'
  milestone_alerts: boolean

  // Metadata
  created_at: string
  updated_at: string
  is_active: boolean

  // Campos calculados para UI
  progress_percentage: number
  days_left: number
  icon?: string
  color?: string
}

// Contribución individual a una meta (tabla goal_contributions)
export interface GoalContribution {
  id: string
  goal_id: string
  transaction_id?: string // Campo opcional en Supabase
  amount: number
  contribution_date: string
  notes?: string // Campo correcto en Supabase
  type: 'manual' | 'automatic' | 'transfer' | 'windfall' // Campo correcto en Supabase
  created_at: string
}

// Hito de progreso de una meta (tabla goal_milestones)
export interface GoalMilestone {
  id: string
  goal_id: string
  user_id: string
  milestone_percentage: number
  milestone_amount: number
  achieved_at?: string
  created_at: string
  is_active: boolean
}

// Tipo legacy para compatibilidad
export interface SavingGoal {
  id: string
  name: string
  description: string
  icon: string
  color: string
  current: number
  target: number
  progress: number
  daysLeft: number
  startDate: string
  targetDate: string
  monthlyContribution: number
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  notes: string
}

export interface SavingsAnalytics {
  monthlyProgress: MonthlyProgress[]
  categoryDistribution: CategoryDistribution[]
  insights: SavingsInsight[]
}

export interface MonthlyProgress {
  month: string
  saved: number
  target: number
}

export interface CategoryDistribution {
  category: string
  amount: number
  percentage: number
}

export interface SavingsInsight {
  type: 'achievement' | 'milestone' | 'reminder' | 'warning'
  message: string
  value: number
  goalId: string | null
}

export interface SavingsTransactions {
  recent: SavingsTransaction[]
  total: number
}

export interface SavingsTransaction {
  id: string
  goalId: string
  amount: number
  type: 'contribution' | 'withdrawal' | 'interest' | 'bonus'
  date: string
  description: string
  category: string
}

export interface SavingsMetadata {
  version: string
  lastUpdated: string
  currency: string
  timezone: string
  categories: Record<string, CategoryDefinition>
  priorities: Record<string, string>
  statuses: Record<string, string>
}

export interface CategoryDefinition {
  name: string
  icon: string
  color: string
}

// Tipos para las respuestas de API
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface SavingsApiResponse extends ApiResponse<SavingsData> {}

// Tipos para filtros y parámetros
export interface SavingsFilters {
  userId: string
  status?: 'active' | 'completed' | 'paused' | 'cancelled'
  category?: string
  priority?: 'critical' | 'high' | 'medium' | 'low'
  startDate?: string
  endDate?: string
}

// Tipos para actualizaciones en tiempo real
export interface SavingsUpdate {
  savingsId: string
  updates: {
    summary?: Partial<SavingsSummary>
    goals?: SavingGoal[]
    transactions?: SavingsTransaction[]
  }
  timestamp: string
}

// Tipos para creación de objetivos según esquema
export interface CreateGoalRequest {
  name: string
  description: string
  target_amount: number
  currency_code: string
  target_date: string
  priority: 'low' | 'medium' | 'high'
  goal_type: 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund' | 'purchase' | 'other'

  // Auto-save settings
  auto_save_enabled?: boolean
  auto_save_amount?: number
  auto_save_frequency?: 'daily' | 'weekly' | 'monthly'

  // Notifications
  reminder_frequency?: 'none' | 'daily' | 'weekly' | 'monthly'
  milestone_alerts?: boolean
}

// Tipos para actualización de objetivos
export interface UpdateGoalRequest {
  id: string
  name?: string
  description?: string
  target_amount?: number
  target_date?: string
  priority?: 'low' | 'medium' | 'high'
  status?: 'active' | 'paused' | 'completed' | 'cancelled'

  // Auto-save settings
  auto_save_enabled?: boolean
  auto_save_amount?: number
  auto_save_frequency?: 'daily' | 'weekly' | 'monthly'

  // Notifications
  reminder_frequency?: 'none' | 'daily' | 'weekly' | 'monthly'
  milestone_alerts?: boolean
}

// Tipos para contribuciones según esquema de Supabase
export interface ContributionRequest {
  goal_id: string
  amount: number
  notes?: string // Campo correcto en Supabase
  contribution_date?: string
  type?: 'manual' | 'automatic' | 'transfer' | 'windfall' // Campo correcto en Supabase
}

// Tipos para obtener contribuciones
export interface GetContributionsRequest {
  goal_id: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

// Tipos para notificaciones y alertas
export interface SavingsAlert {
  goalId: string
  goalName: string
  type: 'milestone' | 'deadline' | 'low_contribution' | 'achievement'
  message: string
  value: number
  priority: 'high' | 'medium' | 'low'
}

// Tipos para comparaciones
export interface SavingsComparison {
  current: SavingsData
  previous: SavingsData
  changes: {
    totalSaved: number
    totalProgress: number
    goalsCompleted: number
    monthlySavings: number
  }
}

// Tipos para exportación
export interface SavingsExportOptions {
  format: 'pdf' | 'csv' | 'json'
  includeGoals: boolean
  includeTransactions: boolean
  includeAnalytics: boolean
  language: 'es' | 'en'
  dateRange?: {
    start: string
    end: string
  }
}

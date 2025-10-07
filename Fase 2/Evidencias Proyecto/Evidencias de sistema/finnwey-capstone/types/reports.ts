// Tipos para la estructura de datos de reportes financieros

export interface ReportData {
  userId: string
  reportId: string
  generatedAt: string
  periods: {
    day: PeriodData
    week: PeriodData
    month: PeriodData
  }
  metadata: ReportMetadata
}

export interface PeriodData {
  period: 'day' | 'week' | 'month'
  label: string
  dateRange: {
    start: string
    end: string
  }
  summary: FinancialSummary
  budget: BudgetData
  analytics: AnalyticsData
  transactions: TransactionsData
}

export interface FinancialSummary {
  income: {
    amount: number
    currency: string
    percentageChange: number
    trend: 'up' | 'down' | 'stable'
  }
  spending: {
    amount: number
    currency: string
    percentageChange: number
    trend: 'up' | 'down' | 'stable'
  }
  balance: {
    amount: number
    currency: string
  }
}

export interface BudgetData {
  totalBudget: number
  spent: number
  remaining: number
  categories: BudgetCategory[]
}

export interface BudgetCategory {
  id: string
  name: string
  label: string
  percentage: number
  amount: number
  color: string
  icon: string
  limit: number
  status: 'excellent' | 'good' | 'warning' | 'danger'
}

export interface AnalyticsData {
  chartType: 'line' | 'bar' | 'pie' | 'area'
  data: ChartDataPoint[]
  insights: Insight[]
}

export interface ChartDataPoint {
  x: string
  y: number
  label: string
}

export interface Insight {
  type: 'peak' | 'trend' | 'anomaly' | 'goal'
  message: string
  value: number
}

export interface TransactionsData {
  total: number
  recent: Transaction[]
}

export interface Transaction {
  id: string
  title: string
  description: string
  amount: number // Positivo para ingresos, negativo para gastos
  type: 'income' | 'expense'
  category: string
  date: string
  icon: string
  merchant: string
  location: string
}

export interface ReportMetadata {
  version: string
  lastUpdated: string
  currency: string
  timezone: string
  categories: {
    expense: CategoryDefinition[]
    income: CategoryDefinition[]
  }
  statuses: {
    excellent: string
    good: string
    warning: string
    danger: string
  }
}

export interface CategoryDefinition {
  id: string
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

export interface ReportApiResponse extends ApiResponse<ReportData> {}

// Tipos para filtros y parámetros
export interface ReportFilters {
  userId: string
  period?: 'day' | 'week' | 'month'
  startDate?: string
  endDate?: string
  categories?: string[]
}

// Tipos para actualizaciones en tiempo real
export interface ReportUpdate {
  reportId: string
  period: 'day' | 'week' | 'month'
  updates: {
    summary?: Partial<FinancialSummary>
    budget?: Partial<BudgetData>
    transactions?: Transaction[]
  }
  timestamp: string
}

// Tipos para exportación
export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json'
  period: 'day' | 'week' | 'month'
  includeTransactions: boolean
  includeAnalytics: boolean
  language: 'es' | 'en'
}

// Tipos para notificaciones y alertas
export interface BudgetAlert {
  categoryId: string
  categoryName: string
  currentAmount: number
  limit: number
  percentage: number
  status: 'warning' | 'danger'
  message: string
}

// Tipos para comparaciones
export interface ComparisonData {
  current: PeriodData
  previous: PeriodData
  changes: {
    income: number
    spending: number
    balance: number
    categories: Record<string, number>
  }
}

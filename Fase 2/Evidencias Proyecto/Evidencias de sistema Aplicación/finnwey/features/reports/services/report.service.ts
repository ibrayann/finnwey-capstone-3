import { supabase } from '@/lib/supabase'
import { PeriodData, FinancialSummary, BudgetData, BudgetCategory, AnalyticsData, ChartDataPoint, Insight, TransactionsData, Transaction } from '@/types/reports'

export type ReportPeriod = 'day' | 'week' | 'month'

/**
 * Obtiene el icono por defecto para una categoría basado en su nombre
 */
function getCategoryIcon(categoryName: string): string {
  const iconMap: Record<string, string> = {
    // Gastos
    Alimentación: 'restaurant-outline',
    Comida: 'restaurant-outline',
    Food: 'restaurant-outline',
    Transporte: 'car-outline',
    Transport: 'car-outline',
    Vivienda: 'home-outline',
    Housing: 'home-outline',
    Salud: 'medical-outline',
    Health: 'medical-outline',
    Educación: 'school-outline',
    Education: 'school-outline',
    Entretenimiento: 'game-controller-outline',
    Entertainment: 'game-controller-outline',
    // Ingresos
    Salario: 'briefcase-outline',
    Salary: 'briefcase-outline',
    Freelance: 'person-outline',
    Inversiones: 'trending-up-outline',
    Investments: 'trending-up-outline',
  }

  // Buscar coincidencia exacta o parcial
  const normalizedName = categoryName.toLowerCase().trim()
  for (const [key, icon] of Object.entries(iconMap)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return icon
    }
  }

  return 'ellipsis-horizontal-outline'
}

/**
 * Obtiene el color por defecto para una categoría basado en su nombre
 */
function getCategoryColor(categoryName: string): string {
  const colorMap: Record<string, string> = {
    // Gastos
    Alimentación: '#FF6384',
    Comida: '#FF6384',
    Food: '#FF6384',
    Transporte: '#36A2EB',
    Transport: '#36A2EB',
    Vivienda: '#FFCE56',
    Housing: '#FFCE56',
    Salud: '#FF9F40',
    Health: '#FF9F40',
    Educación: '#4BC0C0',
    Education: '#4BC0C0',
    Entretenimiento: '#9966FF',
    Entertainment: '#9966FF',
    // Ingresos
    Salario: '#10B981',
    Salary: '#10B981',
    Freelance: '#3B82F6',
    Inversiones: '#8B5CF6',
    Investments: '#8B5CF6',
  }

  // Buscar coincidencia exacta o parcial
  const normalizedName = categoryName.toLowerCase().trim()
  for (const [key, color] of Object.entries(colorMap)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return color
    }
  }

  // Colores por defecto basados en hash del nombre
  const defaultColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF']
  let hash = 0
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return defaultColors[Math.abs(hash) % defaultColors.length]
}

/**
 * Calcula el rango de fechas para un período dado
 */
export function getPeriodDateRange(period: ReportPeriod): { start: string; end: string; label: string } {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        label: 'Hoy',
      }

    case 'week': {
      // Inicio de semana (lunes)
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      start.setDate(now.getDate() + daysToMonday)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        label: 'Esta semana',
      }
    }

    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())
      end.setHours(23, 59, 59, 999)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        label: 'Este mes',
      }
  }
}

/**
 * Calcula el rango de fechas del período anterior para comparación
 */
export function getPreviousPeriodDateRange(period: ReportPeriod): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  switch (period) {
    case 'day': {
      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      const yesterdayEnd = new Date(yesterday)
      yesterdayEnd.setHours(23, 59, 59, 999)
      return {
        start: yesterday.toISOString().split('T')[0],
        end: yesterdayEnd.toISOString().split('T')[0],
      }
    }

    case 'week': {
      // Semana anterior (lunes a domingo)
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const lastMonday = new Date(now)
      lastMonday.setDate(now.getDate() + daysToMonday - 7)
      lastMonday.setHours(0, 0, 0, 0)
      const lastSunday = new Date(lastMonday)
      lastSunday.setDate(lastMonday.getDate() + 6)
      lastSunday.setHours(23, 59, 59, 999)
      return {
        start: lastMonday.toISOString().split('T')[0],
        end: lastSunday.toISOString().split('T')[0],
      }
    }

    case 'month': {
      // Mes anterior
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      lastMonth.setHours(0, 0, 0, 0)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      lastMonthEnd.setHours(23, 59, 59, 999)
      return {
        start: lastMonth.toISOString().split('T')[0],
        end: lastMonthEnd.toISOString().split('T')[0],
      }
    }
  }
}

/**
 * Obtiene transacciones de un período específico
 */
async function getTransactionsForPeriod(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(
      `
      *,
      transaction_type:transaction_types(id, name),
      category:categories(id, name, type),
      subcategory:subcategories(id, name)
    `
    )
    .eq('user_id', userId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false })

  if (error) {
    console.error('❌ Error obteniendo transacciones:', error)
    throw new Error(`Error al obtener transacciones: ${error.message}`)
  }

  return data || []
}

/**
 * Calcula el resumen financiero (ingresos, gastos, balance)
 */
function calculateFinancialSummary(transactions: any[], previousTransactions: any[]): FinancialSummary {
  // Calcular ingresos y gastos del período actual
  let income = 0
  let spending = 0

  transactions.forEach((transaction) => {
    const type = (transaction.transaction_type as any)?.name
    if (type === 'income') {
      income += transaction.amount
    } else if (type === 'expense') {
      spending += transaction.amount
    }
  })

  // Calcular ingresos y gastos del período anterior
  let previousIncome = 0
  let previousSpending = 0

  previousTransactions.forEach((transaction) => {
    const type = (transaction.transaction_type as any)?.name
    if (type === 'income') {
      previousIncome += transaction.amount
    } else if (type === 'expense') {
      previousSpending += transaction.amount
    }
  })

  // Calcular porcentajes de cambio
  const incomeChange = previousIncome > 0 ? ((income - previousIncome) / previousIncome) * 100 : 0
  const spendingChange = previousSpending > 0 ? ((spending - previousSpending) / previousSpending) * 100 : 0

  // Determinar tendencias
  const incomeTrend: 'up' | 'down' | 'stable' = incomeChange > 1 ? 'up' : incomeChange < -1 ? 'down' : 'stable'
  const spendingTrend: 'up' | 'down' | 'stable' = spendingChange > 1 ? 'up' : spendingChange < -1 ? 'down' : 'stable'

  return {
    income: {
      amount: income,
      currency: 'CLP',
      percentageChange: Math.round(incomeChange * 10) / 10,
      trend: incomeTrend,
    },
    spending: {
      amount: spending,
      currency: 'CLP',
      percentageChange: Math.round(spendingChange * 10) / 10,
      trend: spendingTrend,
    },
    balance: {
      amount: income - spending,
      currency: 'CLP',
    },
  }
}

/**
 * Calcula datos de presupuesto agrupados por categoría
 */
async function calculateBudgetData(
  userId: string,
  transactions: any[],
  startDate: string,
  endDate: string
): Promise<BudgetData> {
  // Obtener presupuestos activos que se superponen con el período
  // Un presupuesto se superpone si: start_date <= endDate AND end_date >= startDate
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('*, categories:category_id(id, name)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .lte('start_date', endDate)
    .gte('end_date', startDate)

  if (budgetsError) {
    console.error('❌ Error obteniendo presupuestos:', budgetsError)
  }

  // Filtrar solo transacciones de gastos
  const expenseTransactions = transactions.filter((t) => (t.transaction_type as any)?.name === 'expense')

  // Agrupar transacciones por categoría
  const categoryMap = new Map<string, { amount: number; category: any; transactions: any[] }>()

  expenseTransactions.forEach((transaction) => {
    const category = transaction.category as any
    if (!category) return

    const categoryId = category.id
    const existing = categoryMap.get(categoryId) || {
      amount: 0,
      category,
      transactions: [],
    }

    existing.amount += transaction.amount
    existing.transactions.push(transaction)
    categoryMap.set(categoryId, existing)
  })

  // Calcular total de gastos
  const totalSpent = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

  // Obtener límites de presupuestos por categoría
  const budgetMap = new Map<string, number>()
  budgets?.forEach((budget: any) => {
    const categoryId = budget.category_id
    const existing = budgetMap.get(categoryId) || 0
    budgetMap.set(categoryId, existing + budget.amount)
  })

  // Crear categorías de presupuesto
  const categories: BudgetCategory[] = Array.from(categoryMap.entries())
    .map(([categoryId, data]) => {
      const budgetLimit = budgetMap.get(categoryId) || 0
      const percentage = totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0
      const categoryPercentage = budgetLimit > 0 ? (data.amount / budgetLimit) * 100 : 0

      // Determinar status
      let status: 'excellent' | 'good' | 'warning' | 'danger' = 'good'
      if (categoryPercentage >= 100) {
        status = 'danger'
      } else if (categoryPercentage >= 90) {
        status = 'warning'
      } else if (categoryPercentage <= 50) {
        status = 'excellent'
      }

      return {
        id: categoryId,
        name: data.category.name.toLowerCase().replace(/\s+/g, '_'),
        label: data.category.name,
        percentage: Math.round(percentage * 10) / 10,
        amount: data.amount,
        color: getCategoryColor(data.category.name),
        icon: getCategoryIcon(data.category.name),
        limit: budgetLimit,
        status,
      }
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5) // Top 5 categorías

  // Calcular total de presupuesto
  const totalBudget = Array.from(budgetMap.values()).reduce((sum, amount) => sum + amount, 0)

  return {
    totalBudget,
    spent: totalSpent,
    remaining: totalBudget - totalSpent,
    categories,
  }
}

/**
 * Calcula datos de analytics (gráficos e insights)
 */
function calculateAnalytics(transactions: any[], period: ReportPeriod): AnalyticsData {
  // Agrupar transacciones por tiempo según el período
  const chartData: ChartDataPoint[] = []
  const expenseTransactions = transactions.filter((t) => (t.transaction_type as any)?.name === 'expense')

  if (period === 'day') {
    // Agrupar por hora
    const hourlyMap = new Map<number, number>()
    expenseTransactions.forEach((t) => {
      const hour = new Date(t.transaction_date).getHours()
      const existing = hourlyMap.get(hour) || 0
      hourlyMap.set(hour, existing + t.amount)
    })

    for (let i = 0; i < 24; i++) {
      chartData.push({
        x: String(i),
        y: hourlyMap.get(i) || 0,
        label: `H${i}`,
      })
    }
  } else if (period === 'week') {
    // Agrupar por día de la semana
    const dayMap = new Map<number, number>()
    expenseTransactions.forEach((t) => {
      const day = new Date(t.transaction_date).getDay()
      const existing = dayMap.get(day) || 0
      dayMap.set(day, existing + t.amount)
    })

    const dayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
    for (let i = 0; i < 7; i++) {
      chartData.push({
        x: String(i),
        y: dayMap.get(i) || 0,
        label: dayLabels[i],
      })
    }
  } else {
    // Agrupar por semana del mes
    expenseTransactions.forEach((t) => {
      const date = new Date(t.transaction_date)
      const weekOfMonth = Math.ceil(date.getDate() / 7)
      const existing = chartData.find((d) => d.x === String(weekOfMonth))
      if (existing) {
        existing.y += t.amount
      } else {
        chartData.push({
          x: String(weekOfMonth),
          y: t.amount,
          label: `S${weekOfMonth}`,
        })
      }
    })
  }

  // Generar insights básicos
  const insights: Insight[] = []

  if (expenseTransactions.length > 0) {
    const maxExpense = expenseTransactions.reduce((max, t) => (t.amount > max.amount ? t : max), expenseTransactions[0])
    insights.push({
      type: 'peak',
      message: `Mayor gasto: $${maxExpense.amount.toLocaleString()} en ${maxExpense.merchant_name || 'Transacción'}`,
      value: maxExpense.amount,
    })
  }

  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = transactions
    .filter((t) => (t.transaction_type as any)?.name === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100
    if (savingsRate > 20) {
      insights.push({
        type: 'goal',
        message: `¡Excelente! Estás ahorrando ${Math.round(savingsRate)}% de tus ingresos`,
        value: savingsRate,
      })
    } else if (savingsRate < 0) {
      insights.push({
        type: 'anomaly',
        message: 'Atención: Tus gastos superan tus ingresos',
        value: savingsRate,
      })
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: 'trend',
      message: 'Tus gastos están bajo control',
      value: 0,
    })
  }

  return {
    chartType: 'line',
    data: chartData,
    insights,
  }
}

/**
 * Transforma transacciones de Supabase al formato de reporte
 */
function transformTransactions(transactions: any[]): Transaction[] {
  return transactions.slice(0, 10).map((t) => {
    const categoryName = (t.category as any)?.name || 'Otros'
    return {
      id: t.id,
      title: t.merchant_name || 'Transacción',
      description: t.description || '',
      amount: (t.transaction_type as any)?.name === 'expense' ? -t.amount : t.amount,
      type: (t.transaction_type as any)?.name === 'income' ? 'income' : 'expense',
      category: categoryName,
      date: t.transaction_date,
      icon: getCategoryIcon(categoryName),
      merchant: t.merchant_name || '',
      location: '',
    }
  })
}

/**
 * Obtiene datos completos de reporte para un período
 */
export async function getReportData(userId: string, period: ReportPeriod): Promise<PeriodData> {
  console.log(`📊 Obteniendo datos de reporte para período: ${period}`)

  // Calcular rangos de fechas
  const currentRange = getPeriodDateRange(period)
  const previousRange = getPreviousPeriodDateRange(period)

  // Obtener transacciones del período actual y anterior
  const [currentTransactions, previousTransactions] = await Promise.all([
    getTransactionsForPeriod(userId, currentRange.start, currentRange.end),
    getTransactionsForPeriod(userId, previousRange.start, previousRange.end),
  ])

  console.log(`✅ Transacciones obtenidas: ${currentTransactions.length} actuales, ${previousTransactions.length} anteriores`)

  // Calcular resumen financiero
  const summary = calculateFinancialSummary(currentTransactions, previousTransactions)

  // Calcular datos de presupuesto
  const budget = await calculateBudgetData(userId, currentTransactions, currentRange.start, currentRange.end)

  // Calcular analytics
  const analytics = calculateAnalytics(currentTransactions, period)

  // Transformar transacciones
  const transactions: TransactionsData = {
    total: currentTransactions.length,
    recent: transformTransactions(currentTransactions),
  }

  return {
    period,
    label: currentRange.label,
    dateRange: {
      start: currentRange.start,
      end: currentRange.end,
    },
    summary,
    budget,
    analytics,
    transactions,
  }
}


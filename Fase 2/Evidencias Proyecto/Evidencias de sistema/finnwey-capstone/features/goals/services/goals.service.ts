import { supabase } from '@/lib/supabase'
import { FinancialGoal, GoalContribution, GoalMilestone, CreateGoalRequest, UpdateGoalRequest, ContributionRequest, SavingsData, SavingsSummary } from '@/types/savings'

// Servicio para manejar goals financieros con Supabase
export class GoalsService {
  // ========== GOALS ==========

  /**
   * Obtener todas las goals del usuario
   */
  static async getGoals(filters?: { status?: string; goal_type?: string; priority?: string; includeRelations?: boolean; userId?: string }) {
    console.log('🔄 GoalsService.getGoals - Iniciando query con filtros:', filters)

    // ⚠️ SEGURIDAD: userId es requerido
    if (!filters?.userId) {
      throw new Error('userId es requerido para obtener goals')
    }

    // Construir el select con relaciones si se solicitan
    const selectFields = filters?.includeRelations ? `*, category:categories(id, name), goal_contributions(*), goal_milestones(*)` : '*'

    // ✅ FILTRO DE SEGURIDAD: Solo goals del usuario actual
    let query = supabase.from('financial_goals').select(selectFields).eq('user_id', filters.userId).order('created_at', { ascending: false })

    console.log('🔐 Filtrando goals por user_id:', filters.userId)

    // Aplicar filtros dinámicamente
    if (filters?.status) {
      query = query.eq('status', filters.status)
      console.log('🏷️ Filtro por status:', filters.status)
    }

    if (filters?.goal_type) {
      query = query.eq('goal_type', filters.goal_type)
      console.log('🏷️ Filtro por tipo:', filters.goal_type)
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
      console.log('🏷️ Filtro por prioridad:', filters.priority)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error en GoalsService.getGoals:', error)
      throw new Error(`Error al obtener goals: ${error.message}`)
    }

    console.log('✅ GoalsService.getGoals - Goals obtenidas:', data?.length || 0)

    // Procesar y enriquecer los datos
    const enrichedGoals = data?.map((goal) => this.enrichGoalData(goal)) || []
    return enrichedGoals as FinancialGoal[]
  }

  /**
   * Obtener una goal específica
   */
  static async getGoal(id: string, includeRelations = true) {
    const selectFields = includeRelations ? `*, category:categories(id, name), goal_contributions(*), goal_milestones(*)` : '*'

    const { data, error } = await supabase.from('financial_goals').select(selectFields).eq('id', id).single()

    if (error) {
      throw new Error(error.message)
    }

    return this.enrichGoalData(data) as FinancialGoal
  }

  /**
   * Crear una nueva goal
   */
  static async createGoal(goalData: CreateGoalRequest, userId: string) {
    console.log('🚀 GoalsService.createGoal - Creando goal:', goalData)
    console.log('👤 User ID:', userId)

    const goalWithUserId = {
      ...goalData,
      user_id: userId,
    }

    const { data, error } = await supabase.from('financial_goals').insert([goalWithUserId]).select('*').single()

    if (error) {
      console.error('❌ Error al crear goal:', error)
      throw new Error(`Error al crear goal: ${error.message}`)
    }

    console.log('✅ Goal creada exitosamente:', data)
    return this.enrichGoalData(data) as FinancialGoal
  }

  /**
   * Actualizar una goal
   */
  static async updateGoal(id: string, updateData: Omit<UpdateGoalRequest, 'id'>) {
    const { data, error } = await supabase.from('financial_goals').update(updateData).eq('id', id).select().single()

    if (error) {
      throw new Error(error.message)
    }

    return this.enrichGoalData(data) as FinancialGoal
  }

  /**
   * Eliminar una goal
   */
  static async deleteGoal(id: string) {
    const { error } = await supabase.from('financial_goals').delete().eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    return id
  }

  // ========== CONTRIBUTIONS ==========

  /**
   * Obtener contribuciones de una goal
   */
  static async getContributions(
    goalId: string,
    filters?: {
      start_date?: string
      end_date?: string
      limit?: number
      offset?: number
    }
  ) {
    console.log('🔄 GoalsService.getContributions - Obteniendo contribuciones para goal:', goalId)

    let query = supabase.from('goal_contributions').select('*').eq('goal_id', goalId).order('contribution_date', { ascending: false })

    if (filters?.start_date) {
      query = query.gte('contribution_date', filters.start_date)
    }

    if (filters?.end_date) {
      query = query.lte('contribution_date', filters.end_date)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error en GoalsService.getContributions:', error)
      throw new Error(`Error al obtener contribuciones: ${error.message}`)
    }

    console.log('✅ GoalsService.getContributions - Contribuciones obtenidas:', data?.length || 0)
    return data as GoalContribution[]
  }

  /**
   * Agregar una contribución a una goal
   */
  static async addContribution(contribution: ContributionRequest) {
    console.log('🚀 GoalsService.addContribution - Agregando contribución:', contribution)

    const { data, error } = await supabase.from('goal_contributions').insert([contribution]).select('*').single()

    if (error) {
      console.error('❌ Error al agregar contribución:', error)
      throw new Error(`Error al agregar contribución: ${error.message}`)
    }

    // Actualizar el current_amount de la goal
    await this.updateGoalCurrentAmount(contribution.goal_id, contribution.amount)

    console.log('✅ Contribución agregada exitosamente:', data)
    return data as GoalContribution
  }

  /**
   * Actualizar el monto actual de una goal
   */
  static async updateGoalCurrentAmount(goalId: string, additionalAmount: number) {
    // Obtener la goal actual
    const { data: goal, error: fetchError } = await supabase.from('financial_goals').select('current_amount').eq('id', goalId).single()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    // Actualizar el monto
    const newAmount = (goal.current_amount || 0) + additionalAmount

    const { error: updateError } = await supabase.from('financial_goals').update({ current_amount: newAmount }).eq('id', goalId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return newAmount
  }

  // ========== MILESTONES ==========

  /**
   * Obtener milestones de una goal
   */
  static async getMilestones(goalId: string) {
    const { data, error } = await supabase.from('goal_milestones').select('*').eq('goal_id', goalId).order('percentage', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return data as GoalMilestone[]
  }

  /**
   * Crear milestones automáticos para una goal
   */
  static async createDefaultMilestones(goalId: string, targetAmount: number) {
    const milestones = [
      { percentage: 25, amount_threshold: targetAmount * 0.25 },
      { percentage: 50, amount_threshold: targetAmount * 0.5 },
      { percentage: 75, amount_threshold: targetAmount * 0.75 },
      { percentage: 100, amount_threshold: targetAmount },
    ]

    const { data, error } = await supabase
      .from('goal_milestones')
      .insert(milestones.map((m) => ({ goal_id: goalId, ...m })))
      .select('*')

    if (error) {
      throw new Error(error.message)
    }

    return data as GoalMilestone[]
  }

  // ========== STATISTICS ==========

  /**
   * Obtener estadísticas de goals del usuario
   */
  static async getGoalsStats(userId?: string) {
    console.log('📊 GoalsService.getGoalsStats - Calculando estadísticas')

    // ⚠️ SEGURIDAD: userId es requerido
    if (!userId) {
      throw new Error('userId es requerido para obtener estadísticas de goals')
    }

    // ✅ FILTRO DE SEGURIDAD: Solo stats del usuario actual
    let query = supabase.from('financial_goals').select('target_amount, current_amount, status, goal_type, target_date').eq('user_id', userId)

    console.log('🔐 Calculando stats para user_id:', userId)

    const { data, error } = await query

    if (error) {
      console.error('❌ Error en GoalsService.getGoalsStats:', error)
      throw new Error(`Error al obtener estadísticas: ${error.message}`)
    }

    const stats = data.reduce(
      (acc, goal) => {
        if (goal.status === 'active') {
          acc.totalTarget += goal.target_amount
          acc.totalCurrent += goal.current_amount || 0
          acc.activeGoals += 1
        } else if (goal.status === 'completed') {
          acc.completedGoals += 1
        }
        return acc
      },
      {
        totalTarget: 0,
        totalCurrent: 0,
        activeGoals: 0,
        completedGoals: 0,
      }
    )

    const result = {
      ...stats,
      totalProgress: stats.totalTarget > 0 ? (stats.totalCurrent / stats.totalTarget) * 100 : 0,
      totalGoals: stats.activeGoals + stats.completedGoals,
    }

    console.log('✅ Estadísticas calculadas:', result)
    return result
  }

  // ========== HELPER METHODS ==========

  /**
   * Enriquecer datos de goal con campos calculados
   */
  private static enrichGoalData(goal: any): FinancialGoal {
    const targetDate = new Date(goal.target_date)
    const today = new Date()
    const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    const progressPercentage = goal.target_amount > 0 ? ((goal.current_amount || 0) / goal.target_amount) * 100 : 0

    return {
      ...goal,
      progress_percentage: Math.min(progressPercentage, 100),
      days_left: Math.max(daysLeft, 0),
      icon: this.getGoalIcon(goal.goal_type),
      color: this.getGoalColor(goal.goal_type),
    }
  }

  /**
   * Obtener icono según el tipo de goal
   */
  private static getGoalIcon(goalType: string): string {
    const iconMap: Record<string, string> = {
      savings: 'wallet-outline',
      emergency_fund: 'shield-checkmark-outline',
      investment: 'trending-up-outline',
      debt_payoff: 'card-outline',
      purchase: 'bag-outline',
      other: 'ellipse-outline',
    }
    return iconMap[goalType] || 'ellipse-outline'
  }

  /**
   * Obtener color según el tipo de goal
   */
  private static getGoalColor(goalType: string): string {
    const colorMap: Record<string, string> = {
      savings: '#4CAF50',
      emergency_fund: '#10B981',
      investment: '#EF4444',
      debt_payoff: '#F97316',
      purchase: '#8B5CF6',
      other: '#6B7280',
    }
    return colorMap[goalType] || '#6B7280'
  }

  /**
   * Generar datos de savings completos (compatible con la estructura actual)
   */
  static async generateSavingsData(userId?: string): Promise<SavingsData> {
    console.log('🔄 GoalsService.generateSavingsData - Generando datos completos de savings')

    const goals = await this.getGoals({ userId, includeRelations: true })
    const stats = await this.getGoalsStats(userId)

    // Calcular resumen
    const summary: SavingsSummary = {
      totalSaved: stats.totalCurrent,
      totalTarget: stats.totalTarget,
      totalProgress: stats.totalProgress,
      currency: 'USD',
      percentageChange: 0, // TODO: Calcular cambio vs mes anterior
      trend: stats.totalProgress > 0 ? 'up' : 'stable',
      monthlySavings: 0, // TODO: Calcular ahorro mensual promedio
      averageDailySavings: 0, // TODO: Calcular ahorro diario promedio
    }

    // Generar analytics básicos
    const analytics = {
      monthlyProgress: [], // TODO: Implementar progreso mensual
      categoryDistribution: [], // TODO: Implementar distribución por categoría
      insights: [], // TODO: Implementar insights automáticos
    }

    const savingsData: SavingsData = {
      userId: userId || 'current-user',
      savingsId: `savings_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      summary,
      goals,
      analytics,
      transactions: {
        recent: [],
        total: 0,
      },
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        currency: 'USD',
        timezone: 'UTC',
        categories: {},
        priorities: {},
        statuses: {},
      },
    }

    console.log('✅ Datos de savings generados:', savingsData)
    return savingsData
  }
}

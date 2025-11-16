import { supabase } from '@/lib/supabase'

const SUPABASE_URL = 'https://vvzmlchzfurkpvkefyrg.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2em1sY2h6ZnVya3B2a2VmeXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Mjg2OTUsImV4cCI6MjA3NDQwNDY5NX0.-nTz1S_gfkKKPHcgaAuC7lVFhxCASGNIXIZzRYVM__o'
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/swift-endpoint`

export interface FinancialTip {
  id: string | null
  title: string
  content: string
  tipType: 'general' | 'expense' | 'budget' | 'goal' | 'insight' | 'warning' | 'achievement' | 'recommendation'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  relatedCategory?: string | null
  createdAt?: string
  isNew?: boolean
}

export interface GenerateTipResponse {
  success: boolean
  data?: FinancialTip
  error?: string
}

export class FinancialTipService {
  /**
   * Genera un tip financiero personalizado usando la Edge Function
   * @param categoryId - ID de la categoría para generar el tip específico (opcional)
   * @param budgetId - ID del presupuesto para generar el tip específico (opcional)
   * @param goalId - ID de la meta financiera para generar el tip específico (opcional)
   * @returns Tip financiero generado por Gemini AI
   */
  static async generateTip(categoryId?: string, budgetId?: string, goalId?: string): Promise<GenerateTipResponse> {
    try {
      console.log('📤 Generando tip financiero...')

      // Obtener la sesión actual para incluir el token de autenticación
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.warn('⚠️ No hay sesión activa, continuando sin autenticación')
      }

      console.log('🔐 Token obtenido, enviando request a:', EDGE_FUNCTION_URL)
      console.log('🔑 Token presente:', !!session?.access_token)

      // Llamar a la Edge Function directamente con fetch
      const requestBody: any = {}
      if (categoryId) {
        requestBody.categoryId = categoryId
      }
      if (budgetId) {
        requestBody.budgetId = budgetId
      }
      if (goalId) {
        requestBody.goalId = goalId
      }

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
          apikey: SUPABASE_ANON_KEY, // Requerido por Supabase Edge Functions
          'Content-Type': 'application/json',
        },
        body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined,
      })

      console.log('📡 Respuesta recibida - Status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error HTTP:', response.status, errorText)
        throw new Error(`Error ${response.status}: ${errorText.substring(0, 200) || 'No se pudo generar el tip'}`)
      }

      const data: GenerateTipResponse = await response.json()
      console.log('📄 Datos parseados correctamente')

      if (!data || !data.success) {
        console.error('❌ Respuesta sin éxito:', data?.error)
        throw new Error(data?.error || 'No se pudo generar el tip')
      }

      console.log('✅ Tip generado exitosamente')
      console.log('📝 Título:', data.data?.title)
      console.log('🎯 Tipo:', data.data?.tipType)
      console.log('⚡ Prioridad:', data.data?.priority)

      return data
    } catch (error) {
      console.error('❌ Error al generar tip financiero:', error)

      // Si es un error de red o timeout, dar más detalles
      if (error instanceof TypeError && error.message.includes('Network')) {
        return {
          success: false,
          error: 'Error de conexión. Verifica tu conexión a internet y que la Edge Function esté activa.',
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al generar el tip',
      }
    }
  }

  /**
   * Obtiene tips activos del usuario desde la base de datos
   * @param limit - Número máximo de tips a obtener
   * @param categoryId - ID de la categoría para filtrar tips (opcional)
   * @param goalId - ID de la meta financiera para filtrar tips (opcional)
   * @returns Lista de tips activos
   */
  static async getActiveTips(limit: number = 10, categoryId?: string, goalId?: string): Promise<FinancialTip[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Si se proporciona goalId, filtrar tips por meta financiera (prioridad sobre categoryId)
      if (goalId) {
        console.log('🎯 Filtrando tips por goalId:', goalId)
        // Obtener tips relacionados con esta meta
        const { data, error } = await supabase
          .from('ai_tips')
          .select('id, title, content, tip_type, priority, related_entity_type, related_entity_id, created_at, first_displayed_at')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('related_entity_type', 'goal')
          .eq('related_entity_id', goalId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) {
          console.error('❌ Error al obtener tips:', error)
          throw error
        }

        console.log(`✅ Tips encontrados para goalId ${goalId}:`, data?.length || 0)
        if (data && data.length > 0) {
          console.log(
            '📋 Primeros tips:',
            data.slice(0, 3).map((t: any) => ({
              id: t.id,
              title: t.title,
              related_entity_type: t.related_entity_type,
              related_entity_id: t.related_entity_id,
            }))
          )
        }

        // Solo el primer tip (más reciente) que no haya sido visto es "nuevo"
        let foundNewTip = false

        return (
          data?.map((tip: any, index: number) => {
            // Solo el primer tip sin first_displayed_at es "nuevo"
            const isNew = !foundNewTip && !tip.first_displayed_at && index === 0
            if (isNew) {
              foundNewTip = true
            }

            return {
              id: tip.id,
              title: tip.title,
              content: tip.content,
              tipType: tip.tip_type as FinancialTip['tipType'],
              priority: tip.priority as FinancialTip['priority'],
              createdAt: tip.created_at,
              isNew: !!isNew,
            }
          }) || []
        )
      }

      // Si se proporciona categoryId, filtrar tips por categoría
      if (categoryId) {
        // Primero obtener los budgets de esta categoría
        const { data: budgetsData, error: budgetsError } = await supabase.from('budgets').select('id').eq('category_id', categoryId).eq('user_id', user.id)

        if (budgetsError) {
          console.error('❌ Error al obtener budgets:', budgetsError)
          throw budgetsError
        }

        const budgetIds = budgetsData?.map((b) => b.id) || []

        // Si no hay budgets de esta categoría, retornar array vacío
        if (budgetIds.length === 0) {
          return []
        }

        // Obtener tips relacionados con esos budgets
        const { data, error } = await supabase
          .from('ai_tips')
          .select('id, title, content, tip_type, priority, related_entity_type, related_entity_id, created_at, first_displayed_at')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('related_entity_type', 'budget')
          .in('related_entity_id', budgetIds)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) {
          console.error('❌ Error al obtener tips:', error)
          throw error
        }

        // Solo el primer tip (más reciente) que no haya sido visto es "nuevo"
        let foundNewTip = false

        return (
          data?.map((tip: any, index: number) => {
            // Solo el primer tip sin first_displayed_at es "nuevo"
            const isNew = !foundNewTip && !tip.first_displayed_at && index === 0
            if (isNew) {
              foundNewTip = true
            }

            return {
              id: tip.id,
              title: tip.title,
              content: tip.content,
              tipType: tip.tip_type as FinancialTip['tipType'],
              priority: tip.priority as FinancialTip['priority'],
              relatedCategory: categoryId,
              createdAt: tip.created_at,
              isNew: !!isNew,
            }
          }) || []
        )
      }

      // Si no hay categoryId ni goalId, obtener todos los tips
      // IMPORTANTE: Si se proporcionó goalId pero no se encontraron tips, retornar array vacío
      // (no caer aquí si se estaba filtrando por goalId)
      if (goalId) {
        // Si llegamos aquí con goalId, significa que no se encontraron tips para esa meta
        console.log('⚠️ No se encontraron tips para goalId:', goalId, '- retornando array vacío')
        return []
      }

      const { data, error } = await supabase
        .from('ai_tips')
        .select('id, title, content, tip_type, priority, related_entity_type, related_entity_id, created_at, first_displayed_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Error al obtener tips: ${error.message}`)
      }

      // Solo el primer tip (más reciente) que no haya sido visto es "nuevo"
      let foundNewTip = false

      return (
        data?.map((tip: any, index: number) => {
          // Solo el primer tip sin first_displayed_at es "nuevo"
          const isNew = !foundNewTip && !tip.first_displayed_at && index === 0
          if (isNew) {
            foundNewTip = true
          }

          return {
            id: tip.id,
            title: tip.title,
            content: tip.content,
            tipType: tip.tip_type as FinancialTip['tipType'],
            priority: tip.priority as FinancialTip['priority'],
            createdAt: tip.created_at,
            isNew: !!isNew,
          }
        }) || []
      )
    } catch (error) {
      console.error('❌ Error al obtener tips:', error)
      throw error
    }
  }

  /**
   * Marca un tip como visto (actualiza first_displayed_at y last_displayed_at)
   * @param tipId - ID del tip a marcar como visto
   */
  static async markTipAsViewed(tipId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Obtener el tip actual para verificar si ya tiene first_displayed_at
      const { data: tipData } = await supabase.from('ai_tips').select('first_displayed_at, current_displays').eq('id', tipId).eq('user_id', user.id).single()

      if (!tipData) {
        throw new Error('Tip no encontrado')
      }

      const now = new Date().toISOString()
      const updateData: any = {
        last_displayed_at: now,
      }

      // Si es la primera vez que se ve, actualizar first_displayed_at
      if (!tipData.first_displayed_at) {
        updateData.first_displayed_at = now
      }

      // Incrementar current_displays
      updateData.current_displays = (tipData.current_displays || 0) + 1

      const { error } = await supabase.from('ai_tips').update(updateData).eq('id', tipId).eq('user_id', user.id)

      if (error) {
        throw new Error(`Error al marcar tip como visto: ${error.message}`)
      }
    } catch (error) {
      console.error('❌ Error al marcar tip como visto:', error)
      throw error
    }
  }

  /**
   * Marca un tip como descartado
   * @param tipId - ID del tip a descartar
   */
  static async dismissTip(tipId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const { error } = await supabase
        .from('ai_tips')
        .update({
          status: 'dismissed',
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', tipId)
        .eq('user_id', user.id)

      if (error) {
        throw new Error(`Error al descartar tip: ${error.message}`)
      }
    } catch (error) {
      console.error('❌ Error al descartar tip:', error)
      throw error
    }
  }

  /**
   * Obtiene el feedback de un tip específico del usuario
   * @param tipId - ID del tip
   * @returns Feedback del tip o null si no existe
   */
  static async getTipFeedback(tipId: string): Promise<{ isLiked: boolean; isUseful: boolean } | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Buscar en tip_actions si hay un 'bookmarked' (me gusta)
      const { data: actions } = await supabase.from('tip_actions').select('action_type').eq('tip_id', tipId).eq('user_id', user.id).eq('action_type', 'bookmarked')

      // Buscar en tip_feedback si hay is_useful
      const { data: feedback } = await supabase.from('tip_feedback').select('is_useful, rating').eq('tip_id', tipId).eq('user_id', user.id).maybeSingle()

      return {
        isLiked: (actions && actions.length > 0) || (feedback?.rating && feedback.rating >= 4) || false,
        isUseful: feedback?.is_useful || false,
      }
    } catch (error) {
      console.error('❌ Error al obtener feedback:', error)
      return null
    }
  }

  /**
   * Guarda o actualiza el feedback de un tip
   * @param tipId - ID del tip
   * @param isLiked - Si el usuario le dio me gusta
   * @param isUseful - Si el tip es útil
   */
  static async saveTipFeedback(tipId: string, isLiked: boolean, isUseful: boolean): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Guardar en tip_feedback usando upsert
      const { error: feedbackError } = await supabase.from('tip_feedback').upsert(
        {
          tip_id: tipId,
          user_id: user.id,
          rating: isLiked ? 5 : null,
          is_useful: isUseful,
        },
        {
          onConflict: 'tip_id,user_id',
        }
      )

      if (feedbackError) {
        throw new Error(`Error al guardar feedback: ${feedbackError.message}`)
      }

      // Si le dio me gusta, también guardar en tip_actions como 'bookmarked'
      if (isLiked) {
        const { error: actionError } = await supabase.from('tip_actions').insert({
          tip_id: tipId,
          user_id: user.id,
          action_type: 'bookmarked',
          action_data: {},
        })

        if (actionError && !actionError.message.includes('duplicate')) {
          console.warn('⚠️ Error al guardar acción bookmarked:', actionError)
        }
      }

      // Si marcó como útil, también guardar en tip_actions como 'applied'
      if (isUseful) {
        const { error: actionError } = await supabase.from('tip_actions').insert({
          tip_id: tipId,
          user_id: user.id,
          action_type: 'applied',
          action_data: {},
        })

        if (actionError && !actionError.message.includes('duplicate')) {
          console.warn('⚠️ Error al guardar acción applied:', actionError)
        }
      }
    } catch (error) {
      console.error('❌ Error al guardar feedback:', error)
      throw error
    }
  }

  /**
   * Registra una acción del usuario sobre un tip
   * @param tipId - ID del tip
   * @param actionType - Tipo de acción (clicked, applied, dismissed, shared, bookmarked)
   */
  static async recordTipAction(tipId: string, actionType: 'clicked' | 'applied' | 'dismissed' | 'shared' | 'bookmarked'): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const { error } = await supabase.from('tip_actions').insert({
        tip_id: tipId,
        user_id: user.id,
        action_type: actionType,
        action_data: {},
      })

      if (error) {
        throw new Error(`Error al registrar acción: ${error.message}`)
      }
    } catch (error) {
      console.error('❌ Error al registrar acción:', error)
      throw error
    }
  }
}

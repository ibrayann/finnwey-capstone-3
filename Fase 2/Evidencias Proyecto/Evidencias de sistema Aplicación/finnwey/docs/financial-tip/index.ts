// Edge Function: financial-tip
// Genera análisis financieros personalizados e inteligentes usando Gemini 2.0 Flash
import { GoogleGenAI, Type } from 'npm:@google/genai@1.0.0'
import { createClient } from 'jsr:@supabase/supabase-js@2'
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
if (!GOOGLE_API_KEY) {
  console.warn('WARNING: GOOGLE_API_KEY not set')
}
const ai = new GoogleGenAI({
  apiKey: GOOGLE_API_KEY,
})
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
// ========================================
// BENCHMARKS DE CATEGORÍAS
// ========================================
const CATEGORY_BENCHMARKS = {
  Alimentación: {
    min: 15,
    max: 35,
    optimal: 25,
  },
  Vivienda: {
    min: 25,
    max: 40,
    optimal: 30,
  },
  Transporte: {
    min: 10,
    max: 20,
    optimal: 15,
  },
  Entretenimiento: {
    min: 5,
    max: 15,
    optimal: 10,
  },
  Salud: {
    min: 5,
    max: 15,
    optimal: 10,
  },
  Educación: {
    min: 5,
    max: 15,
    optimal: 10,
  },
  'Ropa y Accesorios': {
    min: 3,
    max: 10,
    optimal: 5,
  },
  Servicios: {
    min: 5,
    max: 15,
    optimal: 10,
  },
}
// ========================================
// ANÁLISIS DE SUBCATEGORÍAS
// ========================================
async function analyzeSubcategories(categoryId, categoryName, transactions) {
  const { data: subcategories } = await supabase.from('subcategories').select('id, name').eq('category_id', categoryId).eq('is_active', true)
  if (!subcategories || subcategories.length === 0) return null
  const subcatSpending = subcategories.map((sub) => {
    const spent = transactions.filter((t) => t.subcategory_id === sub.id).reduce((sum, t) => sum + Number(t.amount), 0)
    return {
      name: sub.name,
      amount: spent,
      id: sub.id,
    }
  })
  const totalSpent = subcatSpending.reduce((sum, s) => sum + s.amount, 0)
  if (totalSpent === 0) return null
  const subcatWithPercentage = subcatSpending
    .map((s) => ({
      name: s.name,
      amount: s.amount,
      percentage: (s.amount / totalSpent) * 100,
    }))
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount)
  return {
    subcategories: subcatWithPercentage,
    totalSpent,
  }
}
// ========================================
// ANÁLISIS DE TIMING
// ========================================
function analyzeTimingUrgency(daysRemaining, percentageSpent) {
  let urgencyLevel = 'low'
  let message = ''
  if (daysRemaining <= 5 && percentageSpent >= 90) {
    urgencyLevel = 'critical'
    message = `Quedan solo ${daysRemaining} días y ya gastaste el ${percentageSpent.toFixed(0)}% del presupuesto.`
  } else if (daysRemaining <= 10 && percentageSpent >= 80) {
    urgencyLevel = 'high'
    message = `Quedan ${daysRemaining} días y ya gastaste el ${percentageSpent.toFixed(0)}%.`
  } else if (daysRemaining <= 15 && percentageSpent >= 70) {
    urgencyLevel = 'medium'
    message = `Con ${daysRemaining} días restantes, ya usaste el ${percentageSpent.toFixed(0)}%.`
  } else if (percentageSpent < 50 && daysRemaining > 20) {
    urgencyLevel = 'low'
    message = `Quedan ${daysRemaining} días y solo gastaste el ${percentageSpent.toFixed(0)}%.`
  } else {
    message = `Quedan ${daysRemaining} días, gastaste ${percentageSpent.toFixed(0)}%.`
  }
  return {
    urgencyLevel,
    message,
  }
}
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          error: 'Method not allowed',
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: 'Missing auth',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Obtener parámetros del body (categoryId, budgetId o goalId)
    let requestedCategoryId: string | undefined
    let requestedBudgetId: string | undefined
    let requestedGoalId: string | undefined

    try {
      const contentType = req.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const bodyText = await req.text()
        if (bodyText && bodyText.trim()) {
          const requestBody = JSON.parse(bodyText)
          requestedCategoryId = requestBody.categoryId
          requestedBudgetId = requestBody.budgetId
          requestedGoalId = requestBody.goalId
        }
      }
    } catch (e) {
      // Si no hay body o no es JSON válido, continuar sin parámetros
      console.log('⚠️ No se recibieron parámetros en el body o error al parsear:', e)
    }

    console.log('📋 Parámetros recibidos:', { requestedCategoryId, requestedBudgetId, requestedGoalId })
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Invalid token',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }
    const userId = user.id
    console.log(`🧠 Generando análisis inteligente para: ${userId}`)
    // ========================================
    // OBTENER DATOS
    // ========================================
    const [userData, userPreferencesData, budgetsData, goalsData, transactionsData, kpiData] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('user_preferences_cache').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('budgets').select('*, category:categories(id, name, type)').eq('user_id', userId).eq('status', 'active'),
      supabase.from('financial_goals').select('*').eq('user_id', userId).eq('status', 'active'),
      supabase
        .from('transactions')
        .select('*, category:categories(id, name, type), subcategory:subcategories(id, name), transaction_type:transaction_types(name)')
        .eq('user_id', userId)
        .gte('transaction_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
        .order('transaction_date', {
          ascending: false,
        }),
      supabase
        .from('monthly_kpi_snapshots')
        .select('*')
        .eq('user_id', userId)
        .order('period_month', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle(),
    ])
    const userProfile = userData.data
    if (!userProfile) {
      return new Response(
        JSON.stringify({
          error: 'User profile not found',
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }
    // Obtener datos demográficos después de tener userData
    // Nota: kpiPreviousData fue eliminado en el código proporcionado, lo dejo comentado para evitar un error.
    // const kpiPrevious = kpiPreviousData.data
    const [maritalData, educationData] = await Promise.all([
      userProfile.marital_status_id
        ? supabase.from('marital_status').select('name').eq('id', userProfile.marital_status_id).maybeSingle()
        : Promise.resolve({
            data: null,
          }),
      userProfile.education_level_id
        ? supabase.from('education_levels').select('name').eq('id', userProfile.education_level_id).maybeSingle()
        : Promise.resolve({
            data: null,
          }),
    ])
    const userPreferences = userPreferencesData.data
    const budgets = budgetsData.data || []
    const goals = goalsData.data || []
    const transactions = transactionsData.data || []
    const kpi = kpiData.data
    // ========================================
    // CALCULAR INGRESOS
    // ========================================
    const incomeRange = userPreferences?.financial_profile?.income_range || null
    const exactIncome = Number(userProfile?.exact_income) || 0
    const parseIncomeRange = (range) => {
      if (!range) return exactIncome
      if (range.includes('under')) {
        const match = range.match(/(\d+)/)
        return match ? parseInt(match[1]) * 1000 * 0.8 : exactIncome
      }
      if (range.includes('over')) {
        const match = range.match(/(\d+\.?\d*)/)
        return match ? parseFloat(match[1]) * (match[1].includes('.') ? 1000000 : 1000) : exactIncome
      }
      const parts = range
        .replace(/[^\d.-]/g, '')
        .split('-')
        .filter((p) => p)
      if (parts.length === 2) {
        let [min, max] = parts.map((p) => parseFloat(p))
        if (range.toLowerCase().includes('k')) {
          min *= 1000
          max *= 1000
        }
        return Math.round((min + max) / 2)
      }
      return exactIncome
    }
    const sueldoBase = parseIncomeRange(incomeRange)
    const ingresosMesActual = kpi?.total_income || sueldoBase
    // Obtener moneda antes de calcular gastos
    const currency = userProfile?.currency_preference || 'CLP'
    // Calcular gastos totales del mes desde transacciones reales
    // Si el KPI existe y está actualizado (del mes actual), usarlo; si no, calcular desde transacciones
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const kpiMonth = kpi?.period_month ? new Date(kpi.period_month).getMonth() : -1
    const kpiYear = kpi?.period_month ? new Date(kpi.period_month).getFullYear() : -1
    let totalExpenses = 0
    if (kpi?.total_expenses && kpiMonth === currentMonth && kpiYear === currentYear) {
      // Usar KPI si está del mes actual
      totalExpenses = kpi.total_expenses
      console.log(`💰 Gastos desde KPI: ${totalExpenses.toLocaleString()} ${currency}`)
    } else {
      // Calcular desde transacciones del mes actual
      const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
      totalExpenses = transactions
        .filter((t) => {
          // Verificar que NO sea un ingreso primero
          const isIncome = t.transaction_type?.name === 'income' || t.category?.type === 'income'
          if (isIncome) return false
          // Luego verificar que sea un gasto
          const isExpense = t.transaction_type?.name === 'expense' || t.category?.type === 'expense'
          // Verificar que esté en el mes actual
          const transactionDate = t.transaction_date ? new Date(t.transaction_date) : null
          const isCurrentMonth = transactionDate && transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
          return isExpense && isCurrentMonth
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
      // Logging detallado para debugging
      const expenseTransactions = transactions.filter((t) => {
        const isIncome = t.transaction_type?.name === 'income' || t.category?.type === 'income'
        if (isIncome) return false
        const isExpense = t.transaction_type?.name === 'expense' || t.category?.type === 'expense'
        const transactionDate = t.transaction_date ? new Date(t.transaction_date) : null
        const isCurrentMonth = transactionDate && transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
        return isExpense && isCurrentMonth
      })
      const incomeTransactions = transactions.filter((t) => {
        const isIncome = t.transaction_type?.name === 'income' || t.category?.type === 'income'
        const transactionDate = t.transaction_date ? new Date(t.transaction_date) : null
        const isCurrentMonth = transactionDate && transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
        return isIncome && isCurrentMonth
      })
      console.log(`💰 Gastos calculados desde transacciones: ${totalExpenses.toLocaleString()} ${currency}`)
      console.log(`   Total transacciones del mes: ${transactions.length}`)
      console.log(`   Transacciones de gastos: ${expenseTransactions.length}`)
      console.log(`   Transacciones de ingresos: ${incomeTransactions.length}`)
      if (incomeTransactions.length > 0) {
        console.log(`   ⚠️ Ingresos encontrados (no deben contarse como gastos):`)
        incomeTransactions.forEach((t) => {
          console.log(`      - ${t.category?.name || 'Sin categoría'} (${t.transaction_type?.name || 'Sin tipo'}): ${Number(t.amount).toLocaleString()} ${currency}`)
        })
      }
    }
    const netSavings = ingresosMesActual - totalExpenses
    console.log(`📊 Resumen financiero:`)
    console.log(`   Sueldo base: ${sueldoBase.toLocaleString()} ${currency}`)
    console.log(`   Ingresos mes actual: ${ingresosMesActual.toLocaleString()} ${currency}`)
    console.log(`   Gastos mes actual: ${totalExpenses.toLocaleString()} ${currency}`)
    console.log(`   Ahorro neto: ${netSavings.toLocaleString()} ${currency}`)
    // ========================================
    // PREPARAR CONTEXTO PARA GEMINI
    // ========================================
    const insights = []
    // Contexto demográfico
    const demographicContext = []
    if (userProfile?.household_size > 1) {
      demographicContext.push(`${userProfile.household_size} personas en el hogar`)
    }
    if (maritalData?.data?.name) {
      demographicContext.push(maritalData.data.name)
    }
    // 1. ANÁLISIS DE PRESUPUESTO (si existe y no se especificó un goalId)
    let budgetContext = ''
    let relatedBudgetId: string | undefined
    let relatedCategoryId: string | undefined
    let relatedGoalId: string | undefined

    // IMPORTANTE: Si se especificó un goalId, priorizar la meta sobre el presupuesto
    if (budgets.length > 0 && !requestedGoalId) {
      // Si se especificó un budgetId o categoryId, usar ese presupuesto
      let budget = budgets[0]
      if (requestedBudgetId) {
        const foundBudget = budgets.find((b: any) => b.id === requestedBudgetId)
        if (foundBudget) {
          budget = foundBudget
          console.log(`✅ Usando presupuesto específico: ${budget.id}`)
        }
      } else if (requestedCategoryId) {
        const foundBudget = budgets.find((b: any) => b.category?.id === requestedCategoryId)
        if (foundBudget) {
          budget = foundBudget
          console.log(`✅ Usando presupuesto de categoría específica: ${budget.category?.name}`)
        }
      }

      // Guardar IDs para relacionar el tip con el presupuesto y categoría
      relatedBudgetId = budget.id
      relatedCategoryId = budget.category?.id

      const categoryId = budget.category?.id
      const categoryName = budget.category?.name || 'Sin categoría'
      console.log(`📊 Analizando presupuesto: ${categoryName} (${budget.amount} ${currency})`)
      const budgetSpent = transactions
        .filter((t) => {
          // Verificar que NO sea un ingreso
          const isIncome = t.transaction_type?.name === 'income' || t.category?.type === 'income'
          if (isIncome) return false
          // Verificar que sea un gasto
          const isExpense = t.transaction_type?.name === 'expense' || t.category?.type === 'expense'
          const matchesCategory = t.category?.id === categoryId
          return isExpense && matchesCategory
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
      const budgetAmount = Number(budget.amount)
      const remaining = budgetAmount - budgetSpent
      const percentUsed = budgetAmount > 0 ? (budgetSpent / budgetAmount) * 100 : 0
      const now = new Date()
      const endDate = new Date(budget.end_date)
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const timingAnalysis = analyzeTimingUrgency(daysRemaining, percentUsed)
      const budgetVsIncome = (budgetAmount / sueldoBase) * 100
      const benchmark = CATEGORY_BENCHMARKS[categoryName]
      budgetContext = `PRESUPUESTO ACTUAL: ${categoryName}
- Presupuestado: ${budgetAmount.toLocaleString()} ${currency}
- Gastado hasta ahora: ${budgetSpent.toLocaleString()} ${currency}
- Disponible: ${remaining.toLocaleString()} ${currency}
- Porcentaje usado: ${percentUsed.toFixed(1)}%
- Días restantes del periodo: ${daysRemaining}
- Estado: ${timingAnalysis.message}
- Presupuesto vs Ingreso: ${budgetVsIncome.toFixed(0)}% de tu sueldo${benchmark ? ` (recomendado: ${benchmark.min}-${benchmark.max}%)` : ''}`
      // Análisis de subcategorías
      const subcatAnalysis = await analyzeSubcategories(categoryId, categoryName, transactions)
      if (subcatAnalysis && subcatAnalysis.subcategories.length > 0) {
        budgetContext += `\n\nDISTRIBUCIÓN POR SUBCATEGORÍAS (del total gastado en ${categoryName}):\n`
        subcatAnalysis.subcategories.forEach((sub: any) => {
          const percentOfBudget = budgetAmount > 0 ? (sub.amount / budgetAmount) * 100 : 0
          budgetContext += `- ${sub.name}: ${sub.amount.toLocaleString()} ${currency} (${sub.percentage.toFixed(0)}% del gasto en ${categoryName}, ${percentOfBudget.toFixed(
            1
          )}% del presupuesto total)\n`
        })
      }
    }
    // 2. ANÁLISIS DE META (si existe y no hay presupuesto activo, o si se especificó un goalId)
    let goalContext = ''
    if (goals.length > 0 && (budgets.length === 0 || requestedGoalId)) {
      // Si se especificó un goalId, usar esa meta específica
      let goal = goals[0]
      if (requestedGoalId) {
        const foundGoal = goals.find((g: any) => g.id === requestedGoalId)
        if (foundGoal) {
          goal = foundGoal
          console.log(`✅ Usando meta específica: ${goal.id} - "${goal.name}"`)
        }
      }

      // Guardar ID para relacionar el tip con la meta
      relatedGoalId = goal.id

      const objetivo = Number(goal.target_amount)
      const actual = Number(goal.current_amount || 0)
      const progreso = objetivo > 0 ? (actual / objetivo) * 100 : 0
      const faltante = objetivo - actual
      const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      const monthsLeft = Math.max(1, Math.round(daysLeft / 30))
      const necesitaMensual = Math.round(faltante / monthsLeft)
      goalContext = `META FINANCIERA: "${goal.name}"
- Objetivo total: ${objetivo.toLocaleString()} ${currency}
- Ahorrado hasta ahora: ${actual.toLocaleString()} ${currency}
- Falta por ahorrar: ${faltante.toLocaleString()} ${currency}
- Progreso: ${progreso.toFixed(1)}%
- Días restantes: ${daysLeft} (${monthsLeft} meses)
- Necesitas ahorrar al mes: ${necesitaMensual.toLocaleString()} ${currency}
- Tu ahorro actual del mes: ${netSavings.toLocaleString()} ${currency}`
      console.log(`📊 Analizando meta: "${goal.name}" (${objetivo.toLocaleString()} ${currency})`)
    }
    // 3. TRANSACCIONES DEL MES (para que Gemini detecte patrones)
    // Separar ingresos y gastos claramente
    const expenseTransactions = transactions
      .filter((t: any) => {
        const isIncome = t.transaction_type?.name === 'income' || t.category?.type === 'income'
        return !isIncome && (t.transaction_type?.name === 'expense' || t.category?.type === 'expense')
      })
      .slice(0, 30)

    const incomeTransactions = transactions
      .filter((t: any) => {
        return t.transaction_type?.name === 'income' || t.category?.type === 'income'
      })
      .slice(0, 10)

    let transactionsList = ''

    if (expenseTransactions.length > 0) {
      transactionsList += 'GASTOS DEL MES:\n'
      transactionsList += expenseTransactions
        .map((t: any) => {
          const merchantInfo = t.merchant_name ? ` en ${t.merchant_name}` : ''
          const subcatInfo = t.subcategory?.name ? ` (${t.subcategory.name})` : ''
          return `- ${t.category?.name}${subcatInfo}${merchantInfo}: ${Number(t.amount).toLocaleString()} ${currency}`
        })
        .join('\n')
    }

    if (incomeTransactions.length > 0) {
      if (transactionsList) transactionsList += '\n\n'
      transactionsList += 'INGRESOS DEL MES:\n'
      transactionsList += incomeTransactions
        .map((t: any) => {
          const merchantInfo = t.merchant_name ? ` en ${t.merchant_name}` : ''
          const subcatInfo = t.subcategory?.name ? ` (${t.subcategory.name})` : ''
          return `- ${t.category?.name}${subcatInfo}${merchantInfo}: ${Number(t.amount).toLocaleString()} ${currency}`
        })
        .join('\n')
    }

    if (!transactionsList) {
      transactionsList = 'No hay transacciones registradas este mes.'
    }
    // ========================================
    // PROMPT PARA GEMINI 2.0 FLASH
    // ========================================
    const promptText =
      `Eres un asesor financiero empático, motivador y analítico. Tu trabajo es analizar la situación financiera del usuario y generar UN consejo personalizado, accionable y motivador.

SITUACIÓN FINANCIERA BASE:
- Sueldo mensual: ${sueldoBase.toLocaleString()} ${currency}
- Ingresos este mes: ${ingresosMesActual.toLocaleString()} ${currency}
- Gastos totales del mes: ${totalExpenses.toLocaleString()} ${currency}
- Ahorro neto: ${netSavings.toLocaleString()} ${currency}
${demographicContext.length > 0 ? `- Contexto personal: ${demographicContext.join(', ')}` : ''}

${budgetContext}
${goalContext}

TRANSACCIONES DEL MES:
${transactionsList}

IMPORTANTE SOBRE LOS DATOS:
- Los GASTOS son dinero que sale de tu cuenta (debes reducir estos)
- Los INGRESOS son dinero que entra a tu cuenta (estos aumentan tu capacidad de ahorro)
- NO confundas ingresos con gastos. Si ves un ingreso de $60,000 en "Negocios", eso es dinero que RECIBISTE, no que gastaste.
- Cuando veas porcentajes en "DISTRIBUCIÓN POR SUBCATEGORÍAS", el primer porcentaje es del total gastado en esa categoría, NO del presupuesto total. Por ejemplo, si dice "Delivery: 50,000 (100%)", significa que el 100% de lo que has gastado en Alimentación fue en Delivery, pero eso es solo el 25% de tu presupuesto de 200,000.

TU MISIÓN:
Analiza toda esta información y genera un consejo financiero que:
1. **SEA ANALÍTICO PERO AMIGABLE**: Explica qué está pasando con sus finanzas de forma clara y entendible
2. **DETECTA PATRONES**: Busca en las transacciones patrones interesantes (suscripciones no usadas, gastos repetidos en ciertos lugares, oportunidades de ahorro)
3. **SEA MOTIVADOR**: Nunca digas "no lo vas a lograr". En su lugar, muestra el camino: "Para lograrlo, podrías hacer X, Y, Z"
4. **DE RECOMENDACIONES ESPECÍFICAS**: No digas "gasta menos", di "Si reducís 30.000 en restaurantes, podrías..."
5. **USE NÚMEROS REALES**: Menciona montos específicos de sus transacciones
6. **SEA PERSONALIZADO**: Usa su contexto (hogar, metas, presupuestos)

REGLAS DE FORMATO:
- Extensión: 150-250 palabras (un análisis completo pero conciso)
- Tono: Conversacional, amigable, cercano (como un asesor que realmente le importa)
- Estructura: 3-4 párrafos naturales (sin listas con bullets, sin secciones con títulos como "ANÁLISIS:", "RECOMENDACIÓN:")
- Emojis: Máximo 3-4 en TODO el mensaje
- Primera persona: Tutea al usuario ("vi que gastaste...", "podrías intentar...")

EJEMPLO DE BUEN ANÁLISIS:
"Hola! Estuve revisando tus finanzas de este mes y noté algo interesante. Tu presupuesto de alimentación es de 150.000 pesos, y hasta ahora llevás gastados 120.000 con 8 días restantes. Vi que tenés varios gastos en restaurantes (35.000 en total) y solo 40.000 en supermercado. Si ajustás un poco y cocinás más seguido, podrías reducir esos 35.000 a unos 15.000, lo que te daría un ahorro de 20.000 mensuales. Con ese dinero extra, estarías mucho más cerca de tu meta de ahorro.

También noté que tenés 3 suscripciones activas (Spotify, Netflix, Amazon Prime) por un total de 18.000 al mes. ¿Las estás usando todas? Si cancelás una que no uses tanto, son otros 6.000 que podrías destinar a tu objetivo.

En resumen, con estos pequeños ajustes podrías ahorrar cerca de 26.000 al mes sin grandes sacrificios. ¡Estás en buen camino, solo necesitás estos ajustes para llegar más rápido! 💪"

NO HAGAS:
❌ Listas con bullets o numbered lists
❌ Secciones con títulos ("ANÁLISIS:", "RECOMENDACIÓN:")
❌ Tono formal o de informe ejecutivo
❌ Mensajes desmotivadores ("no podrás lograrlo", "vas mal")
❌ Consejos genéricos sin números específicos

GENERA EL CONSEJO:`.trim()
    // 🌟 AÑADIDO: console.log para ver el prompt final
    console.log('--- PROMPT FINAL ENVIADO A GEMINI ---')
    console.log(promptText)
    console.log('------------------------------------')
    console.log('🤖 Consultando Gemini 2.0 Flash...')
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: promptText,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Título claro y directo del consejo (máx 60 caracteres)',
            },
            content: {
              type: Type.STRING,
              description: 'Análisis completo de 150-250 palabras, amigable y motivador',
            },
            tipType: {
              type: Type.STRING,
              enum: ['general', 'expense', 'budget', 'goal', 'insight', 'warning', 'recommendation'],
            },
            priority: {
              type: Type.STRING,
              enum: ['low', 'medium', 'high', 'urgent'],
            },
          },
          required: ['title', 'content', 'tipType', 'priority'],
        },
      },
    })
    // Extracción robusta de texto JSON
    const text = response.response?.text() || response.text || JSON.stringify(response)
    const tipData = JSON.parse(text)
    console.log('✅ Análisis generado:', tipData.title)
    console.log('📄 Longitud:', tipData.content.split(' ').length, 'palabras')

    // Preparar datos para guardar el tip
    const tipInsertData: any = {
      user_id: userId,
      title: tipData.title,
      content: tipData.content,
      tip_type: tipData.tipType,
      priority: tipData.priority,
      ai_model: 'gemini-2.0-flash-exp',
      ai_confidence: 0.92,
      personalization_score: 0.95,
      status: 'active',
      display_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      max_displays: 5,
    }

    // IMPORTANTE: Priorizar goal sobre budget si ambos están presentes
    // Si hay una meta relacionada, guardar la relación (tiene prioridad)
    if (relatedGoalId) {
      tipInsertData.related_entity_type = 'goal'
      tipInsertData.related_entity_id = relatedGoalId
      console.log(`🎯 Guardando tip relacionado con meta: ${relatedGoalId}`)
    } else if (relatedBudgetId) {
      // Si hay un presupuesto relacionado (y no hay meta), guardar la relación
      tipInsertData.related_entity_type = 'budget'
      tipInsertData.related_entity_id = relatedBudgetId
      console.log(`🔗 Guardando tip relacionado con presupuesto: ${relatedBudgetId}`)
    }

    // Guardar tip
    const { data: savedTip } = await supabase.from('ai_tips').insert(tipInsertData).select().single()
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: savedTip?.id,
          title: tipData.title,
          content: tipData.content,
          tipType: tipData.tipType,
          priority: tipData.priority,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (err) {
    console.error('❌ Error:', err)
    return new Response(
      JSON.stringify({
        success: false,
        error: String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})

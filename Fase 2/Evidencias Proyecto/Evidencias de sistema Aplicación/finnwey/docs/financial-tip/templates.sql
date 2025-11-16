-- ============================================
-- PLANTILLAS DE TIPS FINANCIEROS HUMANIZADOS
-- ============================================
-- Mensajes conversacionales, motivadores y accionables
-- Sin informes ejecutivos ni listas exhaustivas de datos

-- ============================================
-- PLANTILLA 1: CONSEJO PARA PRESUPUESTOS
-- ============================================
INSERT INTO ai_tip_templates (
  template_key,
  title_template,
  content_template,
  tip_type,
  trigger_conditions,
  personalization_fields,
  min_confidence,
  is_active
) VALUES (
  'budget_category_analysis',
  '💡 Optimiza tu gasto en {categoria}',
  'Hola! 👋

Veo que definiste {montoPresupuestado} {moneda} para {categoria} este mes. {analisisPersonalizado}

{recomendacionEspecifica}

{mensajeMotivador}',
  'budget',
  '{
    "has_budgets": true,
    "has_active_budgets": true,
    "min_budgets": 1
  }'::jsonb,
  ARRAY[
    'moneda',
    'categoria',
    'montoPresupuestado',
    'montoGastado',
    'montoRestante',
    'porcentajeUsado',
    'status',
    'analisisPersonalizado',
    'recomendacionEspecifica',
    'mensajeMotivador'
  ],
  0.85,
  true
);

-- ============================================
-- PLANTILLA 2: CONSEJO PARA METAS FINANCIERAS
-- ============================================
INSERT INTO ai_tip_templates (
  template_key,
  title_template,
  content_template,
  tip_type,
  trigger_conditions,
  personalization_fields,
  min_confidence,
  is_active
) VALUES (
  'financial_goals_progress',
  '🎯 Estás avanzando hacia {nombreMeta}',
  '¡Vas por buen camino! 🌟

Ya llevas {progresoMeta}% de tu meta "{nombreMeta}". {analisisProgreso}

{recomendacionEstrategia}

{mensajeMotivacion}',
  'goal',
  '{
    "has_goals": true,
    "has_active_goals": true,
    "min_goals": 1
  }'::jsonb,
  ARRAY[
    'moneda',
    'nombreMeta',
    'tipoMeta',
    'objetivoMeta',
    'actualMeta',
    'faltanteMeta',
    'progresoMeta',
    'diasRestantes',
    'necesitaAhorrarMensual',
    'statusMeta',
    'analisisProgreso',
    'recomendacionEstrategia',
    'mensajeMotivacion'
  ],
  0.85,
  true
);

-- ============================================
-- EJEMPLOS DE CÓMO DEBEN GENERARSE LOS MENSAJES
-- ============================================

-- EJEMPLO 1: Para Presupuestos
-- ----------------------------------------
-- analisisPersonalizado:
-- "Llevás gastados $750 de los $1,000 que presupuestaste. Te quedan $250 para el resto del mes."
--
-- recomendacionEspecifica:
-- "Según tu sueldo de $5,000, este gasto representa el 15% de tus ingresos. Si reducís las compras 
-- en $200 este mes, podrías destinar ese dinero a tu fondo de emergencia y llegar a fin de mes con 
-- más holgura en caso de imprevistos."
--
-- mensajeMotivador:
-- "¡Vas bien! Con estos pequeños ajustes, podrás alcanzar tus objetivos sin sentir que te estás 
-- privando de nada. 💪"

-- EJEMPLO 2: Para Metas
-- ----------------------------------------
-- analisisProgreso:
-- "Ya ahorraste $3,000 de los $10,000 que necesitás. Te faltan $7,000 y quedan 180 días para 
-- tu fecha objetivo."
--
-- recomendacionEstrategia:
-- "Para llegar a tiempo, necesitarías ahorrar unos $1,200 al mes. Vi que este mes gastaste $800 
-- en entretenimiento. Si ajustás ese rubro a $500, podrías cubrir lo que necesitás sin afectar 
-- tu estilo de vida."
--
-- mensajeMotivacion:
-- "¡Lo estás logrando! Cada peso que ahorras te acerca más a tu objetivo. Seguí así y lo 
-- alcanzarás antes de lo que pensás. 🚀"

-- ============================================
-- GUÍAS PARA LA IA AL GENERAR LOS MENSAJES
-- ============================================
-- 
-- TONO Y ESTILO:
-- ✅ Conversacional y cercano (como un amigo que aconseja)
-- ✅ Motivador y positivo
-- ✅ Directo y accionable
-- ✅ Usar "vos/tú" según región del usuario
-- 
-- QUÉ INCLUIR:
-- ✅ Números clave en contexto (no listas)
-- ✅ Una recomendación específica y práctica
-- ✅ Impacto real de la acción sugerida
-- ✅ Mensaje de motivación al final
-- 
-- QUÉ EVITAR:
-- ❌ Listas de datos con bullets
-- ❌ Porcentajes excesivos
-- ❌ Tono de informe ejecutivo
-- ❌ Análisis exhaustivos
-- ❌ Secciones con títulos como "ANÁLISIS:", "RECOMENDACIÓN:"
-- ❌ Emojis en exceso (máximo 3-4 por mensaje)
-- 
-- LONGITUD:
-- 3-4 párrafos cortos máximo (8-10 líneas totales)
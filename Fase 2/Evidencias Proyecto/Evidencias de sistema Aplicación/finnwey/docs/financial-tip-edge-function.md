# Edge Function: swift-endpoint

Esta Edge Function genera tips financieros personalizados usando Google Gemini AI basado en los datos financieros reales del usuario.

## 📋 Descripción

La función analiza:
- Perfil financiero del usuario (ingresos, gastos, ahorros)
- Presupuestos activos y su estado
- Metas financieras y su progreso
- Transacciones recientes
- Alertas de presupuesto
- KPIs mensuales
- Preferencias y patrones de comportamiento del usuario

Y genera un tip personalizado, accionable y relevante.

## 🚀 Despliegue

### Opción 1: Desde Supabase Dashboard

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Edge Functions** > **Create a new function**
3. Nombre: `swift-endpoint`
4. Copia el contenido de `financial-tip/index.ts` (ver abajo)

### Opción 2: Desde Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase functions deploy swift-endpoint
```

## 🔧 Configuración

Asegúrate de tener estas variables de entorno configuradas en Supabase:

- `GOOGLE_API_KEY`: Tu API key de Google Gemini
- `SUPABASE_URL`: URL de tu proyecto (ya configurada automáticamente)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (ya configurada automáticamente)

## 📝 Código de la Edge Function

Ver archivo: `docs/financial-tip/index.ts`

**Nota:** Asegúrate de que el nombre de la función en Supabase sea `swift-endpoint` para que coincida con la URL en el servicio del cliente.

## 🔌 Uso desde el Cliente

```typescript
import { FinancialTipService } from '@/features/financial-tips'

const response = await FinancialTipService.generateTip()
if (response.success && response.data) {
  console.log('Tip:', response.data.title, response.data.content)
}
```

## 📊 Estructura de Respuesta

```typescript
{
  success: true,
  data: {
    id: string,
    title: string,
    content: string,
    tipType: 'general' | 'expense' | 'budget' | 'goal' | 'insight' | 'warning' | 'achievement' | 'recommendation',
    priority: 'low' | 'medium' | 'high' | 'urgent',
    relatedCategory?: string
  }
}
```


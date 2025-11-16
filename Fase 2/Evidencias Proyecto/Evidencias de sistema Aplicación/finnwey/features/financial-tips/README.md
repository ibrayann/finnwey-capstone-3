# Feature: Tips Financieros con IA

Este feature genera tips financieros personalizados usando Google Gemini AI basado en los datos financieros reales del usuario.

## 🚀 Características

- ✅ **Tips personalizados** basados en datos reales del usuario
- ✅ **Análisis inteligente** de presupuestos, metas y gastos
- ✅ **Priorización automática** según urgencia financiera
- ✅ **Integración con Gemini AI** para generar contenido relevante
- ✅ **Persistencia en base de datos** para historial y feedback

## 📁 Estructura

```
features/financial-tips/
├── services/
│   └── financial-tip.service.ts    # Servicio para llamar a Edge Function
├── hooks/
│   └── useFinancialTip.ts          # Hooks de React Query
├── index.ts                        # Exports públicos
└── README.md                       # Esta documentación
```

## 🔧 Uso

### Hook: useGenerateFinancialTip

Genera un nuevo tip financiero personalizado:

```tsx
import { useGenerateFinancialTip } from '@/features/financial-tips'

function MyComponent() {
  const { mutate: generateTip, isPending, data: tip, error } = useGenerateFinancialTip()

  const handleGenerate = () => {
    generateTip()
  }

  return (
    <View>
      <Button onPress={handleGenerate} disabled={isPending}>
        {isPending ? 'Generando...' : 'Obtener Tip Financiero'}
      </Button>
      {tip && (
        <View>
          <Text style={{ fontWeight: 'bold' }}>{tip.title}</Text>
          <Text>{tip.content}</Text>
        </View>
      )}
      {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
    </View>
  )
}
```

### Hook: useActiveFinancialTips

Obtiene tips activos del usuario:

```tsx
import { useActiveFinancialTips } from '@/features/financial-tips'

function TipsList() {
  const { data: tips, isLoading } = useActiveFinancialTips(5)

  if (isLoading) return <ActivityIndicator />

  return (
    <FlatList
      data={tips}
      renderItem={({ item }) => (
        <View>
          <Text>{item.title}</Text>
          <Text>{item.content}</Text>
        </View>
      )}
    />
  )
}
```

### Hook: useDismissTip

Descarta un tip:

```tsx
import { useDismissTip } from '@/features/financial-tips'

function TipCard({ tip }) {
  const { mutate: dismissTip } = useDismissTip()

  return (
    <View>
      <Text>{tip.title}</Text>
      <Button onPress={() => dismissTip(tip.id)} title="Descartar" />
    </View>
  )
}
```

## 📊 Tipos de Tips

Los tips pueden ser de los siguientes tipos:

- `general`: Tips generales de educación financiera
- `expense`: Tips sobre control de gastos
- `budget`: Tips sobre presupuestos
- `goal`: Tips sobre metas financieras
- `insight`: Insights y análisis
- `warning`: Advertencias financieras
- `achievement`: Logros y celebraciones
- `recommendation`: Recomendaciones específicas

## 🎯 Prioridades

- `low`: Baja prioridad
- `medium`: Prioridad media
- `high`: Alta prioridad
- `urgent`: Urgente (presupuestos excedidos, metas críticas)

## 🔌 Edge Function

La Edge Function `financial-tip` debe estar desplegada en Supabase. Ver documentación en:
`docs/financial-tip-edge-function.md`

## 📝 Ejemplo Completo

```tsx
import { useGenerateFinancialTip, useActiveFinancialTips } from '@/features/financial-tips'

export default function FinancialTipsScreen() {
  const { mutate: generateTip, isPending } = useGenerateFinancialTip()
  const { data: activeTips, isLoading } = useActiveFinancialTips(10)

  return (
    <View>
      <Button
        onPress={() => generateTip()}
        disabled={isPending}
        title={isPending ? 'Generando...' : 'Generar Nuevo Tip'}
      />

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={activeTips}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 16, marginBottom: 8, backgroundColor: '#f5f5f5' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{item.title}</Text>
              <Text style={{ marginTop: 8 }}>{item.content}</Text>
              <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                Tipo: {item.tipType} | Prioridad: {item.priority}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  )
}
```

## 🔒 Seguridad

- ✅ Edge Function protegida con autenticación JWT
- ✅ Validación de usuario en cada request
- ✅ Solo el usuario puede ver sus propios tips
- ✅ CORS habilitado para app móvil

## ⚡ Optimizaciones

- **Cache de tips**: Los tips se cachean por 5 minutos
- **Invalidación automática**: El cache se invalida al generar nuevos tips
- **Queries paralelas**: La Edge Function obtiene datos en paralelo para mejor performance

## 🐛 Debug

Para ver logs detallados:

```typescript
// En el cliente
console.log('📤 Generando tip...')

// En Supabase (Edge Function logs)
// Logs disponibles en Dashboard > Edge Functions > financial-tip > Logs
```

## 🚧 Próximos Pasos

- [ ] Componente UI para mostrar tips
- [ ] Sistema de feedback (útil/no útil)
- [ ] Notificaciones push para tips importantes
- [ ] Historial de tips aplicados
- [ ] Analytics de efectividad de tips


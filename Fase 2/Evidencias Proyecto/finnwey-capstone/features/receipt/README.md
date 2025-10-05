# Feature: Escaneo de Boletas con IA

Este feature permite escanear boletas y recibos comerciales usando la cámara del dispositivo y extraer automáticamente información relevante mediante IA (Google Gemini).

## 🚀 Características

- ✅ **Escaneo automático** de boletas con la cámara
- ✅ **Extracción inteligente** de datos usando Google Gemini AI
- ✅ **Categorización automática** de gastos
- ✅ **Validación de datos** extraídos
- ✅ **Integración perfecta** con el sistema de transacciones

## 📁 Estructura

```
features/receipt/
├── hooks/
│   └── useScanReceipt.ts      # Hook para escanear boletas
├── services/
│   └── receipt.service.ts     # Servicio para llamar a Edge Function
├── index.ts                   # Exports públicos
└── README.md                  # Esta documentación
```

## 🔧 Uso

### Hook: useScanReceipt

```tsx
import { useScanReceipt } from '@/features/receipt'

function MyComponent() {
  const { scanReceipt, isScanning, scannedData, error, reset } = useScanReceipt()

  const handleScan = async (imageUri: string) => {
    try {
      const data = await scanReceipt(imageUri)
      console.log('Datos extraídos:', data)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <View>
      {isScanning && <ActivityIndicator />}
      {scannedData && <Text>{scannedData.merchantName}</Text>}
      {error && <Text>{error}</Text>}
    </View>
  )
}
```

### Servicio: ReceiptService

```tsx
import { ReceiptService } from '@/features/receipt'

// Escanear una boleta
const result = await ReceiptService.scanReceipt(imageUri)

// Validar datos
const validation = ReceiptService.validateReceiptData(result.data)
if (!validation.valid) {
  console.log('Campos faltantes:', validation.missingFields)
}
```

## 📊 Datos Extraídos

La Edge Function extrae los siguientes datos de cada boleta:

```typescript
interface ReceiptData {
  merchantName: string         // Nombre del comercio
  category: string            // Categoría (Alimentación, Transporte, etc.)
  subcategory: string         // Subcategoría (Supermercado, Combustible, etc.)
  merchantType: string        // Tipo de comercio
  transactionDate: string     // Fecha en formato ISO (YYYY-MM-DD)
  totalAmount: number         // Monto total
  currency: string            // Moneda (CLP, USD, etc.)
  items: Array<{              // Items individuales
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  paymentMethod: string       // Método de pago
  merchantAddress: string     // Dirección del comercio
  merchantRut: string         // RUT del comercio
  receiptNumber: string       // Número de boleta
  ocrConfidence: number       // Confianza del OCR (0-1)
}
```

## 🤖 Edge Function

La Edge Function `boleta` utiliza **Google Gemini 2.0 Flash** para:

1. Recibir la imagen en formato `multipart/form-data`
2. Convertir la imagen a base64
3. Enviar a Gemini con un prompt especializado
4. Extraer y estructurar los datos
5. Retornar JSON tipado

### Endpoint

```
POST https://vvzmlchzfurkpvkefyrg.supabase.co/functions/v1/boleta
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body: FormData con campo 'image'
```

## 🎯 Categorías Soportadas

### Alimentación
- Supermercado (Lider, Jumbo, Santa Isabel)
- Restaurantes
- Delivery (Uber Eats, Rappi, PedidosYa)

### Transporte
- Combustible (Shell, Copec, Petrobras)
- Transporte público (Metro, RED)
- Apps de movilidad (Uber, Cabify, DiDi)

### Salud
- Farmacia (Salcobrand, Cruz Verde, Ahumada)
- Consultas médicas

### Compras
- Ropa (Falabella, Ripley, Paris)
- Artículos para el hogar (Sodimac, Easy)

### Entretenimiento
- Cine (Cinemark, Hoyts)
- Bares
- Streaming (Netflix, Spotify, Disney+)

### Vivienda
- Arriendo, Luz, Agua, Gas, Internet

### Educación
- Colegio, Universidad, Cursos, Libros

### Imprevistos
- Gastos no categorizados

## 🔒 Seguridad

- ✅ Edge Function protegida con autenticación JWT
- ✅ Validación de tipos de archivo
- ✅ CORS habilitado para app móvil
- ✅ Límite de tamaño de imagen (procesamiento optimizado)

## ⚡ Optimizaciones

- **Procesamiento en chunks** para archivos grandes
- **Compresión de imagen** antes de enviar (quality: 0.8)
- **Cache de sesión** para tokens de autenticación
- **Manejo de errores robusto** con reintentos

## 🐛 Debug

Para ver logs detallados:

```typescript
// En el cliente
console.log('📤 Enviando imagen...')
console.log('📊 Tamaño:', size, 'KB')

// En Supabase (Edge Function logs)
// Logs disponibles en Dashboard > Edge Functions > boleta > Logs
```

## 📝 Ejemplo Completo

Ver implementación en: `/app/(protected)/(tabs)/scan/index.tsx`

```tsx
const { scanReceipt, isScanning } = useScanReceipt()

const handleSaveImage = async () => {
  const data = await scanReceipt(capturedImage)
  
  // Navegar a crear transacción con datos prellenados
  router.push({
    pathname: '/dashboard/add-transaction',
    params: {
      merchantName: data.merchantName,
      amount: data.totalAmount,
      category: data.category,
      subcategory: data.subcategory,
      date: data.transactionDate,
    }
  })
}
```

## 🔄 Flujo de Usuario

1. Usuario abre la cámara desde el tab de Scan
2. Captura foto de la boleta o selecciona de galería
3. Presiona "Guardar" para procesar
4. Se muestra overlay de loading "Escaneando Boleta..."
5. Edge Function extrae datos con IA
6. Alert muestra resumen de datos extraídos
7. Usuario puede crear transacción con datos prellenados

## 🎨 UX/UI

- **Loading State**: Overlay elegante con ActivityIndicator
- **Success Alert**: Muestra comercio y monto extraído
- **Error Handling**: Opción de reintentar o cancelar
- **Smooth Navigation**: Transición fluida a pantalla de transacción

## 🚧 Mejoras Futuras

- [ ] Cache de imágenes procesadas
- [ ] Modo batch para múltiples boletas
- [ ] Historial de escaneos
- [ ] Edición manual de datos extraídos
- [ ] Sugerencias basadas en historial
- [ ] Soporte para facturas electrónicas (XML/PDF)

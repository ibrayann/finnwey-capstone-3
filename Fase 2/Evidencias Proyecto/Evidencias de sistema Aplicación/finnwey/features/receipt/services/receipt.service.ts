import { supabase } from '@/lib/supabase'
import { ReceiptData, ScanReceiptResponse } from '@/types/receipt'

const SUPABASE_URL = 'https://vvzmlchzfurkpvkefyrg.supabase.co'
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/boleta`

export class ReceiptService {
  /**
   * Escanea una imagen de boleta usando la Edge Function de Supabase
   * @param imageUri - URI de la imagen capturada o seleccionada
   * @returns Datos extraídos de la boleta
   */
  static async scanReceipt(imageUri: string): Promise<ScanReceiptResponse> {
    try {
      console.log('📤 Enviando imagen a Edge Function...')
      console.log('📍 URI:', imageUri)

      // Obtener el blob de la imagen para verificar el tipo
      const imageResponse = await fetch(imageUri)
      const blob = await imageResponse.blob()

      console.log('📊 Tamaño de imagen:', Math.round(blob.size / 1024), 'KB')
      console.log('📊 Tipo MIME:', blob.type || 'image/jpeg')

      // Crear FormData con el tipo MIME correcto
      const formData = new FormData()

      // En React Native, FormData acepta objetos con uri, type, name
      // @ts-ignore - FormData en React Native tiene una API diferente
      formData.append('image', {
        uri: imageUri,
        type: blob.type || 'image/jpeg',
        name: 'receipt.jpg',
      })

      console.log('📦 FormData creado con imagen')

      // Obtener la sesión actual para incluir el token de autenticación
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.warn('⚠️ No hay sesión activa, continuando sin autenticación')
      }

      console.log('🔐 Token obtenido, enviando request a:', EDGE_FUNCTION_URL)

      // Llamar a la Edge Function directamente con fetch
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
          // NO incluir Content-Type, fetch lo configura automáticamente con el boundary correcto para multipart/form-data
        },
      })

      console.log('📡 Respuesta recibida - Status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error HTTP:', response.status, errorText)
        throw new Error(`Error ${response.status}: ${errorText.substring(0, 200) || 'No se pudo procesar la boleta'}`)
      }

      const data: ScanReceiptResponse = await response.json()
      console.log('📄 Datos parseados correctamente')

      if (!data || !data.success) {
        console.error('❌ Respuesta sin éxito:', data?.error)
        throw new Error(data?.error || 'No se pudo procesar la boleta')
      }

      console.log('✅ Boleta procesada exitosamente')
      console.log('🏪 Comercio:', data.data?.merchantName)
      console.log('💰 Total:', data.data?.totalAmount, data.data?.currency)
      console.log('📂 Categoría:', data.data?.category, '/', data.data?.subcategory)
      console.log('📅 Fecha:', data.data?.transactionDate)
      console.log('🎯 Confianza OCR:', data.data?.ocrConfidence)

      return data
    } catch (error) {
      console.error('❌ Error al escanear boleta:', error)

      // Si es un error de red o timeout, dar más detalles
      if (error instanceof TypeError && error.message.includes('Network')) {
        return {
          success: false,
          error: 'Error de conexión. Verifica tu conexión a internet y que la Edge Function esté activa.',
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al procesar la boleta',
      }
    }
  }

  /**
   * Valida que los datos de la boleta sean suficientes para crear una transacción
   */
  static validateReceiptData(data: ReceiptData): { valid: boolean; missingFields: string[] } {
    const missingFields: string[] = []

    if (!data.merchantName) missingFields.push('Nombre del comercio')
    if (!data.totalAmount) missingFields.push('Monto total')
    if (!data.category) missingFields.push('Categoría')
    if (!data.subcategory) missingFields.push('Subcategoría')
    if (!data.transactionDate) missingFields.push('Fecha')

    return {
      valid: missingFields.length === 0,
      missingFields,
    }
  }
}

import { supabase } from '@/lib/supabase'
import { ReceiptData } from '@/types/receipt'
import { CategoryService } from '@/features/shared'

export interface CreateTransactionInput {
  merchantName: string
  amount: number
  category: string // ID de la categoría de Supabase
  subcategory: string // ID de la subcategoría de Supabase (o nombre como fallback)
  transactionDate: string
  transactionType: 'income' | 'expense' // Tipo de transacción
  notes?: string
  receiptData?: ReceiptData
}

export class TransactionService {
  /**
   * Crea una nueva transacción en la base de datos
   * @param input - Datos de la transacción
   * @param userId - ID del usuario
   * @returns ID de la transacción creada
   */
  static async createTransaction(input: CreateTransactionInput, userId: string): Promise<string> {
    try {
      console.log('🚀 TransactionService.createTransaction - Iniciando creación de transacción')
      console.log('📝 Input recibido:', JSON.stringify(input, null, 2))
      console.log('👤 User ID:', userId)

      // Usar directamente los IDs de categoría (ya mapeados en el frontend)
      const categoryId = input.category
      const subcategoryId = input.subcategory

      console.log('🏷️ Category ID:', categoryId)
      console.log('🏷️ Subcategory ID:', subcategoryId)
      console.log('💰 Transaction Type:', input.transactionType)

      // Buscar ID de tipo de transacción basado en el parámetro
      console.log('🔍 Buscando tipo de transacción:', input.transactionType)
      const { data: transactionTypes, error: typeError } = await supabase.from('transaction_types').select('id').eq('name', input.transactionType).single()

      if (typeError) {
        console.error('❌ Error al buscar tipo de transacción:', typeError)
        throw new Error(`Error al buscar tipo de transacción: ${typeError.message}`)
      }

      if (!transactionTypes) {
        console.error('❌ No se encontró el tipo de transacción:', input.transactionType)
        throw new Error(`No se encontró el tipo de transacción "${input.transactionType}"`)
      }

      console.log('✅ Tipo de transacción encontrado:', transactionTypes)

      // Crear la transacción
      console.log('💾 Creando transacción en la base de datos...')
      const transactionData = {
        user_id: userId,
        transaction_type_id: transactionTypes.id,
        merchant_name: input.merchantName,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        amount: input.amount,
        currency_code: 'CLP',
        transaction_date: input.transactionDate,
        description: input.transactionType === 'income' ? `Ingreso: ${input.merchantName}` : `Compra en ${input.merchantName}`,
        notes: input.notes,
        is_recurring: false,
        source: input.receiptData ? 'ocr' : 'manual', // Indica si fue escaneada o manual
        confidence_score: input.receiptData?.ocrConfidence || null,
        metadata: input.receiptData
          ? {
              merchantType: input.receiptData.merchantType,
              paymentMethod: input.receiptData.paymentMethod,
              receiptNumber: input.receiptData.receiptNumber,
              merchantRut: input.receiptData.merchantRut,
              items: input.receiptData.items,
            }
          : null,
      }

      console.log('📊 Datos de transacción a insertar:', JSON.stringify(transactionData, null, 2))

      const { data: transaction, error: transactionError } = await supabase.from('transactions').insert(transactionData).select('id').single()

      if (transactionError) {
        console.error('❌ Error al crear transacción:', transactionError)
        throw new Error(`Error al crear transacción: ${transactionError.message}`)
      }

      console.log('✅ Transacción creada exitosamente:', transaction)
      return transaction.id
    } catch (error) {
      console.error('❌ Error en TransactionService.createTransaction:', error)
      throw error
    }
  }

  /**
   * Crea un registro de receipt vinculado a una transacción
   * @param transactionId - ID de la transacción
   * @param storageUrl - URL de la imagen en storage
   * @param receiptData - Datos extraídos de la boleta
   */
  static async createReceipt(transactionId: string, storageUrl: string, receiptData: ReceiptData): Promise<void> {
    try {
      console.log('📄 Guardando registro de receipt...')

      const { error } = await supabase.from('receipts').insert({
        transaction_id: transactionId,
        storage_url: storageUrl,
        file_name: storageUrl.split('/').pop() || 'receipt.jpg',
        mime_type: 'image/jpeg',
        ocr_data: receiptData,
        extracted_data: {
          merchantName: receiptData.merchantName,
          totalAmount: receiptData.totalAmount,
          transactionDate: receiptData.transactionDate,
          category: receiptData.category,
          subcategory: receiptData.subcategory,
        },
        processing_status: 'completed',
        confidence_score: receiptData.ocrConfidence,
        processed_at: new Date().toISOString(),
      })

      if (error) {
        console.error('❌ Error al crear receipt:', error)
        throw new Error(`Error al crear receipt: ${error.message}`)
      }

      console.log('✅ Receipt guardado exitosamente')
    } catch (error) {
      console.error('❌ Error al guardar receipt:', error)
      throw error
    }
  }
}

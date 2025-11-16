import { supabase } from '@/lib/supabase'

export class StorageService {
  private static BUCKET_NAME = 'receipts'

  /**
   * Sube una imagen de boleta a Supabase Storage
   * @param imageUri - URI de la imagen local
   * @param userId - ID del usuario
   * @returns URL pública de la imagen subida
   */
  static async uploadReceipt(imageUri: string, userId: string): Promise<string> {
    try {
      console.log('📤 Subiendo imagen a Supabase Storage...')
      console.log('📍 URI:', imageUri)
      console.log('👤 User ID:', userId)

      // En React Native, usar FormData directamente con la URI
      const formData = new FormData()

      // Generar nombre único para el archivo
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 9)
      const fileName = `${userId}/${timestamp}_${randomString}.jpg`

      console.log('📝 Nombre del archivo:', fileName)

      // En React Native, FormData acepta objetos con uri, type, name
      // @ts-ignore - FormData en React Native tiene una API diferente
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      })

      console.log('📦 FormData creado')

      // Obtener la sesión actual para incluir el token de autenticación
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.warn('⚠️ No hay sesión activa, continuando sin autenticación')
      }

      console.log('🔐 Token obtenido, enviando request...')

      // Usar fetch directo para subir al storage
      const supabaseUrl = 'https://vvzmlchzfurkpvkefyrg.supabase.co'
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${this.BUCKET_NAME}/${fileName}`

      console.log('🌐 URL de subida:', uploadUrl)
      console.log('🔑 Token de autorización:', session?.access_token ? 'Presente' : 'Ausente')

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
          // NO incluir Content-Type, fetch lo configura automáticamente
        },
      })

      console.log('📡 Respuesta recibida - Status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error HTTP:', response.status, errorText)
        throw new Error(`Error ${response.status}: ${errorText.substring(0, 200) || 'No se pudo subir la imagen'}`)
      }

      console.log('✅ Imagen subida exitosamente')

      // Obtener URL pública
      const publicUrl = this.getPublicUrl(fileName)
      console.log('🔗 URL pública:', publicUrl)

      return publicUrl
    } catch (error) {
      console.error('❌ Error al subir imagen:', error)

      // Proporcionar información más específica sobre el error
      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.error('🌐 Error de red detectado - Posibles causas:')
        console.error('   - Sin conexión a internet')
        console.error('   - URL de Supabase incorrecta')
        console.error('   - Problemas de CORS')
        console.error('   - Firewall bloqueando la conexión')
        throw new Error('Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet.')
      }

      throw error
    }
  }

  /**
   * Elimina una imagen de boleta del storage
   * @param filePath - Ruta del archivo en el storage
   */
  static async deleteReceipt(filePath: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando imagen:', filePath)

      const { error } = await supabase.storage.from(this.BUCKET_NAME).remove([filePath])

      if (error) {
        console.error('❌ Error al eliminar imagen:', error)
        throw new Error(`Error al eliminar imagen: ${error.message}`)
      }

      console.log('✅ Imagen eliminada exitosamente')
    } catch (error) {
      console.error('❌ Error al eliminar imagen:', error)
      throw error
    }
  }

  /**
   * Obtiene la URL pública de una imagen
   * @param filePath - Ruta del archivo en el storage
   * @returns URL pública de la imagen
   */
  static getPublicUrl(filePath: string): string {
    const {
      data: { publicUrl },
    } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(filePath)
    return publicUrl
  }
}

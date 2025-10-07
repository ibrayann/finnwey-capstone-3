import { supabase } from '@/lib/supabase'
import { City, CityFilters } from '@/types/city'

export class CityService {
  /**
   * Obtiene todas las ciudades
   */
  static async getCities(filters?: CityFilters): Promise<City[]> {
    let query = supabase.from('cities').select('*').order('name', { ascending: true })

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters?.region_id) {
      query = query.eq('region_id', filters.region_id)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener ciudades: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtiene una ciudad por ID
   */
  static async getCityById(id: string): Promise<City | null> {
    const { data, error } = await supabase.from('cities').select('*').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Ciudad no encontrada
      }
      throw new Error(`Error al obtener ciudad: ${error.message}`)
    }

    return data
  }

  /**
   * Obtiene ciudades por región
   */
  static async getCitiesByRegion(regionId: string): Promise<City[]> {
    const { data, error } = await supabase.from('cities').select('*').eq('region_id', regionId).order('name', { ascending: true })

    if (error) {
      throw new Error(`Error al obtener ciudades por región: ${error.message}`)
    }

    return data || []
  }

  /**
   * Verifica si existen ciudades en la base de datos
   */
  static async hasCities(): Promise<boolean> {
    const { count, error } = await supabase.from('cities').select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Error al verificar ciudades: ${error.message}`)
    }

    return (count || 0) > 0
  }
}

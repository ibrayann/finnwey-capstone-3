import { supabase } from '@/lib/supabase'
import { Region, RegionFilters } from '@/types/region'

export class RegionService {
  /**
   * Obtiene todas las regiones
   */
  static async getRegions(filters?: RegionFilters): Promise<Region[]> {
    let query = supabase.from('regions').select('*').order('name', { ascending: true })

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters?.country_id) {
      query = query.eq('country_id', filters.country_id)
    }

    const { data, error } = await query
    console.log('data', data)

    if (error) {
      throw new Error(`Error al obtener regiones: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtiene una región por ID
   */
  static async getRegionById(id: string): Promise<Region | null> {
    const { data, error } = await supabase.from('regions').select('*').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Región no encontrada
      }
      throw new Error(`Error al obtener región: ${error.message}`)
    }

    return data
  }

  /**
   * Obtiene regiones por país (puede ser country_id o country_code)
   */
  static async getRegionsByCountry(countryIdOrCode: string): Promise<Region[]> {
    // Primero intentamos obtener el país por código si es necesario
    let countryId = countryIdOrCode

    // Si el parámetro parece ser un código de país (3 caracteres), buscamos el país primero
    if (countryIdOrCode.length === 3) {
      const { data: country, error: countryError } = await supabase.from('countries').select('id').eq('code', countryIdOrCode).single()

      if (countryError) {
        throw new Error(`Error al obtener país por código: ${countryError.message}`)
      }

      if (!country) {
        throw new Error(`País no encontrado con código: ${countryIdOrCode}`)
      }

      countryId = country.id
    }

    const { data, error } = await supabase.from('regions').select('*').eq('country_id', countryId).order('name', { ascending: true })

    if (error) {
      throw new Error(`Error al obtener regiones por país: ${error.message}`)
    }

    return data || []
  }

  /**
   * Verifica si existen regiones en la base de datos
   */
  static async hasRegions(): Promise<boolean> {
    const { count, error } = await supabase.from('regions').select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Error al verificar regiones: ${error.message}`)
    }

    return (count || 0) > 0
  }
}

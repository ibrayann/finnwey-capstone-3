import { supabase } from '@/lib/supabase'
import { Country, CreateCountryInput, UpdateCountryInput, CountryFilters } from '@/types/country'

export class CountryService {
  /**
   * Obtiene todos los países
   */
  static async getCountries(filters?: CountryFilters): Promise<Country[]> {
    let query = supabase.from('countries').select('*').order('name', { ascending: true })

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters?.currency_code) {
      query = query.eq('currency_code', filters.currency_code)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener países: ${error.message}`)
    }

    return data || []
  }

  /**
   * Obtiene un país por ID
   */
  static async getCountryById(id: string): Promise<Country | null> {
    const { data, error } = await supabase.from('countries').select('*').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // País no encontrado
      }
      throw new Error(`Error al obtener país: ${error.message}`)
    }

    return data
  }

  /**
   * Obtiene un país por código
   */
  static async getCountryByCode(code: string): Promise<Country | null> {
    const { data, error } = await supabase.from('countries').select('*').eq('code', code).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // País no encontrado
      }
      throw new Error(`Error al obtener país por código: ${error.message}`)
    }

    return data
  }

  /**
   * Crea un nuevo país
   */
  static async createCountry(input: CreateCountryInput): Promise<Country> {
    const { data, error } = await supabase.from('countries').insert([input]).select().single()

    if (error) {
      throw new Error(`Error al crear país: ${error.message}`)
    }

    return data
  }

  /**
   * Actualiza un país existente
   */
  static async updateCountry(id: string, input: UpdateCountryInput): Promise<Country> {
    const { data, error } = await supabase.from('countries').update(input).eq('id', id).select().single()

    if (error) {
      throw new Error(`Error al actualizar país: ${error.message}`)
    }

    return data
  }

  /**
   * Elimina un país
   */
  static async deleteCountry(id: string): Promise<void> {
    const { error } = await supabase.from('countries').delete().eq('id', id)

    if (error) {
      throw new Error(`Error al eliminar país: ${error.message}`)
    }
  }

  /**
   * Inserta múltiples países (útil para datos iniciales)
   */
  static async insertMultipleCountries(countries: CreateCountryInput[]): Promise<Country[]> {
    const { data, error } = await supabase.from('countries').insert(countries).select()

    if (error) {
      throw new Error(`Error al insertar países: ${error.message}`)
    }

    return data || []
  }

  /**
   * Verifica si existen países en la base de datos
   */
  static async hasCountries(): Promise<boolean> {
    const { count, error } = await supabase.from('countries').select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Error al verificar países: ${error.message}`)
    }

    return (count || 0) > 0
  }
}

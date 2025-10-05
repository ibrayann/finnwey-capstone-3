import { supabase } from '@/lib/supabase'

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  type: 'expense' | 'income' | 'transfer' | 'savings'
  is_active: boolean
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  is_active: boolean
}

export class CategoryService {
  /**
   * Obtiene todas las categorías de gastos
   */
  static async getExpenseCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('type', 'expense').eq('is_active', true).order('name')

      if (error) {
        throw new Error(`Error al obtener categorías: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('❌ Error al obtener categorías de gastos:', error)
      throw error
    }
  }

  /**
   * Obtiene todas las categorías de ingresos
   */
  static async getIncomeCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('type', 'income').eq('is_active', true).order('name')

      if (error) {
        throw new Error(`Error al obtener categorías: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('❌ Error al obtener categorías de ingresos:', error)
      throw error
    }
  }

  /**
   * Obtiene subcategorías por categoría
   */
  static async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    try {
      const { data, error } = await supabase.from('subcategories').select('*').eq('category_id', categoryId).eq('is_active', true).order('name')

      if (error) {
        throw new Error(`Error al obtener subcategorías: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('❌ Error al obtener subcategorías:', error)
      throw error
    }
  }

  /**
   * Busca una categoría por nombre
   */
  static async findCategoryByName(name: string, type: 'expense' | 'income' = 'expense'): Promise<Category | null> {
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('name', name).eq('type', type).eq('is_active', true).single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró la categoría
          return null
        }
        throw new Error(`Error al buscar categoría: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('❌ Error al buscar categoría por nombre:', error)
      return null
    }
  }

  /**
   * Busca una subcategoría por nombre dentro de una categoría
   */
  static async findSubcategoryByName(categoryId: string, subcategoryName: string): Promise<Subcategory | null> {
    try {
      const { data, error } = await supabase.from('subcategories').select('*').eq('category_id', categoryId).eq('name', subcategoryName).eq('is_active', true).single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró la subcategoría
          return null
        }
        throw new Error(`Error al buscar subcategoría: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('❌ Error al buscar subcategoría por nombre:', error)
      return null
    }
  }

  /**
   * Busca una subcategoría por nombre dentro de una categoría (búsqueda flexible)
   */
  static async findSubcategoryByNameFlexible(categoryId: string, subcategoryName: string): Promise<Subcategory | null> {
    try {
      // Primero intentar búsqueda exacta
      let subcategory = await this.findSubcategoryByName(categoryId, subcategoryName)

      if (subcategory) {
        return subcategory
      }

      // Si no se encuentra, intentar búsqueda flexible (case insensitive, sin acentos)
      const normalizedSearchName = subcategoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .trim()

      const { data, error } = await supabase.from('subcategories').select('*').eq('category_id', categoryId).eq('is_active', true).ilike('name', `%${normalizedSearchName}%`)

      if (error) {
        throw new Error(`Error en búsqueda flexible de subcategoría: ${error.message}`)
      }

      // Si encontramos una coincidencia parcial, usar la primera
      if (data && data.length > 0) {
        console.log(`✅ Subcategoría encontrada con búsqueda flexible: "${data[0].name}" para "${subcategoryName}"`)
        return data[0]
      }

      console.log(`⚠️ No se encontró subcategoría "${subcategoryName}" en categoría ${categoryId}`)
      return null
    } catch (error) {
      console.error('❌ Error en búsqueda flexible de subcategoría:', error)
      return null
    }
  }

  /**
   * Mapea nombres de categorías del OCR a IDs de Supabase
   */
  static async mapCategoryNameToId(categoryName: string, subcategoryName: string, type: 'expense' | 'income' = 'expense'): Promise<{ categoryId: string; subcategoryId: string | null }> {
    try {
      console.log('🔍 CategoryService.mapCategoryNameToId - Buscando:', { categoryName, subcategoryName, type })

      // Buscar la categoría por nombre y tipo
      const category = await this.findCategoryByName(categoryName, type)

      if (!category) {
        console.log('⚠️ Categoría no encontrada, usando fallback')
        // Si no se encuentra, usar una categoría por defecto según el tipo
        const fallbackCategoryName = type === 'income' ? 'Otros Ingresos' : 'Compras'
        const fallbackCategory = await this.findCategoryByName(fallbackCategoryName, type)

        if (!fallbackCategory) {
          throw new Error(`No se encontró la categoría "${categoryName}" ni el fallback "${fallbackCategoryName}"`)
        }

        console.log('✅ Usando categoría fallback:', fallbackCategory.name)

        // Buscar subcategoría en la categoría fallback usando búsqueda flexible
        const subcategory = await this.findSubcategoryByNameFlexible(fallbackCategory.id, subcategoryName)

        return {
          categoryId: fallbackCategory.id,
          subcategoryId: subcategory?.id || null,
        }
      }

      console.log('✅ Categoría encontrada:', category.name)

      // Buscar la subcategoría dentro de la categoría encontrada usando búsqueda flexible
      const subcategory = await this.findSubcategoryByNameFlexible(category.id, subcategoryName)

      console.log('✅ Subcategoría encontrada:', subcategory?.name || 'No encontrada')

      return {
        categoryId: category.id,
        subcategoryId: subcategory?.id || null,
      }
    } catch (error) {
      console.error('❌ Error en CategoryService.mapCategoryNameToId:', error)
      throw error
    }
  }
}

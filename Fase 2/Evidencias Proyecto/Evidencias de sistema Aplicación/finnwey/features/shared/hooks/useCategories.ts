import { useQuery } from '@tanstack/react-query'
import { CategoryService, Category, Subcategory } from '../services/category.service'

// Hook para obtener categorías de gastos
export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ['categories', 'expense'],
    queryFn: () => CategoryService.getExpenseCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  })
}

// Hook para obtener categorías de ingresos
export const useIncomeCategories = () => {
  return useQuery({
    queryKey: ['categories', 'income'],
    queryFn: () => CategoryService.getIncomeCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  })
}

// Hook para obtener todas las categorías (gastos e ingresos)
export const useAllCategories = () => {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const [expenseCategories, incomeCategories] = await Promise.all([CategoryService.getExpenseCategories(), CategoryService.getIncomeCategories()])
      return [...expenseCategories, ...incomeCategories]
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  })
}

// Hook para obtener subcategorías por categoría
export const useSubcategoriesByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: () => CategoryService.getSubcategoriesByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  })
}

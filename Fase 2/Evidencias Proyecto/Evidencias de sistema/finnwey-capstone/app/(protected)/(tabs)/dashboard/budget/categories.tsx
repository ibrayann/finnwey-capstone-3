import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useAuthStore } from '@/store/auth.store'
import { budgetService } from '@/features/budgets/services/budget.service'
import { useExpenseCategories } from '@/features/shared/hooks/useCategories'

interface Category {
  id: string
  name: string
  type: string
  description?: string
}

interface CategoryWithBudget extends Category {
  budget?: {
    id: string
    amount: number
    spent_amount: number
    percentage_used: number
    period_type: string
    status: string
  }
}

export default function BudgetCategoriesScreen() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { user } = useAuthStore()

  // Usar el hook para cargar categorías de gastos
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useExpenseCategories()
  const [budgets, setBudgets] = useState<any[]>([])
  const [budgetsLoading, setBudgetsLoading] = useState(true)

  useEffect(() => {
    loadBudgets()
  }, [user?.id])

  // 🔄 Recargar datos cuando la pantalla vuelve a estar en foco
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        console.log('🔄 Pantalla Categories en foco - Recargando presupuestos...')
        loadBudgets()
      }
    }, [user?.id])
  )

  const loadBudgets = async () => {
    if (!user?.id) return

    try {
      setBudgetsLoading(true)
      const userBudgets = await budgetService.getBudgets(user.id)
      setBudgets(userBudgets)
    } catch (budgetError) {
      console.error('Error loading budgets:', budgetError)
    } finally {
      setBudgetsLoading(false)
    }
  }

  // Combinar categorías con sus presupuestos
  const categoriesWithBudgets: CategoryWithBudget[] = (categoriesData || []).map((category) => {
    const budget = budgets.find((b) => b.category_id === category.id)
    return {
      ...category,
      budget: budget
        ? {
            id: budget.id,
            amount: budget.amount,
            spent_amount: budget.spent_amount || 0,
            percentage_used: budget.percentage_used || 0,
            period_type: budget.period_type,
            status: budget.status,
          }
        : undefined,
    }
  })

  const isLoading = categoriesLoading || budgetsLoading

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      Alimentación: 'restaurant-outline',
      Compras: 'bag-outline',
      Educación: 'school-outline',
      Entretenimiento: 'game-controller-outline',
      Salud: 'medical-outline',
      Transporte: 'car-outline',
      Vivienda: 'home-outline',
    }
    return iconMap[categoryName] || 'wallet-outline'
  }

  const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
      Alimentación: '#FF6B6B',
      Compras: '#4ECDC4',
      Educación: '#FECA57',
      Entretenimiento: '#45B7D1',
      Salud: '#96CEB4',
      Transporte: '#FF9F43',
      Vivienda: '#A55EEA',
    }
    return colorMap[categoryName] || '#3B82F6'
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444' // Rojo - peligro
    if (percentage >= 75) return '#f59e0b' // Amarillo - advertencia
    return '#10b981' // Verde - bien
  }

  const CategoryCard = ({ category }: { category: CategoryWithBudget }) => {
    const hasBudget = !!category.budget
    const iconName = getCategoryIcon(category.name)
    const color = getCategoryColor(category.name)
    const statusColor = hasBudget ? getStatusColor(category.budget!.percentage_used) : '#6B7280'

    return (
      <TouchableOpacity
        onPress={() => {
          console.log('Enviando categoryId:', category.id, 'para categoría:', category.name)
          router.push(`/dashboard/budget/detail?categoryId=${category.id}`)
        }}
        className={`p-4 rounded-2xl border mb-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        style={{ borderLeftWidth: 4, borderLeftColor: statusColor }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: color + '20' }}>
              <Ionicons name={iconName as any} size={24} color={color} />
            </View>
            <View className="flex-1">
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{category.name}</Text>
              {category.description && <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{category.description}</Text>}
            </View>
          </View>

          <View className="items-end">
            {hasBudget ? (
              <View className="items-end">
                <View className="flex-row items-center mb-1">
                  <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: statusColor }} />
                  <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{category.budget!.percentage_used.toFixed(1)}% usado</Text>
                </View>
                <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>${category.budget!.amount.toLocaleString()}</Text>
                <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{category.budget!.period_type}</Text>
              </View>
            ) : (
              <View className="items-end">
                <Text className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Sin Presupuesto</Text>
                <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toca para configurar</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium">Cargando...</Text>
            <View className="w-12" />
          </View>
          <View className="bg-white dark:bg-gray-800 mt-4 flex-1 rounded-t-3xl px-4 pt-4 items-center justify-center">
            <Text className="text-gray-600 dark:text-gray-300 text-lg">Cargando categorías...</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#166534] dark:bg-gray-900">
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-2">
          <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-medium">Presupuestos</Text>
          <View className="w-12" />
        </View>

        <View className="bg-white dark:bg-gray-800 mt-4 flex-1 rounded-t-3xl px-4 pt-4">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Información */}
            <View className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <View className="flex-row items-center mb-2">
                <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-3">
                  <Ionicons name="wallet-outline" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-blue-800 dark:text-blue-300 font-semibold text-lg">Configurar Presupuestos</Text>
                  <Text className="text-blue-700 dark:text-blue-200 text-sm">Selecciona una categoría para crear o editar su presupuesto</Text>
                </View>
              </View>
            </View>

            {/* Estadísticas */}
            <View className="mb-6">
              <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resumen</Text>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                  <Text className="text-green-700 dark:text-green-300 text-xs font-medium">Con Presupuesto</Text>
                  <Text className="text-green-800 dark:text-green-200 text-lg font-bold">{categoriesWithBudgets.filter((c) => c.budget).length}</Text>
                </View>
                <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                  <Text className="text-blue-700 dark:text-blue-300 text-xs font-medium">Sin Presupuesto</Text>
                  <Text className="text-blue-800 dark:text-blue-200 text-lg font-bold">{categoriesWithBudgets.filter((c) => !c.budget).length}</Text>
                </View>
                <View className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <Text className="text-gray-700 dark:text-gray-300 text-xs font-medium">Total</Text>
                  <Text className="text-gray-800 dark:text-gray-200 text-lg font-bold">{categoriesWithBudgets.length}</Text>
                </View>
              </View>
            </View>

            {/* Lista de categorías */}
            <View className="mb-6">
              <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Categorías de Gastos</Text>
              {categoriesWithBudgets.length > 0 ? (
                categoriesWithBudgets.map((category) => <CategoryCard key={category.id} category={category} />)
              ) : (
                <View className="p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl items-center">
                  <Ionicons name="alert-circle-outline" size={48} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  <Text className={`text-lg font-medium mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No hay categorías disponibles</Text>
                  <Text className={`text-sm text-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Contacta al administrador para agregar categorías de gastos</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  )
}

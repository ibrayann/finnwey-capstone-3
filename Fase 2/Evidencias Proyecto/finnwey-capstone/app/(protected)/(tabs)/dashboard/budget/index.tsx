import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useSupabaseBudgets, SupabaseBudget, SupabaseCategory } from '@/features/budgets/hooks/useSupabaseBudgets'
import { useAuthStore } from '@/store/auth.store'
import Svg, { Circle } from 'react-native-svg'
import { useCallback } from 'react'

// Componente para círculo de progreso
interface ProgressCircleProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color: string
  backgroundColor?: string
}

function ProgressCircle({ percentage, size = 100, strokeWidth = 8, color, backgroundColor = '#e5e7eb' }: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Svg width={size} height={size} className="transform -rotate-90">
      <Circle stroke={backgroundColor} fill="transparent" strokeWidth={strokeWidth} r={radius} cx={size / 2} cy={size / 2} />
      <Circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </Svg>
  )
}

export default function BudgetScreen() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { user } = useAuthStore()

  // ✅ SEGURIDAD: Pasar userId al hook
  const { budgets, categories, loading, error, getBudgetSummary, getActiveBudgets, getUnreadAlerts, getSpentByCategory, refetch } = useSupabaseBudgets(user?.id)

  const [isBalanceVisible, setIsBalanceVisible] = useState(true)

  // 🔄 Recargar datos cuando la pantalla vuelve a estar en foco
  // Solo recarga si cambia el userId, no cada vez que cambia refetch
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        console.log('🔄 Pantalla Budget en foco - Recargando datos...')
        refetch()
      }
    }, [user?.id])
  )

  const budgetSummary = getBudgetSummary()
  const activeBudgets = getActiveBudgets()
  const unreadAlerts = getUnreadAlerts()

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444' // Rojo - peligro
    if (percentage >= 75) return '#f59e0b' // Amarillo - advertencia
    return '#10b981' // Verde - bien
  }

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: any } = {
      Alimentación: 'restaurant-outline',
      Vivienda: 'home-outline',
      Transporte: 'car-outline',
      Compras: 'bag-outline',
      Educación: 'school-outline',
      Entretenimiento: 'game-controller-outline',
      Salud: 'medical-outline',
      Salario: 'cash-outline',
      Freelance: 'briefcase-outline',
      Inversiones: 'trending-up-outline',
      Negocios: 'business-outline',
      'Otros Ingresos': 'add-circle-outline',
      Regalos: 'gift-outline',
    }
    return iconMap[categoryName] || 'ellipse-outline'
  }

  const CategoryBudgetCard = ({ category, existingBudget, onPress }: { category: SupabaseCategory; existingBudget?: SupabaseBudget; onPress: () => void }) => {
    const spent = existingBudget ? getSpentByCategory(category.id) : 0
    const percentage = existingBudget ? (spent / Number(existingBudget.amount)) * 100 : 0
    const daysRemaining = existingBudget ? Math.max(0, Math.ceil((new Date(existingBudget.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0

    // Parámetros para el círculo SVG
    const size = 64
    const radius = 28
    const center = size / 2
    const strokeWidth = 3
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference * (1 - Math.min(percentage, 100) / 100)

    return (
      <TouchableOpacity onPress={onPress} className="bg-white dark:bg-gray-800 rounded-3xl p-5 w-full border border-gray-200 dark:border-gray-700 shadow-sm" style={{ height: 200 }}>
        <View className="flex-1 justify-between">
          {/* Icono con círculo de progreso */}
          <View className="items-start mb-3 relative">
            <View className="w-16 h-16 items-center justify-center">
              {existingBudget ? (
                <Svg width={size} height={size}>
                  {/* Círculo de progreso */}
                  <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={getStatusColor(percentage)}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90, ${center}, ${center})`}
                  />
                </Svg>
              ) : null}

              {/* Fondo del círculo e icono */}
              <View className="absolute bg-gray-50 dark:bg-gray-700 rounded-full w-12 h-12 items-center justify-center shadow-sm">
                <Ionicons name={getCategoryIcon(category.name)} size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </View>
            </View>
          </View>

          {/* Nombre y estado */}
          <View className="items-start flex-1 justify-center">
            <Text className="text-gray-800 dark:text-white text-lg font-semibold mb-1 line-clamp-1">{category.name}</Text>
            {existingBudget ? (
              <>
                <Text className="text-gray-500 dark:text-gray-300 text-sm mb-2">{daysRemaining} Días Restantes</Text>
                {/* Tipo de presupuesto */}
                <View className="flex-row items-center mb-3">
                  <View className={`w-2 h-2 rounded-full mr-2`} style={{ backgroundColor: '#ef4444' }} />
                  <Text className="text-gray-500 dark:text-gray-300 text-xs capitalize">Gasto</Text>
                </View>
              </>
            ) : (
              <Text className="text-gray-500 dark:text-gray-300 text-sm mb-3">Sin configurar</Text>
            )}
          </View>

          {/* Monto */}
          <View className="items-start relative w-full">
            {existingBudget ? (
              <>
                <Text className="text-gray-800 dark:text-white text-2xl font-bold">{isBalanceVisible ? `$${spent.toLocaleString()}` : '$•••••'}</Text>
                <Text className="text-gray-500 dark:text-gray-300">De {isBalanceVisible ? `$${Number(existingBudget.amount).toLocaleString()}` : '$•••••'}</Text>
                {/* Restante */}
                <Text className="text-gray-400 dark:text-gray-400 text-xs mt-1">{isBalanceVisible ? `$${(Number(existingBudget.amount) - spent).toLocaleString()} restante` : '$••••• restante'}</Text>
              </>
            ) : (
              <>
                <Text className="text-gray-400 dark:text-gray-400 text-lg font-semibold">Sin presupuesto</Text>
                <Text className="text-gray-400 dark:text-gray-400 text-sm">Toca para configurar</Text>
              </>
            )}

            <View className="absolute right-0 bottom-1 h-2 w-2 rounded-full" style={{ backgroundColor: existingBudget ? (isBalanceVisible ? getStatusColor(percentage) : '#ccc') : '#ccc' }} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-4 text-lg">Cargando presupuestos...</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-1 justify-center items-center px-6">
            <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            <Text className="text-white text-xl font-semibold mt-4 text-center">Error al cargar presupuestos</Text>
            <Text className="text-white/60 text-center mt-2">{error}</Text>
            <TouchableOpacity onPress={() => window.location.reload()} className="bg-white/10 rounded-2xl px-6 py-3 mt-6">
              <Text className="text-white font-semibold">Reintentar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#166534] dark:bg-gray-900">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium">Presupuestos</Text>
            <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="ellipsis-horizontal" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="px-6 py-4">
            <Text className="text-white/60 text-lg">Presupuesto Disponible</Text>
            <View className="mt-2 relative">
              <Text className="text-white text-5xl font-bold">{isBalanceVisible ? `$ ${budgetSummary.remainingBudget.toLocaleString()}` : '$ ••••••'}</Text>
              <TouchableOpacity className="absolute right-0 bottom-1" onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
                <Ionicons name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'} size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Información adicional */}
            <View className="mt-4 flex-row justify-between items-center">
              <View>
                <Text className="text-white/60 text-sm">Gastado</Text>
                <Text className="text-white text-lg font-semibold">{budgetSummary.percentage.toFixed(1)}%</Text>
              </View>
              <View className="items-end">
                <View className="flex-row items-center">
                  <Ionicons name={budgetSummary.status === 'good' ? 'trending-up' : 'trending-down'} size={16} color={budgetSummary.status === 'good' ? '#4ADE80' : '#EF4444'} />
                  <Text className={`text-sm ml-1 ${budgetSummary.status === 'good' ? 'text-green-400' : 'text-red-400'}`}>{budgetSummary.status === 'good' ? 'En control' : 'Revisar'}</Text>
                </View>
                <Text className="text-white/60 text-xs">Estado actual</Text>
              </View>
            </View>
          </View>

          <View className="bg-white dark:bg-gray-800 mt-4 rounded-t-3xl px-4 pt-4 pb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-black dark:text-white text-xl font-medium">Configurar Presupuestos</Text>
              <Text className="text-gray-600 dark:text-gray-300 text-sm">Toca para editar</Text>
            </View>

            {/* Stats Cards */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-2xl p-3">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="trending-up-outline" size={16} color={isDarkMode ? '#F87171' : '#EF4444'} />
                  <Text className="text-red-700 dark:text-red-300 text-xs ml-1">Gasto Mensual</Text>
                </View>
                <Text className="text-red-800 dark:text-red-200 font-semibold">{isBalanceVisible ? `$${budgetSummary.totalSpent.toLocaleString()}` : '$•••••'}</Text>
              </View>

              <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="calendar-outline" size={16} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                  <Text className="text-blue-700 dark:text-blue-300 text-xs ml-1">Días Restantes</Text>
                </View>
                <Text className="text-blue-800 dark:text-blue-200 font-semibold">{budgetSummary.daysRemaining}</Text>
              </View>
            </View>

            {/* Insights Banner */}
            {unreadAlerts.length > 0 && (
              <View className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="warning-outline" size={20} color={isDarkMode ? '#FB923C' : '#F97316'} />
                  <Text className="text-orange-800 dark:text-orange-300 font-medium ml-2">Alertas</Text>
                </View>
                <View className="space-y-2">
                  {unreadAlerts.slice(0, 2).map((alert, index) => (
                    <View key={index} className="flex-row items-start">
                      <View className={`w-2 h-2 rounded-full mt-2 mr-3 ${alert.type === 'exceeded' ? 'bg-red-500' : alert.type === 'limit_warning' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                      <Text className="text-orange-700 dark:text-orange-200 text-sm flex-1">{alert.message}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Grid de categorías */}
            <View className="flex-row flex-wrap justify-between pb-24">
              {/* Solo categorías de tipo "expense" en grid de 2 columnas */}
              {categories
                .filter((category) => category.type === 'expense')
                .map((category) => {
                  const existingBudget = activeBudgets.find((budget) => budget.category_id === category.id)
                  return (
                    <View key={category.id} style={{ width: '48%', marginBottom: 12 }}>
                      <CategoryBudgetCard category={category} existingBudget={existingBudget} onPress={() => router.push(`/dashboard/budget/detail?categoryId=${category.id}` as any)} />
                    </View>
                  )
                })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

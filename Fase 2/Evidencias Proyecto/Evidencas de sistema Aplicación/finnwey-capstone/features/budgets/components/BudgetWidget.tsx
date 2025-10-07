import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTheme } from '@/features/shared/hooks/useTheme'
import Svg, { Circle } from 'react-native-svg'
import { useBudgets, useBudgetSummary, useBudgetAlerts } from '@/features/budgets/hooks/useBudgets'
import { useAuthStore } from '@/store/auth.store'

// Funciones helper para iconos y colores por categoría
const getCategoryIcon = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    Alimentación: '🍽️',
    Compras: '🛍️',
    Educación: '📚',
    Entretenimiento: '🎬',
    Salud: '🏥',
    Transporte: '🚗',
    Vivienda: '🏠',
  }
  return iconMap[categoryName] || '📊'
}

const getCategoryColor = (categoryName: string): string => {
  const colorMap: Record<string, string> = {
    Alimentación: '#f59e0b',
    Compras: '#8b5cf6',
    Educación: '#06b6d4',
    Entretenimiento: '#ec4899',
    Salud: '#ef4444',
    Transporte: '#3b82f6',
    Vivienda: '#10b981',
  }
  return colorMap[categoryName] || '#10b981'
}

interface ProgressCircleProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color: string
  backgroundColor?: string
}

function ProgressCircle({ percentage, size = 80, strokeWidth = 8, color, backgroundColor = '#e5e7eb' }: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Svg width={size} height={size} className="transform -rotate-90">
      {/* Círculo de fondo */}
      <Circle stroke={backgroundColor} fill="transparent" strokeWidth={strokeWidth} r={radius} cx={size / 2} cy={size / 2} />
      {/* Círculo de progreso */}
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

export default function BudgetWidget() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { user } = useAuthStore()

  // Usar los hooks de Supabase (ahora incluyen userId en query keys)
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets()
  const { data: budgetSummary, isLoading: summaryLoading } = useBudgetSummary()
  const { data: alerts = [], isLoading: alertsLoading } = useBudgetAlerts()

  // Si está cargando, mostrar skeleton
  if (budgetsLoading || summaryLoading || alertsLoading) {
    return (
      <View className={`mx-4 mb-4 p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className={`w-10 h-10 rounded-full items-center justify-center bg-gray-300`}>
              <Ionicons name="wallet-outline" size={20} color="white" />
            </View>
            <View className="ml-3">
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Presupuestos</Text>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando...</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  // Si no hay presupuestos activos, mostrar mensaje de configuración
  if (budgets.length === 0) {
    return (
      <View className={`mx-4 mb-4 p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <Ionicons name="wallet-outline" size={20} color="white" />
            </View>
            <Text className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Presupuestos</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/dashboard/budget/categories')} className={`px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
            <Text className="text-white text-sm font-medium">Configurar</Text>
          </TouchableOpacity>
        </View>

        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Configura tus presupuestos para controlar mejor tus gastos</Text>

        <View className="flex-row justify-between">
          <View className="flex-1 mr-2">
            <Text className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Gastos Necesarios</Text>
            <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>50% recomendado</Text>
          </View>
          <View className="flex-1 ml-2">
            <Text className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>Gastos Discrecionales</Text>
            <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>30% recomendado</Text>
          </View>
        </View>
      </View>
    )
  }

  // Si no hay resumen, usar valores por defecto
  const summary = budgetSummary || {
    total_budget: 0,
    total_spent: 0,
    remaining_budget: 0,
    percentage: 0,
    status: 'good' as const,
    projected_monthly_spending: 0,
    days_remaining: 0,
  }

  // Determinar color basado en el estado
  const getStatusColor = () => {
    switch (summary.status) {
      case 'good':
        return '#10b981'
      case 'warning':
        return '#f59e0b'
      case 'danger':
        return '#ef4444'
      default:
        return '#10b981'
    }
  }

  const getStatusText = () => {
    switch (summary.status) {
      case 'good':
        return 'En buen camino'
      case 'warning':
        return 'Atención requerida'
      case 'danger':
        return 'Límite excedido'
      default:
        return 'En buen camino'
    }
  }

  const statusColor = getStatusColor()
  const unreadAlerts = alerts.filter((alert) => !alert.is_acknowledged)

  return (
    <TouchableOpacity onPress={() => router.push('/dashboard/budget')} className={`mx-4 mb-4 p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`} activeOpacity={0.7}>
      {/* Header con alertas */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className={`w-10 h-10 rounded-full items-center justify-center`} style={{ backgroundColor: statusColor }}>
            <Ionicons name="wallet-outline" size={20} color="white" />
          </View>
          <View className="ml-3">
            <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Presupuestos</Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getStatusText()}</Text>
          </View>
        </View>

        <View className="flex-row items-center">
          {unreadAlerts.length > 0 && (
            <View className="bg-red-500 w-5 h-5 rounded-full items-center justify-center mr-2">
              <Text className="text-white text-xs font-bold">{unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
        </View>
      </View>

      {/* Círculo de progreso y resumen */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${summary.remaining_budget.toLocaleString('es-CL')}</Text>
            <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>restante</Text>
          </View>

          <View className="flex-row items-center mb-1">
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gastado: ${summary.total_spent.toLocaleString('es-CL')}</Text>
          </View>

          <View className="flex-row items-center">
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total: ${summary.total_budget.toLocaleString('es-CL')}</Text>
          </View>

          {/* Proyección */}
          {summary.projected_monthly_spending > summary.total_budget && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="trending-up" size={14} color="#f59e0b" />
              <Text className="text-xs text-amber-500 ml-1">Proyección: ${Math.round(summary.projected_monthly_spending).toLocaleString('es-CL')}</Text>
            </View>
          )}
        </View>

        {/* Círculo de progreso */}
        <View className="relative items-center justify-center">
          <ProgressCircle percentage={Math.min(summary.percentage, 100)} size={80} strokeWidth={8} color={statusColor} backgroundColor={isDarkMode ? '#374151' : '#e5e7eb'} />
          <View className="absolute items-center justify-center">
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{Math.round(summary.percentage)}%</Text>
            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>usado</Text>
          </View>
        </View>
      </View>

      {/* Categorías más gastadas (solo mostrar si hay espacio) */}
      {budgets.length > 0 && (
        <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Categorías principales</Text>
          <View className="flex-row justify-between">
            {budgets.slice(0, 3).map((budget, index) => {
              const percentage = (budget.spent_amount / budget.amount) * 100
              return (
                <View key={budget.id} className="flex-1 items-center" style={{ marginHorizontal: index === 1 ? 8 : 0 }}>
                  <Text className="text-lg mb-1">{getCategoryIcon(budget.category_name)}</Text>
                  <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center`} numberOfLines={1}>
                    {budget.category_name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View
                      className="h-1 rounded-full mr-1"
                      style={{
                        width: 30,
                        backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
                      }}
                    >
                      <View
                        className="h-1 rounded-full"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: percentage > 100 ? '#ef4444' : getCategoryColor(budget.category_name),
                        }}
                      />
                    </View>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{Math.round(percentage)}%</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {/* Indicador de días restantes */}
      <View className="mt-3 flex-row items-center justify-center">
        <Ionicons name="calendar-outline" size={14} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
        <Text className={`text-xs ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{budgetSummary?.days_remaining} días restantes en el período</Text>
      </View>
    </TouchableOpacity>
  )
}

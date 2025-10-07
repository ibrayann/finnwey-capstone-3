import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import Svg, { Circle } from 'react-native-svg'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useBudgetStore } from '@/store/budget.store'
import { BUDGET_CATEGORIES, Budget, BUDGET_PERIODS, BudgetPeriod } from '@/types/budget'
import BudgetDetailTabs from '@/features/budgets/components/BudgetDetailTabs'
import { budgetService } from '@/features/budgets/services/budget.service'
import { useAuthStore } from '@/store/auth.store'
import { useExpenseCategories } from '@/features/shared/hooks/useCategories'
import { invalidateQueries } from '@/lib/query-client'
import { useSupabaseBudgets } from '@/features/budgets/hooks/useSupabaseBudgets'

interface Category {
  id: string
  name: string
  type: string
  description?: string
}

export default function BudgetDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>()

  // Debug: verificar qué está llegando
  console.log('CategoryId recibido:', categoryId)

  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [showOptions, setShowOptions] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const { isDarkMode } = useTheme()
  const { getActiveBudgets } = useBudgetStore()
  const { user } = useAuthStore()

  // Estados para el modal de presupuesto
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [category, setCategory] = useState<Category | null>(null)
  const [existingBudget, setExistingBudget] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 🔥 Usar el hook de Supabase que ya carga presupuestos y transacciones
  const { budgets, transactions: allTransactions, loading: budgetsLoading, getBudgetByCategory, getSpentByCategory, refetch } = useSupabaseBudgets(user?.id)

  // Usar el hook para cargar categorías de gastos
  const { data: categoriesData, isLoading: categoriesLoading } = useExpenseCategories()

  // Encontrar la categoría específica por ID
  const supabaseCategory = categoriesData?.find((cat) => cat.id === categoryId) || null

  // Obtener el presupuesto de esta categoría
  const supabaseBudget = getBudgetByCategory(categoryId || '')

  // Filtrar transacciones por esta categoría
  const categoryTransactions = allTransactions.filter((t) => t.category_id === categoryId && t.categories?.type === 'expense')

  // Recargar datos cuando cambie el categoryId o userId
  useEffect(() => {
    if (user?.id) {
      refetch()
    }
  }, [categoryId, user?.id])

  // Mapear transacciones al formato esperado por el componente
  const transactions = categoryTransactions.map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    description: t.merchant_name || t.description || 'Sin descripción',
    date: new Date(t.transaction_date),
    type: (t.transaction_type?.name?.toLowerCase() === 'income' ? 'income' : 'expense') as 'expense' | 'income',
  }))

  const [insights] = useState([
    {
      id: '1',
      type: 'warning' as const,
      message: 'Has gastado el 75% de tu presupuesto esta semana',
      priority: 'high' as const,
    },
    {
      id: '2',
      type: 'tip' as const,
      message: 'Considera reducir gastos en restaurantes para mantener tu presupuesto',
      priority: 'medium' as const,
    },
    {
      id: '3',
      type: 'achievement' as const,
      message: '¡Excelente! Has mantenido tu presupuesto por 3 semanas consecutivas',
      priority: 'low' as const,
    },
  ])

  // Función para cargar datos del presupuesto cuando se abre el modal
  const loadBudgetDataForModal = async () => {
    if (!supabaseCategory) return

    try {
      setIsLoading(true)
      setCategory(supabaseCategory)

      // Usar los datos ya cargados de Supabase
      if (supabaseBudget) {
        setExistingBudget(supabaseBudget)
        setBudgetAmount(supabaseBudget.amount.toString())
        setSelectedPeriod(supabaseBudget.period_type as 'weekly' | 'biweekly' | 'monthly')
        setIsEditing(true)
      } else {
        setIsEditing(false)
        setExistingBudget(null)
        setBudgetAmount('')
        setSelectedPeriod('monthly')
      }
    } catch (error) {
      console.error('Error loading budget data:', error)
      Alert.alert('Error', 'No se pudo cargar la información del presupuesto')
    } finally {
      setIsLoading(false)
    }
  }

  // Función para guardar el presupuesto
  const handleSaveBudget = async () => {
    if (!budgetAmount.trim()) {
      Alert.alert('Error', 'Por favor define el monto del presupuesto')
      return
    }

    const amount = parseFloat(budgetAmount.replace(/[^0-9.]/g, ''))
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'El monto debe ser un número mayor a 0')
      return
    }

    if (!category) {
      Alert.alert('Error', 'Categoría no válida')
      return
    }

    if (!user?.id) {
      Alert.alert('Error', 'Usuario no autenticado')
      return
    }

    try {
      const { startDate, endDate } = budgetService.getBudgetPeriodDates(selectedPeriod)

      if (isEditing && existingBudget) {
        await budgetService.updateBudget(existingBudget.id, {
          amount: amount,
          period_type: selectedPeriod,
          start_date: startDate,
          end_date: endDate,
        })
        // Recargar los datos del presupuesto e invalidar cache
        await refetch()
        invalidateQueries.budget() // Invalidar lista de presupuestos
        setShowEditModal(false)
        Alert.alert('Éxito', `Presupuesto actualizado para ${category.name}`)
      } else {
        await budgetService.createBudget(
          {
            name: `Presupuesto ${category.name}`,
            description: `Presupuesto para ${category.name}`,
            category_id: category.id,
            amount: amount,
            period_type: selectedPeriod,
            start_date: startDate,
            end_date: endDate,
          },
          user.id
        )
        // Recargar los datos del presupuesto e invalidar cache
        await refetch()
        invalidateQueries.budget() // Invalidar lista de presupuestos
        setShowEditModal(false)
        Alert.alert('Éxito', `Presupuesto creado para ${category.name}`)
      }
    } catch (error) {
      console.error('Error saving budget:', error)
      const errorMessage = error instanceof Error ? error.message : 'No se pudo guardar el presupuesto'
      Alert.alert('Error', errorMessage)
    }
  }

  // Componente para las tarjetas de período
  const PeriodCard = ({ period }: { period: (typeof BUDGET_PERIODS)[0] }) => {
    const isSelected = selectedPeriod === period.value
    return (
      <TouchableOpacity
        onPress={() => setSelectedPeriod(period.value)}
        className={`flex-1 p-4 rounded-2xl border-2 ${isSelected ? 'border-[#166534] bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
      >
        <View className="items-center">
          {isSelected && (
            <View className="absolute -top-2 -right-2 w-6 h-6 bg-[#166534] rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={14} color="white" />
            </View>
          )}
          <Text className={`font-bold text-base mb-1 ${isSelected ? 'text-[#166534] dark:text-green-400' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>{period.label}</Text>
          <Text className={`text-xs ${isSelected ? 'text-[#166534] dark:text-green-400' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{period.days} días</Text>
        </View>
      </TouchableOpacity>
    )
  }

  if (categoriesLoading || budgetsLoading) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium">Cargando...</Text>
            <View className="w-12 h-12" />
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 mt-4 rounded-t-3xl px-4 pt-4 items-center justify-center">
            <Text className="text-gray-800 dark:text-white text-center mt-8">Cargando información...</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  if (!supabaseCategory) {
    return (
      <View className="flex-1 bg-[#166534] dark:bg-gray-900">
        <SafeAreaView edges={['top']} className="flex-1">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-medium">Detalle del Presupuesto</Text>
            <View className="w-12 h-12" />
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 mt-4 rounded-t-3xl px-4 pt-4">
            <Text className="text-gray-800 dark:text-white text-center mt-8">Categoría no encontrada</Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  // Calcular el gasto usando el método del hook
  const spentAmount = categoryId ? getSpentByCategory(categoryId) : 0
  const percentage = supabaseBudget ? (spentAmount / supabaseBudget.amount) * 100 : 0
  const daysRemaining = supabaseBudget ? Math.max(0, Math.ceil((new Date(supabaseBudget.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444' // Rojo - peligro
    if (percentage >= 75) return '#f59e0b' // Amarillo - advertencia
    return '#10b981' // Verde - bien
  }

  return (
    <View className="flex-1 bg-[#166534] dark:bg-gray-900">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-1">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-medium">Detalle del Presupuesto</Text>
            <View>
              <TouchableOpacity onPress={() => setShowOptions(true)} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                <Ionicons name="ellipsis-horizontal" size={20} color="white" />
              </TouchableOpacity>

              <Modal visible={showOptions} transparent={true} animationType="fade" onRequestClose={() => setShowOptions(false)}>
                <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setShowOptions(false)}>
                  <View className={`absolute top-20 right-4 rounded-xl shadow-lg py-2 w-52 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      onPress={() => {
                        setShowOptions(false)
                        setShowEditModal(true)
                      }}
                    >
                      <Ionicons name="create-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Editar presupuesto</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      onPress={() => {
                        setShowOptions(false)
                        // TODO: Implementar agregar transacción
                        console.log('Add transaction')
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Agregar transacción</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center px-4 py-3"
                      onPress={() => {
                        setShowOptions(false)
                        // TODO: Implementar exportar datos
                        console.log('Export data')
                      }}
                    >
                      <Ionicons name="download-outline" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Exportar datos</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
          </View>

          {/* Información del presupuesto */}
          <View className="px-6 py-2">
            <View className="items-center">
              {/* Icono con círculo de progreso */}
              <View className="w-24 h-24 items-center justify-center mb-4">
                <Svg width="100%" height="100%" viewBox="0 0 128 128">
                  {/* Círculo de progreso */}
                  <Circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={getStatusColor(percentage)}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - Math.min(percentage, 100) / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 64 64)"
                  />
                </Svg>
                {/* Fondo del círculo e icono */}
                <View className="absolute bg-white dark:bg-gray-700 rounded-full w-18 h-18 items-center justify-center shadow-sm">
                  <Ionicons name="wallet-outline" size={36} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </View>
              </View>

              {/* Nombre de la categoría */}
              <Text className="text-white text-2xl font-bold text-center mb-1">{supabaseCategory.name}</Text>
              <Text className="text-white/60 text-base text-center mb-4">{supabaseBudget ? `${daysRemaining} Días Restantes` : 'Sin presupuesto configurado'}</Text>
            </View>
          </View>

          {/* Contenido principal con tabs */}
          <View className="bg-white dark:bg-gray-800 mt-2 rounded-t-3xl min-h-screen">
            <BudgetDetailTabs
              budget={supabaseBudget as any}
              category={supabaseCategory as any}
              transactions={transactions}
              insights={insights}
              isBalanceVisible={isBalanceVisible}
              onToggleBalance={() => setIsBalanceVisible(!isBalanceVisible)}
              onConfigureBudget={() => {
                loadBudgetDataForModal()
                setShowEditModal(true)
              }}
            />
          </View>
        </ScrollView>

        {/* Modal de configuración de presupuesto */}
        <Modal visible={showEditModal} transparent={true} animationType="slide" onRequestClose={() => setShowEditModal(false)}>
          <View className="flex-1 bg-black/60 justify-end">
            <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl max-h-[85%]`}>
              {/* Header del modal con gradiente */}
              <View className={`${isDarkMode ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-[#166534] to-emerald-600'} rounded-t-3xl px-6 py-6`}>
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-white text-2xl font-bold mb-1">{isEditing ? 'Editar Presupuesto' : 'Crear Presupuesto'}</Text>
                    <Text className="text-white/80 text-sm">Establece tu límite de gasto</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowEditModal(false)} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {isLoading ? (
                <View className="py-12 items-center">
                  <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando información...</Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} className="px-6 pt-4">
                  {/* Información de la categoría */}
                  {category && (
                    <View className={`mb-5 p-4 rounded-2xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-green-50 border-[#166534]'}`}>
                      <View className="flex-row items-center">
                        <View
                          className="w-12 h-12 bg-[#166534] dark:bg-green-600 rounded-xl items-center justify-center mr-3 "
                          style={{ shadowColor: '#166534', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }}
                        >
                          <Ionicons name={isEditing ? 'checkmark-circle' : 'add-circle'} size={24} color="white" />
                        </View>
                        <View className="flex-1">
                          <Text className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{category.name}</Text>
                          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>{isEditing ? 'Actualizando presupuesto' : 'Configuración nueva'}</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Estado actual con diseño mejorado */}
                  {existingBudget && (
                    <View className={`mb-5 p-5 rounded-2xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                      <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 bg-[#166534] dark:bg-green-600 rounded-xl items-center justify-center mr-3">
                          <Ionicons name="analytics" size={20} color="white" />
                        </View>
                        <Text className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Estado Actual</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <View className="items-center flex-1">
                          <Text className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gastado</Text>
                          <Text className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>${spentAmount.toLocaleString()}</Text>
                        </View>
                        <View className="w-px bg-gray-300 dark:bg-gray-600" />
                        <View className="items-center flex-1">
                          <Text className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Límite</Text>
                          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${existingBudget.amount?.toLocaleString() || '0'}</Text>
                        </View>
                        <View className="w-px bg-gray-300 dark:bg-gray-600" />
                        <View className="items-center flex-1">
                          <Text className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Usado</Text>
                          <Text className={`text-xl font-bold text-[#166534] dark:text-green-400`}>{percentage.toFixed(0)}%</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Información de ayuda para nuevos presupuestos */}
                  {!existingBudget && (
                    <View className={`mb-5 p-4 rounded-2xl border-2 ${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300'}`}>
                      <View className="flex-row items-start">
                        <View className="w-10 h-10 bg-[#166534] dark:bg-green-600 rounded-xl items-center justify-center mr-3 mt-0.5">
                          <Ionicons name="bulb" size={20} color="white" />
                        </View>
                        <View className="flex-1">
                          <Text className={`font-bold mb-1 ${isDarkMode ? 'text-green-300' : 'text-[#166534]'}`}>Consejo</Text>
                          <Text className={`text-sm leading-5 ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
                            Establece un límite realista para {category?.name}. Recibirás alertas cuando te acerques al 75% y 90% del límite.
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Monto con mejor diseño */}
                  <View className="mb-5">
                    <Text className={`text-base font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{isEditing ? '💰 Nuevo Monto' : '💰 Monto del Presupuesto'}</Text>
                    <View className={`flex-row items-center p-4 rounded-2xl border-2 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                      <Text className={`text-2xl font-bold mr-2 ${isDarkMode ? 'text-green-400' : 'text-[#166534]'}`}>$</Text>
                      <TextInput
                        value={budgetAmount}
                        onChangeText={setBudgetAmount}
                        placeholder={isEditing ? 'Nuevo monto...' : 'Ej: 150000'}
                        placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                        keyboardType="numeric"
                        className={`flex-1 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      />
                    </View>
                    <Text className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>💡 Ingresa solo números sin puntos ni comas</Text>
                  </View>

                  {/* Período con diseño mejorado - Grid horizontal */}
                  <View className="mb-6">
                    <Text className={`text-base font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📅 Período</Text>
                    <View className="flex-row gap-3">
                      {BUDGET_PERIODS.map((period) => (
                        <PeriodCard key={period.value} period={period} />
                      ))}
                    </View>
                  </View>
                </ScrollView>
              )}

              {/* Botón de guardar - Abajo fijo */}
              <View className={`px-6 py-5 border-t-2 mb-5 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                <TouchableOpacity
                  onPress={handleSaveBudget}
                  className="bg-[#166534] dark:bg-green-600 rounded-2xl py-5 items-center"
                  style={{
                    shadowColor: '#166534',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <View className="flex-row items-center">
                    <Ionicons name={isEditing ? 'checkmark-circle' : 'add-circle'} size={26} color="white" style={{ marginRight: 10 }} />
                    <Text className="text-white text-lg font-bold">{isEditing ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  )
}

import { View, Text, ScrollView, Pressable, TextInput, FlatList, Modal, Alert, Image, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState, useMemo, useEffect } from 'react'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useTransactions, Transaction } from '@/hooks/queries/useTransactions'
import { useAllCategories } from '@/features/shared'
import { useAuthStore } from '@/store/auth.store'

export default function AllTransactionsScreen() {
  const { isDarkMode } = useTheme()
  const { user } = useAuthStore()

  // Estados para filtro de fecha (NO USADOS - eliminados para mostrar todas las transacciones)
  // const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  // const [selectedYear] = useState(new Date().getFullYear())

  // ✅ SEGURIDAD: Usar React Query con filtro por userId
  const {
    data: allTransactions = [],
    isLoading,
    error,
    refetch,
    isFetching,
    isRefetching,
  } = useTransactions({
    includeRelations: true,
    userId: user?.id, // ✅ Filtrar por usuario actual
  })

  // Obtener categorías dinámicamente desde Supabase
  const { data: categories = [], isLoading: isLoadingCategories } = useAllCategories()

  // Estados existentes
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const [showDatePicker, setShowDatePicker] = useState(false)

  // Estados temporales para filtros (NO USADOS - eliminados para mostrar todas las transacciones)
  // const [tempMonth, setTempMonth] = useState(new Date().getMonth())
  // const [tempYear, setTempYear] = useState(new Date().getFullYear())

  // Obtener años únicos de las transacciones
  const availableYears = useMemo(() => {
    const years = new Set(allTransactions.map((t) => new Date(t.transaction_date).getFullYear()))
    const currentYear = new Date().getFullYear()
    years.add(currentYear)
    return Array.from(years).sort((a, b) => b - a)
  }, [allTransactions])

  // Nombres de meses en español
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  // Filtrar y ordenar transacciones
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions

    // Aplicar filtro de tipo
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((t) => t.transaction_type?.name === selectedFilter)
    }

    // Aplicar búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (t) =>
          t.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Aplicar ordenamiento
    if (sortBy === 'date') {
      filtered = [...filtered].sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    } else {
      filtered = [...filtered].sort((a, b) => b.amount - a.amount)
    }

    return filtered
  }, [allTransactions, selectedFilter, searchQuery, sortBy])

  const renderTransaction = ({ item: transaction, index }: { item: Transaction; index: number }) => {
    if (viewMode === 'grid') {
      return (
        <Pressable
          className={`flex-1 p-4 rounded-2xl mx-1 mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
          onPress={() => {
            setSelectedTransaction(transaction)
            setShowTransactionModal(true)
          }}
        >
          <View className="items-center">
            <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <Text className="text-2xl">💰</Text>
            </View>
            <Text className={`text-sm font-medium text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`} numberOfLines={2} ellipsizeMode="tail">
              {transaction.merchant_name || transaction.description || 'Transacción'}
            </Text>
            <Text className={`text-lg font-semibold mt-1 ${transaction.transaction_type?.name === 'expense' ? 'text-red-500' : 'text-[#4CAF50] dark:text-green-400'}`}>
              {transaction.transaction_type?.name === 'expense' ? '-' : '+'}${transaction.amount.toLocaleString('es-CL')}
            </Text>
            <Text className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
              {new Date(transaction.transaction_date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
        </Pressable>
      )
    }

    return (
      <Pressable
        key={transaction.id}
        className={`flex-row items-center py-4 px-4 rounded-2xl mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
        onPress={() => {
          setSelectedTransaction(transaction)
          setShowTransactionModal(true)
        }}
      >
        <View className="flex-row items-center gap-3 flex-1 min-w-0">
          <View className={`w-12 h-12 rounded-full items-center justify-center overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex-shrink-0`}>
            <Text className="text-2xl">💰</Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`} numberOfLines={1} ellipsizeMode="tail">
              {transaction.merchant_name || transaction.description || 'Transacción'}
            </Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} numberOfLines={1} ellipsizeMode="tail">
              {transaction.description}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {new Date(transaction.transaction_date).toLocaleDateString('es-CL', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
              {transaction.source === 'ocr' && (
                <View className="ml-2 bg-green-500/20 px-2 py-1 rounded-full">
                  <Text className="text-green-700 dark:text-green-400 text-xs">📄</Text>
                </View>
              )}
              {transaction.is_recurring && (
                <View className="ml-2 bg-blue-500/20 px-2 py-1 rounded-full">
                  <Text className="text-green-700 dark:text-green-400 text-xs">🔄</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View className="flex-shrink-0 ml-3">
          <Text className={`text-lg font-semibold text-right ${transaction.transaction_type?.name === 'expense' ? 'text-red-500' : 'text-[#4CAF50] dark:text-green-400'}`}>
            {transaction.transaction_type?.name === 'expense' ? '-' : '+'}${transaction.amount.toLocaleString('es-CL')}
          </Text>
          <Text className={`text-xs text-right ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{transaction.transaction_type?.name === 'expense' ? 'Gasto' : 'Ingreso'}</Text>
          <View className="flex-row items-center justify-end mt-1">
            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{transaction.category?.name || 'Sin categoría'}</Text>
          </View>
        </View>
      </Pressable>
    )
  }

  const FilterButton = ({ title, value, isActive }: { title: string; value: 'all' | 'income' | 'expense'; isActive: boolean }) => (
    <Pressable className={`px-4 py-2 rounded-full ${isActive ? (isDarkMode ? 'bg-green-600' : 'bg-green-500') : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} onPress={() => setSelectedFilter(value)}>
      <Text className={`text-sm font-medium ${isActive ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</Text>
    </Pressable>
  )

  const SortButton = ({ title, value, isActive }: { title: string; value: 'date' | 'amount'; isActive: boolean }) => (
    <Pressable className={`px-3 py-1 rounded-full ${isActive ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-500') : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} onPress={() => setSortBy(value)}>
      <Text className={`text-xs font-medium ${isActive ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{title}</Text>
    </Pressable>
  )

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        edges={['top']}
        style={{
          flex: 0,
          backgroundColor: isDarkMode ? '#14532d' : '#166534',
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? '#16a34a' : '#fff',
        }}
      >
        {/* Header */}
        <View className={`px-5 pt-4 pb-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <View className="flex-row items-center justify-between mb-6">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
            </Pressable>
            <View className="items-center">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Todas las Transacciones</Text>
              <View className="flex-row items-center">
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{allTransactions.length} transacciones</Text>
                {isFetching && !isLoading && (
                  <View className="ml-2">
                    <ActivityIndicator size="small" color={isDarkMode ? '#4CAF50' : '#4CAF50'} />
                  </View>
                )}
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => refetch()} className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} disabled={isRefetching}>
                <Ionicons name={isRefetching ? 'refresh' : 'refresh-outline'} size={20} color={isDarkMode ? '#fff' : '#000'} />
              </Pressable>
              <Pressable
                onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                <Ionicons name={viewMode === 'list' ? 'grid-outline' : 'list-outline'} size={20} color={isDarkMode ? '#fff' : '#000'} />
              </Pressable>
              <Pressable
                onPress={() => {
                  // Sincronizar valores temporales con los actuales al abrir filtros
                  // setTempMonth(selectedMonth)
                  // setTempYear(selectedYear)
                  setShowFilterModal(true)
                }}
                className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                <Ionicons name="filter-outline" size={20} color={isDarkMode ? '#fff' : '#000'} />
              </Pressable>
            </View>
          </View>

          {/* Barra de búsqueda */}
          <View className={`flex-row items-center px-4 py-3 rounded-2xl mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <Ionicons name="search" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <TextInput
              className={`flex-1 ml-3 text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              placeholder="Buscar transacciones..."
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              </Pressable>
            )}
          </View>

          {/* Filtros */}
          <View className="flex-row gap-3 mb-4">
            <FilterButton title="Todas" value="all" isActive={selectedFilter === 'all'} />
            <FilterButton title="Ingresos" value="income" isActive={selectedFilter === 'income'} />
            <FilterButton title="Gastos" value="expense" isActive={selectedFilter === 'expense'} />
          </View>

          {/* Ordenamiento */}
          <View className="flex-row gap-2">
            <SortButton title="Por fecha" value="date" isActive={sortBy === 'date'} />
            <SortButton title="Por monto" value="amount" isActive={sortBy === 'amount'} />
          </View>
        </View>

        {/* Lista de transacciones */}
        <View className={`flex-1 px-5 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color={isDarkMode ? '#4CAF50' : '#4CAF50'} />
              <Text className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cargando transacciones...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="alert-circle-outline" size={64} color={isDarkMode ? '#ef4444' : '#dc2626'} />
              <Text className={`text-lg font-medium mt-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>Error al cargar transacciones</Text>
              <Text className={`text-sm text-center mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{error instanceof Error ? error.message : 'Ocurrió un error inesperado'}</Text>
              <Pressable onPress={() => refetch()} className={`mt-4 px-6 py-3 rounded-xl ${isDarkMode ? 'bg-red-600' : 'bg-red-500'}`}>
                <Text className="text-white font-medium">Reintentar</Text>
              </Pressable>
            </View>
          ) : filteredTransactions.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="receipt-outline" size={64} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
              <Text className={`text-lg font-medium mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{searchQuery.trim() ? 'No se encontraron transacciones' : 'No hay transacciones'}</Text>
              <Text className={`text-sm text-center mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {searchQuery.trim() ? 'Intenta con otros términos de búsqueda' : 'Agrega tu primera transacción para comenzar'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredTransactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 150 }}
              numColumns={viewMode === 'grid' ? 2 : 1}
              key={viewMode}
            />
          )}
        </View>
      </View>

      {/* Modal de Filtros Avanzados */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl p-6`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Filtros Avanzados</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </Pressable>
            </View>

            <View className="space-y-6">
              {/* Selector de Período */}
              <View>
                <Text className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Período</Text>
                <Pressable
                  onPress={() => {
                    setShowFilterModal(false)
                    setTimeout(() => setShowDatePicker(true), 100)
                  }}
                  className={`flex-row items-center justify-between p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#4CAF50' : '#4CAF50'} />
                    <Text className={`ml-3 text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {/* {monthNames[tempMonth]} {tempYear} */}
                      Todas las fechas
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                </Pressable>
              </View>

              <View>
                <Text className={`text-lg font-semibold mt-4 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Categorías</Text>
                <View className="flex-row flex-wrap gap-3">
                  {isLoadingCategories ? (
                    <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cargando categorías...</Text>
                  ) : (
                    categories.map((category) => (
                      <Pressable key={category.id} className={`px-3 py-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <View className="flex-row items-center">
                          <Text className="text-sm mr-1">{category.icon || '💰'}</Text>
                          <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{category.name}</Text>
                        </View>
                      </Pressable>
                    ))
                  )}
                </View>
              </View>

              <View>
                <Text className={`text-lg mt-5 font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Estado de Boleta</Text>
                <View className="flex-row gap-3">
                  <Pressable className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Con Boleta</Text>
                  </Pressable>
                  <Pressable className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sin Boleta</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                className="bg-green-500 rounded-xl py-4 mt-8 mb-5"
                onPress={() => {
                  // Aplicar los filtros temporales a los reales
                  // setSelectedMonth(tempMonth)
                  // setSelectedYear(tempYear)
                  setShowFilterModal(false)
                }}
              >
                <Text className="text-white text-center text-lg font-semibold">Aplicar Filtros</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Vista Rápida de Transacción */}
      <Modal visible={showTransactionModal} transparent animationType="slide" onRequestClose={() => setShowTransactionModal(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl p-6 max-h-[80%]`}>
            {selectedTransaction && (
              <>
                <View className="flex-row items-center justify-between mb-6">
                  <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Vista Rápida</Text>
                  <Pressable onPress={() => setShowTransactionModal(false)}>
                    <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="space-y-4">
                    <View className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {selectedTransaction.merchant_name || selectedTransaction.description || 'Transacción'}
                      </Text>
                      <Text className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedTransaction.description}</Text>
                      <Text className={`text-3xl font-bold mt-2 ${selectedTransaction.transaction_type?.name === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                        {selectedTransaction.transaction_type?.name === 'expense' ? '-' : '+'}${selectedTransaction.amount.toLocaleString('es-CL')}
                      </Text>
                    </View>

                    <View className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <Text className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Detalles</Text>
                      <View className="space-y-2">
                        <View className="flex-row justify-between">
                          <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Categoría:</Text>
                          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{selectedTransaction.category?.name || 'Sin categoría'}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subcategoría:</Text>
                          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{selectedTransaction.subcategory?.name || 'Sin subcategoría'}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fecha:</Text>
                          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{new Date(selectedTransaction.transaction_date).toLocaleDateString('es-CL')}</Text>
                        </View>
                      </View>
                    </View>

                    {selectedTransaction.notes && (
                      <View className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <Text className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Notas</Text>
                        <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedTransaction.notes}</Text>
                      </View>
                    )}

                    <View className="flex-row gap-3 mt-6">
                      <Pressable className="flex-1 bg-gray-500 rounded-xl py-4" onPress={() => setShowTransactionModal(false)}>
                        <Text className="text-white text-center font-semibold">Cerrar</Text>
                      </Pressable>
                      <Pressable
                        className="flex-1 bg-green-500 rounded-xl py-4"
                        onPress={() => {
                          setShowTransactionModal(false)
                          router.push(`/(protected)/(tabs)/dashboard/transactions/${selectedTransaction.id}`)
                        }}
                      >
                        <Text className="text-white text-center font-semibold">Ver Detalle</Text>
                      </Pressable>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Selector de Fecha */}
      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl p-6`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Seleccionar Período</Text>
              <Pressable onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {/* Selector de Año */}
              <View className="mb-6">
                <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Año</Text>
                <View className="flex-row flex-wrap gap-3">
                  {availableYears.map((year) => (
                    <Pressable
                      key={year}
                      onPress={() => {
                        /* setTempYear(year) */
                      }}
                      className={`px-4 py-2 rounded-full ${/* tempYear === year ? */ false ? 'bg-[#4CAF50]' : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      <Text className={`text-sm font-medium ${/* tempYear === year ? */ false ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{year}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Selector de Mes */}
              <View className="mb-6">
                <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Mes</Text>
                <View className="flex-row flex-wrap gap-3">
                  {monthNames.map((month, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        /* setTempMonth(index) */
                      }}
                      className={`px-4 py-2 rounded-full ${/* tempMonth === index ? */ false ? 'bg-[#4CAF50]' : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      <Text className={`text-sm font-medium ${/* tempMonth === index ? */ false ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{month}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Botones de acción rápida */}
              <View className="mb-6">
                <Text className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Acceso Rápido</Text>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => {
                      // const now = new Date()
                      // setTempMonth(now.getMonth())
                      // setTempYear(now.getFullYear())
                      setShowDatePicker(false)
                      setTimeout(() => setShowFilterModal(true), 100)
                    }}
                    className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}
                  >
                    <Text className="text-white text-sm font-medium">Este Mes</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      // const lastMonth = new Date()
                      // lastMonth.setMonth(lastMonth.getMonth() - 1)
                      // setTempMonth(lastMonth.getMonth())
                      // setTempYear(lastMonth.getFullYear())
                      setShowDatePicker(false)
                      setTimeout(() => setShowFilterModal(true), 100)
                    }}
                    className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-purple-600' : 'bg-purple-500'}`}
                  >
                    <Text className="text-white text-sm font-medium">Mes Anterior</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            <Pressable
              className="bg-[#4CAF50] rounded-xl py-4 mt-4"
              onPress={() => {
                setShowDatePicker(false)
                setTimeout(() => setShowFilterModal(true), 100)
              }}
            >
              <Text className="text-white text-center text-lg font-semibold">Confirmar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}

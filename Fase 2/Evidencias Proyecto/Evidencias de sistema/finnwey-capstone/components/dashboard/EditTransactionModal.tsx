import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Platform, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { Transaction, useUpdateTransaction } from '@/hooks/queries/useTransactions'
import { CategoryService } from '@/features/shared'

interface EditTransactionModalProps {
  visible: boolean
  onClose: () => void
  transaction: Transaction
  onSuccess?: () => void
}

export default function EditTransactionModal({ visible, onClose, transaction, onSuccess }: EditTransactionModalProps) {
  const { isDarkMode } = useTheme()
  const updateTransactionMutation = useUpdateTransaction()

  // Estados del formulario
  const [amount, setAmount] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Estados de categorías
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])

  // Cargar datos iniciales de la transacción
  useEffect(() => {
    if (transaction && visible) {
      setAmount(transaction.amount.toString())
      setMerchantName(transaction.merchant_name || '')
      setDescription(transaction.description || '')
      setSelectedCategory(transaction.category_id || '')
      setSelectedSubcategory(transaction.subcategory_id || '')
      setDate(new Date(transaction.transaction_date))
      setNotes(transaction.notes || '')
    }
  }, [transaction, visible])

  // Cargar categorías
  useEffect(() => {
    if (visible) {
      loadCategories()
    }
  }, [visible])

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory)
    } else {
      setSubcategories([])
    }
  }, [selectedCategory])

  const loadCategories = async () => {
    try {
      const transactionType = transaction.transaction_type?.name || 'expense'
      const fetchedCategories = transactionType === 'income' ? await CategoryService.getIncomeCategories() : await CategoryService.getExpenseCategories()
      setCategories(fetchedCategories)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      Alert.alert('Error', 'No se pudieron cargar las categorías')
    }
  }

  const loadSubcategories = async (categoryId: string) => {
    try {
      const fetchedSubcategories = await CategoryService.getSubcategoriesByCategory(categoryId)
      setSubcategories(fetchedSubcategories)
    } catch (error) {
      console.error('Error al cargar subcategorías:', error)
      setSubcategories([])
    }
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      const newDate = new Date(date)
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      setDate(newDate)
    }
  }

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false)
    if (selectedTime) {
      const newDate = new Date(date)
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes())
      setDate(newDate)
    }
  }

  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido')
      return false
    }
    if (!merchantName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del comercio')
      return false
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Por favor selecciona una categoría')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await updateTransactionMutation.mutateAsync({
        id: transaction.id,
        amount: parseFloat(amount),
        merchant_name: merchantName,
        description: description || merchantName,
        category_id: selectedCategory,
        subcategory_id: selectedSubcategory || undefined,
        transaction_date: date.toISOString(),
        notes: notes || undefined,
      })

      Alert.alert('Éxito', 'Transacción actualizada correctamente', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess?.()
            onClose()
          },
        },
      ])
    } catch (error: any) {
      console.error('Error al actualizar transacción:', error)
      Alert.alert('Error', error.message || 'No se pudo actualizar la transacción')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.name || 'Seleccionar'
  }

  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find((sub) => sub.id === subcategoryId)
    return subcategory?.name || 'Seleccionar'
  }

  const transactionType = transaction.transaction_type?.name || 'expense'
  const isExpense = transactionType === 'expense'

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl max-h-[85%]`}>
          {/* Header del modal con gradiente */}
          <View className={`${isExpense ? 'bg-red-500' : 'bg-green-500'} rounded-t-3xl px-6 py-6`}>
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold mb-1">Editar Transacción</Text>
                <Text className="text-white/80 text-sm">Modifica los datos de tu {isExpense ? 'gasto' : 'ingreso'}</Text>
              </View>
              <TouchableOpacity onPress={onClose} disabled={isLoading} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView className="px-6 py-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Tipo de transacción - Solo lectura */}
            <View className="mb-6">
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tipo de Transacción</Text>
              <View className={`p-4 rounded-2xl ${isExpense ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                <View className="flex-row items-center">
                  <View className={`p-2 rounded-full ${isExpense ? 'bg-red-500' : 'bg-green-500'} mr-3`}>
                    <Ionicons name={isExpense ? 'trending-down' : 'trending-up'} size={20} color="white" />
                  </View>
                  <Text className={`font-semibold ${isExpense ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{isExpense ? 'Gasto' : 'Ingreso'}</Text>
                </View>
              </View>
              <Text className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>El tipo de transacción no se puede modificar</Text>
            </View>

            {/* Monto */}
            <View className="mb-6">
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monto *</Text>
              <View className={`flex-row items-center px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <Text className={`text-2xl font-bold mr-2 ${isExpense ? 'text-red-500' : 'text-green-500'}`}>$</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                  keyboardType="numeric"
                  className={`flex-1 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Comercio */}
            <View className="mb-6">
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Comercio/Título *</Text>
              <View className={`flex-row items-center px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <Ionicons name="business-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                <TextInput
                  value={merchantName}
                  onChangeText={setMerchantName}
                  placeholder="Ej: Supermercado Líder"
                  placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                  className={`flex-1 ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Descripción */}
            <View className="mb-6">
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Descripción</Text>
              <View className={`flex-row items-center px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <Ionicons name="document-text-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ej: Compras del mes"
                  placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                  className={`flex-1 ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Categoría */}
            <View className="mb-6">
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Categoría *</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(true)}
                disabled={isLoading}
                className={`flex-row items-center justify-between px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="pricetag-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  <Text className={`ml-3 ${selectedCategory ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>{getCategoryName(selectedCategory)}</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Subcategoría */}
            {subcategories.length > 0 && (
              <View className="mb-6">
                <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subcategoría</Text>
                <TouchableOpacity
                  onPress={() => setShowSubcategoryPicker(true)}
                  disabled={isLoading}
                  className={`flex-row items-center justify-between px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons name="layers-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <Text className={`ml-3 ${selectedSubcategory ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>
                      {selectedSubcategory ? getSubcategoryName(selectedSubcategory) : 'Seleccionar'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </TouchableOpacity>
              </View>
            )}

            {/* Fecha */}
            <View className="mb-6">
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fecha</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                disabled={isLoading}
                className={`flex-row items-center justify-between px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  <Text className={`ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {date.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Hora */}
            <View className="mb-6">
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hora</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                disabled={isLoading}
                className={`flex-row items-center justify-between px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="time-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  <Text className={`ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {date.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Notas */}
            <View className="mb-6">
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Notas adicionales</Text>
              <View className={`px-4 py-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Agrega notas adicionales..."
                  placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                  className={`${isDarkMode ? 'text-white' : 'text-gray-900'} min-h-[80px]`}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Botón de guardar */}
            <TouchableOpacity onPress={handleSave} disabled={isLoading} className={`py-4 rounded-2xl mb-4 ${isExpense ? 'bg-red-500' : 'bg-green-500'} ${isLoading ? 'opacity-50' : ''}`}>
              <View className="flex-row items-center justify-center">
                {isLoading && <ActivityIndicator size="small" color="white" className="mr-2" />}
                <Text className="text-white font-bold text-lg">{isLoading ? 'Guardando...' : 'Guardar Cambios'}</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Modal de selección de categoría */}
          <Modal visible={showCategoryPicker} transparent={true} animationType="slide" onRequestClose={() => setShowCategoryPicker(false)}>
            <View className="flex-1 bg-black/50 justify-end">
              <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl max-h-[70%]`}>
                <View className={`flex-row justify-between items-center px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Seleccionar Categoría</Text>
                  <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                    <Ionicons name="close" size={28} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>
                </View>
                <ScrollView className="px-6 py-4">
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => {
                        setSelectedCategory(category.id)
                        setSelectedSubcategory('')
                        setShowCategoryPicker(false)
                      }}
                      className={`flex-row items-center justify-between py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}
                    >
                      <Text
                        className={`text-base ${selectedCategory === category.id ? (isExpense ? 'text-red-500' : 'text-green-500') : isDarkMode ? 'text-white' : 'text-gray-900'} ${
                          selectedCategory === category.id ? 'font-bold' : ''
                        }`}
                      >
                        {category.name}
                      </Text>
                      {selectedCategory === category.id && <Ionicons name="checkmark" size={24} color={isExpense ? '#EF4444' : '#22C55E'} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Modal de selección de subcategoría */}
          <Modal visible={showSubcategoryPicker} transparent={true} animationType="slide" onRequestClose={() => setShowSubcategoryPicker(false)}>
            <View className="flex-1 bg-black/50 justify-end">
              <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl max-h-[70%]`}>
                <View className={`flex-row justify-between items-center px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Seleccionar Subcategoría</Text>
                  <TouchableOpacity onPress={() => setShowSubcategoryPicker(false)}>
                    <Ionicons name="close" size={28} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>
                </View>
                <ScrollView className="px-6 py-4">
                  {subcategories.map((subcategory) => (
                    <TouchableOpacity
                      key={subcategory.id}
                      onPress={() => {
                        setSelectedSubcategory(subcategory.id)
                        setShowSubcategoryPicker(false)
                      }}
                      className={`flex-row items-center justify-between py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}
                    >
                      <Text
                        className={`text-base ${selectedSubcategory === subcategory.id ? (isExpense ? 'text-red-500' : 'text-green-500') : isDarkMode ? 'text-white' : 'text-gray-900'} ${
                          selectedSubcategory === subcategory.id ? 'font-bold' : ''
                        }`}
                      >
                        {subcategory.name}
                      </Text>
                      {selectedSubcategory === subcategory.id && <Ionicons name="checkmark" size={24} color={isExpense ? '#EF4444' : '#22C55E'} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Date Picker */}
          {showDatePicker && <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleDateChange} maximumDate={new Date()} locale="es-ES" />}

          {/* Time Picker */}
          {showTimePicker && <DateTimePicker value={date} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleTimeChange} locale="es-ES" />}
        </View>
      </View>
    </Modal>
  )
}

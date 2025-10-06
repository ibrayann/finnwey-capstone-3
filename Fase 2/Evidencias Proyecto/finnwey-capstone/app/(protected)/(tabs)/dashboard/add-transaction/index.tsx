import { ReceiptService } from '@/features/receipt'
import { CategoryService } from '@/features/shared'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useCreateTransaction } from '@/features/transactions'
import { useFinanceStore } from '@/store/finance.store'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AddTransactionScreen() {
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false)
  const [notes, setNotes] = useState('')
  const [hasReceipt, setHasReceipt] = useState(false)
  const [scannedReceipt, setScannedReceipt] = useState<any>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [showItemSelector, setShowItemSelector] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [scannedImage, setScannedImage] = useState<string | null>(null)
  const [expenseCategories, setExpenseCategories] = useState<any[]>([])
  const [incomeCategories, setIncomeCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])

  const navigation = useNavigation()
  const { isDarkMode } = useTheme()
  const params = useLocalSearchParams()
  const { addTransaction } = useFinanceStore()
  const { createTransactionWithReceipt, isCreating } = useCreateTransaction()

  // Función para limpiar todos los datos del formulario
  const clearAllData = () => {
    setScannedImage(null)
    setScannedReceipt(null)
    setSelectedItems(new Set())
    setHasReceipt(false)
    setAmount('')
    setTitle('')
    setDescription('')
    setSelectedCategory('')
    setSelectedSubcategory('')
    setNotes('')
    setTransactionType('expense')
  }

  // Función para seleccionar imagen de galería
  const handleSelectFromGallery = async () => {
    try {
      // Solicitar permisos de galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert('Permisos Requeridos', 'Necesitamos acceso a tu galería para seleccionar imágenes de boletas.', [{ text: 'OK' }])
        return
      }

      // Abrir galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0]

        // Procesar la imagen seleccionada
        setScannedImage(selectedImage.uri)
        setHasReceipt(true)
        processScannedImage(selectedImage.uri)
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen de la galería.')
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      tabBarStyle: { display: 'none' },
    })

    return () => {
      navigation.setOptions({
        tabBarStyle: undefined,
      })
    }
  }, [navigation])

  // Cargar categorías de Supabase al inicio
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [expenseCats, incomeCats] = await Promise.all([CategoryService.getExpenseCategories(), CategoryService.getIncomeCategories()])
        setExpenseCategories(expenseCats)
        setIncomeCategories(incomeCats)
      } catch (error) {
        console.error('Error al cargar categorías:', error)
      }
    }

    loadCategories()
  }, [])

  // Cargar subcategorías cuando se selecciona una categoría
  useEffect(() => {
    const loadSubcategories = async () => {
      if (selectedCategory) {
        try {
          const subs = await CategoryService.getSubcategoriesByCategory(selectedCategory)
          setSubcategories(subs)
        } catch (error) {
          console.error('Error al cargar subcategorías:', error)
          setSubcategories([])
        }
      } else {
        setSubcategories([])
      }
    }

    loadSubcategories()
  }, [selectedCategory])

  // Efecto para recibir datos prellenados desde el escáner
  useEffect(() => {
    if (params.fromScan === 'true') {
      // Establecer como gasto (las boletas siempre son gastos)
      setTransactionType('expense')

      // Llenar el formulario con los datos extraídos
      if (params.merchantName) {
        setTitle(params.merchantName as string)
      }

      if (params.amount) {
        setAmount(params.amount as string)
      }

      if (params.category && params.subcategory) {
        // Buscar la categoría en las categorías de gastos cargadas
        const category = expenseCategories.find((cat) => cat.name === params.category)
        if (category) {
          setSelectedCategory(category.id)
          setSelectedSubcategory(params.subcategory as string)
        }
      }

      if (params.date) {
        setDate(new Date(params.date as string))
      }

      if (params.notes) {
        setNotes(params.notes as string)
      }

      // Generar descripción automática
      if (params.merchantName) {
        setDescription(`Compra en ${params.merchantName}`)
      }

      setHasReceipt(true)
    }
  }, [params.fromScan, params.merchantName, params.amount, params.category, params.subcategory, params.date, params.notes])

  // Efecto para procesar la imagen escaneada cuando se recibe
  useEffect(() => {
    if (params.scannedImage) {
      // Limpiar imagen anterior si es diferente
      if (scannedImage !== params.scannedImage) {
        setScannedImage(params.scannedImage as string)
        setHasReceipt(true)
        processScannedImage(params.scannedImage as string)
      }
    }
  }, [params.scannedImage])

  const processScannedImage = async (imageUri: string) => {
    // Limpiar boleta anterior y datos relacionados
    setScannedReceipt(null)
    setSelectedItems(new Set())
    setNotes('')
    setAmount('')
    setTitle('')
    setDescription('')
    setSelectedCategory('')
    setSelectedSubcategory('')

    // Establecer como gasto cuando se escanea una boleta
    setTransactionType('expense')

    // Mostrar modal de carga
    setShowLoadingModal(true)

    try {
      // Usar el servicio REAL de escaneo
      const response = await ReceiptService.scanReceipt(imageUri)

      // Ocultar modal de carga
      setShowLoadingModal(false)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'No se pudo procesar la boleta')
      }

      const receiptData = response.data

      // Usar directamente los datos de la IA sin conversiones innecesarias
      const receipt = {
        merchantName: receiptData.merchantName || 'Comercio Desconocido',
        total: receiptData.totalAmount || 0,
        category: receiptData.category || 'Compras', // ← Usar directamente de IA
        subcategory: receiptData.subcategory || 'Imprevistos', // ← Usar directamente de IA
        items: receiptData.items.map((item) => ({
          name: item.description,
          price: item.totalPrice,
          quantity: item.quantity,
        })),
        scanDate: receiptData.transactionDate || new Date().toISOString(),
        receiptNumber: receiptData.receiptNumber || `B-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        taxAmount: receiptData.totalAmount ? Math.round(receiptData.totalAmount * 0.19) : 0,
        subtotal: receiptData.totalAmount ? Math.round(receiptData.totalAmount / 1.19) : 0,
        paymentMethod: receiptData.paymentMethod || 'No especificado',
        cashier: 'Sistema Automatizado',
        storeLocation: receiptData.merchantAddress || 'Chile',
        merchantRut: receiptData.merchantRut || 'N/A',
        ocrConfidence: receiptData.ocrConfidence || 0,
        // Datos originales de la IA para referencia
        originalData: receiptData,
      }

      setScannedReceipt(receipt)

      // Inicializar todos los productos como seleccionados
      const allItemsSelected = new Set(receipt.items.map((_, index) => index))
      setSelectedItems(allItemsSelected)

      // Mostrar modal de confirmación
      setShowReceiptModal(true)
    } catch (error) {
      setShowLoadingModal(false)

      Alert.alert('Error al Procesar Boleta', error instanceof Error ? error.message : 'No se pudo procesar la boleta. Por favor, intenta nuevamente.', [
        {
          text: 'OK',
          onPress: () => {
            setScannedImage(null)
            setHasReceipt(false)
          },
        },
      ])
    }
  }

  // Función para mapear nombres de categorías del OCR a IDs de Supabase
  const mapCategoryNameToSupabaseId = async (categoryName: string, subcategoryName: string): Promise<{ categoryId: string; subcategoryId: string | null }> => {
    try {
      const result = await CategoryService.mapCategoryNameToId(categoryName, subcategoryName, transactionType)
      return result
    } catch (error) {
      // Fallback: usar la primera categoría disponible según el tipo
      const fallbackCategories = transactionType === 'income' ? incomeCategories : expenseCategories
      if (fallbackCategories.length > 0) {
        return {
          categoryId: fallbackCategories[0].id,
          subcategoryId: null,
        }
      }
      throw error
    }
  }

  // Función auxiliar para obtener el nombre de una categoría por ID
  const getCategoryNameById = (categoryId: string): string => {
    const allCategories = [...expenseCategories, ...incomeCategories]
    const category = allCategories.find((cat) => cat.id === categoryId)
    return category?.name || 'Compras'
  }

  // Función auxiliar para obtener el nombre de una subcategoría por ID
  const getSubcategoryNameById = (subcategoryId: string): string => {
    const subcategory = subcategories.find((sub) => sub.id === subcategoryId)
    return subcategory?.name || 'Subcategoría no encontrada'
  }

  const formatDate = (date: Date) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const onDateChange = (_: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const handleScanReceipt = () => {
    // Limpiar todos los datos antes de ir a escanear
    clearAllData()

    // Siempre navegar a la cámara para escanear
    router.push('/(protected)/(tabs)/scan')
  }

  const isFormValid = amount && title && description && selectedCategory && selectedSubcategory

  const handleSaveTransaction = async () => {
    console.log('🎯 handleSaveTransaction - Iniciando guardado de transacción')
    console.log('📊 Estado del formulario:', {
      amount,
      title,
      description,
      selectedCategory,
      selectedSubcategory,
      transactionType,
      hasReceipt,
      scannedImage: !!scannedImage,
      scannedReceipt: !!scannedReceipt,
    })

    if (!isFormValid) {
      console.log('❌ Formulario no válido')
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios')
      return
    }

    console.log('✅ Formulario válido, procediendo con el guardado')

    try {
      // Si hay imagen escaneada, usar el nuevo sistema de Supabase
      if (hasReceipt && scannedImage && scannedReceipt) {
        console.log('📄 Guardando transacción con imagen escaneada')

        // Mapear categorías del OCR a IDs de Supabase
        console.log('🗺️ Mapeando categorías a IDs de Supabase...')
        const { categoryId, subcategoryId } = await mapCategoryNameToSupabaseId(
          scannedReceipt.category || getCategoryNameById(selectedCategory),
          scannedReceipt.subcategory || getSubcategoryNameById(selectedSubcategory)
        )

        console.log('📤 Datos enviando a Supabase:', {
          merchantName: title,
          amount: parseFloat(amount),
          category: categoryId,
          subcategory: subcategoryId || selectedSubcategory,
          transactionDate: date.toISOString().split('T')[0],
          notes: notes,
          receiptData: {
            merchantName: scannedReceipt.merchantName,
            category: scannedReceipt.category || getCategoryNameById(selectedCategory),
            subcategory: scannedReceipt.subcategory || getSubcategoryNameById(selectedSubcategory),
            totalAmount: parseFloat(amount),
            transactionDate: date.toISOString().split('T')[0],
            items: scannedReceipt.items || [],
            ocrConfidence: scannedReceipt.ocrConfidence || 0.8,
            merchantType: scannedReceipt.merchantType || '',
            paymentMethod: scannedReceipt.paymentMethod || '',
            receiptNumber: scannedReceipt.receiptNumber || '',
            merchantAddress: scannedReceipt.storeLocation || '',
            merchantRut: scannedReceipt.merchantRut || '',
            currency: 'CLP',
          },
        })

        console.log('🚀 Llamando a createTransactionWithReceipt...')
        const result = await createTransactionWithReceipt(
          {
            merchantName: title,
            amount: parseFloat(amount),
            category: categoryId, // Usar ID de Supabase
            subcategory: subcategoryId || selectedSubcategory, // Usar ID de Supabase o nombre como fallback
            transactionDate: date.toISOString().split('T')[0],
            transactionType: transactionType, // Pasar el tipo de transacción
            notes: notes,
            receiptData: {
              merchantName: scannedReceipt.merchantName,
              category: scannedReceipt.category || getCategoryNameById(selectedCategory),
              subcategory: scannedReceipt.subcategory || selectedSubcategory,
              totalAmount: parseFloat(amount),
              transactionDate: date.toISOString().split('T')[0],
              items: scannedReceipt.items || [],
              ocrConfidence: scannedReceipt.ocrConfidence || 0.8,
              merchantType: scannedReceipt.merchantType || '',
              paymentMethod: scannedReceipt.paymentMethod || '',
              receiptNumber: scannedReceipt.receiptNumber || '',
              merchantAddress: scannedReceipt.storeLocation || '',
              merchantRut: scannedReceipt.merchantRut || '',
              currency: 'CLP',
            },
          },
          scannedImage,
          scannedReceipt
        )

        console.log('📋 Resultado de createTransactionWithReceipt:', result)

        if (result.success) {
          // El store local se sincroniza automáticamente después de crear la transacción
          Alert.alert('¡Éxito!', `${transactionType === 'income' ? 'Ingreso' : 'Gasto'} guardado correctamente con imagen de boleta`)
          clearAllData()
          router.back()
        } else {
          throw new Error('No se pudo guardar en Supabase')
        }
      } else {
        console.log('📝 Guardando transacción manual (sin imagen)')

        // Mapear categorías a IDs de Supabase para transacciones manuales
        console.log('🗺️ Mapeando categorías manuales a IDs de Supabase...')
        const { categoryId, subcategoryId } = await mapCategoryNameToSupabaseId(getCategoryNameById(selectedCategory), getSubcategoryNameById(selectedSubcategory))

        console.log('📤 Datos de transacción manual:', {
          merchantName: title,
          amount: parseFloat(amount),
          category: categoryId,
          subcategory: subcategoryId || selectedSubcategory,
          transactionDate: date.toISOString().split('T')[0],
          transactionType: transactionType,
          notes: notes,
        })

        console.log('🚀 Llamando a createTransactionWithReceipt para transacción manual...')
        const result = await createTransactionWithReceipt({
          merchantName: title,
          amount: parseFloat(amount),
          category: categoryId,
          subcategory: subcategoryId || selectedSubcategory,
          transactionDate: date.toISOString().split('T')[0],
          transactionType: transactionType,
          notes: notes,
        })

        console.log('📋 Resultado de transacción manual:', result)

        if (result.success) {
          console.log('✅ Transacción manual guardada exitosamente')
          // El store local se sincroniza automáticamente después de crear la transacción
          Alert.alert('Éxito', `${transactionType === 'income' ? 'Ingreso' : 'Gasto'} registrado correctamente`)
          clearAllData()
          router.back()
        } else {
          console.error('❌ Error al guardar transacción manual')
          Alert.alert('Error', 'No se pudo guardar la transacción')
        }
      }
    } catch (error) {
      console.error('❌ Error al guardar:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo guardar la transacción')
    }
  }

  const handleConfirmReceipt = async () => {
    if (scannedReceipt) {
      try {
        // Si hay productos seleccionados, aplicar solo esos
        if (selectedItems.size > 0) {
          await applyReceiptToForm(
            scannedReceipt,
            scannedReceipt.items.filter((_: any, index: number) => selectedItems.has(index))
          )
          setShowReceiptModal(false)
          Alert.alert('Selección Confirmada', `Se han aplicado solo los productos seleccionados de ${scannedReceipt.merchantName}`, [{ text: 'OK' }])
        } else {
          // Si no hay selección, aplicar toda la boleta
          await applyReceiptToForm(scannedReceipt, scannedReceipt.items)
          setShowReceiptModal(false)
          Alert.alert('Boleta Confirmada', `Se ha aplicado toda la información de ${scannedReceipt.merchantName}`, [{ text: 'OK' }])
        }
      } catch (error) {
        console.error('❌ Error al aplicar datos de la boleta:', error)
        Alert.alert('Error', 'No se pudieron aplicar los datos de la boleta. Por favor, intenta nuevamente.')
      }
    }
  }

  const applyReceiptToForm = async (receipt: any, items: any[]) => {
    // Calcular el total basado en los items proporcionados
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price, 0)

    // Auto-completar campos principales
    setAmount(totalAmount.toString())
    setTitle(receipt.merchantName)

    // Generar descripción descriptiva
    // Como todos los productos vienen seleccionados por defecto, siempre usamos los seleccionados
    const selectedItemsList = items.filter((_, index) => selectedItems.has(index))
    const productNames = selectedItemsList.map((item) => item.name).join(', ')
    setDescription(`Compra en ${receipt.merchantName} y compraste: ${productNames}`)

    // Solo aplicar categoría si es un gasto (las boletas siempre son gastos)
    if (transactionType === 'expense') {
      try {
        // Mapear nombres de categorías del OCR a IDs de Supabase
        const { categoryId, subcategoryId } = await mapCategoryNameToSupabaseId(receipt.category || 'Compras', receipt.subcategory || 'Imprevistos')

        setSelectedCategory(categoryId)
        setSelectedSubcategory(subcategoryId || '')

        console.log('✅ Categorías mapeadas correctamente:', {
          categoryName: receipt.category,
          subcategoryName: receipt.subcategory,
          categoryId,
          subcategoryId,
        })
      } catch (error) {
        console.error('❌ Error al mapear categorías:', error)
        // Fallback: usar la primera categoría disponible
        if (expenseCategories.length > 0) {
          setSelectedCategory(expenseCategories[0].id)
          setSelectedSubcategory('')
        }
      }
    }

    // Actualizar fecha con la fecha de escaneo
    if (receipt.scanDate) {
      setDate(new Date(receipt.scanDate))
    }

    // Generar notas detalladas
    if (selectedItems.size > 0) {
      // Si hay productos seleccionados, mostrar solo esos
      const selectedItemsList = items.filter((_, index) => selectedItems.has(index))
      const selectedTotal = calculateSelectedTotal()
      setNotes(
        `Boleta escaneada de ${receipt.merchantName}\nFecha: ${new Date(receipt.scanDate).toLocaleDateString('es-CL')}\n\nMis productos seleccionados:\n${selectedItemsList
          .map((item: any) => `• ${item.quantity}x ${item.name}: $${item.price.toLocaleString('es-CL')}`)
          .join('\n')}\n\nTotal seleccionado: $${selectedTotal.toLocaleString('es-CL')}`
      )
    } else {
      // Si no hay selección, mostrar todos los productos
      setNotes(
        `Boleta escaneada de ${receipt.merchantName}\nFecha: ${new Date(receipt.scanDate).toLocaleDateString('es-CL')}\n\nTodos los productos:\n${items
          .map((item: any) => `• ${item.quantity}x ${item.name}: $${item.price.toLocaleString('es-CL')}`)
          .join('\n')}\n\nTotal boleta: $${receipt.total.toLocaleString('es-CL')}`
      )
    }
  }

  const handleItemSelection = (index: number) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(index)) {
      newSelection.delete(index)
    } else {
      newSelection.add(index)
    }
    setSelectedItems(newSelection)
  }

  const calculateSelectedTotal = () => {
    if (!scannedReceipt) return 0
    return scannedReceipt.items.filter((_: any, index: number) => selectedItems.has(index)).reduce((sum: number, item: any) => sum + item.price, 0)
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-full items-center justify-center">
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? 'white' : '#374151'} />
          </TouchableOpacity>
          <Text className="text-gray-800 dark:text-white text-2xl font-semibold">{transactionType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}</Text>
          <TouchableOpacity
            onPress={() => setShowConfirmModal(true)}
            className={`w-12 h-12 rounded-full items-center justify-center ${isFormValid ? 'bg-green-500/20 border-2 border-green-500' : 'bg-gray-100 dark:bg-white/10'}`}
            disabled={!isFormValid}
          >
            <Ionicons name="checkmark" size={24} color={isFormValid ? '#10b981' : isDarkMode ? 'white' : '#374151'} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Tipo de Transacción */}
          <View className="mb-6">
            <Text className="text-gray-700 dark:text-white text-lg font-semibold mb-3">Tipo de Transacción</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setTransactionType('expense')
                  setSelectedCategory('')
                  setSelectedSubcategory('')
                }}
                className={`flex-1 rounded-xl p-4 border-2 flex-row items-center justify-center ${
                  transactionType === 'expense' ? 'bg-red-500/20 border-red-500' : 'bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/30'
                }`}
              >
                <Ionicons name="trending-down" size={20} color={transactionType === 'expense' ? '#ef4444' : isDarkMode ? 'white' : '#374151'} />
                <Text className={`ml-2 font-medium ${transactionType === 'expense' ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-white'}`}>Gasto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setTransactionType('income')
                  setSelectedCategory('')
                  setSelectedSubcategory('')
                }}
                className={`flex-1 rounded-xl p-4 border-2 flex-row items-center justify-center ${
                  transactionType === 'income' ? 'bg-green-500/20 border-green-500' : 'bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/30'
                }`}
              >
                <Ionicons name="trending-up" size={20} color={transactionType === 'income' ? '#10b981' : isDarkMode ? 'white' : '#374151'} />
                <Text className={`ml-2 font-medium ${transactionType === 'income' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-white'}`}>Ingreso</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Escanear Boleta - Solo para gastos */}
          {transactionType === 'expense' && (
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-white text-lg font-semibold mb-3">Boleta</Text>

              {/* Botón único de cámara/galería */}
              <TouchableOpacity
                onPress={handleScanReceipt}
                className={`rounded-xl p-4 border-2 ${hasReceipt ? 'bg-green-500/20 border-green-500/50' : 'bg-gray-100 dark:bg-white/10 border-dashed border-gray-300 dark:border-white/30'}`}
              >
                <View className="items-center">
                  <Ionicons name={hasReceipt ? 'checkmark-circle' : 'camera'} size={32} color={hasReceipt ? '#10b981' : isDarkMode ? 'white' : '#374151'} />
                  <Text className={`text-center mt-2 font-medium ${hasReceipt ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-white'}`}>
                    {hasReceipt ? 'Boleta Escaneada' : 'Escanear Boleta'}
                  </Text>
                  <Text className={`text-center text-sm mt-1 ${hasReceipt ? 'text-green-600 dark:text-green-300' : 'text-gray-500 dark:text-white/70'}`}>
                    {hasReceipt ? 'Toca para nueva foto' : 'Toca para escanear'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Monto */}
          <View className="mb-6">
            <Text className="text-gray-700 dark:text-white text-lg font-semibold mb-3">Monto</Text>
            <View className="bg-gray-100 dark:bg-white/10 rounded-xl p-4">
              <View className="flex-row items-center">
                <Text className="text-gray-700 dark:text-white text-3xl font-bold mr-2">$</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(55,65,81,0.5)'}
                  className="flex-1 text-gray-700 dark:text-white text-3xl font-bold"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Título */}
          <View className="mb-6">
            <Text className="text-gray-700 dark:text-white text-lg font-semibold mb-3">Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={transactionType === 'income' ? '¿De dónde viene este ingreso?' : '¿Qué compraste?'}
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(55,65,81,0.5)'}
              className="bg-gray-100 dark:bg-white/10 rounded-xl p-4 text-gray-700 dark:text-white text-lg"
            />
          </View>

          {/* Descripción */}
          <View className="mb-6">
            <Text className="text-gray-700 dark:text-white text-lg font-semibold mb-3">Descripción</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={transactionType === 'income' ? 'Describe el ingreso recibido' : '¿En qué gastaste?'}
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(55,65,81,0.5)'}
              className="bg-gray-100 dark:bg-white/10 rounded-xl p-4 text-gray-700 dark:text-white text-lg"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Categoría */}
          <View className="mb-6">
            <Text className="text-gray-700 dark:text-white text-lg font-semibold mb-3">Categoría</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(true)}
              className={`p-4 rounded-2xl border-2 ${selectedCategory ? 'border-green-500 bg-green-500/20' : 'border-gray-300 dark:border-white/30 bg-gray-100 dark:bg-white/10'}`}
            >
              <View className="flex-row items-center justify-between">
                <Text className={`font-semibold text-lg ${selectedCategory ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-white/50'}`}>
                  {selectedCategory ? (transactionType === 'income' ? incomeCategories : expenseCategories).find((cat) => cat.id === selectedCategory)?.name : 'Selecciona una categoría'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={selectedCategory ? '#10b981' : isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(156,163,175,0.8)'} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Subcategoría */}
          {selectedCategory && (
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-white text-lg font-semibold mb-3">Subcategoría</Text>
              <TouchableOpacity
                onPress={() => setShowSubcategoryPicker(true)}
                className={`p-4 rounded-2xl border-2 ${selectedSubcategory ? 'border-green-500 bg-green-500/20' : 'border-gray-300 dark:border-white/30 bg-gray-100 dark:bg-white/10'}`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className={`font-semibold text-lg ${selectedSubcategory ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-white/50'}`}>
                    {selectedSubcategory ? getSubcategoryNameById(selectedSubcategory) : 'Selecciona una subcategoría'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={selectedSubcategory ? '#10b981' : isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(156,163,175,0.8)'} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Fecha */}
          <View className="mb-6">
            <Text className="text-gray-700 dark:text-white text-lg font-semibold mb-3">Fecha</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} className={`p-4 rounded-2xl border-2 border-green-500 bg-green-500/20`}>
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-lg text-green-700 dark:text-green-400">{formatDate(date)}</Text>
                <Ionicons name="calendar" size={20} color="#10b981" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Notas */}
          <View className="mb-6">
            <Text className="text-gray-700 dark:text-white text-lg font-semibold mb-3">Notas (Opcional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Agregar notas adicionales..."
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(55,65,81,0.5)'}
              className="bg-gray-100 dark:bg-white/10 rounded-xl p-4 text-gray-700 dark:text-white text-lg"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Detalle */}
          <View className="mb-36">
            <Text className="text-gray-700 dark:text-white text-lg font-semibold mb-3">Detalle (Opcional)</Text>
            <TextInput
              placeholder="Agregar detalles específicos..."
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(55,65,81,0.5)'}
              className="bg-gray-100 dark:bg-white/10 rounded-xl p-4 text-gray-700 dark:text-white text-lg"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Botón Guardar */}
          <TouchableOpacity
            onPress={handleSaveTransaction}
            className={`rounded-xl py-4 mb-20 ${isFormValid && !isCreating ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            disabled={!isFormValid || isCreating}
          >
            {isCreating ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-center text-lg font-semibold text-white ml-2">Guardando...</Text>
              </View>
            ) : (
              <Text className={`text-center text-lg font-semibold ${isFormValid ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {transactionType === 'income' ? 'Guardar Ingreso' : 'Guardar Gasto'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Modal de Categorías */}
        <Modal visible={showCategoryPicker} transparent animationType="fade" onRequestClose={() => setShowCategoryPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Selecciona una categoría</Text>
                <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </TouchableOpacity>
              </View>

              <View className="gap-3">
                {(transactionType === 'income' ? incomeCategories : expenseCategories).map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`p-4 rounded-2xl border-2 ${selectedCategory === category.id ? 'border-green-500 bg-green-500/20' : isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                    onPress={() => {
                      setSelectedCategory(category.id)
                      setSelectedSubcategory('') // Limpiar subcategoría al cambiar categoría
                      setShowCategoryPicker(false)
                    }}
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
                        <Text className="text-2xl">{category.icon || '📁'}</Text>
                      </View>
                      <Text className={`font-semibold text-lg ${selectedCategory === category.id ? 'text-green-700 dark:text-green-400' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {category.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de Subcategorías */}
        <Modal visible={showSubcategoryPicker} transparent animationType="fade" onRequestClose={() => setShowSubcategoryPicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Selecciona una subcategoría</Text>
                <TouchableOpacity onPress={() => setShowSubcategoryPicker(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </TouchableOpacity>
              </View>

              <View className="gap-3">
                {subcategories.map((subcategory) => (
                  <TouchableOpacity
                    key={subcategory.id}
                    className={`p-4 rounded-2xl border-2 ${selectedSubcategory === subcategory.id ? 'border-green-500 bg-green-500/20' : isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
                    onPress={() => {
                      setSelectedSubcategory(subcategory.id)
                      setShowSubcategoryPicker(false)
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className={`font-semibold text-lg ${selectedSubcategory === subcategory.id ? 'text-green-700 dark:text-green-400' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {subcategory.name}
                      </Text>
                      {selectedSubcategory === subcategory.id && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de Confirmación de Transacción */}
        <Modal visible={showConfirmModal} transparent animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              {/* Header del Modal */}
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-green-500/20 rounded-full items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                </View>
                <Text className={`text-xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Confirmar Transacción</Text>
                <Text className={`text-center text-sm mt-2 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Revisa los detalles antes de guardar</Text>
              </View>

              {/* Resumen de la Transacción */}
              <View className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-100'} rounded-xl p-4 mb-6`}>
                <View className="space-y-3">
                  <View className="flex-row justify-between items-center">
                    <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-sm`}>Monto:</Text>
                    <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-bold text-lg`}>${amount || '0'}</Text>
                  </View>

                  {title && (
                    <View className="flex-row justify-between items-start">
                      <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-sm flex-shrink-0 mr-2`}>Título:</Text>
                      <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium flex-1 text-right`} numberOfLines={2}>
                        {title}
                      </Text>
                    </View>
                  )}

                  {selectedCategory && (
                    <View className="flex-row justify-between items-start">
                      <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-sm flex-shrink-0 mr-2`}>Categoría:</Text>
                      <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium capitalize flex-1 text-right`} numberOfLines={1}>
                        {(transactionType === 'income' ? incomeCategories : expenseCategories).find((cat) => cat.id === selectedCategory)?.name}
                      </Text>
                    </View>
                  )}

                  {selectedSubcategory && (
                    <View className="flex-row justify-between items-start">
                      <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-sm flex-shrink-0 mr-2`}>Subcategoría:</Text>
                      <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium flex-1 text-right`} numberOfLines={1}>
                        {getSubcategoryNameById(selectedSubcategory)}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row justify-between items-center">
                    <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-sm`}>Fecha:</Text>
                    <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium`}>{formatDate(date)}</Text>
                  </View>
                </View>
              </View>

              {/* Botones de Acción */}
              <View className="flex-row gap-3">
                <TouchableOpacity onPress={() => setShowConfirmModal(false)} className={`flex-1 py-3 px-4 rounded-xl border-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <Text className={`text-center font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowConfirmModal(false)
                    handleSaveTransaction()
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl ${isFormValid ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  disabled={!isFormValid}
                >
                  <Text className={`text-center font-semibold ${isFormValid ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de Fecha */}
        <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full max-w-sm rounded-3xl p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <View className="flex-row items-center justify-between mb-6">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Selecciona una fecha</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </TouchableOpacity>
              </View>

              <View className="items-center">
                <DateTimePicker value={date} mode="date" display="spinner" onChange={onDateChange} textColor={isDarkMode ? 'white' : '#374151'} style={{ backgroundColor: 'transparent' }} />
              </View>

              <TouchableOpacity onPress={() => setShowDatePicker(false)} className="bg-green-500 rounded-xl py-4 mt-6">
                <Text className="text-white text-center text-lg font-semibold">Confirmar Fecha</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de Carga */}
        <Modal visible={showLoadingModal} transparent animationType="fade" onRequestClose={() => setShowLoadingModal(false)}>
          <View className="flex-1 bg-black/70 justify-center items-center px-6">
            <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl p-8 items-center max-w-sm`}>
              <View className="w-16 h-16 bg-green-500/20 rounded-full items-center justify-center mb-6">
                <Ionicons name="refresh" size={32} color="#10b981" />
              </View>
              <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-xl font-bold text-center mb-3`}>Procesando Boleta...</Text>
              <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-center`}>Estamos analizando la imagen escaneada para extraer la información de tu compra.</Text>
              <View className="mt-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <View className="bg-green-500 h-2 rounded-full w-3/4" />
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de Confirmación de Boleta Escaneada */}
        <Modal visible={showReceiptModal} transparent animationType="slide" onRequestClose={() => setShowReceiptModal(false)}>
          <View className="flex-1 bg-black/70 justify-center items-center px-6">
            <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl w-full max-w-sm overflow-hidden`}>
              {/* Header del Modal - Fijo y Compacto */}
              <View className={`relative p-3 items-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {/* Botón X en la esquina superior derecha */}
                <TouchableOpacity
                  onPress={() => setShowReceiptModal(false)}
                  className={`absolute top-3 right-3 w-7 h-7 rounded-full items-center justify-center ${isDarkMode ? 'bg-white/15' : 'bg-gray-200'}`}
                >
                  <Ionicons name="close" size={16} color={isDarkMode ? 'white' : '#374151'} />
                </TouchableOpacity>

                <View className="w-10 h-10 bg-green-500/20 rounded-full items-center justify-center mb-1">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base font-bold text-center`}>¡Boleta Detectada!</Text>
                <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-center text-xs`}>Revisa y confirma los detalles</Text>
              </View>

              {/* Contenido del Modal - Scrolleable */}
              <ScrollView className="max-h-[400px]" showsVerticalScrollIndicator={false}>
                <View className="p-6">
                  {scannedReceipt && (
                    <>
                      {/* Información del comercio */}
                      <View className="mb-6">
                        <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-bold text-lg text-center mb-2`}>{scannedReceipt.merchantName}</Text>
                        <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-sm text-center`}>Boleta #{scannedReceipt.receiptNumber}</Text>
                        <Text className={`${isDarkMode ? 'text-white/60' : 'text-gray-500'} text-xs text-center mt-1`}>
                          Escaneada el {new Date(scannedReceipt.scanDate).toLocaleDateString('es-CL')}
                        </Text>
                      </View>

                      {/* Lista de productos */}
                      <View className="mb-6">
                        <View className="flex-col gap-y-2 items-center mb-3">
                          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-semibold`}>Productos detectados:</Text>
                          {selectedItems.size > 0 && (
                            <View className="bg-green-500/20 border border-green-500/40 rounded-full px-3 py-1">
                              <Text className="text-green-700 dark:text-green-400 text-xs font-medium">Seleccionados: ${calculateSelectedTotal().toLocaleString('es-CL')}</Text>
                            </View>
                          )}
                        </View>
                        <View className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-100'} rounded-xl p-3`}>
                          {scannedReceipt.items.map((item: any, index: number) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => handleItemSelection(index)}
                              className={`flex-row items-center py-2 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'} last:border-b-0`}
                            >
                              {/* Checkbox de selección */}
                              <View className="w-5 h-5 mr-3 border-2 border-green-500/40 rounded items-center justify-center">
                                {selectedItems.has(index) && <View className="w-3 h-3 bg-green-500 rounded" />}
                              </View>

                              <View className="flex-1 mr-3">
                                <Text className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {item.quantity > 1 ? `${item.quantity}x ` : ''}
                                  {item.name}
                                </Text>
                                {item.unit && <Text className={`${isDarkMode ? 'text-white/60' : 'text-gray-500'} text-xs`}>por {item.unit}</Text>}
                              </View>
                              <View className="items-end">
                                <Text className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>${item.price.toLocaleString('es-CL')}</Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {/* Instrucciones de selección */}
                        <View className="mt-2">
                          <Text className={`${isDarkMode ? 'text-white/60' : 'text-gray-500'} text-xs text-center mb-2`}>
                            💡 Toca los productos que consumiste para calcular tu total personalizado
                          </Text>
                        </View>
                      </View>

                      {/* Resumen financiero */}
                      <View className={`${isDarkMode ? 'bg-white/10' : 'bg-gray-100'} rounded-xl p-4 mb-6`}>
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-sm`}>Subtotal:</Text>
                          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium`}>${scannedReceipt.subtotal?.toLocaleString('es-CL') || 'N/A'}</Text>
                        </View>
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className={`${isDarkMode ? 'text-white/80' : 'text-gray-600'} text-sm`}>IVA (19%):</Text>
                          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium`}>${scannedReceipt.taxAmount?.toLocaleString('es-CL') || 'N/A'}</Text>
                        </View>
                        <View className={`flex-row justify-between items-center pt-2 border-t ${isDarkMode ? 'border-white/20' : 'border-gray-200'}`}>
                          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-bold text-lg`}>Total Boleta:</Text>
                          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-2xl font-bold`}>${scannedReceipt.total.toLocaleString('es-CL')}</Text>
                        </View>

                        {/* Total seleccionado */}
                        {selectedItems.size > 0 && (
                          <View className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-white/20' : 'border-gray-200'}`}>
                            <View className="flex-row justify-between items-center">
                              <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-bold text-lg`}>Tu Total:</Text>
                              <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-2xl font-bold`}>${calculateSelectedTotal().toLocaleString('es-CL')}</Text>
                            </View>
                            <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-500'} text-xs text-center mt-1`}>Solo los productos seleccionados</Text>
                          </View>
                        )}
                      </View>

                      {/* Información adicional */}
                      <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-sm`}>Categoría sugerida:</Text>
                          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-semibold capitalize`}>
                            {expenseCategories.find((cat) => cat.name === scannedReceipt.category)?.name || scannedReceipt.category}
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-sm`}>Subcategoría sugerida:</Text>
                          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-semibold capitalize`}>{scannedReceipt.subcategory || 'No disponible'}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-sm`}>Método de pago:</Text>
                          <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium text-sm`}>{scannedReceipt.paymentMethod}</Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </ScrollView>

              {/* Botón de Confirmar */}
              <View className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <TouchableOpacity onPress={handleConfirmReceipt} className="bg-green-500 rounded-xl py-4 px-6">
                  <Text className="text-white text-center text-lg font-bold">{selectedItems.size > 0 ? 'Confirmar Selección' : 'Confirmar Todo'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  )
}

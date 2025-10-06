import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView, useColorScheme, Image, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Transaction, useTransactionReceipt } from '@/hooks/queries/useTransactions'

interface TransactionDetailTabsProps {
  transaction: Transaction
}

const TABS = [
  { id: 1, key: 'info', label: 'Información', selected: true },
  { id: 2, key: 'image', label: 'Imagen', selected: false },
  { id: 3, key: 'tips', label: 'IA Tips', selected: false },
]

export default function TransactionDetailTabs({ transaction }: TransactionDetailTabsProps) {
  const [tabs, setTabs] = useState(TABS)
  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === 'dark'

  // Obtener el receipt de la transacción
  const { data: receipt, isLoading: isLoadingReceipt, error: receiptError } = useTransactionReceipt(transaction.id)

  const handleTabPress = (tabId: number) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => ({
        ...tab,
        selected: tab.id === tabId,
      }))
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Obtener el tab activo
  const getActiveTab = () => {
    const selectedTab = tabs.find((tab) => tab.selected)
    return selectedTab?.key || 'info'
  }

  const activeTab = getActiveTab()
  const transactionType = transaction.transaction_type?.name || 'expense'
  const isExpense = transactionType === 'expense'

  const renderInfoTab = () => (
    <View>
      {/* Card principal de monto */}
      <View className="mb-6">
        <View className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <View className="flex-row justify-between items-center mb-3">
            <View className={`p-2 rounded-full ${isExpense ? 'bg-red-500' : 'bg-green-500'}`}>
              <Ionicons name={isExpense ? 'trending-down-outline' : 'trending-up-outline'} size={20} color="white" />
            </View>
            <View className="flex-row items-center">
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monto</Text>
              <Text className={`text-lg font-bold ml-2 ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
                {isExpense ? '-' : '+'}${transaction.amount.toLocaleString('es-CL')}
              </Text>
            </View>
          </View>
          <Text className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{isExpense ? 'Gasto' : 'Ingreso'}</Text>
          <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{transaction.merchant_name || transaction.description}</Text>
          <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{transaction.category?.name || 'Sin categoría'}</Text>
        </View>
      </View>

      {/* Detalles de la transacción - Grid de cards */}
      <View className="mb-6">
        <Text className={`text-[17px] font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Detalles de la Transacción</Text>

        {/* Grid de cards - 3 columnas */}
        <View className="flex-row flex-wrap gap-3 justify-between">
          {/* Categoría */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-2">
                <Ionicons name="pricetag-outline" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Categoría</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`} numberOfLines={2}>
              {transaction.category?.name || 'Sin categoría'}
            </Text>
          </View>

          {/* Subcategoría */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-2">
                <Ionicons name="layers-outline" size={20} color={isDarkMode ? '#A78BFA' : '#8B5CF6'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Subcategoría</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`} numberOfLines={2}>
              {transaction.subcategory?.name || 'Sin subcategoría'}
            </Text>
          </View>

          {/* Tipo */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className={`${isExpense ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'} p-3 rounded-full mb-2`}>
                <Ionicons name={isExpense ? 'arrow-down' : 'arrow-up'} size={20} color={isExpense ? '#EF4444' : '#22C55E'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Tipo</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>{isExpense ? 'Gasto' : 'Ingreso'}</Text>
          </View>

          {/* Fecha */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mb-2">
                <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#FB923C' : '#F97316'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Fecha</Text>
            </View>
            <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>
              {new Date(transaction.transaction_date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Hora */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full mb-2">
                <Ionicons name="time-outline" size={20} color={isDarkMode ? '#818CF8' : '#6366F1'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Hora</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>{formatTime(transaction.transaction_date)}</Text>
          </View>

          {/* Moneda */}
          <View className={`w-[31%] rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <View className="items-center mb-2">
              <View className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full mb-2">
                <Ionicons name="cash-outline" size={20} color={isDarkMode ? '#FCD34D' : '#F59E0B'} />
              </View>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Moneda</Text>
            </View>
            <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>{transaction.currency_code || 'CLP'}</Text>
          </View>
        </View>
      </View>

      {/* Badges de estado */}
      {(receipt || transaction.is_recurring) && (
        <View className="mb-6">
          <Text className={`text-[17px] font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Estado</Text>
          <View className="flex-row gap-3">
            {receipt && (
              <View className={`flex-1 rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'}`}>
                <View className="flex-row items-center">
                  <View className="bg-green-500 p-2 rounded-full mr-3">
                    <Ionicons name="receipt-outline" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Con Boleta</Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Imagen disponible</Text>
                  </View>
                </View>
              </View>
            )}
            {transaction.is_recurring && (
              <View className={`flex-1 rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
                <View className="flex-row items-center">
                  <View className="bg-blue-500 p-2 rounded-full mr-3">
                    <Ionicons name="repeat-outline" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recurrente</Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transacción periódica</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Descripción */}
      <View className={`p-6 rounded-2xl border mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-[17px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Descripción</Text>
        </View>
        <Text className={`text-base leading-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{transaction.description}</Text>
      </View>

      {/* Notas */}
      {transaction.notes && (
        <View className={`p-6 rounded-2xl border mb-36 pb-28 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-[17px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notas</Text>
          </View>
          <Text className={`text-base leading-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{transaction.notes}</Text>
        </View>
      )}
    </View>
  )

  const renderImageTab = () => {
    // Mostrar loading mientras se carga el receipt
    if (isLoadingReceipt) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color={isDarkMode ? '#4CAF50' : '#166534'} />
          <Text className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando imagen...</Text>
        </View>
      )
    }

    // Si hay receipt con imagen
    if (receipt && receipt.storage_url) {
      return (
        <View>
          <View className="mb-6">
            <Text className={`text-[17px] font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Imagen de la Boleta</Text>
            <View className={`rounded-2xl overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <Image source={{ uri: receipt.storage_url }} className="w-full h-96" resizeMode="contain" />
            </View>

            {/* Información de la imagen */}
            <View className={`p-4 rounded-2xl mt-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle-outline" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text className={`ml-2 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Información de la Imagen</Text>
              </View>
              <View className="space-y-2 mt-3">
                <View className="flex-row justify-between">
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estado:</Text>
                  <Text className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>{receipt.processing_status === 'completed' ? 'Procesada' : 'Pendiente'}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fuente:</Text>
                  <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{transaction.source === 'ocr' ? 'Escaneada (OCR)' : 'Manual'}</Text>
                </View>
                {receipt.confidence_score && (
                  <View className="flex-row justify-between">
                    <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confianza OCR:</Text>
                    <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{(receipt.confidence_score * 100).toFixed(1)}%</Text>
                  </View>
                )}
                <View className="flex-row justify-between">
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fecha de subida:</Text>
                  <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {new Date(receipt.uploaded_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )
    }

    // Sin imagen disponible
    return (
      <View className="mb-6">
        <View className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <View className="items-center">
            <View className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center mb-4">
              <Ionicons name="image-outline" size={48} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            </View>
            <Text className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sin Imagen de Boleta</Text>
            <Text className={`text-sm text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Esta transacción no tiene una imagen de boleta asociada.</Text>
            <Text className={`text-xs text-center mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Puedes escanear boletas desde la tab Scan en el menú principal.</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderTipsTab = () => (
    <View>
      {/* Recomendaciones Premium */}
      <View className="mb-6">
        <Text className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recomendaciones IA</Text>

        <View className="bg-purple-500 rounded-3xl p-6 relative overflow-hidden">
          {/* Overlay de premium */}
          <View className="absolute top-4 right-4 bg-white/20 rounded-full px-3 py-1">
            <Text className="text-white text-sm font-semibold">PREMIUM</Text>
          </View>

          {/* Contenido de la tarjeta */}
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
              <Ionicons name="bulb-outline" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold mb-1">Optimiza tus Gastos</Text>
              <Text className="text-white/80 text-sm">Recibe análisis inteligente sobre tus transacciones y sugerencias personalizadas</Text>
            </View>
          </View>

          {/* Características premium */}
          <View className="space-y-2 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-2">Análisis de patrones de compra</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-2">Detección de gastos inusuales</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-2">Sugerencias de ahorro personalizadas</Text>
            </View>
          </View>

          {/* Botón de upgrade */}
          <Pressable className="bg-white/20 rounded-2xl p-4 flex-row items-center justify-center">
            <Ionicons name="star" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Actualizar a Premium</Text>
          </Pressable>
        </View>
      </View>

      {/* Tips básicos */}
      <View className="mb-6">
        <Text className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tips Básicos</Text>

        {isExpense ? (
          <>
            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="trending-down-outline" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text className={`font-medium ml-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Controla tus gastos</Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>Registrar cada gasto te ayuda a tener una visión clara de tus finanzas y identificar áreas de mejora.</Text>
            </View>

            <View className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="shield-outline" size={20} color={isDarkMode ? '#FB923C' : '#F97316'} />
                <Text className={`font-medium ml-2 ${isDarkMode ? 'text-orange-300' : 'text-orange-800'}`}>Guarda tus recibos</Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-orange-200' : 'text-orange-700'}`}>Mantén un registro fotográfico de tus boletas para facilitar el seguimiento y gestión de gastos.</Text>
            </View>

            <View className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="wallet-outline" size={20} color={isDarkMode ? '#4ADE80' : '#22C55E'} />
                <Text className={`font-medium ml-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Revisa tu presupuesto</Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                Asegúrate de que este gasto esté dentro de tu presupuesto de {transaction.category?.name || 'la categoría'}.
              </Text>
            </View>
          </>
        ) : (
          <>
            <View className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="trending-up-outline" size={20} color={isDarkMode ? '#4ADE80' : '#22C55E'} />
                <Text className={`font-medium ml-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Excelente ingreso</Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>Registrar tus ingresos te permite tener un panorama completo de tu situación financiera.</Text>
            </View>

            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="wallet-outline" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text className={`font-medium ml-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Ahorra parte de tus ingresos</Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>Considera destinar un porcentaje de este ingreso a tus metas de ahorro o fondo de emergencia.</Text>
            </View>

            <View className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="star-outline" size={20} color={isDarkMode ? '#A78BFA' : '#8B5CF6'} />
                <Text className={`font-medium ml-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>Planifica tu futuro</Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>Usa este ingreso para establecer nuevas metas financieras o mejorar tu presupuesto mensual.</Text>
            </View>
          </>
        )}
      </View>
    </View>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return renderInfoTab()
      case 'image':
        return renderImageTab()
      case 'tips':
        return renderTipsTab()
      default:
        return renderInfoTab()
    }
  }

  return (
    <View className="flex-1">
      {/* Tab Navigation */}
      <View className="px-6 pt-6 pb-4">
        <View className={`flex-row py-1 rounded-full px-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              className={`flex-1 py-2.5 px-4 rounded-full ${tab.selected ? (isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-white border border-gray-100') : ''}`}
              onPress={() => handleTabPress(tab.id)}
            >
              <Text className={`text-center ${tab.selected ? (isDarkMode ? 'text-green-400' : 'text-[#4CAF50]') : isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      <View className="flex-1 px-6 pt-2">{renderTabContent()}</View>
    </View>
  )
}

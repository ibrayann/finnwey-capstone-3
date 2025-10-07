import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Modal, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { ContributionRequest } from '@/types/savings'
import { useAddContribution } from '@/features/goals/hooks/useGoals'

interface AddMoneyModalProps {
  visible: boolean
  onClose: () => void
  goalId: string
  goalName: string
  currentAmount: number
  targetAmount: number
  currency: string
}

const QUICK_AMOUNTS = [100, 500, 1000, 2500, 5000]

export default function AddMoneyModal({ visible, onClose, goalId, goalName, currentAmount, targetAmount, currency }: AddMoneyModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const { isDarkMode } = useTheme()

  // Hook para agregar contribuciones usando Supabase
  const addContributionMutation = useAddContribution()

  // Función para formatear montos en CLP
  const formatCLP = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    return numValue.toLocaleString('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  // Función para formatear el input mientras se escribe
  const formatInputValue = (value: string) => {
    // Remover caracteres no numéricos excepto puntos
    const cleanValue = value.replace(/[^\d]/g, '')
    if (!cleanValue) return ''

    // Convertir a número y formatear
    const numValue = parseInt(cleanValue)
    return numValue.toLocaleString('es-CL')
  }

  // Función para manejar cambios en el input
  const handleAmountChange = (text: string) => {
    // Remover caracteres no numéricos
    const cleanValue = text.replace(/[^\d]/g, '')
    setAmount(cleanValue)
  }

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString())
  }

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido')
      return
    }

    const contributionAmount = parseFloat(amount)
    const newTotal = currentAmount + contributionAmount

    if (newTotal > targetAmount) {
      Alert.alert('Meta Excedida', `Con este aporte excederías tu meta de $${targetAmount.toLocaleString()}. ¿Deseas continuar?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => processContribution(contributionAmount) },
      ])
    } else {
      processContribution(contributionAmount)
    }
  }

  const processContribution = async (contributionAmount: number) => {
    try {
      const contribution: ContributionRequest = {
        goal_id: goalId,
        amount: contributionAmount,
        notes: description.trim() || undefined, // Campo correcto para Supabase
        contribution_date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD para Supabase
        type: 'manual', // Campo correcto para Supabase
      }

      await addContributionMutation.mutateAsync(contribution)

      // Reset form
      setAmount('')
      setDescription('')
      onClose()
    } catch (error) {
      console.error('Error al agregar contribución:', error)
      Alert.alert('Error', 'No se pudo agregar el dinero. Inténtalo de nuevo.')
    }
  }

  const remainingAmount = targetAmount - currentAmount
  const progressPercentage = (currentAmount / targetAmount) * 100

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl h-[85%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-1">
              <Text className="text-gray-800 dark:text-white text-xl font-semibold">Agregar Dinero</Text>
              <Text className="text-gray-500 dark:text-gray-300 text-sm mt-1">{goalName}</Text>
            </View>
            <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center">
              <Ionicons name="close" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
            {/* Progreso actual */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600 dark:text-gray-300 text-sm">Progreso actual</Text>
                <Text className="text-gray-800 dark:text-white font-semibold">{Math.round(progressPercentage)}%</Text>
              </View>
              <View className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                <View className="bg-[#4CAF50] h-2 rounded-full" style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  ${formatCLP(currentAmount)} de ${formatCLP(targetAmount)}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">Faltan ${formatCLP(remainingAmount)}</Text>
              </View>
            </View>

            {/* Montos rápidos */}
            <View className="mb-4">
              <Text className="text-gray-800 dark:text-white text-base font-semibold mb-3">Monto Rápido</Text>
              <View className="flex-row flex-wrap gap-2">
                {QUICK_AMOUNTS.map((quickAmount) => (
                  <Pressable
                    key={quickAmount}
                    onPress={() => handleQuickAmount(quickAmount)}
                    className={`px-3 py-2 rounded-lg border ${
                      amount === quickAmount.toString() ? 'bg-[#4CAF50] border-[#4CAF50]' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${amount === quickAmount.toString() ? 'text-white' : 'text-gray-800 dark:text-white'}`}>${formatCLP(quickAmount)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Input de monto */}
            <View className="mb-4">
              <Text className="text-gray-800 dark:text-white text-base font-semibold mb-3">Monto Personalizado</Text>
              <View className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                <View className="flex-row items-center justify-center">
                  <Text className="text-gray-500 dark:text-gray-400 text-lg mr-1">$</Text>
                  <TextInput
                    value={amount ? formatInputValue(amount) : ''}
                    onChangeText={handleAmountChange}
                    placeholder="0"
                    keyboardType="numeric"
                    className="text-gray-800 dark:text-white text-2xl font-bold text-center flex-1"
                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                  />
                  <Text className="text-gray-500 dark:text-gray-400 text-lg ml-1">CLP</Text>
                </View>
              </View>
            </View>

            {/* Descripción */}
            <View className="mb-4">
              <Text className="text-gray-800 dark:text-white text-base font-semibold mb-3">Descripción (Opcional)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Ej: Ahorro extra del mes..."
                multiline
                numberOfLines={2}
                className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-gray-800 dark:text-white"
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              />
            </View>

            {/* Preview del resultado */}
            {amount && parseFloat(amount) > 0 && (
              <View className="mb-4">
                <Text className="text-gray-800 dark:text-white text-base font-semibold mb-3">Vista Previa</Text>
                <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-green-700 dark:text-green-300 text-sm">Monto actual</Text>
                    <Text className="text-green-800 dark:text-green-200 font-semibold">${formatCLP(currentAmount)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-green-700 dark:text-green-300 text-sm">Aporte</Text>
                    <Text className="text-green-800 dark:text-green-200 font-semibold">+${formatCLP(parseFloat(amount))}</Text>
                  </View>
                  <View className="border-t border-green-200 dark:border-green-700 pt-2 mt-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-green-800 dark:text-green-200 font-semibold">Nuevo total</Text>
                      <Text className="text-green-800 dark:text-green-200 font-bold text-lg">${formatCLP(currentAmount + parseFloat(amount))}</Text>
                    </View>
                    <Text className="text-green-600 dark:text-green-300 text-sm mt-1">Progreso: {Math.round(((currentAmount + parseFloat(amount)) / targetAmount) * 100)}%</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Botones de acción */}
          <View className="p-4 pb-6 border-t border-gray-200 dark:border-gray-700">
            <Pressable
              onPress={handleAddMoney}
              disabled={addContributionMutation.isPending || !amount || parseFloat(amount) <= 0}
              className={`rounded-xl py-4 items-center justify-center ${
                addContributionMutation.isPending || !amount || parseFloat(amount) <= 0 ? 'bg-gray-300 dark:bg-gray-600' : 'bg-[#4CAF50] dark:bg-green-600'
              }`}
            >
              <Text className={`text-lg font-semibold ${addContributionMutation.isPending || !amount || parseFloat(amount) <= 0 ? 'text-gray-500 dark:text-gray-400' : 'text-white'}`}>
                {addContributionMutation.isPending ? 'Agregando...' : 'Agregar Dinero'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

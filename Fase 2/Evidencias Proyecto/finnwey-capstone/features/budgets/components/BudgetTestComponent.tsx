import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useSupabaseBudgets } from '@/features/budgets/hooks/useSupabaseBudgets'

export default function BudgetTestComponent() {
  const { budgets, categories, transactions, loading, error, getBudgetSummary, getActiveBudgets, getUnreadAlerts } = useSupabaseBudgets()

  const budgetSummary = getBudgetSummary()
  const activeBudgets = getActiveBudgets()
  const unreadAlerts = getUnreadAlerts()

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg">Cargando datos de Supabase...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-lg text-red-600 mt-4 text-center">Error: {error}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-6 text-center">Datos de Supabase</Text>

        {/* Resumen */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold mb-3">Resumen de Presupuestos</Text>
          <Text className="text-gray-600">Presupuesto Total: ${budgetSummary.totalBudget.toLocaleString()}</Text>
          <Text className="text-gray-600">Gastado: ${budgetSummary.totalSpent.toLocaleString()}</Text>
          <Text className="text-gray-600">Restante: ${budgetSummary.remainingBudget.toLocaleString()}</Text>
          <Text className="text-gray-600">Porcentaje: {budgetSummary.percentage.toFixed(1)}%</Text>
          <Text className="text-gray-600">Estado: {budgetSummary.status}</Text>
          <Text className="text-gray-600">Días Restantes: {budgetSummary.daysRemaining}</Text>
        </View>

        {/* Presupuestos Activos */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold mb-3">Presupuestos Activos ({activeBudgets.length})</Text>
          {activeBudgets.map((budget) => (
            <View key={budget.id} className="border-b border-gray-200 py-2">
              <Text className="font-medium">{budget.name}</Text>
              <Text className="text-gray-600">
                ${Number(budget.amount).toLocaleString()} - {budget.category_name}
              </Text>
              <Text className="text-gray-500 text-sm">
                {budget.period_type} ({budget.start_date} - {budget.end_date})
              </Text>
            </View>
          ))}
        </View>

        {/* Categorías */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold mb-3">Categorías ({categories.length})</Text>
          {categories.map((category) => (
            <View key={category.id} className="border-b border-gray-200 py-2">
              <Text className="font-medium">{category.name}</Text>
              <Text className="text-gray-600">
                {category.type} - {category.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Transacciones */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold mb-3">Transacciones ({transactions.length})</Text>
          {transactions.map((transaction) => (
            <View key={transaction.id} className="border-b border-gray-200 py-2">
              <Text className="font-medium">${Number(transaction.amount).toLocaleString()}</Text>
              <Text className="text-gray-600">{transaction.categories?.name || 'Sin categoría'}</Text>
              <Text className="text-gray-500 text-sm">{transaction.transaction_date}</Text>
            </View>
          ))}
        </View>

        {/* Alertas */}
        {unreadAlerts.length > 0 && (
          <View className="bg-orange-50 rounded-2xl p-4 mb-4 border border-orange-200">
            <Text className="text-lg font-semibold mb-3 text-orange-800">Alertas ({unreadAlerts.length})</Text>
            {unreadAlerts.map((alert, index) => (
              <View key={index} className="py-2">
                <Text className="text-orange-700">{alert.message}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

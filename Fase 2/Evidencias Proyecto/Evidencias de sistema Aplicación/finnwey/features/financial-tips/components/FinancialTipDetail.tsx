import { View, Text, Modal, Pressable, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { FinancialTip, FinancialTipService } from '../services/financial-tip.service'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useDismissTip } from '../hooks/useFinancialTip'
import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQueryClient } from '@tanstack/react-query'

interface FinancialTipDetailProps {
  tip: FinancialTip | null
  visible: boolean
  onClose: () => void
}

export default function FinancialTipDetail({ tip, visible, onClose }: FinancialTipDetailProps) {
  const { isDarkMode } = useTheme()
  const { mutate: dismissTip } = useDismissTip()
  const queryClient = useQueryClient()
  const [isDismissing, setIsDismissing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isUseful, setIsUseful] = useState(false)
  const [isActioning, setIsActioning] = useState(false)
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false)

  // Cargar feedback y marcar como visto cuando se abre el modal o cambia el tip
  useEffect(() => {
    if (visible && tip?.id) {
      loadTipFeedback()
      // Marcar el tip como visto cuando se abre el modal
      markTipAsViewed()
    } else {
      // Resetear estado cuando se cierra el modal
      setIsLiked(false)
      setIsUseful(false)
    }
  }, [visible, tip?.id])

  const markTipAsViewed = async () => {
    if (!tip?.id) return
    try {
      await FinancialTipService.markTipAsViewed(tip.id)
      // Invalidar cache para que el badge "Nuevo" desaparezca inmediatamente
      queryClient.invalidateQueries({ queryKey: ['financial-tips'] })
    } catch (error) {
      console.error('Error marcando tip como visto:', error)
      // No mostramos error al usuario, es una acción silenciosa
    }
  }

  const loadTipFeedback = async () => {
    if (!tip?.id) return

    setIsLoadingFeedback(true)
    try {
      const feedback = await FinancialTipService.getTipFeedback(tip.id)
      if (feedback) {
        setIsLiked(feedback.isLiked)
        setIsUseful(feedback.isUseful)
      }
    } catch (error) {
      console.error('Error cargando feedback:', error)
    } finally {
      setIsLoadingFeedback(false)
    }
  }

  if (!tip) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444'
      case 'high':
        return '#f59e0b'
      case 'medium':
        return '#4CAF50' // Verde de la app
      case 'low':
        return '#6b7280'
      default:
        return '#4CAF50' // Verde por defecto
    }
  }

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return ['#ef4444', '#dc2626']
      case 'high':
        return ['#f59e0b', '#d97706']
      case 'medium':
        return ['#8B5CF6', '#7C3AED']
      case 'low':
        return ['#6b7280', '#4b5563']
      default:
        return ['#8B5CF6', '#7C3AED']
    }
  }

  const getTipTypeIcon = (tipType: string) => {
    switch (tipType) {
      case 'budget':
        return 'wallet-outline'
      case 'goal':
        return 'flag-outline'
      case 'warning':
        return 'alert-circle-outline'
      case 'achievement':
        return 'trophy-outline'
      case 'recommendation':
        return 'bulb-outline'
      default:
        return 'information-circle-outline'
    }
  }

  const handleDismiss = () => {
    if (!tip.id) return

    Alert.alert(
      'Descartar consejo',
      '¿Estás seguro de que quieres descartar este consejo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => {
            setIsDismissing(true)
            dismissTip(tip.id!, {
              onSuccess: () => {
                setIsDismissing(false)
                onClose()
              },
              onError: () => {
                setIsDismissing(false)
                Alert.alert('Error', 'No se pudo descartar el consejo')
              },
            })
          },
        },
      ]
    )
  }

  const handleLike = async () => {
    if (!tip.id || isActioning) return
    
    setIsActioning(true)
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    
    try {
      await FinancialTipService.saveTipFeedback(tip.id, newLikedState, isUseful)
      setIsActioning(false)
    } catch (error) {
      console.error('Error guardando me gusta:', error)
      setIsLiked(!newLikedState) // Revertir estado
      setIsActioning(false)
      Alert.alert('Error', 'No se pudo guardar tu preferencia')
    }
  }

  const handleUseful = async () => {
    if (!tip.id || isActioning) return
    
    setIsActioning(true)
    const newUsefulState = !isUseful
    setIsUseful(newUsefulState)
    
    try {
      await FinancialTipService.saveTipFeedback(tip.id, isLiked, newUsefulState)
      setIsActioning(false)
    } catch (error) {
      console.error('Error guardando útil:', error)
      setIsUseful(!newUsefulState) // Revertir estado
      setIsActioning(false)
      Alert.alert('Error', 'No se pudo guardar tu preferencia')
    }
  }

  const priorityColor = getPriorityColor(tip.priority)
  const iconName = getTipTypeIcon(tip.tipType) as any

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60">
        <SafeAreaView edges={['top']} className="flex-1 justify-end">
          <View className={`flex-1 rounded-t-3xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`} style={{ maxHeight: '90%' }}>
            {/* Header con gradiente */}
            <View
              className="rounded-t-3xl px-6 pt-6 pb-4"
              style={{ backgroundColor: priorityColor }}
            >
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-1">
                  <Text className="text-white text-2xl font-bold mb-1">
                    Consejo Financiero
                  </Text>
                  <Text className="text-white/80 text-sm">
                    Recomendación personalizada para ti
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* Badges */}
              <View className="flex-row items-center gap-2">
                <View
                  className="px-3 py-1.5 rounded-full bg-white/20 flex-row items-center"
                >
                  <Ionicons name={iconName} size={16} color="white" />
                  <Text className="ml-1.5 text-white text-sm font-semibold">
                    {tip.priority === 'urgent' ? 'Urgente' : tip.priority === 'high' ? 'Alta' : tip.priority === 'medium' ? 'Media' : 'Baja'}
                  </Text>
                </View>
                <View className="px-3 py-1.5 rounded-full bg-white/20">
                  <Text className="text-white text-sm font-medium">
                    {tip.tipType === 'budget' ? 'Presupuesto' : tip.tipType === 'goal' ? 'Meta' : tip.tipType === 'warning' ? 'Alerta' : tip.tipType === 'achievement' ? 'Logro' : 'Recomendación'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Content */}
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Icono destacado */}
              <View className="items-center mb-6">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center"
                  style={{ backgroundColor: priorityColor + '20' }}
                >
                  <Ionicons name={iconName} size={40} color={priorityColor} />
                </View>
              </View>

              {/* Título */}
              <Text
                className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {tip.title}
              </Text>

              {/* Contenido */}
              <View className={`rounded-2xl p-5 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                <Text
                  className={`text-base leading-7 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  style={{ fontWeight: '400' }}
                >
                  {tip.content}
                </Text>
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View
              className={`px-6 pt-4 pb-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              {/* Botones de acción positiva */}
              <View className="flex-row gap-3 mb-3">
                <TouchableOpacity
                  onPress={handleLike}
                  disabled={isActioning}
                  className={`flex-1 py-3.5 rounded-2xl items-center justify-center flex-row ${
                    isLiked
                      ? 'bg-[#4CAF50]/20'
                      : isDarkMode
                        ? 'bg-gray-800'
                        : 'bg-gray-100'
                  }`}
                  style={{
                    borderWidth: isLiked ? 1.5 : 0,
                    borderColor: isLiked ? '#4CAF50' : 'transparent',
                  }}
                >
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isLiked ? '#4CAF50' : isDarkMode ? '#9ca3af' : '#6b7280'}
                  />
                  <Text
                    className={`ml-2 font-semibold text-sm ${
                      isLiked
                        ? 'text-[#4CAF50]'
                        : isDarkMode
                          ? 'text-gray-300'
                          : 'text-gray-700'
                    }`}
                  >
                    Me gusta
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleUseful}
                  disabled={isActioning}
                  className={`flex-1 py-3.5 rounded-2xl items-center justify-center flex-row ${
                    isUseful
                      ? 'bg-[#4CAF50]/20'
                      : isDarkMode
                        ? 'bg-gray-800'
                        : 'bg-gray-100'
                  }`}
                  style={{
                    borderWidth: isUseful ? 1.5 : 0,
                    borderColor: isUseful ? '#4CAF50' : 'transparent',
                  }}
                >
                  <Ionicons
                    name={isUseful ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={20}
                    color={isUseful ? '#4CAF50' : isDarkMode ? '#9ca3af' : '#6b7280'}
                  />
                  <Text
                    className={`ml-2 font-semibold text-sm ${
                      isUseful
                        ? 'text-[#4CAF50]'
                        : isDarkMode
                          ? 'text-gray-300'
                          : 'text-gray-700'
                    }`}
                  >
                    Útil
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Botón de descartar */}
              <TouchableOpacity
                onPress={handleDismiss}
                disabled={isDismissing}
                className={`py-3.5 rounded-2xl items-center justify-center flex-row ${
                  isDismissing
                    ? isDarkMode
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                    : isDarkMode
                      ? 'bg-gray-800'
                      : 'bg-gray-100'
                }`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                {isDismissing ? (
                  <ActivityIndicator size="small" color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color={isDarkMode ? '#9ca3af' : '#6b7280'}
                    />
                    <Text className={`ml-2 font-semibold text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Descartar consejo
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}


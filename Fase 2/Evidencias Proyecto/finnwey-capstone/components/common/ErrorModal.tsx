import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Modal } from '@/components/common/Modal'
import { PrimaryButton } from '@/features/auth/components/welcomeModal/PrimaryButton'
import { useTheme } from '@/features/shared/hooks/useTheme'

interface ErrorModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  message: string
  buttonText?: string
}

export const ErrorModal = ({ visible, onClose, title = 'Lo sentimos', message, buttonText = 'Entendido' }: ErrorModalProps) => {
  const { isDarkMode } = useTheme()

  return (
    <Modal visible={visible} onClose={onClose}>
      <View className={`flex flex-col items-center gap-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Icono de error */}
        <View className={`w-16 h-16 rounded-full items-center justify-center ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
          <Text className="text-3xl">⚠️</Text>
        </View>

        {/* Título */}
        <Text className={`text-xl font-semibold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</Text>

        {/* Mensaje */}
        <Text className={`text-base text-center leading-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{message}</Text>

        {/* Botón de acción */}
        <View className="w-full">
          <PrimaryButton title={buttonText} onPress={onClose} variant="primary" />
        </View>
      </View>
    </Modal>
  )
}

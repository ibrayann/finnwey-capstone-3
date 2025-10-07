import React, { ReactNode } from 'react'
import { View, TouchableOpacity, Text, Modal as RNModal, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import { twMerge } from 'tailwind-merge'
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/features/shared/hooks/useTheme'

interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  blur?: boolean
}

export const Modal = ({ visible, onClose, title, children, className, blur = true }: ModalProps) => {
  const { isDarkMode } = useTheme()

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onClose()
  }

  return (
    <RNModal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/30" onPress={handleClose} />

        <View className={twMerge(`w-full rounded-t-[32px] overflow-hidden pt-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`, className)}>
          <View className={`w-10 h-1.5 rounded-full mx-auto mb-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`} />

          <View className="px-8 pb-8">
            {title && <Text className={`text-[28px] font-semibold text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</Text>}
            {children}
          </View>

          {/* Espacio extra para el bottom safe area */}
          <View className="h-10" />
        </View>
      </View>
    </RNModal>
  )
}

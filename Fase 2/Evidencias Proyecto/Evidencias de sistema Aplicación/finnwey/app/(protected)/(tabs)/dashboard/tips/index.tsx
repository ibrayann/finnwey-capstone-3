import { View, Text, SafeAreaView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { useTheme } from '@/features/shared/hooks/useTheme'
import FinancialTipsList from '@/features/financial-tips/components/FinancialTipsList'
import FinancialTipDetail from '@/features/financial-tips/components/FinancialTipDetail'
import { FinancialTip } from '@/features/financial-tips/services/financial-tip.service'

export default function TipsScreen() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const [selectedTip, setSelectedTip] = useState<FinancialTip | null>(null)
  const [isDetailVisible, setIsDetailVisible] = useState(false)

  const handleTipPress = (tip: FinancialTip) => {
    setSelectedTip(tip)
    setIsDetailVisible(true)
  }

  const handleCloseDetail = () => {
    setIsDetailVisible(false)
    setSelectedTip(null)
  }

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View
          className={`px-4 pt-4 pb-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-4 p-2">
              <Ionicons
                name="arrow-back"
                size={24}
                color={isDarkMode ? '#ffffff' : '#000000'}
              />
            </Pressable>
            <View className="flex-1">
              <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Mis Consejos Financieros
              </Text>
              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Consejos personalizados basados en tu situación financiera
              </Text>
            </View>
          </View>
        </View>

        {/* List */}
        <FinancialTipsList onTipPress={handleTipPress} limit={50} />

        {/* Detail Modal */}
        <FinancialTipDetail
          tip={selectedTip}
          visible={isDetailVisible}
          onClose={handleCloseDetail}
        />
      </SafeAreaView>
    </View>
  )
}


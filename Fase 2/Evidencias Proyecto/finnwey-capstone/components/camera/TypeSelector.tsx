import { View, Text, TouchableOpacity, ScrollView } from 'react-native'

type ReceiptType = 'general' | 'supermarket' | 'restaurant' | 'utility'

interface TypeConfig {
  widthPercent: number
  heightPercent: number
  label: string
}

interface TypeSelectorProps {
  show: boolean
  selectedType: ReceiptType
  configs: Record<ReceiptType, TypeConfig>
  onSelect: (type: ReceiptType) => void
}

export function TypeSelector({ show, selectedType, configs, onSelect }: TypeSelectorProps) {
  if (!show) return null

  return (
    <View className="absolute top-20 left-0 right-0 bg-black/70 py-2 px-4 rounded-lg mx-4">
      <Text className="text-white text-center mb-2">Selecciona el tipo de boleta</Text>
      <ScrollView horizontal className="w-full" showsHorizontalScrollIndicator={false}>
        {Object.entries(configs).map(([type, config]) => (
          <TouchableOpacity key={type} onPress={() => onSelect(type as ReceiptType)} className={`mr-3 py-2 px-4 rounded-lg ${selectedType === type ? 'bg-blue-500' : 'bg-gray-700'}`}>
            <Text className="text-white">{config.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

export default TypeSelector

import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface NumericKeyboardProps {
  onKeyPress: (key: string) => void
  onDelete: () => void
}

export default function NumericKeyboard({ onKeyPress, onDelete }: NumericKeyboardProps) {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
  ]

  return (
    <View className="w-full">
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-around my-2">
          {row.map((key, keyIndex) => (
            <TouchableOpacity
              key={keyIndex}
              onPress={() => (key === 'delete' ? onDelete() : onKeyPress(key))}
              className={`w-20 h-20 rounded-full items-center justify-center ${!key ? 'opacity-0' : ''}`}
              disabled={!key}
            >
              {key === 'delete' ? <Ionicons name="backspace-outline" size={24} color="#4B5ED9" /> : <Text className="text-2xl font-medium text-black">{key}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  )
}

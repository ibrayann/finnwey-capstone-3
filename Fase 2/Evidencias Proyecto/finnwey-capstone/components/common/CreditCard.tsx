import React from 'react'
import { View, Text, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface CreditCardProps {
  lastFourDigits: string
  amount: string
  name: string
  expiryDate: string
  cardType?: 'visa' | 'mastercard'
  style?: any
}

export const CreditCard = ({ lastFourDigits, amount, name, expiryDate, cardType = 'visa', style }: CreditCardProps) => {
  return (
    <View style={style} className="relative mx-auto">
      <LinearGradient colors={['#F5F7FF', '#E8EDFF']} className="w-[340px] h-[200px] rounded-2xl overflow-hidden p-5" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {/* Dots pattern in background */}
        <View className="absolute inset-0 opacity-25">
          {Array.from({ length: 10 }).map((_, rowIndex) => (
            <View key={`row-${rowIndex}`} className="flex-row justify-between">
              {Array.from({ length: 15 }).map((_, colIndex) => (
                <View key={`dot-${rowIndex}-${colIndex}`} className="w-1 h-1 rounded-full bg-primary-light m-3" />
              ))}
            </View>
          ))}
        </View>

        {/* Card content */}
        <View className="flex-1 justify-between">
          <View className="flex-row justify-between items-start">
            {cardType === 'visa' ? <Text className="text-2xl font-bold text-black">VISA</Text> : <Text className="text-2xl font-bold text-black">MASTERCARD</Text>}
            <View className="w-10 h-8 bg-yellow-400 rounded-md border border-yellow-500 overflow-hidden">
              <View className="flex-row h-2 mt-1">
                <View className="w-2 h-full bg-yellow-600"></View>
                <View className="w-2 h-full bg-yellow-600 ml-1"></View>
                <View className="w-2 h-full bg-yellow-600 ml-1"></View>
              </View>
            </View>
          </View>

          <View className="mt-2">
            <Text className="text-xs text-gray-500">Card Number</Text>
            <Text className="text-lg font-medium">{lastFourDigits} **** **** ****</Text>
          </View>

          <View className="flex-row justify-between mt-6">
            <View>
              <Text className="text-xs text-gray-500">Amount</Text>
              <Text className="text-lg font-bold">${amount}</Text>
              <Text className="text-sm font-medium">{name}</Text>
            </View>

            <View className="items-end">
              <Text className="text-xs text-gray-500">Expiry</Text>
              <Text className="text-lg font-medium">{expiryDate}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}

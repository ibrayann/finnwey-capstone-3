import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { CardStackPNG } from '@/components/common/CardStackPNG'
import { WelcomeModal } from '@/features/auth/components/WelcomeModal'
import { FontAwesome, FontAwesome5, AntDesign } from '@expo/vector-icons'
import '../global.css'

export default function WelcomeScreen() {
  const [showModal, setShowModal] = useState(false)

  const handleGetStarted = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#111827', '#1f2937', '#4CAF50']} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 40, flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome name="forumbee" size={28} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>Finnwey</Text>
          </View>

          {/* Card Stack */}
          <View style={{ marginTop: 100 }}>
            <CardStackPNG />
          </View>

          {/* Content */}
          <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'flex-end', paddingBottom: 40 }}>
            <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>Seguimiento de Gastos Inteligente con Finnwey</Text>
            <Text style={{ color: 'white', fontSize: 16, opacity: 0.8, marginTop: 16 }}>Gestiona tus finanzas fácilmente y alcanza tus objetivos con Finnwey, simple, efectivo y inteligente.</Text>

            <TouchableOpacity
              onPress={handleGetStarted}
              style={{
                backgroundColor: 'white',
                paddingVertical: 16,
                borderRadius: 30,
                marginTop: 48,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#111827', fontWeight: 'bold', fontSize: 16 }}>Comenzar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <WelcomeModal visible={showModal} onClose={handleCloseModal} />
      </LinearGradient>
    </View>
  )
}

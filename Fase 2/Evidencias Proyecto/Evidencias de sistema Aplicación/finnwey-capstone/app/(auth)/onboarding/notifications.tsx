import React from 'react'
import { View, Text, Pressable, useColorScheme, Alert } from 'react-native'
import { router } from 'expo-router'
import { AntDesign } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NotificationsScreen() {
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  const handleBack = () => {
    router.back()
  }

  const handleTurnOn = async () => {
    try {
      // TODO: Instalar expo-notifications con: npx expo install expo-notifications
      // const { status } = await Notifications.requestPermissionsAsync()

      // Por ahora, simulamos la solicitud de permisos
      Alert.alert('Permisos de Notificaciones', '¿Deseas recibir notificaciones de Finnwey?', [
        {
          text: 'No permitir',
          onPress: () => {
            console.log('Permisos de notificaciones denegados')
            router.push('/(protected)/(tabs)/dashboard')
          },
          style: 'cancel',
        },
        {
          text: 'Permitir',
          onPress: () => {
            console.log('Permisos de notificaciones concedidos')
            router.push('/(protected)/(tabs)/dashboard')
          },
        },
      ])
    } catch (error) {
      console.log('Error al solicitar permisos:', error)
      router.push('/(protected)/(tabs)/dashboard')
    }
  }

  const handleNotNow = () => {
    router.push('/(protected)/(tabs)/dashboard')
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-1 px-6">
        {/* Header con botón de retroceso */}
        <Pressable onPress={handleBack} className={`h-12 w-12 rounded-full items-center justify-center mt-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <AntDesign name="arrow-left" size={24} color={isDark ? '#ffffff' : '#000000'} />
        </Pressable>

        {/* Contenido principal */}
        <View className="flex-1 justify-between px-4">
          {/* Título */}
          <View className="mt-16">
            <Text className={`text-[32px] font-bold text-left leading-9 ${isDark ? 'text-white' : 'text-black'}`}>¡No te pierdas ninguna actualización sobre tu dinero!</Text>
          </View>

          {/* Descripción */}
          <View className="mt-8">
            <Text className={`text-base text-left leading-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Mantente informado con actualizaciones oportunas para administrar tu dinero de forma efectiva.
            </Text>
          </View>

          {/* Ilustración */}
          <View className="flex-1 justify-center items-center">
            <View className="w-80 h-80 bg-blue-200/40 dark:bg-blue-900/20 rounded-full items-center justify-center relative">
              {/* Teléfono */}
              <View className="w-44 h-56 bg-black dark:bg-gray-900 rounded-[28px] items-center justify-start p-1 relative shadow-xl">
                {/* Pantalla del teléfono */}
                <View className="w-full h-full bg-gray-100 dark:bg-gray-200 rounded-[24px] p-4 relative overflow-hidden">
                  {/* Líneas de contenido simulado */}
                  <View className="space-y-2 mt-8">
                    <View className="h-2 bg-gray-300 rounded-full w-3/4" />
                    <View className="h-2 bg-gray-300 rounded-full w-1/2" />
                    <View className="h-2 bg-gray-300 rounded-full w-2/3" />
                    <View className="h-2 bg-gray-300 rounded-full w-3/5" />
                  </View>

                  {/* Notificación */}
                  <View className="absolute top-4 left-4 right-4 bg-white rounded-xl p-3 shadow-lg border border-gray-200">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-[#4CAF50] rounded-full items-center justify-center mr-3">
                        <Text className="text-white text-xs">💰</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium text-xs">Finnwey</Text>
                        <Text className="text-gray-600 text-xs mt-0.5">Nueva transacción agregada</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Botón home */}
                <View className="absolute bottom-2 w-20 h-1 bg-gray-600 rounded-full" />

                {/* Cámara */}
                <View className="absolute top-3 w-16 h-1.5 bg-gray-700 rounded-full" />
              </View>

              {/* Punto rojo de notificación */}
              <View className="absolute top-16 right-12 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md" />
            </View>
          </View>
        </View>

        {/* Botones */}
        <View className="pb-12 px-4">
          <View className="flex-row gap-4">
            <Pressable
              onPress={handleNotNow}
              className="flex-1 py-4 rounded-full items-center"
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Ahora no</Text>
            </Pressable>

            <Pressable
              onPress={handleTurnOn}
              className="flex-1 bg-[#4CAF50] py-4 rounded-full items-center"
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text className="text-white text-lg font-semibold">Encender</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

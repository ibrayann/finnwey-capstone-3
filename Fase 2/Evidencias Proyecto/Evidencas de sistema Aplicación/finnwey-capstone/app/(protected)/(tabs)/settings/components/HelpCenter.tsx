import { View, Text, Pressable, ScrollView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

interface HelpCategory {
  id: string
  title: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
}

interface ContactOption {
  id: string
  title: string
  contact: string
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
}

export default function HelpCenter() {
  const { isDarkMode } = useTheme()

  const helpCategories: HelpCategory[] = [
    {
      id: 'faqs',
      title: 'Preguntas Frecuentes',
      description: 'Encuentra respuestas rápidas a las preguntas más comunes.',
      icon: 'help-circle-outline',
      onPress: () => {
        router.push('/settings/faq')
      },
    },
    {
      id: 'account',
      title: 'Soporte de Cuenta',
      description: 'Ayuda con problemas de inicio de sesión, recuperación de contraseña y configuración de cuenta.',
      icon: 'person-outline',
      onPress: () => {
        // Navegar a soporte de cuenta
        console.log('Navegar a soporte de cuenta')
      },
    },
    {
      id: 'billing',
      title: 'Facturación y Pagos',
      description: 'Información sobre suscripciones, facturas y solución de problemas de pago.',
      icon: 'card-outline',
      onPress: () => {
        // Navegar a facturación
        console.log('Navegar a facturación')
      },
    },
    {
      id: 'features',
      title: 'Funciones y Uso',
      description: 'Aprende a usar todas las funciones de la aplicación de manera efectiva.',
      icon: 'phone-portrait-outline',
      onPress: () => {
        // Navegar a funciones
        console.log('Navegar a funciones')
      },
    },
    {
      id: 'contact',
      title: 'Contactar Soporte',
      description: '¿No encuentras lo que buscas? Comunícate con nuestro equipo de soporte.',
      icon: 'call-outline',
      onPress: () => {
        // Navegar a contacto
        console.log('Navegar a contacto')
      },
    },
  ]

  const contactOptions: ContactOption[] = [
    {
      id: 'email',
      title: 'Correo Electrónico',
      contact: 'soporte@finnwey.com',
      icon: 'mail-outline',
      onPress: () => {
        // Abrir email
        console.log('Abrir email')
      },
    },
    {
      id: 'phone',
      title: 'Teléfono',
      contact: 'Llámanos al +1-800-FINNWEY',
      icon: 'call-outline',
      onPress: () => {
        // Llamar
        console.log('Llamar')
      },
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4">
          <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
          </TouchableOpacity>

          <Text className="text-[28px] font-semibold text-black dark:text-white mb-2">Centro de Ayuda</Text>
          <Text className="text-gray-400 dark:text-gray-300 text-base">Tu recurso principal para respuestas, orientación y soporte.</Text>
        </View>

        {/* Categorías de Ayuda */}
        <View className="px-4">
          <View className="gap-3 mb-8">
            {helpCategories.map((category) => (
              <HelpCategoryItem key={category.id} category={category} />
            ))}
          </View>

          {/* Opciones de Contacto Directo */}
          <View className="mb-8">
            <Text className="text-xl font-semibold mb-4 text-black dark:text-white">Contacto Directo</Text>
            <View className="flex-row gap-3">
              {contactOptions.map((option) => (
                <ContactOptionItem key={option.id} option={option} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function HelpCategoryItem({ category }: { category: HelpCategory }) {
  const { isDarkMode } = useTheme()

  return (
    <Pressable onPress={category.onPress} className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
      <View className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-4">
        <Ionicons name={category.icon} size={24} color={isDarkMode ? '#ffffff' : '#4CAF50'} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-black dark:text-white mb-1">{category.title}</Text>
        <Text className="text-gray-500 dark:text-gray-300 text-sm">{category.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
    </Pressable>
  )
}

function ContactOptionItem({ option }: { option: ContactOption }) {
  const { isDarkMode } = useTheme()

  return (
    <Pressable onPress={option.onPress} className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
      <View className="items-center">
        <View className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-3">
          <Ionicons name={option.icon} size={24} color={isDarkMode ? '#ffffff' : '#4CAF50'} />
        </View>
        <Text className="text-lg font-semibold text-black dark:text-white mb-1">{option.title}</Text>
        <Text className="text-gray-500 dark:text-gray-300 text-sm text-center">{option.contact}</Text>
      </View>
    </Pressable>
  )
}

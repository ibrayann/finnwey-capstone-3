import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

interface FAQCard {
  id: string
  icon: keyof typeof Ionicons.glyphMap
  question: string
  answer: string
}

interface TopicItem {
  id: string
  icon: keyof typeof Ionicons.glyphMap
  title: string
  disabled?: boolean
}

export default function FAQScreen() {
  const { isDarkMode } = useTheme()

  const faqCards: FAQCard[] = [
    {
      id: '1',
      icon: 'person-outline',
      question: '¿Cómo creo una cuenta?',
      answer: 'Haz clic en "Registrarse" en la página principal, ingresa tus datos y sigue las instrucciones.',
    },
    {
      id: '2',
      icon: 'lock-closed-outline',
      question: '¿Olvidaste tu contraseña?',
      answer: 'Selecciona "Olvidé mi contraseña" en la pantalla de inicio de sesión y sigue los pasos para restablecerla.',
    },
    {
      id: '3',
      icon: 'card-outline',
      question: '¿Cómo agrego una tarjeta?',
      answer: 'Ve a Configuración > Cuentas Bancarias y sigue el proceso de vinculación.',
    },
  ]

  const topicItems: TopicItem[] = [
    {
      id: 'billing',
      icon: 'receipt-outline',
      title: 'Facturación y Pagos',
    },
    {
      id: 'budgeting',
      icon: 'trending-up-outline',
      title: 'Herramientas de Presupuesto',
    },
    {
      id: 'security',
      icon: 'shield-checkmark-outline',
      title: 'Configuración de Seguridad',
      disabled: true,
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

          <Text className="text-[28px] font-semibold text-black dark:text-white mb-2">Preguntas Frecuentes</Text>
          <Text className="text-gray-400 dark:text-gray-300 text-base">Encuentra respuestas rápidas a preguntas comunes y soluciones a tus inquietudes.</Text>
        </View>

        {/* Search Bar */}
        <View className="px-4 mb-8">
          <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3">
            <Ionicons name="search" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <TextInput className="flex-1 ml-3 text-black dark:text-white text-base" placeholder="Buscar preguntas frecuentes..." placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'} />
          </View>
        </View>

        {/* General Questions Section */}
        <View className="px-4 mb-8">
          <Text className="text-xl font-semibold text-black dark:text-white mb-4">Preguntas Generales</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4">
            {faqCards.map((card) => (
              <FAQCard key={card.id} card={card} />
            ))}
          </ScrollView>
        </View>

        {/* Help by Topic Section */}
        <View className="px-4 mb-8">
          <Text className="text-xl font-semibold text-black dark:text-white mb-4">Ayuda por Temas</Text>
          <View className="gap-3">
            {topicItems.map((item) => (
              <TopicItem key={item.id} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function FAQCard({ card }: { card: FAQCard }) {
  const { isDarkMode } = useTheme()

  return (
    <TouchableOpacity className="w-80 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
      <View className="items-center mb-3">
        <View className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 items-center justify-center">
          <Ionicons name={card.icon} size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
        </View>
      </View>
      <Text className="text-black dark:text-white font-semibold text-base mb-2 text-center">{card.question}</Text>
      <Text className="text-gray-500 dark:text-gray-300 text-sm text-center leading-5">{card.answer}</Text>
    </TouchableOpacity>
  )
}

function TopicItem({ item }: { item: TopicItem }) {
  const { isDarkMode } = useTheme()

  return (
    <TouchableOpacity className={`bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex-row items-center ${item.disabled ? 'opacity-50' : ''}`} disabled={item.disabled}>
      <View className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 items-center justify-center mr-4">
        <Ionicons name={item.icon} size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
      </View>
      <Text className={`text-black dark:text-white font-medium text-base flex-1 ${item.disabled ? 'text-gray-400 dark:text-gray-500' : ''}`}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
    </TouchableOpacity>
  )
}

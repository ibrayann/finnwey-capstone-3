import { Tabs, usePathname } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from '@/features/shared/hooks/useTheme'

function ScanButton() {
  const { isDarkMode } = useTheme()

  const handlePress = () => {
    // Aquí implementaremos la lógica para abrir la cámara
    router.push('/scan')
  }

  return (
    <View className="items-center">
      <TouchableOpacity onPress={handlePress} className={`w-20 h-20 rounded-full items-center justify-center -mt-10 shadow-sm ${isDarkMode ? 'bg-green-600' : 'bg-[#4CAF50]'}`}>
        <Ionicons name="scan" size={30} color="white" />
      </TouchableOpacity>
    </View>
  )
}

export default function TabsLayout() {
  const pathname = usePathname()
  const { isDarkMode } = useTheme()
  const hiddenTabBarRoutes = ['/dashboard/savings', '/dashboard/add-goal', '/dashboard/budget', '/settings/subscription', '/settings/help', '/settings/edit-profile', '/settings/faq']
  const tabBarVisible = !hiddenTabBarRoutes.includes(pathname)

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          display: tabBarVisible ? 'flex' : 'none',
          backgroundColor: isDarkMode ? '#1f2937' : 'white',
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? '#374151' : '#e5e7eb',
          height: 90,
          paddingHorizontal: 20,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarActiveTintColor: isDarkMode ? '#4ade80' : '#4CAF50',
        tabBarInactiveTintColor: isDarkMode ? '#9ca3af' : '#64748b',
        tabBarItemStyle: {
          paddingVertical: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan/index"
        options={{
          title: '',
          tabBarButton: () => <ScanButton />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}

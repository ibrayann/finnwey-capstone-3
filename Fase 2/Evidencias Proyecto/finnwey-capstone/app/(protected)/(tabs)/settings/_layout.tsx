import { Stack } from 'expo-router'
import { useTheme } from '@/features/shared/hooks/useTheme'

export default function SettingsLayout() {
  const { isDarkMode } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? '#1f2937' : 'white',
        },
        headerTintColor: isDarkMode ? '#ffffff' : '#4CAF50',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Ajustes',
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="faq"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}

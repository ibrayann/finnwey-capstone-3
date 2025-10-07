import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'

export default function AuthLayout() {
  const systemColorScheme = useColorScheme()
  const isDark = systemColorScheme === 'dark'

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? '#111827' : '#ffffff',
        },
      }}
    >
      {/* Las rutas de onboarding se manejan automáticamente por Expo Router */}
    </Stack>
  )
}

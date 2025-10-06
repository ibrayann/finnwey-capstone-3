import { Stack } from 'expo-router'
import { useAuthStore } from '@/store/auth.store'

export default function ProtectedLayout() {
  // ✅ Usar directamente el store para evitar suscripciones duplicadas
  const isLoading = useAuthStore((state) => state.isLoading)

  if (isLoading) {
    return null
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}

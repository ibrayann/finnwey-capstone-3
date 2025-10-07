import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useAuthStore } from '@/store/auth.store'
import { useEffect } from 'react'
import '../global.css'

function RootLayoutContent() {
  const { isDarkMode } = useTheme()
  const { initSession, setupAuthListener } = useAuthStore()

  // Inicializar auth al montar
  useEffect(() => {
    initSession()
    const unsubscribe = setupAuthListener()
    return unsubscribe
  }, [])

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
      </Stack>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </>
  )
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </QueryProvider>
  )
}

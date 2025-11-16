import { Stack, useNavigation, useRouter } from 'expo-router'
import { useEffect } from 'react'

export default function DashboardLayout() {
  const router = useRouter()
  const navigation = useNavigation()

  // Esta es la configuración clave para el problema de navegación por gestos
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Solo interceptamos si estamos en add-goal
      if (e.target?.includes('add-goal')) {
        // Verificamos si debemos ir a savings en lugar de la ruta por defecto
        const shouldGoToSavings = true // Siempre queremos ir a savings desde add-goal

        if (shouldGoToSavings) {
          // Prevenimos la navegación por defecto
          e.preventDefault()

          // Redirigimos a savings
          router.push('/dashboard/savings')
        }
      }
    })

    return unsubscribe
  }, [navigation, router])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add-money" />
      <Stack.Screen name="budget/index" />
      <Stack.Screen name="history" />
      <Stack.Screen name="more" />
      <Stack.Screen
        name="savings/index"
        options={{
          gestureEnabled: true,
        }}
      />
      {/* <Stack.Screen
        name="add-goal/index"
        options={{
          gestureEnabled: true,
          presentation: 'card',
        }}
      /> */}
      <Stack.Screen
        name="savings/detail"
        options={{
          gestureEnabled: true,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="savings/all"
        options={{
          gestureEnabled: true,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="add-transaction/index"
        options={{
          gestureEnabled: true,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="report/index"
        options={{
          gestureEnabled: true,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="tips/index"
        options={{
          gestureEnabled: true,
          presentation: 'card',
          headerShown: false,
        }}
      />
    </Stack>
  )
}

import { Stack } from 'expo-router'

export default function CompleteProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="phase-1" />
      <Stack.Screen name="phase-2" />
      <Stack.Screen name="phase-3" />
    </Stack>
  )
}

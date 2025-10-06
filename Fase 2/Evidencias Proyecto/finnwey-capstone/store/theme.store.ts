import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ColorSchemeName } from 'react-native'

interface ThemeState {
  theme: ColorSchemeName
  isDarkMode: boolean
  setTheme: (theme: ColorSchemeName) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      isDarkMode: false,
      setTheme: (theme) =>
        set({
          theme,
          isDarkMode: theme === 'dark',
        }),
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        set({
          theme: newTheme,
          isDarkMode: newTheme === 'dark',
        })
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

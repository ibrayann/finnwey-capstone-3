import React, { createContext, useContext, useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { useThemeStore } from '@/store/theme.store'
import { useColorScheme as useNativeWindColorScheme } from 'nativewind'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const { theme, setTheme, toggleTheme, isDarkMode } = useThemeStore()
  const { setColorScheme } = useNativeWindColorScheme()

  // Sincronizar con el tema del sistema al iniciar
  useEffect(() => {
    if (!theme || theme === 'light') {
      const initialTheme = systemColorScheme || 'light'
      setTheme(initialTheme)
      setColorScheme(initialTheme)
    }
  }, [systemColorScheme])

  // Sincronizar NativeWind cuando cambie el tema
  useEffect(() => {
    setColorScheme(theme || 'light')
  }, [theme, setColorScheme])

  const value: ThemeContextType = {
    isDarkMode,
    toggleTheme,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

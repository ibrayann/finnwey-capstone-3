import { useThemeStore } from '@/store/theme.store'

export const useTheme = () => {
  const { theme, isDarkMode, setTheme, toggleTheme } = useThemeStore()

  return {
    theme,
    isDarkMode,
    setTheme,
    toggleTheme,
  }
}

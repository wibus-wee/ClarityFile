import { useContext } from 'react'
import { ThemeContext } from './custom-theme-context'
import type { ExtendedThemeContextValue } from '@renderer/types/theme'

export function useCustomTheme(): ExtendedThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider')
  }
  return context
}

import { createContext } from 'react'
import type { ExtendedThemeContextValue } from '@renderer/types/theme'

export const ThemeContext = createContext<ExtendedThemeContextValue | undefined>(undefined)

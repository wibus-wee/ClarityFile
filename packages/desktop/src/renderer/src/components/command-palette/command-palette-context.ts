import { createContext, useContext } from 'react'
import type { CommandPaletteContextValue } from './types'

/**
 * Command Palette Context
 */
export const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

/**
 * 使用 Command Palette Context 的 Hook
 */
export function useCommandPaletteContext() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPaletteContext must be used within a CommandPaletteProvider')
  }
  return context
}

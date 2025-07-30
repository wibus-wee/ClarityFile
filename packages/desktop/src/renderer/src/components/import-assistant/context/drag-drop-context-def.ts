import { createContext } from 'react'
import type { DragDropContextValue } from './drag-drop-types'

/**
 * 拖拽状态Context
 */
export const DragDropContext = createContext<DragDropContextValue | null>(null)

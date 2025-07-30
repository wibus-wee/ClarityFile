import { useContext } from 'react'
import { DragDropContext } from './drag-drop-context-def'
import type { DragDropContextValue, DragDropContextData } from './drag-drop-types'

/**
 * 使用拖拽状态的Hook
 */
export function useDragDrop(): DragDropContextValue {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider')
  }
  return context
}

/**
 * 仅获取拖拽状态的Hook（用于只读组件）
 */
export function useDragDropState(): DragDropContextData {
  const { isDragging, dragCounter } = useDragDrop()
  return { isDragging, dragCounter }
}

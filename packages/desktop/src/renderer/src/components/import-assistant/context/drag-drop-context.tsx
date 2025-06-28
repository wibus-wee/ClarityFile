import { createContext, useContext, useState, ReactNode } from 'react'

/**
 * 拖拽状态数据
 */
interface DragDropContextData {
  /** 是否正在拖拽文件 */
  isDragging: boolean
  /** 拖拽计数器，用于处理嵌套的拖拽事件 */
  dragCounter: number
}

/**
 * 拖拽状态操作
 */
interface DragDropContextActions {
  /** 开始拖拽 */
  startDragging: () => void
  /** 结束拖拽 */
  stopDragging: () => void
  /** 增加拖拽计数 */
  incrementDragCounter: () => void
  /** 减少拖拽计数 */
  decrementDragCounter: () => void
  /** 重置拖拽状态 */
  resetDragState: () => void
}

type DragDropContextValue = DragDropContextData & DragDropContextActions

/**
 * 拖拽状态Context
 */
const DragDropContext = createContext<DragDropContextValue | null>(null)

/**
 * 拖拽状态Provider组件
 */
export interface DragDropProviderProps {
  children: ReactNode
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const startDragging = () => {
    document.body.classList.add('file-dragging')
    setIsDragging(true)
  }

  const stopDragging = () => {
    document.body.classList.remove('file-dragging')
    setIsDragging(false)
  }

  const incrementDragCounter = () => {
    setDragCounter((prev) => {
      const newCount = prev + 1
      if (newCount === 1) {
        document.body.classList.add('file-dragging')
        setIsDragging(true)
      }
      return newCount
    })
  }

  const decrementDragCounter = () => {
    setDragCounter((prev) => {
      const newCount = Math.max(0, prev - 1)
      if (newCount === 0) {
        document.body.classList.remove('file-dragging')
        setIsDragging(false)
      }
      return newCount
    })
  }

  const resetDragState = () => {
    document.body.classList.remove('file-dragging')
    setIsDragging(false)
    setDragCounter(0)
  }

  const contextValue: DragDropContextValue = {
    isDragging,
    dragCounter,
    startDragging,
    stopDragging,
    incrementDragCounter,
    decrementDragCounter,
    resetDragState
  }

  return <DragDropContext.Provider value={contextValue}>{children}</DragDropContext.Provider>
}

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

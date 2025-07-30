import { ReactNode } from 'react'

/**
 * 拖拽状态数据
 */
export interface DragDropContextData {
  /** 是否正在拖拽文件 */
  isDragging: boolean
  /** 拖拽计数器，用于处理嵌套的拖拽事件 */
  dragCounter: number
}

/**
 * 拖拽状态操作
 */
export interface DragDropContextActions {
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

export type DragDropContextValue = DragDropContextData & DragDropContextActions

/**
 * 拖拽状态Provider组件Props
 */
export interface DragDropProviderProps {
  children: ReactNode
}

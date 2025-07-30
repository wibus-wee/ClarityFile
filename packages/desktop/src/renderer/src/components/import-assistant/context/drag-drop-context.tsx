import { useState } from 'react'
import { DragDropContext } from './drag-drop-context-def'
import type { DragDropProviderProps, DragDropContextValue } from './drag-drop-types'

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

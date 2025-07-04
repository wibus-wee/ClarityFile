import { useCallback, useEffect } from 'react'
import type { KeyboardHandlerOptions } from '../types/command-box.types'

/**
 * 键盘导航处理 Hook
 * 处理 Command Box 内的键盘事件和导航逻辑
 */
export function useKeyboard({
  selectedIndex,
  setSelectedIndex,
  totalItems,
  onSelect,
  onClose,
  onEscape
}: KeyboardHandlerOptions) {
  
  // 处理键盘事件
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex((selectedIndex + 1) % totalItems)
        break
        
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(selectedIndex === 0 ? totalItems - 1 : selectedIndex - 1)
        break
        
      case 'Enter':
        event.preventDefault()
        onSelect(selectedIndex)
        break
        
      case 'Escape':
        event.preventDefault()
        if (onEscape) {
          onEscape()
        } else {
          onClose()
        }
        break
        
      case 'Tab':
        event.preventDefault()
        // Tab 键切换分组（如果有分组的话）
        setSelectedIndex((selectedIndex + 1) % totalItems)
        break
        
      // 数字键快速选择 (1-9)
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        event.preventDefault()
        const index = parseInt(event.key) - 1
        if (index < totalItems) {
          onSelect(index)
        }
        break
        
      // Cmd/Ctrl + K 关闭（如果已经打开）
      case 'k':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault()
          onClose()
        }
        break
        
      default:
        // 其他键不处理，让输入框正常工作
        break
    }
  }, [selectedIndex, setSelectedIndex, totalItems, onSelect, onClose, onEscape])
  
  return {
    handleKeyDown
  }
}

/**
 * 全局快捷键处理 Hook
 * 处理全局的 Cmd+K / Ctrl+K 快捷键
 */
export function useGlobalKeyboard(onToggle: () => void) {
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Cmd+K / Ctrl+K 切换 Command Box
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onToggle()
      }
    }
    
    // 添加全局事件监听器
    window.addEventListener('keydown', handleGlobalKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [onToggle])
}

/**
 * 搜索输入框键盘处理 Hook
 * 专门处理搜索输入框的键盘事件
 */
export function useSearchKeyboard({
  onArrowDown,
  onArrowUp,
  onEnter,
  onEscape
}: {
  onArrowDown?: () => void
  onArrowUp?: () => void
  onEnter?: () => void
  onEscape?: () => void
}) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        onArrowDown?.()
        break
        
      case 'ArrowUp':
        event.preventDefault()
        onArrowUp?.()
        break
        
      case 'Enter':
        event.preventDefault()
        onEnter?.()
        break
        
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
        
      default:
        // 其他键让输入框正常处理
        break
    }
  }, [onArrowDown, onArrowUp, onEnter, onEscape])
  
  return {
    handleKeyDown
  }
}

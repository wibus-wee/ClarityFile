import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Command } from 'cmdk'
import {
  useCommandPaletteOpen,
  useCommandPaletteActions,
  useCommandPaletteQuery,
  useCommandPaletteActiveCommand
} from './stores/command-palette-store'
import { CommandPaletteInput } from './command-palette-input'
import { CommandPaletteResults } from './command-palette-results'

/**
 * Command Palette 主覆盖层组件
 *
 * 功能：
 * - 使用 React Portal 渲染模态覆盖层
 * - 处理点击外部关闭行为
 * - 管理焦点陷阱
 * - 提供一致的样式和动画
 * - 集成 cmdk 库
 */
export function CommandPaletteOverlay() {
  const isOpen = useCommandPaletteOpen()
  const { close, setQuery, setActiveCommand } = useCommandPaletteActions()
  const query = useCommandPaletteQuery()
  const activeCommand = useCommandPaletteActiveCommand()
  const overlayRef = useRef<HTMLDivElement>(null)
  const commandRef = useRef<HTMLDivElement>(null)

  // 处理 Escape 键的层级逻辑
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()

        // 层级处理逻辑：
        // 1. 如果有搜索查询，清空查询
        if (query.trim()) {
          setQuery('')
          return
        }

        // 2. 如果有激活的命令视图，关闭命令视图
        if (activeCommand) {
          setActiveCommand(null)
          return
        }

        // 3. 都没有时，关闭整个面板
        close()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, query, activeCommand, close, setQuery, setActiveCommand])

  // 处理点击外部关闭
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      close()
    }
  }

  // 焦点管理
  useEffect(() => {
    if (isOpen && commandRef.current) {
      // 自动聚焦到搜索输入框
      const input = commandRef.current.querySelector('input')
      if (input) {
        input.focus()
      }
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="mt-[20vh] w-full max-w-2xl">
        <Command
          ref={commandRef}
          className="mx-4 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-2xl"
          shouldFilter={false} // 我们将自己处理过滤
        >
          <CommandPaletteInput />
          <CommandPaletteResults />
        </Command>
      </div>
    </div>,
    document.body
  )
}

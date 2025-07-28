import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Command } from 'cmdk'
import {
  useCommandPaletteOpen,
  useCommandPaletteActions,
  useCommandPaletteQuery,
  useCommandPaletteActiveCommand,
  useAllCommands
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
          <CommandPaletteStatusBar />
        </Command>
      </div>
    </div>,
    document.body
  )
}

/**
 * Command Palette 底部状态栏组件
 *
 * 功能：
 * - 显示当前状态（搜索模式 vs 命令详情模式）
 * - 显示快捷键提示
 * - 模仿 Raycast 的底部状态栏设计
 */
function CommandPaletteStatusBar() {
  const activeCommandId = useCommandPaletteActiveCommand()
  const allCommands = useAllCommands()

  // 查找当前激活的命令
  const activeCommand = activeCommandId
    ? allCommands.find((cmd) => cmd.id === activeCommandId)
    : null

  // 是否在 details view
  const isInDetailsView = !!activeCommand

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        {isInDetailsView && activeCommand ? (
          <>
            {activeCommand.icon && <activeCommand.icon className="h-3 w-3" />}
            <span>{activeCommand.title}</span>
          </>
        ) : (
          <>
            <span>ClarityFile</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isInDetailsView ? (
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">←</kbd>
            <span>Back</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">↵</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

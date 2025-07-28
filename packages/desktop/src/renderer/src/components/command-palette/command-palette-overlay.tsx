import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-start justify-center"
          onClick={handleOverlayClick}
        >
          <div className="mt-[15vh] w-full max-w-[48rem]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0.9, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              transition={{
                type: 'spring',
                duration: 0.05,
                damping: 19,
                stiffness: 300
              }}
            >
              <Command
                ref={commandRef}
                className="mx-4 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_8px_30px_rgb(0,0,0,0.22)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl"
                shouldFilter={false} // 我们将自己处理过滤
              >
                <CommandPaletteInput />
                <CommandPaletteResults />
                <CommandPaletteStatusBar />
              </Command>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
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
    <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        {isInDetailsView && activeCommand ? (
          <>
            {activeCommand.icon && <activeCommand.icon className="h-3.5 w-3.5 opacity-70" />}
            <span className="font-medium">{activeCommand.title}</span>
          </>
        ) : (
          <>
            <span className="font-medium text-foreground/60">ClarityFile</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isInDetailsView ? (
          <div className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[10px] font-medium bg-background/80 border border-border/60 rounded-md shadow-sm">
              ←
            </kbd>
            <span className="text-muted-foreground/80">Back</span>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[10px] font-medium bg-background/80 border border-border/60 rounded-md shadow-sm">
                ↵
              </kbd>
              <span className="text-muted-foreground/80">Select</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[10px] font-medium bg-background/80 border border-border/60 rounded-md shadow-sm">
                Esc
              </kbd>
              <span className="text-muted-foreground/80">Close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

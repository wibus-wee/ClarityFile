import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useCommandPaletteOpen,
  useCommandPaletteActions,
  useCommandPaletteQuery,
  useCommandPaletteActiveCommand
} from './stores/command-palette-store'
import { CommandPaletteInput } from './command-palette-input'
import { CommandPaletteResults } from './command-palette-results'
import { CommandPaletteStatusBar } from './command-palette-status-bar'

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
  const { close, setQuery, setActiveCommand, goBackToRoot } = useCommandPaletteActions()
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
        // 1. 如果在命令详情视图中且有搜索查询，先清空查询
        if (activeCommand && query.trim()) {
          setQuery('')
          return
        }

        // 2. 如果有激活的命令视图，返回到根视图
        if (activeCommand) {
          goBackToRoot()
          return
        }

        // 3. 如果在根视图有搜索查询，清空查询
        if (query.trim()) {
          setQuery('')
          return
        }

        // 4. 都没有时，关闭整个面板
        close()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, query, activeCommand, close, setQuery, setActiveCommand, goBackToRoot])

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
                duration: 0.1
              }}
            >
              <Command
                ref={commandRef}
                className="mx-4 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_8px_30px_rgb(0,0,0,0.22)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl"
                shouldFilter={false}
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

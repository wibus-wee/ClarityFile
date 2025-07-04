import { Command } from 'cmdk'
import { motion } from 'framer-motion'
import { cn } from '@renderer/lib/utils'
import type { CommandItem as CommandItemType } from '../types/command-box.types'

interface CommandItemProps {
  item: CommandItemType
  isSelected: boolean
  onSelect: () => void
  className?: string
}

/**
 * Command Box 项目组件
 * 显示单个命令项目，支持图标、标题、描述、快捷键等
 */
export function CommandItem({ item, isSelected, onSelect, className }: CommandItemProps) {
  const IconComponent = item.icon

  return (
    <Command.Item
      value={item.id}
      onSelect={onSelect}
      disabled={item.disabled}
      data-selected={isSelected}
      data-slot="command-item"
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg cursor-pointer',
        'text-sm transition-all duration-150',
        'hover:bg-accent/50',
        'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
        'data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed',
        isSelected && 'bg-accent text-accent-foreground',
        className
      )}
    >
      {/* 选中指示器 */}
      {isSelected && (
        <motion.div
          layoutId="command-item-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full"
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30
          }}
        />
      )}

      {/* 图标 */}
      {IconComponent && (
        <div className="flex-shrink-0">
          <IconComponent className="w-4 h-4" />
        </div>
      )}

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          {/* 标题 */}
          <span className="font-medium truncate">{item.title}</span>

          {/* 快捷键 */}
          {item.shortcut && (
            <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded border">
              {item.shortcut}
            </kbd>
          )}
        </div>

        {/* 描述 */}
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
        )}
      </div>

      {/* 类型标识 */}
      {item.type === 'recent' && (
        <div className="flex-shrink-0">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </div>
      )}

      {item.type === 'suggestion' && (
        <div className="flex-shrink-0">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
        </div>
      )}
    </Command.Item>
  )
}

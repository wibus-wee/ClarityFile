import React from 'react'
import { Input } from '@clarity/shadcn/ui/input'
import { LucideIcon } from 'lucide-react'

interface DetailInputProps {
  icon?: LucideIcon
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onEnter?: () => void
  className?: string
  disabled?: boolean
}

/**
 * 详情输入框组件 - 用于插件详情视图中的输入操作
 *
 * 基于 command-palette 输入框的设计语言
 *
 * @example
 * ```tsx
 * <DetailInput
 *   icon={SearchIcon}
 *   placeholder="搜索文件..."
 *   value={query}
 *   onChange={setQuery}
 *   onEnter={handleSearch}
 * />
 * ```
 */
export function DetailInput({
  icon: Icon,
  placeholder,
  value,
  onChange,
  onEnter,
  className = '',
  disabled = false
}: DetailInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter()
    }
  }

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 border border-border/30 rounded-lg bg-background/50 ${className}`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 opacity-60" />}
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70 font-medium"
      />
    </div>
  )
}

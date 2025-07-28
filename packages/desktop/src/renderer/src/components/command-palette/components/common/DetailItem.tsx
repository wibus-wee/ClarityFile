import React from 'react'
import { LucideIcon } from 'lucide-react'

interface DetailItemProps {
  icon?: LucideIcon
  title: string
  subtitle?: string
  description?: string
  badge?: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

/**
 * 详情项组件 - 用于插件详情视图中显示单个项目
 *
 * 基于 CommandItem 的设计语言，适用于详情展示
 *
 * @example
 * ```tsx
 * <DetailItem
 *   icon={FileIcon}
 *   title="文件名.txt"
 *   subtitle="最后修改: 2小时前"
 *   badge="文档"
 *   onClick={() => openFile()}
 * />
 * ```
 */
export function DetailItem({
  icon: Icon,
  title,
  subtitle,
  description,
  badge,
  onClick,
  className = '',
  children
}: DetailItemProps) {
  const baseClasses = [
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
    'transition-all duration-150 group',
    onClick ? 'cursor-pointer hover:bg-accent/40 aria-selected:bg-accent/60' : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {Icon && <Icon className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />}

      <div className="flex-1 min-w-0 flex">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{title}</span>
          {badge && (
            <span className="text-xs text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded-md font-medium shrink-0">
              {badge}
            </span>
          )}
        </div>

        {subtitle && (
          <div className="text-xs text-muted-foreground/70 truncate mt-0.5">{subtitle}</div>
        )}

        {description && (
          <div className="text-xs text-muted-foreground/60 mt-1 line-clamp-2">{description}</div>
        )}
      </div>

      {children}
    </>
  )

  if (onClick) {
    return (
      <button className={baseClasses} onClick={onClick}>
        {content}
      </button>
    )
  }

  return <div className={baseClasses}>{content}</div>
}

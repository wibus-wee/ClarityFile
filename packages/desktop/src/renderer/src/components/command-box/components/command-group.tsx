import { ReactNode } from 'react'
import { Command } from 'cmdk'
import { Navigation, Zap, Clock, Search, Lightbulb, LucideIcon } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

interface CommandGroupProps {
  title: string
  icon?: string | LucideIcon
  children: ReactNode
  className?: string
}

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  navigation: Navigation,
  action: Zap,
  recent: Clock,
  search: Search,
  suggestion: Lightbulb
}

/**
 * Command Box 分组组件
 * 用于组织和显示不同类型的命令项目
 */
export function CommandGroup({ title, icon, children, className }: CommandGroupProps) {
  // 获取图标组件
  const IconComponent = typeof icon === 'string' ? iconMap[icon] : icon

  return (
    <Command.Group className={cn('px-2 py-1', className)}>
      {/* 分组标题 */}
      <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {IconComponent && <IconComponent className="w-3 h-3" />}
        {title}
      </div>

      {/* 分组内容 */}
      <div className="space-y-0.5">{children}</div>
    </Command.Group>
  )
}

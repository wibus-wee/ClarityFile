import React from 'react'
import { useTranslation } from 'react-i18next'
import { LucideIcon, Search } from 'lucide-react'

interface DetailEmptyProps {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * 详情空状态组件 - 用于显示空状态
 *
 * @example
 * ```tsx
 * <DetailEmpty
 *   icon={SearchIcon}
 *   title="没有找到结果"
 *   description="尝试使用不同的关键词搜索"
 *   action={<DetailButton>重新搜索</DetailButton>}
 * />
 * ```
 */
export function DetailEmpty({
  icon: Icon = Search,
  title,
  description,
  action,
  className = ''
}: DetailEmptyProps) {
  const { t } = useTranslation('command-palette')
  const defaultTitle = title || t('empty.noContent')
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-3 py-8 text-center ${className}`}
    >
      <Icon className="h-8 w-8 opacity-40" />
      <div className="space-y-1">
        <div className="text-sm font-medium text-muted-foreground/80">{defaultTitle}</div>
        {description && <div className="text-xs text-muted-foreground/60">{description}</div>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

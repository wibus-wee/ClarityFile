import React from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

interface DetailLoadingProps {
  message?: string
  className?: string
}

/**
 * 详情加载组件 - 用于显示加载状态
 *
 * @example
 * ```tsx
 * <DetailLoading message="正在搜索..." />
 * ```
 */
export function DetailLoading({ message, className = '' }: DetailLoadingProps) {
  const { t } = useTranslation('command-palette')
  const defaultMessage = message || t('loading.default')
  return (
    <div className={`flex items-center justify-center gap-3 px-3 py-8 ${className}`}>
      <Loader2 className="h-4 w-4 animate-spin opacity-70" />
      <span className="text-sm text-muted-foreground/70 font-medium">{defaultMessage}</span>
    </div>
  )
}

import React from 'react'
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
export function DetailLoading({ message = '加载中...', className = '' }: DetailLoadingProps) {
  return (
    <div className={`flex items-center justify-center gap-3 px-3 py-8 ${className}`}>
      <Loader2 className="h-4 w-4 animate-spin opacity-70" />
      <span className="text-sm text-muted-foreground/70 font-medium">{message}</span>
    </div>
  )
}

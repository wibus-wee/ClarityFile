import { LucideIcon, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react'

interface DetailStatusProps {
  status: 'success' | 'error' | 'warning' | 'pending' | 'info'
  message: string
  className?: string
}

/**
 * 详情状态组件 - 用于显示状态信息
 *
 * @example
 * ```tsx
 * <DetailStatus status="success" message="操作成功" />
 * <DetailStatus status="error" message="操作失败" />
 * ```
 */
export function DetailStatus({ status, message, className = '' }: DetailStatusProps) {
  const statusConfig: Record<string, { icon: LucideIcon; color: string }> = {
    success: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
    error: { icon: XCircle, color: 'text-red-600 dark:text-red-400' },
    warning: { icon: AlertCircle, color: 'text-yellow-600 dark:text-yellow-400' },
    pending: { icon: Clock, color: 'text-blue-600 dark:text-blue-400' },
    info: { icon: AlertCircle, color: 'text-muted-foreground' }
  }

  const { icon: Icon, color } = statusConfig[status]

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 ${className}`}>
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

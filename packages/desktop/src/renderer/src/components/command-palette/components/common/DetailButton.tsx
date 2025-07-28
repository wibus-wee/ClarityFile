import React from 'react'
import { Button } from '@clarity/shadcn/ui/button'
import { LucideIcon } from 'lucide-react'

interface DetailButtonProps {
  icon?: LucideIcon
  children: React.ReactNode
  onClick?: (e?: React.MouseEvent) => void
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  disabled?: boolean
}

/**
 * 详情按钮组件 - 用于插件详情视图中的操作按钮
 *
 * 基于 shadcn/ui Button，适配 command-palette 的设计语言
 *
 * @example
 * ```tsx
 * <DetailButton
 *   icon={PlayIcon}
 *   onClick={handlePlay}
 *   variant="default"
 * >
 *   播放
 * </DetailButton>
 * ```
 */
export function DetailButton({
  icon: Icon,
  children,
  onClick,
  variant = 'ghost',
  size = 'sm',
  className = '',
  disabled = false
}: DetailButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`gap-2 font-medium ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Button>
  )
}

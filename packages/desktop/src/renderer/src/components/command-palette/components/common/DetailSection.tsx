import React from 'react'

interface DetailSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
}

/**
 * 详情分组组件 - 用于组织详情视图中的内容
 *
 * 基于 command-palette 的分组标题设计
 *
 * @example
 * ```tsx
 * <DetailSection title="最近文件">
 *   <DetailItem title="文件1" />
 *   <DetailItem title="文件2" />
 * </DetailSection>
 * ```
 */
export function DetailSection({ title, children, className = '' }: DetailSectionProps) {
  return (
    <div className={`${className}`}>
      {title && (
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

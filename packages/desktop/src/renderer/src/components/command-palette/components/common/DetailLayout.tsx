import React from 'react'

interface DetailLayoutProps {
  children: React.ReactNode
  className?: string
}

interface DetailSidebarProps {
  children: React.ReactNode
  className?: string
}

interface DetailMainProps {
  children: React.ReactNode
  className?: string
}

/**
 * 详情布局组件 - 提供常用的布局结构
 *
 * @example
 * ```tsx
 * <DetailLayout>
 *   <DetailSidebar>
 *     <DetailSection title="分类">
 *       <DetailItem title="文档" />
 *       <DetailItem title="图片" />
 *     </DetailSection>
 *   </DetailSidebar>
 *   <DetailMain>
 *     <DetailSection title="文件列表">
 *       <DetailItem title="文件1.txt" />
 *       <DetailItem title="文件2.txt" />
 *     </DetailSection>
 *   </DetailMain>
 * </DetailLayout>
 * ```
 */
export function DetailLayout({ children, className = '' }: DetailLayoutProps) {
  return <div className={`flex gap-4 h-full ${className}`}>{children}</div>
}

export function DetailSidebar({ children, className = '' }: DetailSidebarProps) {
  return (
    <div className={`w-48 shrink-0 space-y-2 border-r border-border/30 pr-4 ${className}`}>
      {children}
    </div>
  )
}

export function DetailMain({ children, className = '' }: DetailMainProps) {
  return <div className={`flex-1 min-w-0 space-y-2 ${className}`}>{children}</div>
}

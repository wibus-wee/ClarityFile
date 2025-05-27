import { Skeleton } from '@renderer/components/ui/skeleton'

interface DocumentSkeletonProps {
  viewMode: 'grid' | 'list'
}

export function DocumentSkeleton({ viewMode }: DocumentSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg">
        {/* 图标和基本信息 */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>

        {/* 项目信息 */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* 类型标签 */}
        <Skeleton className="h-6 w-16 rounded-full" />

        {/* 状态 */}
        <Skeleton className="h-6 w-12 rounded-full" />

        {/* 版本信息 */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-3 w-16" />
        </div>

        {/* 更新时间 */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* 操作菜单 */}
        <Skeleton className="w-8 h-8 rounded" />
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* 状态标签 */}
      <div className="flex justify-end">
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>

      {/* 文档图标和基本信息 */}
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>

      {/* 项目和类型信息 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3 h-3" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-3 h-3" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* 版本和时间信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Skeleton className="w-3 h-3" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <Skeleton className="flex-1 h-8" />
        <Skeleton className="w-8 h-8" />
      </div>
    </div>
  )
}

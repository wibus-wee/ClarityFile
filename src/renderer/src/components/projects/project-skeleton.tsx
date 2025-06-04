import { Skeleton } from '@renderer/components/ui/skeleton'

interface ProjectSkeletonProps {
  viewMode: 'list'
}

export function ProjectSkeleton({ viewMode }: ProjectSkeletonProps) {
  // viewMode 参数暂时未使用，但保留以备将来扩展
  void viewMode
  return (
    <div className="flex items-center justify-between py-3 px-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-7 w-7 rounded" />
    </div>
  )
}

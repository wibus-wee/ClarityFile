import { Button } from '@clarity/shadcn/ui/button'
import { FolderOpen, Plus } from 'lucide-react'

interface ProjectEmptyStateProps {
  searchQuery: string
  statusFilter: string
  onCreateProject: () => void
}

export function ProjectEmptyState({
  searchQuery,
  statusFilter,
  onCreateProject
}: ProjectEmptyStateProps) {
  const isFiltered = searchQuery || statusFilter !== 'all'

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {isFiltered ? '没有找到匹配的项目' : '还没有项目'}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {isFiltered
          ? '尝试调整搜索条件或筛选器来查找项目'
          : '创建您的第一个项目来开始管理文档和资源'}
      </p>
      {!isFiltered && (
        <Button onClick={onCreateProject} className="gap-2">
          <Plus className="w-4 h-4" />
          创建项目
        </Button>
      )}
    </div>
  )
}

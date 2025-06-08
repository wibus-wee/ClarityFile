import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useSearchProjects
} from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { Search, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ProjectCard,
  ProjectSkeleton,
  ProjectEmptyState,
  ProjectDialog,
  type Project
} from '@renderer/components/projects'

export const Route = createFileRoute('/projects/')({
  component: ProjectsPage
})

function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // SWR hooks
  const { data: projects, error: projectsError, isLoading: projectsLoading } = useProjects()
  const { trigger: deleteProject, isMutating: isDeletingProject } = useDeleteProject()
  const { trigger: searchProjects, data: searchResults } = useSearchProjects()

  // 项目操作成功回调
  const handleProjectSuccess = () => {
    // 项目创建/更新成功后的处理已经在 ProjectDialog 组件内部完成
    // 这里只需要关闭对话框
    setIsCreateDialogOpen(false)
    setEditingProject(null)
  }

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`确定要删除项目 "${projectName}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      await deleteProject({ id: projectId })
      toast.success('项目删除成功！')
    } catch (error) {
      toast.error('删除项目失败')
      console.error(error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return
    }

    try {
      await searchProjects({ query: searchQuery })
    } catch (error) {
      toast.error('搜索失败')
      console.error(error)
    }
  }

  const openEditDialog = (project: any) => {
    setEditingProject(project)
  }

  // 过滤项目
  const filteredProjects = (searchResults || projects)?.filter((project) => {
    if (statusFilter === 'all') return true
    return project.status === statusFilter
  })

  return (
    <div className="space-y-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">项目</h1>
          <p className="text-muted-foreground">管理您的所有项目，创建新项目并跟踪进度</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            新建项目
          </Button>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="active">活跃</SelectItem>
            <SelectItem value="archived">已归档</SelectItem>
            <SelectItem value="on_hold">暂停</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 项目列表 */}
      <AnimatePresence mode="wait">
        {projectsLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-border/50"
          >
            {[...Array(6)].map((_, i) => (
              <ProjectSkeleton key={i} viewMode="list" />
            ))}
          </motion.div>
        ) : projectsError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="text-red-500 mb-2">加载项目失败</div>
            <p className="text-sm text-muted-foreground">请检查网络连接或稍后重试</p>
          </motion.div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <motion.div
            key="projects-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="divide-y divide-border/50"
          >
            <AnimatePresence>
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteProject}
                  isDeleting={isDeletingProject}
                  viewMode="list"
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectEmptyState
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onCreateProject={() => setIsCreateDialogOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 项目对话框 */}
      <ProjectDialog
        open={isCreateDialogOpen || !!editingProject}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setEditingProject(null)
          }
        }}
        project={editingProject}
        onSuccess={handleProjectSuccess}
      />
    </div>
  )
}

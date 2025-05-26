import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Input } from '@renderer/components/ui/input'
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
import { Search } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ProjectCard,
  ProjectSkeleton,
  ProjectEmptyState,
  CreateProjectDialog,
  EditProjectDialog,
  type ProjectFormData,
  type Project
} from '@renderer/components/projects'

export const Route = createFileRoute('/projects')({
  component: ProjectsPage
})

function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // 表单状态
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'active'
  })

  // SWR hooks
  const { data: projects, error: projectsError, isLoading: projectsLoading } = useProjects()
  const { trigger: createProject, isMutating: isCreatingProject } = useCreateProject()
  const { trigger: updateProject, isMutating: isUpdatingProject } = useUpdateProject()
  const { trigger: deleteProject, isMutating: isDeletingProject } = useDeleteProject()
  const { trigger: searchProjects, data: searchResults } = useSearchProjects()

  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入项目名称')
      return
    }

    try {
      await createProject({
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status
      })
      toast.success('项目创建成功！')
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error('创建项目失败')
      console.error(error)
    }
  }

  const handleUpdateProject = async () => {
    if (!editingProject || !formData.name.trim()) {
      toast.error('请输入项目名称')
      return
    }

    try {
      await updateProject({
        id: editingProject.id,
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status
      })
      toast.success('项目更新成功！')
      setEditingProject(null)
      resetForm()
    } catch (error) {
      toast.error('更新项目失败')
      console.error(error)
    }
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active'
    })
  }

  const openEditDialog = (project: any) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status
    })
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

        <CreateProjectDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateProject}
          isSubmitting={isCreatingProject}
          onReset={resetForm}
        />
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

      {/* 编辑对话框 */}
      <EditProjectDialog
        project={editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateProject}
        isSubmitting={isUpdatingProject}
      />
    </div>
  )
}

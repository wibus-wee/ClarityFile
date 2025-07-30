import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@clarity/shadcn/ui/input'
import { Button } from '@clarity/shadcn/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import {
  useProjects,
  useDeleteProject,
  useSearchProjects,
  useUpdateProject
} from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { Search, Plus, ArrowUpDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ProjectCard,
  ProjectSkeleton,
  ProjectEmptyState,
  ProjectDrawer,
  DeleteProjectDialog,
  type Project
} from '@renderer/components/projects'
import { Shortcut, ShortcutProvider } from '@renderer/components/shortcuts'

export const Route = createFileRoute('/projects/')({
  component: ProjectsPage
})

function ProjectsPage() {
  const { t } = useTranslation('projects')
  const { t: tCommon } = useTranslation('common')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'status'>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // SWR hooks
  const { data: projects, error: projectsError, isLoading: projectsLoading } = useProjects()
  const { trigger: deleteProject, isMutating: isDeletingProject } = useDeleteProject()
  const { trigger: updateProject, isMutating: isUpdatingProject } = useUpdateProject()
  const { trigger: searchProjects, data: searchResults } = useSearchProjects()

  // 项目操作成功回调
  const handleProjectSuccess = () => {
    // 项目创建/更新成功后的处理已经在 ProjectDrawer 组件内部完成
    // 这里只需要关闭抽屉
    setIsCreateDialogOpen(false)
    setEditingProject(null)
  }

  const handleDeleteProject = async (projectId: string) => {
    // 找到要删除的项目并打开确认对话框
    const project = projects?.find((p) => p.id === projectId)
    if (project) {
      setDeletingProject(project)
    }
  }

  const handleConfirmDelete = async (projectId: string) => {
    try {
      await deleteProject({ id: projectId })
      toast.success(t('messages.deleteSuccess'))
    } catch (error) {
      toast.error(t('messages.deleteFailed'))
      console.error(error)
      throw error // 重新抛出错误，让对话框处理
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return
    }

    try {
      await searchProjects({ query: searchQuery })
    } catch (error) {
      toast.error(tCommon('messages.searchFailed'))
      console.error(error)
    }
  }

  const openEditDialog = (project: any) => {
    setEditingProject(project)
  }

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      await updateProject({
        id: projectId,
        status: newStatus as 'active' | 'on_hold' | 'archived'
      })
      toast.success(t('messages.updateSuccess'))
    } catch (error) {
      toast.error(t('messages.updateFailed'))
      console.error(error)
    }
  }

  // 过滤和排序项目
  const filteredAndSortedProjects = (searchResults || projects)
    ?.filter((project) => {
      if (statusFilter === 'all') return true
      return project.status === statusFilter
    })
    ?.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  return (
    <ShortcutProvider scope="projects-list">
      <div className="space-y-8">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>

          <div className="flex items-center gap-2">
            <Shortcut shortcut={['cmd', 'n']} description={t('shortcuts.newProject')}>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                {t('createNew')}
              </Button>
            </Shortcut>
          </div>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <Shortcut
              shortcut={['cmd', 'p']}
              description={t('shortcuts.filterProjects')}
              showTooltip={false}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
            </Shortcut>
            <SelectContent>
              <SelectItem value="all">{t('status.all')}</SelectItem>
              <SelectItem value="active">{tCommon('states.active')}</SelectItem>
              <SelectItem value="archived">{tCommon('states.archived')}</SelectItem>
              <SelectItem value="on_hold">{t('status.on_hold')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: 'name' | 'createdAt' | 'updatedAt' | 'status') =>
              setSortBy(value)
            }
          >
            <Shortcut
              shortcut={['cmd', 's']}
              description={t('shortcuts.sortProjects')}
              showTooltip={false}
            >
              <SelectTrigger className="w-36">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
            </Shortcut>
            <SelectContent>
              <SelectItem value="updatedAt">{t('sortBy.updatedAt')}</SelectItem>
              <SelectItem value="createdAt">{t('sortBy.createdAt')}</SelectItem>
              <SelectItem value="name">{t('sortBy.name')}</SelectItem>
              <SelectItem value="status">{t('sortBy.status')}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
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
              <div className="text-red-500 mb-2">{t('messages.loadFailed')}</div>
              <p className="text-sm text-muted-foreground">{tCommon('messages.networkError')}</p>
            </motion.div>
          ) : filteredAndSortedProjects && filteredAndSortedProjects.length > 0 ? (
            <motion.div
              key="projects-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="divide-y divide-border/50"
            >
              <AnimatePresence>
                {filteredAndSortedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteProject}
                    onStatusChange={handleStatusChange}
                    isDeleting={isDeletingProject}
                    isUpdating={isUpdatingProject}
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

        {/* 项目抽屉 */}
        <ProjectDrawer
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

        {/* 删除确认对话框 */}
        <DeleteProjectDialog
          open={!!deletingProject}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingProject(null)
            }
          }}
          project={deletingProject}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeletingProject}
        />
      </div>
    </ShortcutProvider>
  )
}

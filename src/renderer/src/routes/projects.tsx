import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Badge } from '@renderer/components/ui/badge'
import { Skeleton } from '@renderer/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { Label } from '@renderer/components/ui/label'
import { Textarea } from '@renderer/components/ui/textarea'
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
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/projects')({
  component: ProjectsPage
})

function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  })

  // SWR hooks
  const { data: projects, error: projectsError, isLoading: projectsLoading } = useProjects()
  const { trigger: createProject, isMutating: isCreatingProject } = useCreateProject()
  const { trigger: updateProject, isMutating: isUpdatingProject } = useUpdateProject()
  const { trigger: deleteProject, isMutating: isDeletingProject } = useDeleteProject()
  const {
    trigger: searchProjects,
    data: searchResults,
    isMutating: isSearching
  } = useSearchProjects()

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

  const displayProjects = searchResults || projects

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">项目管理</h1>
          <p className="text-muted-foreground">管理您的所有项目</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              新建项目
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新项目</DialogTitle>
              <DialogDescription>填写项目信息来创建一个新项目</DialogDescription>
            </DialogHeader>
            <ProjectForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateProject}
              isSubmitting={isCreatingProject}
              submitText="创建项目"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索栏 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="搜索项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 项目列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : projectsError ? (
          <div className="col-span-full text-center text-red-500">加载项目失败</div>
        ) : displayProjects && displayProjects.length > 0 ? (
          displayProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEditDialog}
              onDelete={handleDeleteProject}
              isDeleting={isDeletingProject}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground">
            {searchResults ? '没有找到匹配的项目' : '暂无项目'}
          </div>
        )}
      </div>

      {/* 编辑对话框 */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑项目</DialogTitle>
            <DialogDescription>修改项目信息</DialogDescription>
          </DialogHeader>
          <ProjectForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateProject}
            isSubmitting={isUpdatingProject}
            submitText="更新项目"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 项目表单组件
function ProjectForm({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  submitText
}: {
  formData: any
  setFormData: (data: any) => void
  onSubmit: () => void
  isSubmitting: boolean
  submitText: string
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">项目名称</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="输入项目名称"
        />
      </div>

      <div>
        <Label htmlFor="description">项目描述</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="输入项目描述（可选）"
        />
      </div>

      <div>
        <Label htmlFor="status">项目状态</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">活跃</SelectItem>
            <SelectItem value="archived">已归档</SelectItem>
            <SelectItem value="on_hold">暂停</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onSubmit} disabled={isSubmitting} className="w-full">
        {isSubmitting ? '处理中...' : submitText}
      </Button>
    </div>
  )
}

// 项目卡片组件
function ProjectCard({
  project,
  onEdit,
  onDelete,
  isDeleting
}: {
  project: any
  onEdit: (project: any) => void
  onDelete: (id: string, name: string) => void
  isDeleting: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
            {project.status === 'active'
              ? '活跃'
              : project.status === 'archived'
                ? '已归档'
                : '暂停'}
          </Badge>
        </div>
        {project.description && <CardDescription>{project.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            创建于 {new Date(project.createdAt).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(project.id, project.name)}
              disabled={isDeleting}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

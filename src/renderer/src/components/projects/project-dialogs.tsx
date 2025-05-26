import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Edit, FolderOpen, Plus } from 'lucide-react'
import { ProjectForm } from './project-form'
import type { ProjectFormData, Project } from './index'

interface CreateProjectDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formData: ProjectFormData
  setFormData: (data: ProjectFormData) => void
  onSubmit: () => void
  isSubmitting: boolean
  onReset: () => void
}

interface EditProjectDialogProps {
  project: Project | null
  onOpenChange: (open: boolean) => void
  formData: ProjectFormData
  setFormData: (data: ProjectFormData) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function CreateProjectDialog({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  onReset
}: CreateProjectDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={onReset} className="gap-2">
          <Plus className="w-4 h-4" />
          新建项目
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">创建新项目</DialogTitle>
              <DialogDescription className="text-sm">
                填写项目信息来开始管理您的文档和资源
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ProjectForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitText="创建项目"
        />
      </DialogContent>
    </Dialog>
  )
}

export function EditProjectDialog({
  project,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  isSubmitting
}: EditProjectDialogProps) {
  return (
    <Dialog open={!!project} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">编辑项目</DialogTitle>
              <DialogDescription className="text-sm">
                修改 &ldquo;{project?.name}&rdquo; 的项目信息
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ProjectForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitText="更新项目"
        />
      </DialogContent>
    </Dialog>
  )
}

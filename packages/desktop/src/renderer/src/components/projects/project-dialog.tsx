import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import { Textarea } from '@clarity/shadcn/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@clarity/shadcn/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import { FolderOpen, Edit, Loader2, Plus } from 'lucide-react'
import { useCreateProject, useUpdateProject } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { createProjectSchema, updateProjectSchema } from '../../../../main/types/project-schemas'
import type {
  CreateProjectInput,
  ProjectStatus,
  UpdateProjectInput
} from '../../../../main/types/project-schemas'
import { Project } from '.'

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null // 编辑时传入，创建时为空
  onSuccess?: () => void
}

// 根据模式选择合适的 Schema
const getFormSchema = (isEdit: boolean) => (isEdit ? updateProjectSchema : createProjectSchema)

type ProjectFormData = z.infer<typeof createProjectSchema> &
  Partial<z.infer<typeof updateProjectSchema>>

// 状态选项配置
const statusOptions = [
  { value: 'active', label: '活跃', description: '正在进行中的项目' },
  { value: 'on_hold', label: '暂停', description: '暂时停止的项目' },
  { value: 'archived', label: '已归档', description: '已完成或不再活跃的项目' }
]

export function ProjectDialog({ open, onOpenChange, project, onSuccess }: ProjectDialogProps) {
  const isEdit = !!project
  const { trigger: createProject, isMutating: isCreating } = useCreateProject()
  const { trigger: updateProject, isMutating: isUpdating } = useUpdateProject()

  const isMutating = isCreating || isUpdating

  const form = useForm<ProjectFormData>({
    // only edit need id prop
    resolver: zodResolver(getFormSchema(isEdit) as any),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      ...(isEdit && { id: '' })
    }
  })

  // 当项目数据变化时更新表单
  useEffect(() => {
    if (project) {
      // 编辑模式
      form.reset({
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status as ProjectStatus
      })
    } else {
      // 创建模式
      form.reset({
        name: '',
        description: '',
        status: 'active'
      })
    }
  }, [project, form])

  const onSubmit = async (data: ProjectFormData) => {
    try {
      if (isEdit && project) {
        // 编辑模式
        const input: UpdateProjectInput = {
          id: project.id,
          name: data.name?.trim(),
          description: data.description?.trim() || undefined,
          status: data.status
        }
        await updateProject(input)

        toast.success('项目更新成功', {
          description: `"${data.name}" 已成功更新`
        })
      } else {
        // 创建模式
        const input: CreateProjectInput = {
          name: data.name!.trim(),
          description: data.description?.trim() || undefined,
          status: data.status || 'active'
        }
        await createProject(input)

        toast.success('项目创建成功', {
          description: `"${data.name}" 已成功创建，文件夹已自动生成`
        })
      }

      // 重置表单
      form.reset()

      // 关闭对话框
      onOpenChange(false)

      // 调用成功回调
      onSuccess?.()
    } catch (error) {
      console.error(`${isEdit ? '更新' : '创建'}项目失败:`, error)
      toast.error(`${isEdit ? '更新' : '创建'}项目失败`, {
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isEdit ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-primary/10'
              }`}
            >
              {isEdit ? (
                <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <FolderOpen className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">{isEdit ? '编辑项目' : '创建新项目'}</DialogTitle>
              <DialogDescription className="text-sm">
                {isEdit
                  ? `修改 "${project?.name}" 的项目信息`
                  : '填写项目信息来开始管理您的文档和资源'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-2"
          >
            {/* 项目名称 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    项目名称 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="为您的项目起一个名字"
                      maxLength={100}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    项目名称将用于文件夹命名和组织 ({field.value?.length || 0}/100 字符)
                  </p>
                </FormItem>
              )}
            />

            {/* 项目描述 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>项目描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="简要描述这个项目的目标和内容..."
                      rows={3}
                      maxLength={500}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    可选，帮助您和团队成员了解项目内容 ({field.value?.length || 0}/500 字符)
                  </p>
                </FormItem>
              )}
            />

            {/* 项目状态 */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEdit ? '项目状态' : '初始状态'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isMutating}
                className="flex-1"
              >
                取消
              </Button>

              <Button type="submit" disabled={isMutating} className="flex-1 gap-2">
                {isMutating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEdit ? '更新中...' : '创建中...'}
                  </>
                ) : (
                  <>
                    {isEdit ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isEdit ? '更新项目' : '创建项目'}
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

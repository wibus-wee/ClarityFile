import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@renderer/components/ui/drawer'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { FileText, Edit, Loader2, Plus } from 'lucide-react'
import { useCreateLogicalDocument, useUpdateLogicalDocument } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import type {
  CreateLogicalDocumentInput,
  UpdateLogicalDocumentInput,
  DocumentType
} from '../../../../../main/types/document-schemas'

// 文档输出类型（简化版，用于编辑）
interface DocumentOutput {
  id: string
  name: string
  type: DocumentType
  description?: string | null
  defaultStoragePathSegment?: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}

interface DocumentDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  document?: DocumentOutput | null // 编辑时传入，创建时为空
  onSuccess?: () => void
}

// 统一的表单数据类型
type DocumentFormData = {
  projectId?: string
  id?: string
  name: string
  type: DocumentType
  description?: string
  defaultStoragePathSegment?: string
}

// 文档类型选项配置
const documentTypeOptions = [
  { value: '需求文档', label: '需求文档', description: '项目需求分析和规格说明' },
  { value: '设计文档', label: '设计文档', description: '系统设计和架构文档' },
  { value: '技术文档', label: '技术文档', description: '技术实现和开发文档' },
  { value: '测试文档', label: '测试文档', description: '测试计划和测试报告' },
  { value: '用户手册', label: '用户手册', description: '用户操作指南和说明' },
  { value: '项目计划', label: '项目计划', description: '项目规划和进度安排' },
  { value: '会议纪要', label: '会议纪要', description: '会议记录和决议事项' },
  { value: '其他', label: '其他', description: '其他类型的文档' }
]

export function DocumentDrawer({
  open,
  onOpenChange,
  projectId,
  document,
  onSuccess
}: DocumentDrawerProps) {
  const isEdit = !!document
  const { trigger: createDocument, isMutating: isCreating } = useCreateLogicalDocument()
  const { trigger: updateDocument, isMutating: isUpdating } = useUpdateLogicalDocument()

  const isMutating = isCreating || isUpdating

  const form = useForm<DocumentFormData>({
    defaultValues: {
      projectId: projectId,
      name: '',
      type: '需求文档' as DocumentType,
      description: '',
      defaultStoragePathSegment: '',
      ...(isEdit && { id: '' })
    }
  })

  // 当文档数据变化时更新表单
  useEffect(() => {
    if (document) {
      // 编辑模式
      form.reset({
        id: document.id,
        name: document.name,
        type: document.type,
        description: document.description || '',
        defaultStoragePathSegment: document.defaultStoragePathSegment || ''
      })
    } else {
      // 创建模式
      form.reset({
        projectId: projectId,
        name: '',
        type: '需求文档' as DocumentType,
        description: '',
        defaultStoragePathSegment: ''
      })
    }
  }, [document, projectId, form])

  const onSubmit = async (data: DocumentFormData) => {
    try {
      if (isEdit && document) {
        // 编辑模式
        const input: UpdateLogicalDocumentInput = {
          id: document.id,
          name: data.name?.trim(),
          type: data.type,
          description: data.description?.trim() || undefined,
          defaultStoragePathSegment: data.defaultStoragePathSegment?.trim() || undefined
        }
        await updateDocument(input)

        toast.success('文档更新成功', {
          description: `"${data.name}" 已成功更新`
        })
      } else {
        // 创建模式
        const input: CreateLogicalDocumentInput = {
          projectId: projectId,
          name: data.name!.trim(),
          type: data.type!,
          description: data.description?.trim() || undefined,
          defaultStoragePathSegment: data.defaultStoragePathSegment?.trim() || undefined
        }
        await createDocument(input)

        toast.success('文档创建成功', {
          description: `"${data.name}" 已成功创建`
        })
      }

      // 重置表单
      form.reset()

      // 关闭对话框
      onOpenChange(false)

      // 调用成功回调
      onSuccess?.()
    } catch (error) {
      console.error(`${isEdit ? '更新' : '创建'}文档失败:`, error)
      toast.error(`${isEdit ? '更新' : '创建'}文档失败`, {
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isEdit ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-primary/10'
              }`}
            >
              {isEdit ? (
                <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <FileText className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <DrawerTitle className="text-xl">{isEdit ? '编辑文档' : '创建新文档'}</DrawerTitle>
              <DrawerDescription className="text-sm">
                {isEdit ? `修改 "${document?.name}" 的文档信息` : '填写文档信息来创建新的逻辑文档'}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 overflow-y-auto"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 文档名称 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      文档名称 <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="为您的文档起一个名字"
                        maxLength={100}
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      文档名称将用于文件夹命名和组织 ({field.value?.length || 0}/100 字符)
                    </p>
                  </FormItem>
                )}
              />

              {/* 文档类型 */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      文档类型 <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择文档类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentTypeOptions.map((option) => (
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

              {/* 文档描述 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>文档描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="简要描述这个文档的内容和用途..."
                        rows={3}
                        maxLength={500}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      可选，帮助您和团队成员了解文档内容 ({field.value?.length || 0}/500 字符)
                    </p>
                  </FormItem>
                )}
              />

              {/* 存储路径段 */}
              <FormField
                control={form.control}
                name="defaultStoragePathSegment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>存储路径段</FormLabel>
                    <FormControl>
                      <Input placeholder="自定义文件夹名称（可选）" maxLength={200} {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      可选，自定义文档在项目中的存储文件夹名称 ({field.value?.length || 0}/200 字符)
                    </p>
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
                      {isEdit ? '更新文档' : '创建文档'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </DrawerContent>
    </Drawer>
  )
}

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Badge } from '@renderer/components/ui/badge'
import { Lightbulb, FolderOpen } from 'lucide-react'

const documentFormSchema = z.object({
  name: z.string().min(1, '文档名称不能为空').max(100, '文档名称不能超过100个字符'),
  type: z.string().min(1, '请选择文档类型'),
  projectId: z.string().min(1, '请选择所属项目'),
  description: z.string().optional(),
  defaultStoragePathSegment: z.string().optional()
})

type DocumentFormData = z.infer<typeof documentFormSchema>

interface DocumentFormProps {
  projects: Array<{ id: string; name: string }>
  documentTypes: Array<{ value: string; label: string }>
  onSubmit: (data: DocumentFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  initialData?: Partial<DocumentFormData>
}

export function DocumentForm({
  projects,
  documentTypes,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData
}: DocumentFormProps) {
  const [suggestedName, setSuggestedName] = useState('')

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || '',
      projectId: initialData?.projectId || '',
      description: initialData?.description || '',
      defaultStoragePathSegment: initialData?.defaultStoragePathSegment || ''
    }
  })

  const watchedProject = form.watch('projectId')
  const watchedType = form.watch('type')

  // 生成智能建议的文档名称
  const generateSuggestedName = () => {
    const project = projects.find((p) => p.id === watchedProject)
    const type = documentTypes.find((t) => t.value === watchedType)

    if (project && type) {
      const suggested = `${project.name}_${type.label}`
      setSuggestedName(suggested)
    } else {
      setSuggestedName('')
    }
  }

  // 当项目或类型改变时生成建议
  useEffect(() => {
    if (watchedProject && watchedType) {
      generateSuggestedName()
    }
  }, [watchedProject, watchedType])

  const applySuggestedName = () => {
    if (suggestedName) {
      form.setValue('name', suggestedName)
    }
  }

  const handleSubmit = async (data: DocumentFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 项目选择 */}
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>所属项目 *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择项目" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>选择此文档所属的项目</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 文档类型 */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>文档类型 *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择文档类型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>选择文档的类型，用于智能分类和命名</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 文档名称 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>文档名称 *</FormLabel>
              <FormControl>
                <Input placeholder="输入文档名称" {...field} />
              </FormControl>
              {suggestedName && (
                <div className="flex items-center gap-2 mt-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">建议名称:</span>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={applySuggestedName}
                  >
                    {suggestedName}
                  </Badge>
                </div>
              )}
              <FormDescription>
                为文档起一个清晰的名称，系统会根据项目和类型生成建议
              </FormDescription>
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
                  placeholder="描述文档的用途和内容..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>可选：添加文档的详细描述</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 自定义存储路径段 */}
        <FormField
          control={form.control}
          name="defaultStoragePathSegment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>自定义存储路径</FormLabel>
              <FormControl>
                <Input placeholder="例如: 重要文档/商业计划书" {...field} />
              </FormControl>
              <FormDescription>可选：自定义文档在文件系统中的存储路径段</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '创建中...' : '创建文档'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

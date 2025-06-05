import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@renderer/components/ui/drawer'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { FileText, Save } from 'lucide-react'
import { useUpdateLogicalDocument } from '@renderer/hooks/use-tipc'
import type { LogicalDocumentWithVersionsOutput } from '../../../../../main/types/outputs'

const editDocumentSchema = z.object({
  name: z.string().min(1, '文档名称不能为空').max(100, '文档名称不能超过100个字符'),
  type: z.string().min(1, '请选择文档类型'),
  description: z.string().optional(),
  defaultStoragePathSegment: z.string().optional(),
  status: z.string().min(1, '请选择文档状态')
})

type EditDocumentFormData = z.infer<typeof editDocumentSchema>

interface EditDocumentDrawerProps {
  document: LogicalDocumentWithVersionsOutput | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const documentTypes = [
  { value: '需求文档', label: '需求文档' },
  { value: '设计文档', label: '设计文档' },
  { value: '技术文档', label: '技术文档' },
  { value: '测试文档', label: '测试文档' },
  { value: '用户手册', label: '用户手册' },
  { value: '项目计划', label: '项目计划' },
  { value: '会议纪要', label: '会议纪要' },
  { value: '其他', label: '其他' }
]

const documentStatuses = [
  { value: 'draft', label: '草稿' },
  { value: 'active', label: '活跃' },
  { value: 'archived', label: '已归档' }
]

export function EditDocumentDrawer({
  document,
  open,
  onOpenChange,
  onSuccess
}: EditDocumentDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const updateDocument = useUpdateLogicalDocument()

  const form = useForm<EditDocumentFormData>({
    resolver: zodResolver(editDocumentSchema),
    defaultValues: {
      name: '',
      type: '',
      description: '',
      defaultStoragePathSegment: '',
      status: 'draft'
    }
  })

  // 当文档数据变化时更新表单
  useEffect(() => {
    if (document) {
      form.reset({
        name: document.name,
        type: document.type,
        description: document.description || '',
        defaultStoragePathSegment: document.defaultStoragePathSegment || '',
        status: document.status
      })
    }
  }, [document, form])

  const onSubmit = async (data: EditDocumentFormData) => {
    if (!document) return

    setIsSubmitting(true)
    try {
      await updateDocument.trigger({
        id: document.id,
        name: data.name,
        type: data.type,
        description: data.description || undefined,
        defaultStoragePathSegment: data.defaultStoragePathSegment || undefined,
        status: data.status
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('更新文档失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!document) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            编辑文档
          </DrawerTitle>
          <DrawerDescription>修改文档的基本信息和设置</DrawerDescription>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 overflow-y-auto"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>文档名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="输入文档名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>文档类型 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>文档状态 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择文档状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documentStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>文档描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="描述这个文档的用途、内容概要等..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultStoragePathSegment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>默认存储路径</FormLabel>
                    <FormControl>
                      <Input placeholder="如：docs/requirements" {...field} />
                    </FormControl>
                    <FormDescription>文档版本文件的默认存储子路径</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </motion.div>

        <DrawerFooter>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                '保存中...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存更改
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

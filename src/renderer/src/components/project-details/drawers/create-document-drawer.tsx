import { useState } from 'react'
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
import { FileText, Plus } from 'lucide-react'
import { useCreateLogicalDocument } from '@renderer/hooks/use-tipc'
import { Textarea } from '@renderer/components/ui/textarea'

const createDocumentSchema = z.object({
  name: z.string().min(1, '文档名称不能为空').max(100, '文档名称不能超过100个字符'),
  type: z.string().min(1, '请选择文档类型'),
  description: z.string().optional(),
  defaultStoragePathSegment: z.string().optional()
})

type CreateDocumentFormData = z.infer<typeof createDocumentSchema>

interface CreateDocumentDrawerProps {
  projectId: string
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

export function CreateDocumentDrawer({
  projectId,
  open,
  onOpenChange,
  onSuccess
}: CreateDocumentDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createDocument = useCreateLogicalDocument()

  const form = useForm<CreateDocumentFormData>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      name: '',
      type: '',
      description: '',
      defaultStoragePathSegment: ''
    }
  })

  const onSubmit = async (data: CreateDocumentFormData) => {
    setIsSubmitting(true)
    try {
      await createDocument.trigger({
        projectId,
        name: data.name,
        type: data.type,
        description: data.description || undefined,
        defaultStoragePathSegment: data.defaultStoragePathSegment || undefined
      })

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('创建文档失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            创建新逻辑文档
          </DrawerTitle>
          <DrawerDescription>
            为项目创建一个新的逻辑文档，可以包含多个版本的实体文件
          </DrawerDescription>
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
                      <Input placeholder="输入文档名称，如：用户需求规格说明书" {...field} />
                    </FormControl>
                    <FormDescription>文档的逻辑名称，用于在项目中标识这个文档</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <FormDescription>选择最符合此文档用途的类型</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <FormDescription>可选，帮助团队成员了解这个文档的用途</FormDescription>
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
                    <FormDescription>可选，文档版本文件的默认存储子路径</FormDescription>
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
                '创建中...'
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  创建文档
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

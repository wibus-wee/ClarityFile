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
import { Image, Upload, FolderOpen } from 'lucide-react'
import { useSelectFile, useCreateProjectAsset } from '@renderer/hooks/use-tipc'
import { tipcClient } from '@renderer/lib/tipc-client'

const createAssetSchema = z.object({
  name: z.string().min(1, '资产名称不能为空').max(100, '资产名称不能超过100个字符'),
  assetType: z.string().min(1, '请选择资产类型'),
  contextDescription: z.string().optional(),
  versionInfo: z.string().optional(),
  filePath: z.string().min(1, '请选择要上传的文件')
})

type CreateAssetFormData = z.infer<typeof createAssetSchema>

interface CreateAssetDrawerProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const assetTypes = [
  { value: '图片', label: '图片' },
  { value: '文档', label: '文档' },
  { value: '视频', label: '视频' },
  { value: '音频', label: '音频' },
  { value: '模型', label: '模型' },
  { value: '代码', label: '代码' },
  { value: '数据', label: '数据' },
  { value: '其他', label: '其他' }
]

export function CreateAssetDrawer({
  projectId,
  open,
  onOpenChange,
  onSuccess
}: CreateAssetDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string>('')
  const selectFile = useSelectFile()
  const createAsset = useCreateProjectAsset()

  const form = useForm<CreateAssetFormData>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      name: '',
      assetType: '',
      contextDescription: '',
      versionInfo: '',
      filePath: ''
    }
  })

  const handleSelectFile = async () => {
    try {
      const result = await selectFile.trigger({
        title: '选择资产文件',
        filters: [
          { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
          { name: '文档文件', extensions: ['pdf', 'doc', 'docx', 'txt', 'md'] },
          { name: '视频文件', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv'] },
          { name: '音频文件', extensions: ['mp3', 'wav', 'flac', 'aac'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })

      // 根据 FilesystemService.selectFile 的实际返回结构处理结果
      if (result && !result.canceled && result.path) {
        const filePath = result.path
        setSelectedFile(filePath)
        form.setValue('filePath', filePath)

        // 自动填充资产名称
        const fileName = filePath.split('/').pop() || ''
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
        if (!form.getValues('name')) {
          form.setValue('name', nameWithoutExt)
        }

        // 根据文件扩展名自动选择类型
        const ext = fileName.split('.').pop()?.toLowerCase()
        if (ext && !form.getValues('assetType')) {
          if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
            form.setValue('assetType', '图片')
          } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
            form.setValue('assetType', '文档')
          } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) {
            form.setValue('assetType', '视频')
          } else if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
            form.setValue('assetType', '音频')
          }
        }
      } else if (result?.canceled) {
        // 用户主动取消，不显示提示
        console.log('用户取消了文件选择')
      }
    } catch (error) {
      console.error('选择文件失败:', error)
    }
  }

  const onSubmit = async (data: CreateAssetFormData) => {
    setIsSubmitting(true)
    try {
      // 1. 使用智能文件导入服务上传文件
      const importResult = await tipcClient.importFile({
        sourcePath: data.filePath,
        projectId,
        importType: 'asset',
        originalFileName: data.filePath.split('/').pop() || '',
        displayName: data.name,
        assetType: data.assetType,
        assetName: data.name,
        preserveOriginalName: false
      })

      if (!importResult.success) {
        throw new Error(`文件上传失败: ${importResult.errors?.join(', ')}`)
      }

      // 2. 创建项目资产记录
      await createAsset.trigger({
        projectId,
        name: data.name,
        assetType: data.assetType,
        managedFileId: importResult.managedFileId!,
        contextDescription: data.contextDescription || undefined,
        versionInfo: data.versionInfo || undefined
      })

      form.reset()
      setSelectedFile('')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('创建资产失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            添加新资产
          </DrawerTitle>
          <DrawerDescription>为项目添加新的资产文件，如图片、文档、视频等</DrawerDescription>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 overflow-y-auto"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 文件选择 */}
              <FormField
                control={form.control}
                name="filePath"
                render={() => (
                  <FormItem>
                    <FormLabel>选择文件 *</FormLabel>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSelectFile}
                        className="w-full justify-start"
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        {selectedFile ? '更换文件' : '选择文件'}
                      </Button>
                      {selectedFile && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">已选择文件：</p>
                          <p className="text-xs text-muted-foreground font-mono break-all">
                            {selectedFile}
                          </p>
                        </div>
                      )}
                    </div>
                    <FormDescription>选择要上传的资产文件</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>资产名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="输入资产名称" {...field} />
                    </FormControl>
                    <FormDescription>资产的显示名称</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>资产类型 *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择资产类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assetTypes.map((type) => (
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
                  name="versionInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>版本信息</FormLabel>
                      <FormControl>
                        <Input placeholder="如：v1.0, 最终版" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contextDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="描述这个资产的用途、内容等..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>可选，描述资产的用途和相关信息</FormDescription>
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
              disabled={isSubmitting || !selectedFile}
              className="flex-1"
            >
              {isSubmitting ? (
                '上传中...'
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  添加资产
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

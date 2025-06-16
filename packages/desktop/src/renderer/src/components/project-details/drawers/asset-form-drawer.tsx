import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'

import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import { Textarea } from '@clarity/shadcn/ui/textarea'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@clarity/shadcn/ui/drawer'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@clarity/shadcn/ui/form'
import { Image, Upload, FolderOpen, Edit, Save } from 'lucide-react'
import {
  useSelectFile,
  useCreateProjectAsset,
  useUpdateProjectAsset
} from '@renderer/hooks/use-tipc'
import { tipcClient } from '@renderer/lib/tipc-client'
import { AssetTypeCombobox } from '@renderer/components/ui/asset-type-combobox'
import { toast } from 'sonner'
import { SafeImage } from '@renderer/components/ui/safe-image'

// 统一的表单数据类型（包含所有可能的字段）
type AssetFormData = {
  name: string
  assetType: string
  contextDescription?: string
  versionInfo?: string
  filePath?: string // 仅在创建模式下需要
}

// 资产输出类型（简化版，用于编辑）
interface AssetOutput {
  id: string
  name: string
  assetType: string
  contextDescription?: string | null
  versionInfo?: string | null
  managedFile?: {
    id: string
    fileName: string
    originalFileName: string
    physicalPath: string
    mimeType: string
    fileSizeBytes: number
  } | null
}

interface AssetFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  asset?: AssetOutput | null // 编辑时传入，创建时为空
  onSuccess?: () => void
}

export function AssetFormDrawer({
  open,
  onOpenChange,
  projectId,
  asset,
  onSuccess
}: AssetFormDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string>('')

  const isEdit = !!asset
  const selectFile = useSelectFile()
  const createAsset = useCreateProjectAsset()
  const updateAsset = useUpdateProjectAsset()

  const form = useForm<AssetFormData>({
    defaultValues: {
      name: '',
      assetType: '',
      contextDescription: '',
      versionInfo: '',
      ...(!isEdit && { filePath: '' })
    }
  })

  // 当资产数据变化时更新表单
  useEffect(() => {
    if (asset) {
      // 编辑模式
      form.reset({
        name: asset.name,
        assetType: asset.assetType,
        contextDescription: asset.contextDescription || '',
        versionInfo: asset.versionInfo || ''
      })
    } else {
      // 创建模式
      form.reset({
        name: '',
        assetType: '',
        contextDescription: '',
        versionInfo: '',
        filePath: ''
      })
      setSelectedFile('')
    }
  }, [asset, form])

  const handleSelectFile = async () => {
    if (isEdit) return // 编辑模式下不允许更换文件

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

      if (result && !result.canceled && result.path) {
        const filePath = result.path
        setSelectedFile(filePath)
        form.setValue('filePath', filePath)

        // 自动生成资产名称
        const fileName = filePath.split('/').pop() || ''
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
        if (!form.getValues('name')) {
          form.setValue('name', nameWithoutExt)
        }

        // 根据文件扩展名自动选择类型
        const ext = fileName.split('.').pop()?.toLowerCase()
        if (ext && !form.getValues('assetType')) {
          if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
            form.setValue('assetType', 'image')
          } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
            form.setValue('assetType', 'document')
          } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) {
            form.setValue('assetType', 'video')
          } else if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
            form.setValue('assetType', 'audio')
          }
        }

        toast.success('文件选择成功！')
      } else if (result?.canceled) {
        // 用户主动取消，不显示提示
        console.log('用户取消了文件选择')
      }
    } catch (error) {
      console.error('选择文件失败:', error)
      toast.error('选择文件失败')
    }
  }

  const onSubmit = async (data: AssetFormData) => {
    // 基本验证
    if (!data.name?.trim()) {
      toast.error('请输入资产名称')
      return
    }
    if (!data.assetType?.trim()) {
      toast.error('请选择资产类型')
      return
    }
    if (!isEdit && !data.filePath?.trim()) {
      toast.error('请选择要上传的文件')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit && asset) {
        // 编辑模式
        await updateAsset.trigger({
          id: asset.id,
          name: data.name.trim(),
          assetType: data.assetType.trim(),
          contextDescription: data.contextDescription?.trim() || undefined,
          versionInfo: data.versionInfo?.trim() || undefined
        })

        toast.success('资产更新成功', {
          description: `"${data.name}" 已成功更新`
        })
      } else {
        // 创建模式
        // 1. 使用智能文件导入服务上传文件
        const importResult = await tipcClient.importFile({
          sourcePath: data.filePath!,
          projectId,
          importType: 'asset',
          originalFileName: data.filePath!.split('/').pop() || '',
          displayName: data.name.trim(),
          assetType: data.assetType.trim(),
          assetName: data.name.trim(),
          preserveOriginalName: false
        })

        if (!importResult.success) {
          throw new Error(`文件上传失败: ${importResult.errors?.join(', ')}`)
        }

        // 2. 创建项目资产记录
        await createAsset.trigger({
          projectId,
          name: data.name.trim(),
          assetType: data.assetType.trim(),
          managedFileId: importResult.managedFileId!,
          contextDescription: data.contextDescription?.trim() || undefined,
          versionInfo: data.versionInfo?.trim() || undefined
        })

        toast.success('资产创建成功', {
          description: `"${data.name}" 已成功添加到项目`
        })
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error(isEdit ? '更新资产失败:' : '创建资产失败:', error)
      toast.error(isEdit ? '更新资产失败' : '创建资产失败', {
        description: error instanceof Error ? error.message : '未知错误'
      })
    } finally {
      setIsSubmitting(false)
    }
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
                <Image className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <DrawerTitle className="text-xl">{isEdit ? '编辑资产' : '添加新资产'}</DrawerTitle>
              <DrawerDescription className="text-sm">
                {isEdit ? `修改 "${asset?.name}" 的资产信息` : '上传文件并填写资产信息'}
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
              {/* 文件选择 - 仅在创建模式显示 */}
              {!isEdit && (
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* 编辑模式下显示当前文件信息 */}
              {isEdit && asset?.managedFile && (
                <div className="space-y-2">
                  <FormLabel>当前文件</FormLabel>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {asset.managedFile.mimeType?.startsWith('image/') && (
                        <SafeImage
                          filePath={asset.managedFile.physicalPath}
                          alt={asset.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {asset.managedFile.originalFileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(asset.managedFile.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    编辑模式下无法更换文件，如需更换请删除后重新创建
                  </p>
                </div>
              )}

              {/* 资产名称 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      资产名称 <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="为您的资产起一个名字" maxLength={100} {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      资产名称将用于识别和组织 ({field.value?.length || 0}/100 字符)
                    </p>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* 资产类型 */}
                <FormField
                  control={form.control}
                  name="assetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        资产类型 <span className="text-destructive">*</span>
                      </FormLabel>
                      <AssetTypeCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="选择或输入资产类型"
                      />
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        可以从预定义选项中选择，也可以输入自定义类型
                      </p>
                    </FormItem>
                  )}
                />

                {/* 版本信息 */}
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

              {/* 描述 */}
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
              disabled={isSubmitting || (!isEdit && !selectedFile)}
              className="flex-1"
            >
              {isSubmitting ? (
                isEdit ? (
                  '更新中...'
                ) : (
                  '上传中...'
                )
              ) : (
                <>
                  {isEdit ? <Save className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isEdit ? '更新资产' : '添加资产'}
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

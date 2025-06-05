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
import { SafeImage } from '@renderer/components/ui/safe-image'
import { Image, Save } from 'lucide-react'
import { useUpdateProjectAsset } from '@renderer/hooks/use-tipc'

const editAssetSchema = z.object({
  name: z.string().min(1, '资产名称不能为空').max(100, '资产名称不能超过100个字符'),
  assetType: z.string().min(1, '请选择资产类型'),
  contextDescription: z.string().optional(),
  versionInfo: z.string().optional()
})

type EditAssetFormData = z.infer<typeof editAssetSchema>

interface EditAssetDrawerProps {
  asset: any | null // 使用 ProjectDetailsOutput['assets'][0] 类型
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

export function EditAssetDrawer({ asset, open, onOpenChange, onSuccess }: EditAssetDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const updateAsset = useUpdateProjectAsset()

  const form = useForm<EditAssetFormData>({
    resolver: zodResolver(editAssetSchema),
    defaultValues: {
      name: '',
      assetType: '',
      contextDescription: '',
      versionInfo: ''
    }
  })

  // 当资产数据变化时更新表单
  useEffect(() => {
    if (asset) {
      form.reset({
        name: asset.name,
        assetType: asset.assetType,
        contextDescription: asset.contextDescription || '',
        versionInfo: asset.versionInfo || ''
      })
    }
  }, [asset, form])

  const onSubmit = async (data: EditAssetFormData) => {
    if (!asset) return

    setIsSubmitting(true)
    try {
      await updateAsset.trigger({
        id: asset.id,
        name: data.name,
        assetType: data.assetType,
        contextDescription: data.contextDescription || undefined,
        versionInfo: data.versionInfo || undefined
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('更新资产失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!asset) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            编辑资产
          </DrawerTitle>
          <DrawerDescription>修改资产的基本信息和描述</DrawerDescription>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 overflow-y-auto"
        >
          {/* 文件预览 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">当前文件</h4>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 bg-muted/20 rounded flex items-center justify-center shrink-0 overflow-hidden">
                {asset.mimeType?.startsWith('image/') ? (
                  <SafeImage
                    filePath={asset.physicalPath}
                    alt={asset.name}
                    className="w-full h-full object-cover rounded"
                    fallbackClassName="w-full h-full rounded"
                  />
                ) : (
                  <Image className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{asset.originalFileName}</p>
                <p className="text-xs text-muted-foreground">
                  {asset.fileSizeBytes
                    ? `${(asset.fileSizeBytes / 1024).toFixed(1)} KB`
                    : '未知大小'}
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>资产名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="输入资产名称" {...field} />
                    </FormControl>
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
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>描述资产的用途和相关信息</FormDescription>
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

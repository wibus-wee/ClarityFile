import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

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
import { Switch } from '@renderer/components/ui/switch'
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
import { FileText, Upload, FolderOpen, Trophy, Target } from 'lucide-react'
import {
  useSelectFile,
  useUploadDocumentVersion,
  useGetAllCompetitionSeries,
  useGetCompetitionMilestones
} from '@renderer/hooks/use-tipc'
import type { ProjectDetailsOutput } from '../../../../../main/types/project-schemas'
import type { LogicalDocumentWithVersionsOutput } from '../../../../../main/types/document-schemas'

const addVersionSchema = z.object({
  versionTag: z.string().min(1, '版本标签不能为空').max(50, '版本标签不能超过50个字符'),
  notes: z.string().optional(),
  isGenericVersion: z.boolean(),
  competitionMilestoneId: z.string().optional(),
  filePath: z.string().min(1, '请选择要上传的文件')
})

type AddVersionFormData = z.infer<typeof addVersionSchema>

interface AddDocumentVersionDrawerProps {
  document: LogicalDocumentWithVersionsOutput | null
  projectDetails: ProjectDetailsOutput | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddDocumentVersionDrawer({
  document,
  projectDetails,
  open,
  onOpenChange,
  onSuccess
}: AddDocumentVersionDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('')

  const selectFile = useSelectFile()
  const uploadDocumentVersion = useUploadDocumentVersion()
  const { data: competitionSeries } = useGetAllCompetitionSeries()
  const { data: milestones } = useGetCompetitionMilestones(selectedSeriesId, {
    enabled: !!selectedSeriesId
  })

  const form = useForm<AddVersionFormData>({
    resolver: zodResolver(addVersionSchema),
    defaultValues: {
      versionTag: '',
      notes: '',
      isGenericVersion: true,
      competitionMilestoneId: '',
      filePath: ''
    }
  })

  const handleSelectFile = async () => {
    try {
      const result = await selectFile.trigger({
        title: '选择文档文件',
        filters: [
          { name: '文档文件', extensions: ['pdf', 'doc', 'docx', 'txt', 'md'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })

      // 根据 FilesystemService.selectFile 的实际返回结构处理结果
      if (result && !result.canceled && result.path) {
        const filePath = result.path

        setSelectedFile(filePath)
        form.setValue('filePath', filePath)

        // 自动生成版本标签
        if (!form.getValues('versionTag')) {
          form.setValue(
            'versionTag',
            `v${document?.versions.length ? document.versions.length + 1 : 1}`
          )
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

  const onSubmit = async (data: AddVersionFormData) => {
    if (!document || !projectDetails) {
      toast.error('缺少必要信息，无法上传文档版本')
      return
    }

    setIsSubmitting(true)
    try {
      // 从文件路径中提取原始文件名
      const originalFileName = data.filePath.split(/[/\\]/).pop() || 'unknown'

      // 从原始文件名中提取扩展名
      const fileExtension = originalFileName.includes('.')
        ? '.' + originalFileName.split('.').pop()
        : ''

      // 构建文件导入上下文
      const importContext = {
        // 文件基本信息
        sourcePath: data.filePath,
        originalFileName,
        displayName: `${document.name} - ${data.versionTag}${fileExtension}`,

        // 导入类型
        importType: 'document' as const,

        // 项目信息（必需字段）
        projectId: projectDetails.project.id,
        projectName: projectDetails.project.name,

        // 文档相关信息（必需字段）
        logicalDocumentId: document.id,
        logicalDocumentName: document.name,
        logicalDocumentType: document.type,
        versionTag: data.versionTag,
        isGenericVersion: data.isGenericVersion,

        // 比赛相关信息（如果不是通用版本）
        competitionMilestoneId: !data.isGenericVersion ? data.competitionMilestoneId : undefined,

        // 其他选项
        notes: data.notes,
        preserveOriginalName: false
      }

      // 调用文档上传API
      const result = await uploadDocumentVersion.trigger(importContext)

      if (result.success) {
        toast.success(`文档版本 "${data.versionTag}" 上传成功！`)

        // 重置表单并关闭抽屉
        form.reset()
        setSelectedFile('')
        onOpenChange(false)
        onSuccess?.()

        // 显示警告信息（如果有）
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning) => {
            toast.warning(warning)
          })
        }
      } else {
        throw new Error('上传失败')
      }
    } catch (error) {
      console.error('添加版本失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      toast.error(`添加文档版本失败: ${errorMessage}`)
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
            添加文档版本
          </DrawerTitle>
          <DrawerDescription>为 &ldquo;{document.name}&rdquo; 添加新的版本文件</DrawerDescription>
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
                    <FormDescription>选择要上传的文档文件</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="versionTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>版本标签 *</FormLabel>
                    <FormControl>
                      <Input placeholder="如：v1.0, 初稿, 最终版" {...field} />
                    </FormControl>
                    <FormDescription>用于标识这个版本的标签</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isGenericVersion"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">通用版本</FormLabel>
                      <FormDescription>是否为通用版本（非特定赛事项目版本）</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!form.watch('isGenericVersion') && (
                <div className="space-y-4">
                  {/* 赛事系列选择 */}
                  <div>
                    <label className="text-sm font-medium">赛事系列</label>
                    <Select
                      value={selectedSeriesId}
                      onValueChange={(value) => {
                        setSelectedSeriesId(value)
                        // 清空里程碑选择
                        form.setValue('competitionMilestoneId', '')
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择赛事系列" />
                      </SelectTrigger>
                      <SelectContent>
                        {competitionSeries?.map((series) => (
                          <SelectItem key={series.id} value={series.id}>
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-primary" />
                              {series.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 赛事里程碑选择 */}
                  {selectedSeriesId && (
                    <FormField
                      control={form.control}
                      name="competitionMilestoneId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>赛事里程碑</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择赛事里程碑" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {milestones?.map((milestone) => (
                                <SelectItem key={milestone.id} value={milestone.id}>
                                  <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-primary" />
                                    {milestone.levelName}
                                    {milestone.dueDate && (
                                      <span className="text-xs text-muted-foreground">
                                        ({new Date(milestone.dueDate).toLocaleDateString()})
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>选择此版本关联的赛事里程碑</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>版本备注</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="描述此版本的变更内容、用途等..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>可选，记录此版本的相关信息</FormDescription>
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
                  添加版本
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

import { useState, useEffect } from 'react'
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
} from '@clarity/shadcn/ui/drawer'
import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import { Textarea } from '@clarity/shadcn/ui/textarea'
import { Switch } from '@clarity/shadcn/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Badge } from '@clarity/shadcn/ui/badge'
import { FileText, Upload, FolderOpen, Trophy, Target, Edit } from 'lucide-react'
import {
  useUploadDocumentVersion,
  useUpdateDocumentVersion,
  useGetAllCompetitionSeries,
  useGetCompetitionMilestones
} from '@renderer/hooks/use-tipc'
import { useFilePicker } from '@renderer/hooks/use-file-picker'
import type { ProjectDetailsOutput } from '@main/types/project-schemas'
import type {
  LogicalDocumentWithVersionsOutput,
  DocumentVersionOutput
} from '@main/types/document-schemas'

const versionFormSchema = z.object({
  versionTag: z.string().min(1, '版本标签不能为空').max(50, '版本标签不能超过50个字符'),
  notes: z.string().optional(),
  isGenericVersion: z.boolean(),
  competitionMilestoneId: z.string().optional(),
  filePath: z.string().optional() // 仅在创建模式下需要
})

type VersionFormData = z.infer<typeof versionFormSchema>

interface DocumentVersionFormDrawerProps {
  mode: 'create' | 'edit'
  document: LogicalDocumentWithVersionsOutput | null
  version?: DocumentVersionOutput | null // 编辑模式下的版本数据
  projectDetails: ProjectDetailsOutput | null
  open: boolean
  onOpenChange: (open: boolean) => void
  // 新增：预填充数据支持
  prefilledData?: {
    versionTag?: string
    notes?: string
    isGenericVersion?: boolean
  }
  // 新增：预选择文件支持
  preselectedFile?: {
    path: string
    name: string
    size: number
    type: string
    extension: string
  }
  onSuccess?: () => void
}

export function DocumentVersionFormDrawer({
  mode,
  document,
  version,
  projectDetails,
  open,
  onOpenChange,
  prefilledData,
  preselectedFile,
  onSuccess
}: DocumentVersionFormDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('')

  const { pickFile } = useFilePicker()
  const uploadDocumentVersion = useUploadDocumentVersion()
  const updateDocumentVersion = useUpdateDocumentVersion()
  const { data: competitionSeries } = useGetAllCompetitionSeries()
  const { data: milestones } = useGetCompetitionMilestones(selectedSeriesId, {
    enabled: !!selectedSeriesId
  })

  const isEdit = mode === 'edit'
  const title = isEdit ? '编辑文档版本' : '添加文档版本'
  const description = isEdit ? '修改版本信息，注意不能更改关联的文件' : '为此逻辑文档添加新版本'

  const form = useForm<VersionFormData>({
    resolver: zodResolver(versionFormSchema),
    defaultValues: {
      versionTag: prefilledData?.versionTag || '',
      notes: prefilledData?.notes || '',
      isGenericVersion: prefilledData?.isGenericVersion ?? true,
      competitionMilestoneId: '',
      filePath: preselectedFile?.path || ''
    }
  })

  // 编辑模式下预填充数据
  useEffect(() => {
    if (isEdit && version && open) {
      form.reset({
        versionTag: version.versionTag,
        notes: version.notes || '',
        isGenericVersion: version.isGenericVersion,
        competitionMilestoneId: version.competitionMilestoneId || '',
        filePath: '' // 编辑模式下不需要文件路径
      })

      // 如果有赛事里程碑，需要设置对应的系列ID
      if (version.competitionMilestone) {
        setSelectedSeriesId(version.competitionMilestone.series.id)
      }
    } else if (!isEdit && open) {
      // 创建模式下重置表单，支持预填充数据
      form.reset({
        versionTag: prefilledData?.versionTag || '',
        notes: prefilledData?.notes || '',
        isGenericVersion: prefilledData?.isGenericVersion ?? true,
        competitionMilestoneId: '',
        filePath: preselectedFile?.path || ''
      })

      // 如果有预选择的文件，设置为选中状态
      if (preselectedFile) {
        setSelectedFile(preselectedFile.path)
      } else {
        setSelectedFile('')
      }

      setSelectedSeriesId('')
    }
  }, [isEdit, version, open, prefilledData, preselectedFile, form])

  const handleSelectFile = async () => {
    if (isEdit) return // 编辑模式下不允许选择文件

    try {
      // 使用前端原生文件选择器
      const result = await pickFile('.pdf,.doc,.docx,.txt,.md')

      if (!result.canceled && result.path) {
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
      }
    } catch (error) {
      console.error('选择文件失败:', error)
      toast.error('选择文件失败')
    }
  }

  const onSubmit = async (data: VersionFormData) => {
    if (!document || !projectDetails) return

    setIsSubmitting(true)
    try {
      if (isEdit && version) {
        // 编辑模式
        await updateDocumentVersion.trigger({
          id: version.id,
          versionTag: data.versionTag,
          isGenericVersion: data.isGenericVersion,
          competitionMilestoneId: data.isGenericVersion
            ? null
            : data.competitionMilestoneId || null,
          notes: data.notes
        })

        toast.success('文档版本更新成功！')
      } else {
        // 创建模式
        if (!data.filePath) {
          toast.error('请选择要上传的文件')
          return
        }

        const fileExtension = data.filePath.split('.').pop() || ''
        const originalFileName = data.filePath.split('/').pop() || data.filePath

        // 构建文件导入上下文
        const importContext = {
          sourcePath: data.filePath,
          originalFileName,
          displayName: `${document.name} - ${data.versionTag}${fileExtension ? '.' + fileExtension : ''}`,
          importType: 'document' as const,
          projectId: projectDetails.project.id,
          projectName: projectDetails.project.name,
          logicalDocumentId: document.id,
          logicalDocumentName: document.name,
          logicalDocumentType: document.type,
          versionTag: data.versionTag,
          isGenericVersion: data.isGenericVersion,
          competitionMilestoneId: !data.isGenericVersion ? data.competitionMilestoneId : undefined,
          notes: data.notes,
          preserveOriginalName: false
        }

        await uploadDocumentVersion.trigger(importContext)
        toast.success('文档版本添加成功！')
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('操作失败:', error)
      toast.error(isEdit ? '更新文档版本失败' : '添加文档版本失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl mx-auto">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            {isEdit ? (
              <Edit className="w-5 h-5 text-primary" />
            ) : (
              <Upload className="w-5 h-5 text-primary" />
            )}
            {title}
          </DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 overflow-y-auto"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 文件信息显示（编辑模式）或文件选择（创建模式） */}
              {isEdit && version ? (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">关联文件</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>{version.originalFileName}</div>
                    <div className="text-xs mt-1">
                      文件大小:{' '}
                      {version.fileSizeBytes
                        ? `${(version.fileSizeBytes / 1024).toFixed(1)} KB`
                        : '未知'}
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    编辑模式下不可更改文件
                  </Badge>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="filePath"
                  render={() => (
                    <FormItem>
                      <FormLabel>选择文件</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSelectFile}
                            className="w-full justify-start"
                            disabled={isSubmitting}
                          >
                            <FolderOpen className="w-4 h-4 mr-2" />
                            {selectedFile ? '重新选择文件' : '选择文档文件'}
                          </Button>
                          {selectedFile && (
                            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                              已选择: {selectedFile.split('/').pop()}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>支持 PDF、Word、文本等文档格式</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* 版本标签 */}
              <FormField
                control={form.control}
                name="versionTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>版本标签</FormLabel>
                    <FormControl>
                      <Input placeholder="如: v1.0, 初稿, 终稿等" {...field} />
                    </FormControl>
                    <FormDescription>用于标识此版本的简短描述</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 通用版本开关 */}
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

              {/* 赛事选择器 */}
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

              {/* 版本备注 */}
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
                  {isEdit ? <Edit className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isEdit ? '更新版本' : '添加版本'}
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

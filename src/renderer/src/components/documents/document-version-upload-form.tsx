import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { Label } from '@renderer/components/ui/label'
import { Checkbox } from '@renderer/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@renderer/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select'

const versionUploadSchema = z.object({
  versionTag: z.string().min(1, '版本标签不能为空'),
  isGenericVersion: z.boolean().default(true),
  competitionProjectName: z.string().optional(),
  notes: z.string().optional(),
  file: z.any().refine((file) => file && file.length > 0, '请选择要上传的文件')
})

type VersionUploadData = z.infer<typeof versionUploadSchema>

interface DocumentVersionUploadFormProps {
  document: any
  onSubmit: (data: VersionUploadData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function DocumentVersionUploadForm({
  document,
  onSubmit,
  onCancel,
  isSubmitting
}: DocumentVersionUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const form = useForm<VersionUploadData>({
    resolver: zodResolver(versionUploadSchema),
    defaultValues: {
      versionTag: '',
      isGenericVersion: true,
      competitionProjectName: '',
      notes: ''
    }
  })

  const isGenericVersion = form.watch('isGenericVersion')

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
      form.setValue('file', files)
      
      // 自动生成版本标签
      if (!form.getValues('versionTag')) {
        const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_')
        form.setValue('versionTag', `v_${timestamp}`)
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = () => {
    setSelectedFile(null)
    form.setValue('file', null)
  }

  const handleSubmit = async (data: VersionUploadData) => {
    await onSubmit(data)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 文件上传区域 */}
        <div className="space-y-4">
          <Label>选择文件 *</Label>
          
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">拖拽文件到此处</p>
                <p className="text-sm text-muted-foreground">或者</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt'
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement
                      handleFileSelect(target.files)
                    }
                    input.click()
                  }}
                >
                  选择文件
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                支持 PDF, Word, PowerPoint, Excel, 文本文件
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 版本标签 */}
        <FormField
          control={form.control}
          name="versionTag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>版本标签 *</FormLabel>
              <FormControl>
                <Input placeholder="例如: v1.0, 初稿, 最终版" {...field} />
              </FormControl>
              <FormDescription>
                为这个版本起一个易于识别的标签
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 版本类型 */}
        <FormField
          control={form.control}
          name="isGenericVersion"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>通用版本</FormLabel>
                <FormDescription>
                  勾选表示这是一个通用版本，不勾选表示这是比赛专用版本
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* 比赛项目名称（仅在非通用版本时显示） */}
        {!isGenericVersion && (
          <FormField
            control={form.control}
            name="competitionProjectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>比赛项目名称</FormLabel>
                <FormControl>
                  <Input placeholder="输入比赛项目名称" {...field} />
                </FormControl>
                <FormDescription>
                  指定这个版本对应的比赛项目
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 版本说明 */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>版本说明</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="描述这个版本的变更内容..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                可选：添加版本的详细说明
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting || !selectedFile}>
            {isSubmitting ? '上传中...' : '上传版本'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

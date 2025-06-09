import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { useFileManagementStore } from '@renderer/stores/file-management'
import { useRenameFile } from '@renderer/hooks/use-tipc'
import { Edit, Loader2 } from 'lucide-react'

const renameSchema = z.object({
  newName: z
    .string()
    .min(1, '文件名不能为空')
    .max(255, '文件名不能超过255个字符')
    .refine(
      (name) => !/[<>:"/\\|?*]/.test(name),
      '文件名不能包含以下字符: < > : " / \\ | ? *'
    )
})

type RenameFormData = z.infer<typeof renameSchema>

export function FileRenameDialog() {
  const {
    isRenameDialogOpen,
    fileForRename,
    closeRenameDialog,
    setProcessing,
    isProcessing
  } = useFileManagementStore()

  const { trigger: renameFile } = useRenameFile()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema)
  })

  const newName = watch('newName')

  // 当Dialog打开时，设置初始值
  useEffect(() => {
    if (isRenameDialogOpen && fileForRename) {
      // 移除文件扩展名，只保留文件名部分
      const nameWithoutExt = fileForRename.originalFileName?.replace(/\.[^/.]+$/, '') || 
                            fileForRename.name?.replace(/\.[^/.]+$/, '') || ''
      setValue('newName', nameWithoutExt)
    }
  }, [isRenameDialogOpen, fileForRename, setValue])

  // 当Dialog关闭时，重置表单
  useEffect(() => {
    if (!isRenameDialogOpen) {
      reset()
    }
  }, [isRenameDialogOpen, reset])

  const onSubmit = async (data: RenameFormData) => {
    if (!fileForRename) return

    try {
      setIsSubmitting(true)
      setProcessing(true, 'rename')

      // 获取原始文件扩展名
      const originalExt = fileForRename.originalFileName?.match(/\.[^/.]+$/)?.[0] || ''
      const newFileName = data.newName + originalExt

      await renameFile({
        fileId: fileForRename.id,
        newName: newFileName
      })

      toast.success(`文件重命名成功: ${newFileName}`)
      closeRenameDialog()
    } catch (error) {
      console.error('重命名文件失败:', error)
      toast.error(`重命名文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsSubmitting(false)
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    if (!isSubmitting) {
      closeRenameDialog()
    }
  }

  if (!fileForRename) return null

  // 获取文件扩展名用于显示
  const fileExtension = fileForRename.originalFileName?.match(/\.[^/.]+$/)?.[0] || ''

  return (
    <Dialog open={isRenameDialogOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            重命名文件
          </DialogTitle>
          <DialogDescription>
            为文件 "{fileForRename.originalFileName}" 输入新的名称
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label htmlFor="newName">新文件名</Label>
            <div className="flex items-center gap-2">
              <Input
                id="newName"
                {...register('newName')}
                placeholder="输入新的文件名"
                disabled={isSubmitting}
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleCancel()
                  }
                }}
              />
              {fileExtension && (
                <span className="text-sm text-muted-foreground font-mono">
                  {fileExtension}
                </span>
              )}
            </div>
            {errors.newName && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-destructive"
              >
                {errors.newName.message}
              </motion.p>
            )}
          </motion.div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !newName?.trim()}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              重命名
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

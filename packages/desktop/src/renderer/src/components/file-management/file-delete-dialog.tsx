import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { Button } from '@clarity/shadcn/ui/button'
import { useFileManagementStore } from '@renderer/stores/file-management'
import { useMoveFileToTrash, useBatchMoveFilesToTrash } from '@renderer/hooks/use-tipc'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'

export function FileDeleteDialog() {
  const {
    isDeleteDialogOpen,
    isBatchDeleteDialogOpen,
    filesForDelete,
    closeDeleteDialog,
    closeBatchDeleteDialog,
    setProcessing,
    clearSelection
  } = useFileManagementStore()

  const { trigger: moveFileToTrash } = useMoveFileToTrash()
  const { trigger: batchMoveFilesToTrash } = useBatchMoveFilesToTrash()
  const [isDeleting, setIsDeleting] = useState(false)

  const isOpen = isDeleteDialogOpen || isBatchDeleteDialogOpen
  const isBatch = isBatchDeleteDialogOpen
  const fileCount = filesForDelete.length

  const handleDelete = async () => {
    if (fileCount === 0) return

    try {
      setIsDeleting(true)
      setProcessing(true, 'delete')

      if (isBatch) {
        // 批量删除
        const fileIds = filesForDelete.map((file) => file.id)
        await batchMoveFilesToTrash({ fileIds })

        toast.success(`已将 ${fileCount} 个文件移动到回收站`)
        clearSelection()
        closeBatchDeleteDialog()
      } else {
        // 单个删除
        const file = filesForDelete[0]
        await moveFileToTrash({ fileId: file.id })

        toast.success(`文件 "${file.originalFileName || file.name}" 已移动到回收站`)
        closeDeleteDialog()
      }
    } catch (error) {
      console.error('删除文件失败:', error)
      toast.error(`删除文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsDeleting(false)
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    if (!isDeleting) {
      if (isBatch) {
        closeBatchDeleteDialog()
      } else {
        closeDeleteDialog()
      }
    }
  }

  if (!isOpen || fileCount === 0) return null

  const getDialogContent = () => {
    if (isBatch) {
      return {
        title: `删除 ${fileCount} 个文件`,
        description: `确定要将这 ${fileCount} 个文件移动到回收站吗？此操作可以撤销。`,
        fileNames: filesForDelete.slice(0, 3).map((f) => f.originalFileName || f.name)
      }
    } else {
      const file = filesForDelete[0]
      return {
        title: '删除文件',
        description: `确定要将文件 "${file.originalFileName || file.name}" 移动到回收站吗？此操作可以撤销。`,
        fileNames: [file.originalFileName || file.name]
      }
    }
  }

  const { title, description, fileNames } = getDialogContent()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">{description}</DialogDescription>
        </DialogHeader>

        {/* 文件列表预览 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="space-y-1">
              {fileNames.map((fileName, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  <span className="truncate">{fileName}</span>
                </div>
              ))}
              {isBatch && fileCount > 3 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span>还有 {fileCount - 3} 个文件...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-3 h-3" />
            <span>文件将被移动到系统回收站，可以从回收站恢复</span>
          </div>
        </motion.div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isDeleting}>
            取消
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            移动到回收站
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

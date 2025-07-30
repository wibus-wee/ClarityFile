import { useState } from 'react'
import { Button } from '@clarity/shadcn/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { Input } from '@clarity/shadcn/ui/input'
import { Label } from '@clarity/shadcn/ui/label'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Project } from './index'

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onConfirm: (projectId: string, projectName: string) => Promise<void>
  isDeleting: boolean
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onConfirm,
  isDeleting
}: DeleteProjectDialogProps) {
  const [confirmationText, setConfirmationText] = useState('')

  const isConfirmationValid = project && confirmationText === project.name

  const handleConfirm = async () => {
    if (!project || !isConfirmationValid) return

    try {
      await onConfirm(project.id, project.name)
      // 成功后重置状态并关闭对话框
      setConfirmationText('')
      onOpenChange(false)
    } catch (error) {
      // 错误处理已在父组件中完成
      console.error('删除项目失败:', error)
    }
  }

  const handleCancel = () => {
    setConfirmationText('')
    onOpenChange(false)
  }

  // 当对话框关闭时重置确认文本
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmationText('')
    }
    onOpenChange(newOpen)
  }

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">删除项目</DialogTitle>
              <DialogDescription className="text-sm">此操作不可撤销，请谨慎操作</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-red-900 dark:text-red-100">
                  您即将删除项目 &quot;{project.name}&quot;
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">删除后将会：</p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-4">
                  <li>• 永久删除项目记录和所有相关数据</li>
                  <li>• 删除项目文件夹（如果为空）</li>
                  <li>• 删除所有关联的文档、资产和经费记录</li>
                  <li>• 此操作无法撤销</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              请输入项目名称{' '}
              <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{project.name}</span>{' '}
              以确认删除：
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`输入 "${project.name}" 确认删除`}
              className={`${
                confirmationText && !isConfirmationValid
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : ''
              }`}
              disabled={isDeleting}
              autoFocus
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-xs text-red-600 dark:text-red-400">
                项目名称不匹配，请输入完整的项目名称
              </p>
            )}
          </div>
        </motion.div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                删除中...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                确认删除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

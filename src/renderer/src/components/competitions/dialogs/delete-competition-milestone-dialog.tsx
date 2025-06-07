import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'

import { AlertTriangle, Loader2, Target, Calendar, Users } from 'lucide-react'
import { useDeleteCompetitionMilestone } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { CompetitionMilestoneOutput } from '../../../../../main/types/outputs'

interface DeleteCompetitionMilestoneDialogProps {
  milestone: CompetitionMilestoneOutput | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteCompetitionMilestoneDialog({
  milestone,
  isOpen,
  onOpenChange,
  onSuccess
}: DeleteCompetitionMilestoneDialogProps) {
  const { trigger: deleteMilestone, isMutating } = useDeleteCompetitionMilestone()

  const handleDelete = async () => {
    if (!milestone) return

    try {
      await deleteMilestone({ id: milestone.id })

      toast.success('里程碑删除成功', {
        description: `"${milestone.levelName}" 已被删除`
      })

      // 关闭对话框
      onOpenChange(false)

      // 调用成功回调
      onSuccess?.()
    } catch (error) {
      console.error('删除里程碑失败:', error)
      toast.error('删除里程碑失败', {
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!milestone) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>删除里程碑</DialogTitle>
              <DialogDescription>此操作无法撤销，请确认是否继续</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 里程碑信息 */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{milestone.levelName}</span>
            </div>

            {milestone.dueDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  截止日期：
                  {format(new Date(milestone.dueDate), 'yyyy年MM月dd日', { locale: zhCN })}
                </span>
              </div>
            )}

            {milestone.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{milestone.description}</p>
            )}

            {/* 参与项目数量提示 */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                当前有 {milestone.participatingProjectsCount || 0} 个项目参与此里程碑
              </span>
            </div>
          </div>

          {/* 警告信息 */}
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-destructive">删除后将会：</h4>
                <ul className="text-sm text-destructive/80 space-y-1">
                  <li>• 永久删除此里程碑的所有信息</li>
                  <li>• 移除所有项目与此里程碑的关联</li>
                  <li>• 删除相关的参赛状态记录</li>
                  <li>• 此操作无法撤销</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isMutating}
              className="flex-1"
            >
              取消
            </Button>

            <Button
              onClick={handleDelete}
              disabled={isMutating}
              variant="destructive"
              className="flex-1 gap-2"
            >
              {isMutating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  确认删除
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

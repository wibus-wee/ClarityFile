import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { useDeleteCompetitionSeries } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import type { DeleteCompetitionSeriesInput } from '../../../../../main/types/inputs'
import type { CompetitionSeriesWithStatsOutput } from '../../../../../main/types/outputs'

interface DeleteCompetitionSeriesDialogProps {
  series: CompetitionSeriesWithStatsOutput | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteCompetitionSeriesDialog({
  series,
  isOpen,
  onOpenChange,
  onSuccess
}: DeleteCompetitionSeriesDialogProps) {
  const { trigger: deleteSeries, isMutating } = useDeleteCompetitionSeries()

  const handleDelete = async () => {
    if (!series) return

    try {
      const input: DeleteCompetitionSeriesInput = {
        id: series.id
      }

      await deleteSeries(input)

      toast.success('赛事系列删除成功', {
        description: `"${series.name}" 已成功删除`
      })

      // 关闭对话框
      onOpenChange(false)

      // 调用成功回调
      onSuccess?.()
    } catch (error) {
      console.error('删除赛事系列失败:', error)
      toast.error('删除赛事系列失败', {
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!series) return null

  const hasActiveMilestones = series.milestoneCount > 0

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>删除赛事系列</DialogTitle>
              <DialogDescription>此操作无法撤销，请谨慎操作</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 警告信息 */}
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    确定要删除赛事系列 &quot;{series.name}&quot; 吗？
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>删除后将会：</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>永久删除该赛事系列</li>
                      {hasActiveMilestones && (
                        <li className="text-destructive font-medium">
                          删除 {series.milestoneCount} 个相关里程碑
                        </li>
                      )}
                      <li>移除所有项目与该赛事系列的关联</li>
                      <li>清除相关的参赛记录和状态</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 赛事系列信息 */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">赛事系列名称</span>
                <span className="text-sm">{series.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">里程碑数量</span>
                <span className="text-sm">{series.milestoneCount} 个</span>
              </div>
              {series.notes && (
                <div className="pt-2 border-t">
                  <span className="text-sm font-medium">描述</span>
                  <p className="text-sm text-muted-foreground mt-1">{series.notes}</p>
                </div>
              )}
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
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isMutating}
              className="flex-1 gap-2"
            >
              {isMutating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
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

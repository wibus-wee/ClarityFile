import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Separator } from '@clarity/shadcn/ui/separator'
import { formatFileSize } from '@renderer/lib/utils'
import { Trophy, Clock, FileText, Target, Info } from 'lucide-react'

interface CompetitionDetailsDialogProps {
  milestone: {
    seriesId: string
    seriesName: string
    milestoneId: string
    levelName: string
    statusInMilestone: string | null
    dueDateMilestone?: Date | null
    participatedAt?: Date
    milestoneNotes?: string | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompetitionDetailsDialog({
  milestone,
  open,
  onOpenChange
}: CompetitionDetailsDialogProps) {
  if (!milestone) return null

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case '已获奖':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case '已完成':
      case '已提交':
        return 'bg-green-100 text-green-800 border-green-200'
      case '进行中':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case '准备中':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case '未获奖':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case '已放弃':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            赛事详情
          </DialogTitle>
          <DialogDescription>查看赛事的详细信息和参与状态</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{milestone.seriesName}</h3>
              {milestone.statusInMilestone && (
                <Badge className={getStatusColor(milestone.statusInMilestone)}>
                  {milestone.statusInMilestone}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="w-4 h-4" />
              <span className="font-medium">{milestone.levelName}</span>
            </div>
          </div>

          <Separator />

          {/* 时间信息 */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              时间信息
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {milestone.participatedAt && (
                <div>
                  <span className="text-muted-foreground">参与时间:</span>
                  <p className="font-medium">
                    {new Date(milestone.participatedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {milestone.dueDateMilestone && (
                <div>
                  <span className="text-muted-foreground">截止时间:</span>
                  <p className="font-medium">
                    {new Date(milestone.dueDateMilestone).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 里程碑备注 */}
          {milestone.milestoneNotes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  里程碑说明
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {milestone.milestoneNotes}
                </p>
              </div>
            </>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

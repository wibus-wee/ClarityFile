import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import { Trophy, Clock, FileText, Target, Info } from 'lucide-react'

interface CompetitionDetailsDialogProps {
  competition: {
    statusInMilestone: string | null
    milestoneNotes: string | null
    participatedAt: Date
    milestoneId: string
    levelName: string
    dueDateMilestone: Date | null
    milestoneCreatedAt: Date
    milestoneUpdatedAt: Date
    seriesId: string
    seriesName: string
    seriesNotes: string | null
    seriesCreatedAt: Date
    seriesUpdatedAt: Date
    notificationFileName: string | null
    notificationOriginalFileName: string | null
    notificationPhysicalPath: string | null
    notificationMimeType: string | null
    notificationFileSizeBytes: number | null
    notificationUploadedAt: Date | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompetitionDetailsDialog({
  competition,
  open,
  onOpenChange
}: CompetitionDetailsDialogProps) {
  if (!competition) return null

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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '未知大小'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
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
              <h3 className="text-lg font-semibold">{competition.seriesName}</h3>
              {competition.statusInMilestone && (
                <Badge className={getStatusColor(competition.statusInMilestone)}>
                  {competition.statusInMilestone}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="w-4 h-4" />
              <span className="font-medium">{competition.levelName}</span>
            </div>

            {competition.seriesNotes && (
              <div className="flex items-start gap-2 text-sm">
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <p className="text-muted-foreground">{competition.seriesNotes}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* 时间信息 */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              时间信息
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">参与时间:</span>
                <p className="font-medium">
                  {new Date(competition.participatedAt).toLocaleString()}
                </p>
              </div>

              {competition.dueDateMilestone && (
                <div>
                  <span className="text-muted-foreground">截止时间:</span>
                  <p className="font-medium">
                    {new Date(competition.dueDateMilestone).toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <span className="text-muted-foreground">里程碑创建:</span>
                <p className="font-medium">
                  {new Date(competition.milestoneCreatedAt).toLocaleString()}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">最后更新:</span>
                <p className="font-medium">
                  {new Date(competition.milestoneUpdatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* 里程碑备注 */}
          {competition.milestoneNotes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  里程碑说明
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {competition.milestoneNotes}
                </p>
              </div>
            </>
          )}

          {/* 通知文件信息 */}
          {competition.notificationFileName && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  通知文件
                </h4>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{competition.notificationOriginalFileName}</span>
                    <Badge variant="outline">
                      {competition.notificationMimeType || '未知类型'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>大小: {formatFileSize(competition.notificationFileSizeBytes)}</span>
                    {competition.notificationUploadedAt && (
                      <span>
                        上传: {new Date(competition.notificationUploadedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 系列信息 */}
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium">赛事系列信息</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">系列创建:</span>
                <p className="font-medium">
                  {new Date(competition.seriesCreatedAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">系列更新:</span>
                <p className="font-medium">
                  {new Date(competition.seriesUpdatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

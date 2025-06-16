import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Target, Calendar, Trophy, Users, Clock, FileText, Edit } from 'lucide-react'
import { format, differenceInDays, isBefore, startOfDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@renderer/lib/utils'
import type {
  MilestoneWithProjectsOutput,
  CompetitionMilestoneOutput
} from '@main/types/competition-schemas'

interface MilestoneDetailsDialogProps {
  milestone: MilestoneWithProjectsOutput | CompetitionMilestoneOutput | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: () => void
  onViewSeries?: () => void
  onViewProjects?: () => void
}

export function MilestoneDetailsDialog({
  milestone,
  isOpen,
  onOpenChange,
  onEdit,
  onViewSeries,
  onViewProjects
}: MilestoneDetailsDialogProps) {
  if (!milestone) return null

  const now = new Date()
  const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null
  const daysUntilDue = dueDate ? differenceInDays(dueDate, now) : null

  // 判断是否为 MilestoneWithProjectsOutput 类型
  const isMilestoneWithProjects = 'seriesName' in milestone
  const seriesName = isMilestoneWithProjects ? milestone.seriesName : '未知赛事系列'
  const description = isMilestoneWithProjects
    ? milestone.notes
    : (milestone as CompetitionMilestoneOutput).description

  // 确定状态
  const getStatus = () => {
    if (!dueDate)
      return { label: '无截止日期', variant: 'secondary' as const, color: 'text-muted-foreground' }

    const today = startOfDay(now)
    const due = startOfDay(dueDate)

    if (isBefore(due, today)) {
      return { label: '已过期', variant: 'destructive' as const, color: 'text-destructive' }
    } else if (due.getTime() === today.getTime()) {
      return { label: '今天截止', variant: 'default' as const, color: 'text-primary' }
    } else if (daysUntilDue && daysUntilDue <= 3) {
      return { label: '紧急', variant: 'destructive' as const, color: 'text-destructive' }
    } else if (daysUntilDue && daysUntilDue <= 7) {
      return { label: '即将到来', variant: 'secondary' as const, color: 'text-orange-600' }
    } else {
      return { label: '进行中', variant: 'secondary' as const, color: 'text-muted-foreground' }
    }
  }

  const status = getStatus()
  const projectCount = milestone.participatingProjectsCount || 0

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-left">{milestone.levelName}</DialogTitle>
                <DialogDescription className="text-left">
                  {seriesName} 的里程碑详情
                </DialogDescription>
              </div>
            </div>
            <Badge variant={status.variant} className="ml-4">
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 基本信息 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">赛事系列</span>
              </div>
              <p className="text-sm pl-6">{seriesName}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">截止日期</span>
              </div>
              <div className="pl-6">
                {dueDate ? (
                  <div className="space-y-1">
                    <p className="text-sm">{format(dueDate, 'yyyy年MM月dd日', { locale: zhCN })}</p>
                    {daysUntilDue !== null && (
                      <p className={cn('text-xs', status.color)}>
                        {daysUntilDue < 0
                          ? `已过期 ${Math.abs(daysUntilDue)} 天`
                          : daysUntilDue === 0
                            ? '今天截止'
                            : `还有 ${daysUntilDue} 天`}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">未设置截止日期</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">参与项目</span>
              </div>
              <p className="text-sm pl-6">{projectCount} 个项目</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">创建时间</span>
              </div>
              <p className="text-sm pl-6">
                {format(new Date(), 'yyyy年MM月dd日', { locale: zhCN })}
              </p>
            </div>
          </div>

          {/* 描述 */}
          {description && (
            <div className="border-t pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">描述</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                关闭
              </Button>

              {onViewSeries && (
                <Button variant="outline" onClick={onViewSeries} className="gap-2">
                  <Trophy className="h-4 w-4" />
                  查看赛事系列
                </Button>
              )}

              {onViewProjects && projectCount > 0 && (
                <Button variant="outline" onClick={onViewProjects} className="gap-2">
                  <Users className="h-4 w-4" />
                  查看参与项目
                </Button>
              )}

              {onEdit && (
                <Button onClick={onEdit} className="gap-2">
                  <Edit className="h-4 w-4" />
                  编辑里程碑
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

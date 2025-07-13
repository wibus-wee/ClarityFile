import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import {
  Clock,
  Calendar,
  Target,
  Users,
  Trophy,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { useUpcomingMilestones } from '@renderer/hooks/use-tipc'
import { cn } from '@renderer/lib/utils'
import { differenceInDays } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { formatFriendlyDate } from '@renderer/lib/i18n-formatters'
import { MilestoneDetailsDialog } from './dialogs/milestone-details-dialog'
import { MilestoneParticipatingProjectsDialog } from './dialogs/milestone-participating-projects-dialog'
import { MilestoneWithProjectsOutput } from '@main/types/competition-schemas'

interface MilestoneCardProps {
  milestone: MilestoneWithProjectsOutput
  index: number
  onViewDetails: (milestone: MilestoneWithProjectsOutput) => void
  onViewSeries: () => void
}

function MilestoneCard({ milestone, index, onViewDetails, onViewSeries }: MilestoneCardProps) {
  const { t } = useTranslation('competitions')
  const now = new Date()
  const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null
  const daysUntilDue = dueDate ? differenceInDays(dueDate, now) : null

  // 确定紧急程度
  const getUrgencyLevel = () => {
    if (daysUntilDue === null) return 'normal'
    if (daysUntilDue < 0) return 'overdue'
    if (daysUntilDue === 0) return 'today'
    if (daysUntilDue === 1) return 'tomorrow'
    if (daysUntilDue <= 3) return 'urgent'
    if (daysUntilDue <= 7) return 'soon'
    return 'normal'
  }

  const urgencyLevel = getUrgencyLevel()

  const getUrgencyColor = () => {
    switch (urgencyLevel) {
      case 'overdue':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'today':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
      case 'tomorrow':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      case 'urgent':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
      case 'soon':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    }
  }

  const getUrgencyText = () => {
    if (daysUntilDue === null) return '无截止日期'
    if (daysUntilDue < 0) return `已过期 ${Math.abs(daysUntilDue)} 天`
    if (daysUntilDue === 0) return '今天截止'
    if (daysUntilDue === 1) return '明天截止'
    return `还有 ${daysUntilDue} 天`
  }

  const getUrgencyIcon = () => {
    switch (urgencyLevel) {
      case 'overdue':
      case 'today':
      case 'tomorrow':
      case 'urgent':
        return AlertCircle
      case 'soon':
        return Clock
      default:
        return CheckCircle
    }
  }

  const UrgencyIcon = getUrgencyIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative flex items-center justify-between py-3 px-4 border-b border-border/50 hover:bg-muted/30 transition-colors',
        urgencyLevel === 'overdue' && 'border-l-4 border-l-red-500',
        urgencyLevel === 'today' && 'border-l-4 border-l-orange-500',
        urgencyLevel === 'tomorrow' && 'border-l-4 border-l-yellow-500',
        urgencyLevel === 'urgent' && 'border-l-4 border-l-amber-500',
        urgencyLevel === 'soon' && 'border-l-4 border-l-blue-500',
        urgencyLevel === 'normal' && 'border-l-4 border-l-green-500'
      )}
      transition={{
        delay: index * 0.05,
        type: 'spring',
        stiffness: 400,
        damping: 35
      }}
    >
      {/* 左侧：图标和内容 */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Target className="h-4 w-4 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">{milestone.levelName}</h3>
            <Badge variant="secondary" className="text-xs shrink-0">
              {milestone.seriesName}
            </Badge>
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
                getUrgencyColor()
              )}
            >
              <UrgencyIcon className="h-3 w-3" />
              {getUrgencyText()}
            </div>
          </div>

          {milestone.notes && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{milestone.notes}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {t('dueDate')}：{formatFriendlyDate(milestone.dueDate?.toString()!)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{milestone.participatingProjectsCount} 个项目参与</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewSeries}
          className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 text-xs"
        >
          <Trophy className="h-3 w-3" />
          查看系列
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(milestone)}
          className="gap-2 h-7 px-2 text-xs"
        >
          查看详情
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  )
}

export function UpcomingMilestones() {
  const navigate = useNavigate()
  const [limit, setLimit] = useState(10)
  const { data: milestones, isLoading } = useUpcomingMilestones(limit)
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneWithProjectsOutput | null>(
    null
  )
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [projectsDialogOpen, setProjectsDialogOpen] = useState(false)

  // 处理操作
  const handleViewDetails = (milestone: MilestoneWithProjectsOutput) => {
    setSelectedMilestone(milestone)
    setDetailsDialogOpen(true)
  }

  const handleViewSeries = (milestone: MilestoneWithProjectsOutput) => {
    // 跳转到赛事系列页面并直接显示该系列的里程碑列表
    navigate({
      to: '/competitions',
      search: {
        view: 'series',
        seriesId: milestone.seriesId,
        showMilestones: 'true'
      }
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted/50 rounded animate-pulse" />
        </div>

        <div className="divide-y divide-border/50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-muted/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/50 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-muted/50 rounded animate-pulse w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!milestones || milestones.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">暂无即将到来的里程碑</h3>
        <p className="text-muted-foreground mb-6">
          所有里程碑都已完成，或者还没有设置截止日期的里程碑
        </p>
        <Button className="gap-2">
          <Target className="h-4 w-4" />
          添加里程碑
        </Button>
      </motion.div>
    )
  }

  // 按紧急程度分组
  const groupedMilestones = milestones.reduce(
    (groups, milestone) => {
      const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null
      const now = new Date()
      const daysUntilDue = dueDate ? differenceInDays(dueDate, now) : null

      let category = 'later'
      if (!dueDate || daysUntilDue === null) category = 'no-date'
      else if (daysUntilDue < 0) category = 'overdue'
      else if (daysUntilDue === 0) category = 'today'
      else if (daysUntilDue <= 3) category = 'urgent'
      else if (daysUntilDue <= 7) category = 'soon'

      if (!groups[category]) groups[category] = []
      groups[category].push(milestone)
      return groups
    },
    {} as Record<string, typeof milestones>
  )

  const categoryOrder = ['overdue', 'today', 'urgent', 'soon', 'later', 'no-date']
  const categoryLabels = {
    overdue: '已过期',
    today: '今天截止',
    urgent: '紧急（3天内）',
    soon: '即将到来（7天内）',
    later: '稍后',
    'no-date': '无截止日期'
  }

  return (
    <div className="space-y-8">
      {/* 头部控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">即将到来的里程碑</h2>
          <p className="text-sm text-muted-foreground mt-1">按紧急程度排序的赛事里程碑</p>
        </div>

        <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">显示 5 个</SelectItem>
            <SelectItem value="10">显示 10 个</SelectItem>
            <SelectItem value="20">显示 20 个</SelectItem>
            <SelectItem value="50">显示 50 个</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 分组显示里程碑 */}
      <div className="space-y-8">
        {categoryOrder.map((category) => {
          const categoryMilestones = groupedMilestones[category]
          if (!categoryMilestones || categoryMilestones.length === 0) return null

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium">{categoryLabels[category]}</h3>
                <Badge variant="secondary" className="text-xs">
                  {categoryMilestones.length} 个
                </Badge>
              </div>

              <motion.div layout className="divide-y divide-border/50">
                <AnimatePresence>
                  {categoryMilestones.map((milestone, index) => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      index={index}
                      onViewDetails={handleViewDetails}
                      onViewSeries={() => handleViewSeries(milestone)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* 对话框组件 */}
      <MilestoneDetailsDialog
        milestone={selectedMilestone}
        isOpen={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onViewSeries={() => {
          if (selectedMilestone) {
            setDetailsDialogOpen(false)
            handleViewSeries(selectedMilestone)
          }
        }}
        onViewProjects={() => {
          setDetailsDialogOpen(false)
          setProjectsDialogOpen(true)
        }}
      />

      {/* 参与项目对话框 */}
      <MilestoneParticipatingProjectsDialog
        milestone={selectedMilestone}
        isOpen={projectsDialogOpen}
        onOpenChange={setProjectsDialogOpen}
      />
    </div>
  )
}

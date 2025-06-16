import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { format, differenceInDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useNavigate } from '@tanstack/react-router'
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
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm p-6',
        'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
        'transition-all duration-200',
        urgencyLevel === 'overdue' && 'ring-1 ring-red-200 dark:ring-red-800',
        urgencyLevel === 'today' && 'ring-1 ring-orange-200 dark:ring-orange-800',
        urgencyLevel === 'tomorrow' && 'ring-1 ring-yellow-200 dark:ring-yellow-800'
      )}
    >
      {/* 紧急程度指示器 */}
      <div
        className={cn(
          'absolute top-0 left-0 w-1 h-full',
          urgencyLevel === 'overdue' && 'bg-red-500',
          urgencyLevel === 'today' && 'bg-orange-500',
          urgencyLevel === 'tomorrow' && 'bg-yellow-500',
          urgencyLevel === 'urgent' && 'bg-amber-500',
          urgencyLevel === 'soon' && 'bg-blue-500',
          urgencyLevel === 'normal' && 'bg-green-500'
        )}
      />

      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Target className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h3 className="font-semibold text-lg">{milestone.levelName}</h3>
            <Badge variant="secondary" className="text-xs mt-1">
              {milestone.seriesName}
            </Badge>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
            getUrgencyColor()
          )}
        >
          <UrgencyIcon className="h-4 w-4" />
          {getUrgencyText()}
        </div>
      </div>

      {/* 描述 */}
      {milestone.notes && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{milestone.notes}</p>
      )}

      {/* 详细信息 */}
      <div className="space-y-3">
        {/* 日期信息 */}
        {dueDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>截止日期：{format(dueDate, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}</span>
          </div>
        )}

        {/* 参与项目 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{milestone.participatingProjectsCount} 个项目参与</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onViewSeries}
        >
          <Trophy className="h-4 w-4" />
          查看赛事系列
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => onViewDetails(milestone)}
        >
          查看详情
          <ArrowRight className="h-4 w-4" />
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted/50 animate-pulse" />
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

              <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

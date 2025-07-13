import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Trophy, Calendar, ArrowRight, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUpcomingMilestones } from '@renderer/hooks/use-tipc'
import { cn } from '@renderer/lib/utils'
import { differenceInDays } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { formatFriendlyDate } from '@renderer/lib/i18n-formatters'

interface MilestoneItemProps {
  milestone: {
    id: string
    levelName: string
    dueDate: Date | null
    seriesName: string
    participatingProjectsCount: number
  }
  index: number
}

function MilestoneItem({ milestone, index }: MilestoneItemProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const now = new Date()
  const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null
  const daysUntilDue = dueDate ? differenceInDays(dueDate, now) : null

  // 确定紧急程度和颜色
  const getUrgencyInfo = () => {
    if (daysUntilDue === null)
      return {
        level: 'normal',
        color: 'bg-muted',
        text: t('upcomingCompetitions.urgency.noDueDate')
      }
    if (daysUntilDue < 0)
      return {
        level: 'overdue',
        color: 'bg-destructive',
        text: t('upcomingCompetitions.urgency.overdue')
      }
    if (daysUntilDue === 0)
      return {
        level: 'today',
        color: 'bg-destructive',
        text: t('upcomingCompetitions.urgency.today')
      }
    if (daysUntilDue === 1)
      return {
        level: 'tomorrow',
        color: 'bg-orange-500',
        text: t('upcomingCompetitions.urgency.tomorrow')
      }
    if (daysUntilDue <= 3)
      return {
        level: 'urgent',
        color: 'bg-orange-500',
        text: `${daysUntilDue}${t('upcomingCompetitions.urgency.daysLater')}`
      }
    if (daysUntilDue <= 7)
      return {
        level: 'soon',
        color: 'bg-yellow-500',
        text: `${daysUntilDue}${t('upcomingCompetitions.urgency.daysLater')}`
      }
    return {
      level: 'normal',
      color: 'bg-green-500',
      text: `${daysUntilDue}${t('upcomingCompetitions.urgency.daysLater')}`
    }
  }

  const urgencyInfo = getUrgencyInfo()

  const handleClick = () => {
    navigate({ to: '/competitions' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium truncate">{milestone.levelName}</h4>
            {urgencyInfo.level === 'overdue' && (
              <AlertCircle className="w-3 h-3 text-destructive shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mb-2">{milestone.seriesName}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatFriendlyDate(dueDate.toISOString())}</span>
              </div>
            )}
            {milestone.participatingProjectsCount > 0 && (
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                <span>
                  {milestone.participatingProjectsCount}
                  {t('upcomingCompetitions.projectCount')}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="secondary"
            className={cn('text-xs text-white border-0', urgencyInfo.color)}
          >
            {urgencyInfo.text}
          </Badge>
          <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  )
}

export function UpcomingCompetitionsSection() {
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const { data: milestones } = useUpcomingMilestones(3)

  // 条件渲染：没有比赛时完全不显示
  if (!milestones || milestones.length === 0) {
    return null
  }

  const handleViewAll = () => {
    navigate({ to: '/competitions' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">{t('upcomingCompetitions.title')}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAll}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {t('upcomingCompetitions.viewAll')}
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-2">
        {milestones.map((milestone, index) => (
          <MilestoneItem key={milestone.id} milestone={milestone} index={index} />
        ))}
      </div>
    </div>
  )
}

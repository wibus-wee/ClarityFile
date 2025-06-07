import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import {
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Plus,
  ArrowRight,
  Activity
} from 'lucide-react'
import { useCompetitionOverview, useUpcomingMilestones } from '@renderer/hooks/use-tipc'
import { cn } from '@renderer/lib/utils'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useNavigate } from '@tanstack/react-router'
import { CreateCompetitionSeriesDialog } from './dialogs/create-competition-series-dialog'
import { CreateCompetitionMilestoneDrawer } from './drawers/create-competition-milestone-drawer'
import { MilestoneDetailsDialog } from './dialogs/milestone-details-dialog'
import type { MilestoneWithProjectsOutput } from '../../../../main/types/outputs'

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm p-6',
        'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
        'transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend.isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            <TrendingUp className={cn('h-4 w-4', !trend.isPositive && 'rotate-180')} />
            {Math.abs(trend.value)}%
          </div>
          <span className="text-sm text-muted-foreground">较上月</span>
        </div>
      )}
    </motion.div>
  )
}

interface QuickActionProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: 'default' | 'secondary'
}

function QuickAction({
  title,
  description,
  icon: Icon,
  onClick,
  variant = 'default'
}: QuickActionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-xl border p-6 text-left transition-all',
        'hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20',
        variant === 'default'
          ? 'bg-background/50 hover:bg-background/80'
          : 'bg-muted/50 hover:bg-muted/80'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'rounded-lg p-3 transition-colors',
            variant === 'default'
              ? 'bg-primary/10 group-hover:bg-primary/20'
              : 'bg-secondary/50 group-hover:bg-secondary/70'
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5',
              variant === 'default' ? 'text-primary' : 'text-secondary-foreground'
            )}
          />
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
    </motion.button>
  )
}

export function CompetitionOverview() {
  const navigate = useNavigate()
  const { data: overview, isLoading: overviewLoading } = useCompetitionOverview()
  const { data: upcomingMilestones, isLoading: milestonesLoading } = useUpcomingMilestones(5)

  // 对话框状态
  const [createSeriesOpen, setCreateSeriesOpen] = useState(false)
  const [createMilestoneOpen, setCreateMilestoneOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneWithProjectsOutput | null>(
    null
  )
  const [milestoneDetailsOpen, setMilestoneDetailsOpen] = useState(false)

  // 处理快速操作
  const handleCreateSeries = () => {
    setCreateSeriesOpen(true)
  }

  const handleCreateMilestone = () => {
    setCreateMilestoneOpen(true)
  }

  const handleViewTimeline = () => {
    navigate({ to: '/competitions', search: { view: 'timeline' } })
  }

  const handleViewAllMilestones = () => {
    navigate({ to: '/competitions', search: { view: 'upcoming' } })
  }

  const handleMilestoneClick = (milestone: MilestoneWithProjectsOutput) => {
    setSelectedMilestone(milestone)
    setMilestoneDetailsOpen(true)
  }

  const handleSuccess = () => {
    // SWR 会自动重新验证数据
  }

  if (overviewLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const stats = overview?.totalStats

  return (
    <div className="space-y-8">
      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="赛事系列"
          value={stats?.totalSeries || 0}
          description="总共创建的赛事系列数量"
          icon={Trophy}
          trend={{ value: 12, isPositive: true }}
        />

        <StatCard
          title="里程碑"
          value={stats?.totalMilestones || 0}
          description="所有赛事系列的里程碑总数"
          icon={Target}
          trend={{ value: 8, isPositive: true }}
        />

        <StatCard
          title="项目参与"
          value={stats?.totalParticipations || 0}
          description="项目参与赛事的总次数"
          icon={Users}
          trend={{ value: 15, isPositive: true }}
        />

        <StatCard
          title="活跃赛事"
          value={upcomingMilestones?.length || 0}
          description="即将到来的赛事里程碑"
          icon={Activity}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* 快速操作 */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">快速操作</h2>
              <div className="space-y-3">
                <QuickAction
                  title="创建赛事系列"
                  description="开始一个新的赛事系列"
                  icon={Plus}
                  onClick={handleCreateSeries}
                />

                <QuickAction
                  title="添加里程碑"
                  description="为现有赛事系列添加里程碑"
                  icon={Target}
                  onClick={handleCreateMilestone}
                  variant="secondary"
                />

                <QuickAction
                  title="查看时间轴"
                  description="按时间顺序查看所有赛事"
                  icon={Calendar}
                  onClick={handleViewTimeline}
                  variant="secondary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 即将到来的里程碑 */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">即将到来的里程碑</h2>
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleViewAllMilestones}>
                查看全部
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {milestonesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-lg bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : upcomingMilestones && upcomingMilestones.length > 0 ? (
              <div className="space-y-3">
                {upcomingMilestones.map((milestone, index) => (
                  <motion.button
                    key={milestone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleMilestoneClick(milestone)}
                    className="flex items-center gap-4 rounded-lg border bg-background/50 p-4 hover:bg-background/80 transition-colors w-full text-left"
                  >
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{milestone.levelName}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {milestone.seriesName}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {milestone.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(milestone.dueDate), 'MM月dd日', { locale: zhCN })}
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {milestone.participatingProjectsCount} 个项目参与
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无即将到来的里程碑</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 对话框和抽屉组件 */}
      <CreateCompetitionSeriesDialog
        isOpen={createSeriesOpen}
        onOpenChange={setCreateSeriesOpen}
        onSuccess={handleSuccess}
      />

      <CreateCompetitionMilestoneDrawer
        open={createMilestoneOpen}
        onOpenChange={setCreateMilestoneOpen}
        onSuccess={handleSuccess}
      />

      <MilestoneDetailsDialog
        milestone={selectedMilestone}
        isOpen={milestoneDetailsOpen}
        onOpenChange={setMilestoneDetailsOpen}
        onViewSeries={() => {
          setMilestoneDetailsOpen(false)
          navigate({ to: '/competitions', search: { view: 'series' } })
        }}
        onViewProjects={() => {
          // 这里可以导航到项目列表页面，筛选参与该里程碑的项目
          console.log('查看参与项目:', selectedMilestone?.id)
        }}
      />
    </div>
  )
}

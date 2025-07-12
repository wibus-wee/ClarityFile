import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Trophy, Target, Calendar, Users, Clock, Plus, ArrowRight, Activity } from 'lucide-react'
import { useCompetitionOverview, useUpcomingMilestones } from '@renderer/hooks/use-tipc'
import { cn } from '@renderer/lib/utils'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useNavigate } from '@tanstack/react-router'
import { CompetitionSeriesDrawer } from './drawers/competition-series-drawer'
import { CompetitionMilestoneDrawer } from './drawers/competition-milestone-drawer'
import { MilestoneDetailsDialog } from './dialogs/milestone-details-dialog'
import { MilestoneWithProjectsOutput } from '@main/types/competition-schemas'

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
}

function StatCard({ title, value, description, icon: Icon, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors',
        className
      )}
      whileHover={{ scale: 1.04 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 35
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xl font-bold">{value}</div>
          <div className="text-sm font-medium text-foreground truncate">{title}</div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</div>
        </div>
      </div>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group w-full p-4 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors text-left',
        variant === 'secondary' && 'bg-muted/50'
      )}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 35
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
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
            <div key={i} className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-muted/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted/50 rounded animate-pulse w-16" />
                  <div className="h-4 bg-muted/50 rounded animate-pulse w-20" />
                  <div className="h-3 bg-muted/50 rounded animate-pulse w-24" />
                </div>
              </div>
            </div>
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
        />

        <StatCard
          title="里程碑"
          value={stats?.totalMilestones || 0}
          description="所有赛事系列的里程碑总数"
          icon={Target}
        />

        <StatCard
          title="项目参与"
          value={stats?.totalParticipations || 0}
          description="项目参与赛事的总次数"
          icon={Users}
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
              <div className="divide-y divide-border/50">
                {Array.from({ length: 3 }).map((_, i) => (
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
            ) : upcomingMilestones && upcomingMilestones.length > 0 ? (
              <div className="divide-y divide-border/50">
                {upcomingMilestones.map((milestone, index) => (
                  <motion.button
                    key={milestone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleMilestoneClick(milestone)}
                    className="flex items-center gap-3 py-3 px-4 border-b border-border/50 hover:bg-muted/30 transition-colors w-full text-left"
                    transition={{
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 400,
                      damping: 35
                    }}
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{milestone.levelName}</h3>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {milestone.seriesName}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
      <CompetitionSeriesDrawer
        open={createSeriesOpen}
        onOpenChange={setCreateSeriesOpen}
        onSuccess={handleSuccess}
      />

      <CompetitionMilestoneDrawer
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

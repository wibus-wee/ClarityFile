import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import { Plus, Search, Calendar, Trophy, Target, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { CompetitionOverview } from '@renderer/components/competitions/competition-overview'
import { CompetitionSeriesList } from '@renderer/components/competitions/competition-series-list'
import { CompetitionTimeline } from '@renderer/components/competitions/competition-timeline'
import { UpcomingMilestones } from '@renderer/components/competitions/upcoming-milestones'
import { CompetitionSeriesDialog } from '@renderer/components/competitions/dialogs/competition-series-dialog'
import { CompetitionMilestoneDrawer } from '@renderer/components/competitions/drawers/competition-milestone-drawer'

// 视图模式类型
type ViewMode = 'overview' | 'series' | 'timeline' | 'upcoming'

interface ViewTab {
  id: ViewMode
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const viewTabs: ViewTab[] = [
  {
    id: 'overview',
    label: '概览',
    icon: TrendingUp,
    description: '赛事中心总览和统计信息'
  },
  {
    id: 'series',
    label: '赛事系列',
    icon: Trophy,
    description: '管理所有赛事系列和里程碑'
  },
  {
    id: 'timeline',
    label: '时间轴',
    icon: Calendar,
    description: '按时间顺序查看所有赛事里程碑'
  },
  {
    id: 'upcoming',
    label: '即将到来',
    icon: Clock,
    description: '查看即将到来的赛事里程碑'
  }
]

export const Route = createFileRoute('/competitions')({
  component: CompetitionsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      view: (search.view as ViewMode) || 'overview',
      seriesId: search.seriesId as string | undefined,
      showMilestones: search.showMilestones as string | undefined
    } as {
      view?: ViewMode
      seriesId?: string
      showMilestones?: string
    }
  }
})

function CompetitionsPage() {
  const { view, seriesId, showMilestones } = Route.useSearch()
  const [currentView, setCurrentView] = useState<ViewMode>(view || 'overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'milestones'>('created')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')

  // Dialog 和 Drawer 状态
  const [createSeriesOpen, setCreateSeriesOpen] = useState(false)
  const [createMilestoneOpen, setCreateMilestoneOpen] = useState(false)
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null)

  const handleCreateMilestone = (seriesId: string) => {
    setSelectedSeriesId(seriesId)
    setCreateMilestoneOpen(true)
  }

  const handleSuccess = () => {
    // SWR 会自动重新验证数据
  }

  return (
    <div className="space-y-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">赛事中心</h1>
          <p className="text-muted-foreground">管理赛事系列、里程碑和项目参赛情况</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setCreateMilestoneOpen(true)} className="gap-2">
            <Target className="h-4 w-4" />
            添加里程碑
          </Button>

          <Button onClick={() => setCreateSeriesOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            创建赛事系列
          </Button>
        </div>
      </div>

      {/* 视图切换标签 */}
      <div className="border-b border-border">
        <nav className="flex space-x-8" aria-label="Tabs">
          {viewTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={cn(
                  'group relative flex items-center gap-2 py-4 px-1 text-sm font-medium transition-colors',
                  'border-b-2 border-transparent',
                  'hover:text-foreground hover:border-border',
                  currentView === tab.id
                    ? 'text-foreground border-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}

                {/* 活动指示器 */}
                {currentView === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* 搜索和筛选栏 */}
      {(currentView === 'series' || currentView === 'timeline') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索赛事系列或里程碑..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">创建时间</SelectItem>
              <SelectItem value="name">名称</SelectItem>
              <SelectItem value="milestones">里程碑数量</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="active">进行中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* 主要内容区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
        >
          {currentView === 'overview' && <CompetitionOverview />}
          {currentView === 'series' && (
            <CompetitionSeriesList
              searchQuery={searchQuery}
              sortBy={sortBy}
              filterStatus={filterStatus}
              onCreateMilestone={handleCreateMilestone}
              initialSeriesId={seriesId}
              autoShowMilestones={showMilestones === 'true'}
            />
          )}
          {currentView === 'timeline' && (
            <CompetitionTimeline searchQuery={searchQuery} sortBy={sortBy} />
          )}
          {currentView === 'upcoming' && <UpcomingMilestones />}
        </motion.div>
      </AnimatePresence>

      {/* 对话框和抽屉 */}
      <CompetitionSeriesDialog
        open={createSeriesOpen}
        onOpenChange={setCreateSeriesOpen}
        onSuccess={handleSuccess}
      />

      <CompetitionMilestoneDrawer
        open={createMilestoneOpen}
        onOpenChange={setCreateMilestoneOpen}
        selectedSeriesId={selectedSeriesId || undefined}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

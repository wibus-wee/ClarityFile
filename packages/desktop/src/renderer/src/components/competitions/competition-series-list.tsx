import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import {
  Trophy,
  Target,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Clock,
  List,
  Calendar
} from 'lucide-react'
import { useGetAllCompetitionSeries } from '@renderer/hooks/use-tipc'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { CompetitionSeriesDrawer } from './drawers/competition-series-drawer'
import { DeleteCompetitionSeriesDialog } from './dialogs/delete-competition-series-dialog'
import { CompetitionMilestoneList } from './competition-milestone-list'
import type { CompetitionSeriesWithStatsOutput } from '../../../../main/types/competition-schemas'

interface CompetitionSeriesListProps {
  searchQuery: string
  sortBy: 'name' | 'created' | 'milestones'
  filterStatus: 'all' | 'active' | 'completed'
  onCreateMilestone: (seriesId: string) => void
  initialSeriesId?: string
  autoShowMilestones?: boolean
}

interface SeriesCardProps {
  series: CompetitionSeriesWithStatsOutput
  onCreateMilestone: (seriesId: string) => void
  onEdit: (series: CompetitionSeriesWithStatsOutput) => void
  onDelete: (series: CompetitionSeriesWithStatsOutput) => void
  onViewMilestones: (series: CompetitionSeriesWithStatsOutput) => void
}

function SeriesCard({
  series,
  onCreateMilestone,
  onEdit,
  onDelete,
  onViewMilestones
}: SeriesCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group flex items-center justify-between py-3 px-4 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 35
      }}
      onClick={() => onViewMilestones(series)}
    >
      {/* 左侧：图标和内容 */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Trophy className="h-4 w-4 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">{series.name}</h3>
            <Badge
              variant={series.milestoneCount > 0 ? 'default' : 'secondary'}
              className="text-xs shrink-0"
            >
              {series.milestoneCount > 0 ? '活跃' : '待配置'}
            </Badge>
          </div>

          {series.notes && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{series.notes}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{series.milestoneCount} 个里程碑</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(series.updatedAt), 'MM月dd日更新', { locale: zhCN })}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                创建于 {format(new Date(series.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onCreateMilestone(series.id)
          }}
          className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 text-xs"
        >
          <Plus className="h-3 w-3" />
          添加里程碑
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onViewMilestones(series)
              }}
            >
              <List className="h-4 w-4 mr-2" />
              查看里程碑
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onCreateMilestone(series.id)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加里程碑
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onEdit(series)
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              编辑系列
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDelete(series)
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除系列
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}

export function CompetitionSeriesList({
  searchQuery,
  sortBy,
  filterStatus,
  onCreateMilestone,
  initialSeriesId,
  autoShowMilestones
}: CompetitionSeriesListProps) {
  const { data: series, isLoading } = useGetAllCompetitionSeries()
  const [editingSeries, setEditingSeries] = useState<CompetitionSeriesWithStatsOutput | null>(null)
  const [deletingSeries, setDeletingSeries] = useState<CompetitionSeriesWithStatsOutput | null>(
    null
  )
  const [viewingMilestonesSeries, setViewingMilestonesSeries] =
    useState<CompetitionSeriesWithStatsOutput | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [showMilestonesList, setShowMilestonesList] = useState(false)

  // 自动显示特定系列的里程碑
  useEffect(() => {
    if (initialSeriesId && autoShowMilestones && series) {
      const targetSeries = series.find((s) => s.id === initialSeriesId)
      if (targetSeries) {
        setViewingMilestonesSeries(targetSeries)
        setShowMilestonesList(true)
      }
    }
  }, [initialSeriesId, autoShowMilestones, series])

  // 过滤和排序逻辑
  const filteredAndSortedSeries = useMemo(() => {
    if (!series) return []

    const filtered = series.filter((s) => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!s.name.toLowerCase().includes(query) && !s.notes?.toLowerCase().includes(query)) {
          return false
        }
      }

      // 状态过滤
      if (filterStatus === 'active' && s.milestoneCount === 0) return false
      if (filterStatus === 'completed' && s.milestoneCount > 0) return false

      return true
    })

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'milestones':
          return b.milestoneCount - a.milestoneCount
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [series, searchQuery, sortBy, filterStatus])

  const handleEdit = (series: CompetitionSeriesWithStatsOutput) => {
    setEditingSeries(series)
    setEditDialogOpen(true)
  }

  const handleDelete = (series: CompetitionSeriesWithStatsOutput) => {
    setDeletingSeries(series)
    setDeleteDialogOpen(true)
  }

  const handleViewMilestones = (series: CompetitionSeriesWithStatsOutput) => {
    setViewingMilestonesSeries(series)
    setShowMilestonesList(true)
  }

  const handleBackFromMilestones = () => {
    setShowMilestonesList(false)
    setViewingMilestonesSeries(null)
    // 清理可能的编辑状态，防止返回时意外显示 Dialog
    setEditDialogOpen(false)
    setEditingSeries(null)
  }

  const handleSuccess = () => {
    // SWR 会自动重新验证数据
    setEditDialogOpen(false)
    setDeleteDialogOpen(false)
    setEditingSeries(null)
    setDeletingSeries(null)
  }

  // 如果正在查看里程碑列表，显示里程碑列表组件
  if (showMilestonesList && viewingMilestonesSeries) {
    return (
      <CompetitionMilestoneList
        series={viewingMilestonesSeries}
        onBack={handleBackFromMilestones}
        onCreateMilestone={() => onCreateMilestone(viewingMilestonesSeries.id)}
      />
    )
  }

  if (isLoading) {
    return (
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
    )
  }

  if (!series || series.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">暂无赛事系列</h3>
        <p className="text-muted-foreground mb-6">创建您的第一个赛事系列来开始管理赛事里程碑</p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          创建赛事系列
        </Button>
      </motion.div>
    )
  }

  if (filteredAndSortedSeries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">未找到匹配的赛事系列</h3>
        <p className="text-muted-foreground">尝试调整搜索条件或筛选器</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 结果统计 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          找到 {filteredAndSortedSeries.length} 个赛事系列
        </p>
      </div>

      {/* 赛事系列列表 */}
      <motion.div layout className="divide-y divide-border/50">
        <AnimatePresence>
          {filteredAndSortedSeries.map((series) => (
            <SeriesCard
              key={series.id}
              series={series}
              onCreateMilestone={onCreateMilestone}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewMilestones={handleViewMilestones}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* 抽屉组件 */}
      <CompetitionSeriesDrawer
        series={editingSeries}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
      />

      <DeleteCompetitionSeriesDialog
        series={deletingSeries}
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

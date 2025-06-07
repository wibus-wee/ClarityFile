import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { Trophy, Target, MoreHorizontal, Edit, Trash2, Plus, Clock, List } from 'lucide-react'
import { useGetAllCompetitionSeries } from '@renderer/hooks/use-tipc'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { EditCompetitionSeriesDialog } from './dialogs/edit-competition-series-dialog'
import { DeleteCompetitionSeriesDialog } from './dialogs/delete-competition-series-dialog'
import { CompetitionMilestoneList } from './competition-milestone-list'
import type { CompetitionSeriesWithStatsOutput } from '../../../../main/types/outputs'

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
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="group relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm p-6 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-200 cursor-pointer"
      onClick={() => onViewMilestones(series)}
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Trophy className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h3 className="font-semibold text-lg">{series.name}</h3>
            <p className="text-sm text-muted-foreground">
              创建于 {format(new Date(series.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewMilestones(series)}>
              <List className="h-4 w-4 mr-2" />
              查看里程碑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateMilestone(series.id)}>
              <Plus className="h-4 w-4 mr-2" />
              添加里程碑
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(series)}>
              <Edit className="h-4 w-4 mr-2" />
              编辑系列
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(series)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除系列
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 描述 */}
      {series.notes && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{series.notes}</p>
      )}

      {/* 统计信息 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          <span>{series.milestoneCount} 个里程碑</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{format(new Date(series.updatedAt), 'MM月dd日更新', { locale: zhCN })}</span>
        </div>
      </div>

      {/* 状态标签 */}
      <div className="flex items-center justify-between">
        <Badge variant={series.milestoneCount > 0 ? 'default' : 'secondary'} className="text-xs">
          {series.milestoneCount > 0 ? '活跃' : '待配置'}
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCreateMilestone(series.id)}
          className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          添加里程碑
        </Button>
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse" />
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

      {/* 赛事系列网格 */}
      <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      {/* 对话框组件 */}
      <EditCompetitionSeriesDialog
        series={editingSeries}
        isOpen={editDialogOpen}
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

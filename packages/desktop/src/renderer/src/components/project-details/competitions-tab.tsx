import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Separator } from '@clarity/shadcn/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import {
  Trophy,
  Plus,
  Search,
  Filter,
  Calendar,
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import { cn } from '@renderer/lib/utils'
import { Shortcut } from '@renderer/components/shortcuts'
import { AddCompetitionDrawer } from './drawers/add-competition-drawer'
import { EditCompetitionStatusDialog } from './dialogs/edit-competition-status-dialog'
import { CompetitionDetailsDialog } from './dialogs/competition-details-dialog'
import { RemoveCompetitionDialog } from './dialogs/remove-competition-dialog'
import { CompetitionDocumentsSection } from './competition-documents-section'
import { useGetProjectCompetitionsBySeriesWithDocuments } from '@renderer/hooks/use-tipc'
import type { ProjectDetailsOutput } from '../../../../main/types/project-schemas'

interface CompetitionsTabProps {
  projectDetails: ProjectDetailsOutput
}

export function CompetitionsTab({ projectDetails }: CompetitionsTabProps) {
  const { data: competitionSeries, isLoading } = useGetProjectCompetitionsBySeriesWithDocuments(
    projectDetails.project.id
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'series' | 'level' | 'participated' | 'deadline'>(
    'participated'
  )
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set())
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set())

  // Dialog 和 Drawer 状态
  const [addCompetitionOpen, setAddCompetitionOpen] = useState(false)
  const [editStatusOpen, setEditStatusOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<{
    seriesId: string
    seriesName: string
    milestoneId: string
    levelName: string
    statusInMilestone: string | null
  } | null>(null)

  // 事件处理函数
  const handleSuccess = () => {
    // 刷新数据的逻辑会通过 SWR 自动处理
  }

  const toggleSeriesExpansion = (seriesId: string) => {
    setExpandedSeries((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(seriesId)) {
        newSet.delete(seriesId)
      } else {
        newSet.add(seriesId)
      }
      return newSet
    })
  }

  const toggleMilestoneExpansion = (milestoneId: string) => {
    setExpandedMilestones((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId)
      } else {
        newSet.add(milestoneId)
      }
      return newSet
    })
  }

  const handleEditMilestoneStatus = (milestone: {
    seriesId: string
    seriesName: string
    milestoneId: string
    levelName: string
    statusInMilestone: string | null
  }) => {
    setSelectedMilestone(milestone)
    setEditStatusOpen(true)
  }

  const handleViewMilestoneDetails = (milestone: {
    seriesId: string
    seriesName: string
    milestoneId: string
    levelName: string
    statusInMilestone: string | null
  }) => {
    setSelectedMilestone(milestone)
    setDetailsOpen(true)
  }

  const handleRemoveMilestone = (milestone: {
    seriesId: string
    seriesName: string
    milestoneId: string
    levelName: string
    statusInMilestone: string | null
  }) => {
    setSelectedMilestone(milestone)
    setRemoveOpen(true)
  }

  // 获取所有状态（从所有里程碑中提取）
  const statuses = Array.from(
    new Set(
      competitionSeries
        ?.flatMap((series) => series.milestones.map((milestone) => milestone.statusInMilestone))
        .filter(Boolean) || []
    )
  )

  // 过滤和排序赛事系列
  const filteredSeries = (competitionSeries || [])
    .filter((series) => {
      const matchesSearch =
        series.seriesName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        series.milestones.some((milestone) =>
          milestone.levelName.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const matchesStatus =
        filterStatus === 'all' ||
        series.milestones.some((milestone) => milestone.statusInMilestone === filterStatus)

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'series':
          return a.seriesName.localeCompare(b.seriesName)
        case 'participated': {
          // 按最早参与时间排序
          const aEarliest = Math.min(
            ...a.milestones.map((m) => new Date(m.participatedAt).getTime())
          )
          const bEarliest = Math.min(
            ...b.milestones.map((m) => new Date(m.participatedAt).getTime())
          )
          return bEarliest - aEarliest
        }
        default:
          return new Date(b.seriesCreatedAt).getTime() - new Date(a.seriesCreatedAt).getTime()
      }
    })

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'

    switch (status.toLowerCase()) {
      case 'submitted':
      case '已提交':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'in_progress':
      case '进行中':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'completed':
      case '已完成':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'awarded':
      case '获奖':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const isDeadlineApproaching = (deadline: Date | null) => {
    if (!deadline) return false
    const now = new Date()
    const diffDays = Math.ceil(
      (new Date(deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    return diffDays <= 7 && diffDays >= 0
  }

  const isOverdue = (deadline: Date | null) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索赛事..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status!}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="participated">参与时间</SelectItem>
              <SelectItem value="deadline">截止时间</SelectItem>
              <SelectItem value="series">赛事系列</SelectItem>
              <SelectItem value="level">级别</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Shortcut shortcut={['cmd', 'n']} description="关联到新赛事">
            <Button onClick={() => setAddCompetitionOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              关联到新赛事
            </Button>
          </Shortcut>
        </div>
      </div>

      <Separator />

      {/* 赛事系列列表 */}
      <div className="space-y-1">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        ) : filteredSeries.length > 0 ? (
          <AnimatePresence>
            {filteredSeries.map((series, index) => {
              const isSeriesExpanded = expandedSeries.has(series.seriesId)
              const totalDocuments = series.milestones.reduce(
                (sum, milestone) => sum + milestone.documents.length,
                0
              )

              return (
                <motion.div
                  key={series.seriesId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.02 }}
                  className="border border-border/60 rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* 赛事系列主行 */}
                  <div
                    className={cn(
                      'flex items-center justify-between p-5 hover:bg-muted/40 transition-all duration-200 cursor-pointer',
                      isSeriesExpanded && 'bg-muted/30 border-b border-border/50'
                    )}
                    onClick={() => toggleSeriesExpansion(series.seriesId)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* 展开/折叠图标 */}
                      <div className="flex items-center">
                        {series.milestones.length > 0 ? (
                          isSeriesExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                        <Trophy className="w-5 h-5 text-yellow-500 ml-2" />
                      </div>

                      {/* 赛事系列信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-semibold truncate text-foreground">
                            {series.seriesName}
                          </h3>
                          <Badge variant="outline" className="text-xs font-medium">
                            {series.milestones.length} 个里程碑
                          </Badge>
                          {totalDocuments > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {totalDocuments} 个文档
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            参与于 {new Date(series.seriesCreatedAt).toLocaleDateString()}
                          </span>
                          {series.seriesNotes && (
                            <span className="truncate max-w-48">{series.seriesNotes}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 展开的里程碑列表 */}
                  {isSeriesExpanded && (
                    <div className="border-t border-border/40">
                      {series.milestones.map((milestone) => {
                        const isMilestoneExpanded = expandedMilestones.has(milestone.milestoneId)
                        const hasDocuments = milestone.documents && milestone.documents.length > 0

                        return (
                          <div
                            key={milestone.milestoneId}
                            className="border-b border-border/20 last:border-b-0"
                          >
                            {/* 里程碑行 */}
                            <div
                              className={cn(
                                'flex items-center justify-between p-4 pl-10 hover:bg-muted/30 transition-all duration-200 cursor-pointer',
                                isMilestoneExpanded && 'bg-muted/20'
                              )}
                              onClick={() => toggleMilestoneExpansion(milestone.milestoneId)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex items-center">
                                  {hasDocuments ? (
                                    isMilestoneExpanded ? (
                                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                    )
                                  ) : (
                                    <div className="w-3 h-3" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-sm font-semibold truncate text-foreground">
                                      {milestone.levelName}
                                    </h4>
                                    {milestone.statusInMilestone && (
                                      <Badge
                                        className={cn(
                                          'text-xs font-medium',
                                          getStatusColor(milestone.statusInMilestone)
                                        )}
                                      >
                                        {milestone.statusInMilestone}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      参与于{' '}
                                      {new Date(milestone.participatedAt).toLocaleDateString()}
                                    </span>

                                    {milestone.dueDateMilestone && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        截止{' '}
                                        {new Date(milestone.dueDateMilestone).toLocaleDateString()}
                                      </span>
                                    )}

                                    {hasDocuments && (
                                      <span className="flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        {milestone.documents.length} 个文档
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* 里程碑操作按钮 */}
                              <div
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-3 text-xs font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                  onClick={() =>
                                    handleEditMilestoneStatus({
                                      seriesId: series.seriesId,
                                      seriesName: series.seriesName,
                                      milestoneId: milestone.milestoneId,
                                      levelName: milestone.levelName,
                                      statusInMilestone: milestone.statusInMilestone
                                    })
                                  }
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  编辑
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 hover:bg-gray-100 transition-colors"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleViewMilestoneDetails({
                                          seriesId: series.seriesId,
                                          seriesName: series.seriesName,
                                          milestoneId: milestone.milestoneId,
                                          levelName: milestone.levelName,
                                          statusInMilestone: milestone.statusInMilestone
                                        })
                                      }
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      查看详情
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() =>
                                        handleRemoveMilestone({
                                          seriesId: series.seriesId,
                                          seriesName: series.seriesName,
                                          milestoneId: milestone.milestoneId,
                                          levelName: milestone.levelName,
                                          statusInMilestone: milestone.statusInMilestone
                                        })
                                      }
                                    >
                                      取消关联
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* 展开的文档列表 */}
                            {isMilestoneExpanded && hasDocuments && (
                              <div className="pl-12 pr-6 pb-4 bg-muted/10 border-t border-border/30">
                                <div className="pt-3">
                                  <CompetitionDocumentsSection
                                    documents={milestone.documents}
                                    competitionName={series.seriesName}
                                    levelName={milestone.levelName}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        ) : (
          <div className="text-center py-16">
            <div className="bg-muted/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || filterStatus !== 'all' ? '没有找到匹配的赛事' : '暂无参与赛事'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all'
                ? '尝试调整搜索条件或筛选器来查找赛事'
                : '点击下方按钮来关联项目到赛事系列，开始您的竞赛之旅'}
            </p>
            <Shortcut shortcut={['cmd', 'n']} description="关联到新赛事">
              <Button
                onClick={() => setAddCompetitionOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                关联到新赛事
              </Button>
            </Shortcut>
          </div>
        )}
      </div>

      {/* Dialog 和 Drawer 组件 */}
      <AddCompetitionDrawer
        projectId={projectDetails.project.id}
        open={addCompetitionOpen}
        onOpenChange={setAddCompetitionOpen}
        onSuccess={handleSuccess}
      />

      {/* 编辑里程碑状态对话框 */}
      <EditCompetitionStatusDialog
        projectId={projectDetails.project.id}
        competitionMilestoneId={selectedMilestone?.milestoneId || ''}
        currentStatus={selectedMilestone?.statusInMilestone || null}
        competitionName={selectedMilestone?.seriesName || ''}
        levelName={selectedMilestone?.levelName || ''}
        open={editStatusOpen}
        onOpenChange={setEditStatusOpen}
        onSuccess={handleSuccess}
      />

      {/* 查看里程碑详情对话框 */}
      <CompetitionDetailsDialog
        milestone={selectedMilestone}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      {/* 移除里程碑关联对话框 */}
      <RemoveCompetitionDialog
        projectId={projectDetails.project.id}
        competition={
          selectedMilestone
            ? {
                milestoneId: selectedMilestone.milestoneId,
                seriesName: selectedMilestone.seriesName,
                levelName: selectedMilestone.levelName,
                statusInMilestone: selectedMilestone.statusInMilestone
              }
            : null
        }
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

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
import {
  Trophy,
  Plus,
  Search,
  Filter,
  Calendar,
  FileText,
  Clock,
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
      const isCurrentlyExpanded = newSet.has(seriesId)

      if (isCurrentlyExpanded) {
        // 关闭父级时，同时关闭该系列下的所有子级里程碑
        newSet.delete(seriesId)

        // 找到该系列下的所有里程碑ID并从展开状态中移除
        const currentSeries = competitionSeries?.find((series) => series.seriesId === seriesId)
        if (currentSeries) {
          const milestoneIds = currentSeries.milestones.map((milestone) => milestone.milestoneId)
          setExpandedMilestones((prevMilestones) => {
            const newMilestoneSet = new Set(prevMilestones)
            milestoneIds.forEach((id) => newMilestoneSet.delete(id))
            return newMilestoneSet
          })
        }
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
    if (!status) return 'bg-muted/50 text-muted-foreground'

    switch (status.toLowerCase()) {
      case 'submitted':
      case '已提交':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      case 'in_progress':
      case '进行中':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      case 'completed':
      case '已完成':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'awarded':
      case '获奖':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
      default:
        return 'bg-muted/50 text-muted-foreground'
    }
  }

  return (
    <div className="space-y-4">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索赛事..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 border-border/60 focus:border-border"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-28 h-9 border-border/60">
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
            <SelectTrigger className="w-28 h-9 border-border/60">
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
            <Button onClick={() => setAddCompetitionOpen(true)} className="h-9 px-4">
              <Plus className="w-4 h-4 mr-2" />
              关联到新赛事
            </Button>
          </Shortcut>
        </div>
      </div>

      {/* 赛事系列列表 */}
      <div className="">
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
                  className="group p-1"
                >
                  {/* 赛事系列主行 */}
                  <div
                    className={cn(
                      'mb-2 flex items-center justify-between py-4 px-4 bg-muted/40 hover:bg-muted/60 rounded-md border border-border/50 cursor-pointer -mx-1',
                      isSeriesExpanded && 'bg-muted/70'
                    )}
                    onClick={() => toggleSeriesExpansion(series.seriesId)}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* 展开/折叠图标 */}
                      <div className="flex items-center gap-3">
                        {series.milestones.length > 0 ? (
                          <motion.div
                            animate={{ rotate: isSeriesExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
                          >
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </motion.div>
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                        <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                      </div>

                      {/* 赛事系列信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-base font-medium truncate text-foreground">
                            {series.seriesName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                              {series.milestones.length} 个里程碑
                            </span>
                            {totalDocuments > 0 && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                                {totalDocuments} 个文档
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
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
                  <AnimatePresence>
                    {isSeriesExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.04, 0.62, 0.23, 0.98]
                        }}
                        className="mt-3 mb-3 ml-7 space-y-2 overflow-hidden"
                      >
                        {series.milestones.map((milestone, milestoneIndex) => {
                          const isMilestoneExpanded = expandedMilestones.has(milestone.milestoneId)
                          const hasDocuments = milestone.documents && milestone.documents.length > 0

                          return (
                            <motion.div
                              key={milestone.milestoneId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: milestoneIndex * 0.05,
                                duration: 0.25,
                                ease: [0.04, 0.62, 0.23, 0.98]
                              }}
                              className="group/milestone p-1"
                            >
                              {/* 里程碑行 */}
                              <div
                                className={cn(
                                  'flex items-center justify-between py-3 px-3 bg-muted/50 border border-border/50 hover:bg-muted/60 rounded-md cursor-pointer -mx-1',
                                  isMilestoneExpanded && 'bg-muted/70'
                                )}
                                onClick={() => toggleMilestoneExpansion(milestone.milestoneId)}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {hasDocuments ? (
                                      <motion.div
                                        animate={{ rotate: isMilestoneExpanded ? 90 : 0 }}
                                        transition={{
                                          duration: 0.2,
                                          ease: [0.04, 0.62, 0.23, 0.98]
                                        }}
                                      >
                                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                      </motion.div>
                                    ) : (
                                      <div className="w-3 h-3" />
                                    )}
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40"></div>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                      <h4 className="text-sm font-medium truncate text-foreground">
                                        {milestone.levelName}
                                      </h4>
                                      {milestone.statusInMilestone && (
                                        <span
                                          className={cn(
                                            'text-xs font-medium px-2 py-1 rounded-md',
                                            getStatusColor(milestone.statusInMilestone)
                                          )}
                                        >
                                          {milestone.statusInMilestone}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        参与于{' '}
                                        {new Date(milestone.participatedAt).toLocaleDateString()}
                                      </span>

                                      {milestone.dueDateMilestone && (
                                        <span className="flex items-center gap-1.5">
                                          <Clock className="w-3 h-3" />
                                          截止{' '}
                                          {new Date(
                                            milestone.dueDateMilestone
                                          ).toLocaleDateString()}
                                        </span>
                                      )}

                                      {hasDocuments && (
                                        <span className="flex items-center gap-1.5">
                                          <FileText className="w-3 h-3" />
                                          {milestone.documents.length} 个文档
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* 里程碑操作按钮 */}
                                <div
                                  className="flex items-center gap-1 opacity-0 group-hover/milestone:opacity-100 transition-opacity duration-200"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs font-medium hover:bg-muted transition-colors"
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
                                        className="h-7 w-7 p-0 hover:bg-muted transition-colors"
                                      >
                                        <MoreHorizontal className="w-3 h-3" />
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
                              <AnimatePresence>
                                {isMilestoneExpanded && hasDocuments && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{
                                      duration: 0.25,
                                      ease: [0.04, 0.62, 0.23, 0.98]
                                    }}
                                    className="mt-3 ml-5 pl-4 border-l-2 border-muted overflow-hidden"
                                  >
                                    <CompetitionDocumentsSection
                                      documents={milestone.documents}
                                      competitionName={series.seriesName}
                                      levelName={milestone.levelName}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-base font-medium text-foreground mb-2">
              {searchQuery || filterStatus !== 'all' ? '没有找到匹配的赛事' : '暂无参与赛事'}
            </h3>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              {searchQuery || filterStatus !== 'all'
                ? '尝试调整搜索条件或筛选器来查找赛事'
                : '点击下方按钮来关联项目到赛事系列，开始您的竞赛之旅'}
            </p>
            <Shortcut shortcut={['cmd', 'n']} description="关联到新赛事">
              <Button
                onClick={() => setAddCompetitionOpen(true)}
                className="bg-primary hover:bg-primary/90 h-9 px-4"
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

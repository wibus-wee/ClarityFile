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
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Clock,
  Award
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import { cn } from '@renderer/lib/utils'
import { AddCompetitionDrawer } from './drawers/add-competition-drawer'
import { EditCompetitionStatusDialog } from './dialogs/edit-competition-status-dialog'
import { CompetitionDetailsDialog } from './dialogs/competition-details-dialog'
import { RemoveCompetitionDialog } from './dialogs/remove-competition-dialog'
import type { ProjectDetailsOutput } from '../../../../main/types/project-schemas'

interface CompetitionsTabProps {
  projectDetails: ProjectDetailsOutput
}

export function CompetitionsTab({ projectDetails }: CompetitionsTabProps) {
  const { competitions } = projectDetails
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'series' | 'level' | 'participated' | 'deadline'>(
    'participated'
  )
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Dialog 和 Drawer 状态
  const [addCompetitionOpen, setAddCompetitionOpen] = useState(false)
  const [editStatusOpen, setEditStatusOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<(typeof competitions)[0] | null>(
    null
  )

  // 事件处理函数
  const handleSuccess = () => {
    // 刷新数据的逻辑会通过 SWR 自动处理
  }

  const handleEditStatus = (competition: (typeof competitions)[0]) => {
    setSelectedCompetition(competition)
    setEditStatusOpen(true)
  }

  const handleViewDetails = (competition: (typeof competitions)[0]) => {
    setSelectedCompetition(competition)
    setDetailsOpen(true)
  }

  const handleRemoveCompetition = (competition: (typeof competitions)[0]) => {
    setSelectedCompetition(competition)
    setRemoveOpen(true)
  }

  const handleDownloadNotification = (competition: (typeof competitions)[0]) => {
    if (competition.notificationPhysicalPath) {
      // 在 Electron 中，我们可以使用 shell.openPath 来打开文件
      // 这里暂时使用 alert 提示，实际应该调用后端接口
      alert(`下载文件: ${competition.notificationOriginalFileName}`)
    }
  }

  // 获取所有状态
  const statuses = Array.from(
    new Set(competitions.map((comp) => comp.statusInMilestone).filter(Boolean))
  )

  // 过滤和排序赛事
  const filteredCompetitions = competitions
    .filter((comp) => {
      const matchesSearch =
        comp.seriesName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.levelName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || comp.statusInMilestone === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'series':
          return a.seriesName.localeCompare(b.seriesName)
        case 'level':
          return a.levelName.localeCompare(b.levelName)
        case 'participated':
          return new Date(b.participatedAt).getTime() - new Date(a.participatedAt).getTime()
        case 'deadline':
          if (!a.dueDateMilestone && !b.dueDateMilestone) return 0
          if (!a.dueDateMilestone) return 1
          if (!b.dueDateMilestone) return -1
          return new Date(a.dueDateMilestone).getTime() - new Date(b.dueDateMilestone).getTime()
        default:
          return 0
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
          <Button onClick={() => setAddCompetitionOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            关联到新赛事
          </Button>
        </div>
      </div>

      <Separator />

      {/* 赛事列表 */}
      <div className="space-y-4">
        {filteredCompetitions.length > 0 ? (
          <AnimatePresence>
            {filteredCompetitions.map((competition, index) => (
              <motion.div
                key={`${competition.seriesId}-${competition.milestoneId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-lg p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold">{competition.seriesName}</h3>
                      <Badge variant="outline" className="text-xs">
                        {competition.levelName}
                      </Badge>
                      {competition.statusInMilestone && (
                        <Badge
                          className={cn('text-xs', getStatusColor(competition.statusInMilestone))}
                        >
                          {competition.statusInMilestone}
                        </Badge>
                      )}
                    </div>

                    {competition.seriesNotes && (
                      <p className="text-muted-foreground mb-3">{competition.seriesNotes}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">参与时间：</span>
                        <span>{new Date(competition.participatedAt).toLocaleDateString()}</span>
                      </div>

                      {competition.dueDateMilestone && (
                        <div className="flex items-center gap-2">
                          <Clock
                            className={cn(
                              'w-4 h-4',
                              isOverdue(competition.dueDateMilestone)
                                ? 'text-red-500'
                                : isDeadlineApproaching(competition.dueDateMilestone)
                                  ? 'text-yellow-500'
                                  : 'text-muted-foreground'
                            )}
                          />
                          <span className="text-muted-foreground">截止时间：</span>
                          <span
                            className={cn(
                              isOverdue(competition.dueDateMilestone)
                                ? 'text-red-600 font-medium'
                                : isDeadlineApproaching(competition.dueDateMilestone)
                                  ? 'text-yellow-600 font-medium'
                                  : ''
                            )}
                          >
                            {new Date(competition.dueDateMilestone).toLocaleDateString()}
                          </span>
                          {isOverdue(competition.dueDateMilestone) && (
                            <Badge variant="destructive" className="text-xs ml-1">
                              已逾期
                            </Badge>
                          )}
                          {isDeadlineApproaching(competition.dueDateMilestone) &&
                            !isOverdue(competition.dueDateMilestone) && (
                              <Badge
                                variant="secondary"
                                className="text-xs ml-1 bg-yellow-100 text-yellow-800"
                              >
                                即将截止
                              </Badge>
                            )}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">创建时间：</span>
                        <span>{new Date(competition.milestoneCreatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {competition.milestoneNotes && (
                      <div className="mt-3 p-3 bg-muted/20 rounded border">
                        <p className="text-sm text-muted-foreground">
                          <strong>里程碑备注：</strong> {competition.milestoneNotes}
                        </p>
                      </div>
                    )}

                    {/* 通知文件 */}
                    {competition.notificationFileName && (
                      <div className="mt-3 flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800 dark:text-blue-300">
                          通知文件：{competition.notificationOriginalFileName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          onClick={() => handleDownloadNotification(competition)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStatus(competition)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      编辑状态
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(competition)}>
                          <Eye className="w-4 h-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        {competition.notificationFileName && (
                          <DropdownMenuItem onClick={() => handleDownloadNotification(competition)}>
                            <Download className="w-4 h-4 mr-2" />
                            下载通知
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveCompetition(competition)}
                        >
                          取消关联
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">暂无参与赛事</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all' ? '没有找到匹配的赛事' : '开始关联项目到赛事'}
            </p>
            <Button onClick={() => setAddCompetitionOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              关联到新赛事
            </Button>
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

      <EditCompetitionStatusDialog
        projectId={projectDetails.project.id}
        competitionMilestoneId={selectedCompetition?.milestoneId || ''}
        currentStatus={selectedCompetition?.statusInMilestone || null}
        competitionName={selectedCompetition?.seriesName || ''}
        levelName={selectedCompetition?.levelName || ''}
        open={editStatusOpen}
        onOpenChange={setEditStatusOpen}
        onSuccess={handleSuccess}
      />

      <CompetitionDetailsDialog
        competition={selectedCompetition}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <RemoveCompetitionDialog
        projectId={projectDetails.project.id}
        competition={
          selectedCompetition
            ? {
                milestoneId: selectedCompetition.milestoneId,
                seriesName: selectedCompetition.seriesName,
                levelName: selectedCompetition.levelName,
                statusInMilestone: selectedCompetition.statusInMilestone
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

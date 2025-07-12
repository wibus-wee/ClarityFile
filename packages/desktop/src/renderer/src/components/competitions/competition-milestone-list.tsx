import { useState, useMemo } from 'react'
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
  Target,
  Calendar,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Clock,
  ArrowLeft,
  Trophy
} from 'lucide-react'
import { useGetCompetitionMilestones } from '@renderer/hooks/use-tipc'
import { format, differenceInDays, isBefore, startOfDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'

import { CompetitionMilestoneDrawer } from './drawers/competition-milestone-drawer'
import { DeleteCompetitionMilestoneDialog } from './dialogs/delete-competition-milestone-dialog'
import { MilestoneDetailsDialog } from './dialogs/milestone-details-dialog'
import {
  CompetitionSeriesWithStatsOutput,
  CompetitionMilestoneOutput
} from '@main/types/competition-schemas'

interface CompetitionMilestoneListProps {
  series: CompetitionSeriesWithStatsOutput
  onBack: () => void
  onCreateMilestone: () => void
}

interface MilestoneCardProps {
  milestone: CompetitionMilestoneOutput
  onEdit: (milestone: CompetitionMilestoneOutput) => void
  onDelete: (milestone: CompetitionMilestoneOutput) => void
  onViewDetails: (milestone: CompetitionMilestoneOutput) => void
}

function MilestoneCard({ milestone, onEdit, onDelete, onViewDetails }: MilestoneCardProps) {
  const now = new Date()
  const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null
  const daysUntilDue = dueDate ? differenceInDays(dueDate, now) : null

  // 确定状态
  const getStatus = () => {
    if (!dueDate)
      return { label: '无截止日期', variant: 'secondary' as const, color: 'text-muted-foreground' }

    const today = startOfDay(now)
    const due = startOfDay(dueDate)

    if (isBefore(due, today)) {
      return { label: '已过期', variant: 'destructive' as const, color: 'text-destructive' }
    } else if (due.getTime() === today.getTime()) {
      return { label: '今天截止', variant: 'default' as const, color: 'text-primary' }
    } else if (daysUntilDue && daysUntilDue <= 3) {
      return { label: '紧急', variant: 'destructive' as const, color: 'text-destructive' }
    } else if (daysUntilDue && daysUntilDue <= 7) {
      return { label: '即将到来', variant: 'secondary' as const, color: 'text-orange-600' }
    } else {
      return { label: '进行中', variant: 'secondary' as const, color: 'text-muted-foreground' }
    }
  }

  const status = getStatus()
  const projectCount = milestone.participatingProjectsCount || 0

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
      onClick={() => onViewDetails(milestone)}
    >
      {/* 左侧：图标和内容 */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Target className="h-4 w-4 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">{milestone.levelName}</h3>
            <Badge variant={status.variant} className="text-xs shrink-0">
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                创建于 {format(new Date(milestone.createdAt), 'MM月dd日', { locale: zhCN })}
              </span>
            </div>

            {dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>截止：{format(dueDate, 'MM月dd日', { locale: zhCN })}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{projectCount} 个项目参与</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2 shrink-0">
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
                onEdit(milestone)
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              编辑里程碑
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDelete(milestone)
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除里程碑
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}

export function CompetitionMilestoneList({
  series,
  onBack,
  onCreateMilestone
}: CompetitionMilestoneListProps) {
  const { data: milestones, isLoading } = useGetCompetitionMilestones(series.id)
  const [editingMilestone, setEditingMilestone] = useState<CompetitionMilestoneOutput | null>(null)
  const [deletingMilestone, setDeletingMilestone] = useState<CompetitionMilestoneOutput | null>(
    null
  )
  const [selectedMilestone, setSelectedMilestone] = useState<CompetitionMilestoneOutput | null>(
    null
  )
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // 排序里程碑（按截止日期排序）
  const sortedMilestones = useMemo(() => {
    if (!milestones) return []

    return [...milestones].sort((a, b) => {
      // 有截止日期的排在前面
      if (a.dueDate && !b.dueDate) return -1
      if (!a.dueDate && b.dueDate) return 1

      // 都有截止日期，按日期排序
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }

      // 都没有截止日期，按创建时间排序
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [milestones])

  const handleEdit = (milestone: CompetitionMilestoneOutput) => {
    setEditingMilestone(milestone)
    setEditDialogOpen(true)
  }

  const handleDelete = (milestone: CompetitionMilestoneOutput) => {
    setDeletingMilestone(milestone)
    setDeleteDialogOpen(true)
  }

  const handleViewDetails = (milestone: CompetitionMilestoneOutput) => {
    setSelectedMilestone(milestone)
    setDetailsDialogOpen(true)
  }

  const handleSuccess = () => {
    // SWR 会自动重新验证数据
    setEditDialogOpen(false)
    setDeleteDialogOpen(false)
    setDetailsDialogOpen(false)
    setEditingMilestone(null)
    setDeletingMilestone(null)
    setSelectedMilestone(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* 头部骨架 */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted/50 rounded animate-pulse" />
        </div>

        {/* 里程碑骨架 */}
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{series.name}</h1>
              <p className="text-muted-foreground">{sortedMilestones.length} 个里程碑</p>
            </div>
          </div>
        </div>

        <Button onClick={onCreateMilestone} className="gap-2">
          <Plus className="h-4 w-4" />
          添加里程碑
        </Button>
      </div>

      {/* 里程碑列表 */}
      {sortedMilestones.length > 0 ? (
        <motion.div layout className="divide-y divide-border/50">
          <AnimatePresence>
            {sortedMilestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">暂无里程碑</h3>
          <p className="text-muted-foreground mb-6">为这个赛事系列添加第一个里程碑</p>
          <Button onClick={onCreateMilestone} className="gap-2">
            <Plus className="h-4 w-4" />
            添加里程碑
          </Button>
        </motion.div>
      )}

      {/* 抽屉组件 */}
      <CompetitionMilestoneDrawer
        milestone={editingMilestone}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
      />

      <DeleteCompetitionMilestoneDialog
        milestone={deletingMilestone}
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleSuccess}
      />

      <MilestoneDetailsDialog
        milestone={selectedMilestone}
        isOpen={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onEdit={() => {
          if (selectedMilestone) {
            setDetailsDialogOpen(false)
            handleEdit(selectedMilestone)
          }
        }}
      />
    </div>
  )
}

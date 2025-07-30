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
import { Target, Calendar, Users, MoreHorizontal, Edit, Trash2, Plus, Clock } from 'lucide-react'
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

interface EmbeddedMilestoneListProps {
  series: CompetitionSeriesWithStatsOutput
  isExpanded: boolean
  onCreateMilestone: (seriesId: string) => void
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
  const isOverdue = dueDate && isBefore(dueDate, startOfDay(now))
  const daysUntilDue = dueDate ? differenceInDays(dueDate, now) : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group flex items-center justify-between p-3 bg-background rounded border hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => onViewDetails(milestone)}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <Target className="h-3 w-3 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{milestone.levelName}</h4>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                已逾期
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(dueDate, 'MM月dd日', { locale: zhCN })}
                  {daysUntilDue !== null && daysUntilDue >= 0 && (
                    <span className="ml-1">({daysUntilDue}天后)</span>
                  )}
                </span>
              </div>
            )}

            {milestone.participatingProjectsCount && milestone.participatingProjectsCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{milestone.participatingProjectsCount} 个项目参与</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(milestone.createdAt), 'MM月dd日创建', { locale: zhCN })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(milestone)}>
              <Edit className="h-4 w-4 mr-2" />
              编辑里程碑
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(milestone)}
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

export function EmbeddedMilestoneList({
  series,
  isExpanded,
  onCreateMilestone
}: EmbeddedMilestoneListProps) {
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

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.04, 0.62, 0.23, 0.98]
          }}
          className="border-t border-border bg-muted/20 overflow-hidden"
        >
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 space-y-3"
            >
              <div className="h-4 bg-muted/50 rounded animate-pulse w-32" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
                ))}
              </div>
            </motion.div>
          ) : sortedMilestones.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: 0.1,
                ease: [0.04, 0.62, 0.23, 0.98]
              }}
              className="p-4 space-y-3"
            >
              <h4 className="text-sm font-medium text-muted-foreground">
                里程碑 ({sortedMilestones.length})
              </h4>
              <div className="space-y-2">
                <AnimatePresence>
                  {sortedMilestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.25,
                        ease: [0.04, 0.62, 0.23, 0.98]
                      }}
                    >
                      <MilestoneCard
                        milestone={milestone}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewDetails={handleViewDetails}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: 0.1,
                ease: [0.04, 0.62, 0.23, 0.98]
              }}
              className="p-4 text-center text-muted-foreground"
            >
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无里程碑</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => onCreateMilestone(series.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                添加第一个里程碑
              </Button>
            </motion.div>
          )}

          {/* Dialog 组件 */}
          <CompetitionMilestoneDrawer
            selectedSeriesId={series.id}
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
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

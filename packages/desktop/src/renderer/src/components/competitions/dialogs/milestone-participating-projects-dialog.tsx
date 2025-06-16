import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Users, Calendar, ExternalLink, Loader2, FolderOpen, Clock } from 'lucide-react'
import { useMilestoneParticipatingProjects } from '@renderer/hooks/use-tipc'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useNavigate } from '@tanstack/react-router'
import type {
  MilestoneWithProjectsOutput,
  CompetitionMilestoneOutput
} from '@main/types/competition-schemas'

interface MilestoneParticipatingProjectsDialogProps {
  milestone: MilestoneWithProjectsOutput | CompetitionMilestoneOutput | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MilestoneParticipatingProjectsDialog({
  milestone,
  isOpen,
  onOpenChange
}: MilestoneParticipatingProjectsDialogProps) {
  const navigate = useNavigate()
  const { data: projects, isLoading } = useMilestoneParticipatingProjects(milestone?.id || null)

  const handleViewProject = (projectId: string) => {
    onOpenChange(false)
    navigate({ to: '/projects/$projectId', params: { projectId } })
  }

  if (!milestone) return null

  // 判断是否为 MilestoneWithProjectsOutput 类型
  const isMilestoneWithProjects = 'seriesName' in milestone
  const seriesName = isMilestoneWithProjects ? milestone.seriesName : '未知赛事系列'

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>参与项目</DialogTitle>
              <DialogDescription>
                {milestone.levelName} - {seriesName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">加载参与项目...</span>
            </div>
          ) : projects && projects.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {projects.map((project, index) => (
                <motion.div
                  key={project.projectId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-lg border bg-background/50 backdrop-blur-sm p-4 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-200"
                >
                  {/* 项目信息 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{project.projectName}</h3>
                      {project.projectDescription && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.projectDescription}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProject(project.projectId)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      查看项目
                    </Button>
                  </div>

                  {/* 状态和时间信息 */}
                  <div className="flex items-center gap-4 text-sm">
                    {project.statusInMilestone && (
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {project.statusInMilestone}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        参与于{' '}
                        {format(new Date(project.participatedAt), 'yyyy年MM月dd日', {
                          locale: zhCN
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        创建于{' '}
                        {format(new Date(project.projectCreatedAt), 'yyyy年MM月dd日', {
                          locale: zhCN
                        })}
                      </span>
                    </div>
                  </div>

                  {/* 快速操作 */}
                  <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProject(project.projectId)}
                      className="gap-2"
                    >
                      <FolderOpen className="h-4 w-4" />
                      查看详情
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">暂无参与项目</h3>
              <p className="text-muted-foreground">还没有项目参与这个里程碑</p>
            </motion.div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {projects ? `共 ${projects.length} 个项目` : ''}
          </div>

          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

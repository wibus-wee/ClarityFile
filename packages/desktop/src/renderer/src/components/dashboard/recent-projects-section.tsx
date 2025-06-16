import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { FolderOpen, ArrowRight, Calendar, MoreHorizontal, ExternalLink } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useProjects } from '@renderer/hooks/use-tipc'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const statusConfig = {
  active: {
    label: '活跃',
    color:
      'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'
  },
  on_hold: {
    label: '暂停',
    color:
      'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50'
  },
  archived: {
    label: '已归档',
    color: 'bg-muted/50 text-muted-foreground border-border'
  }
}

export function RecentProjectsSection() {
  const { data: projects, isLoading, error } = useProjects()

  // 获取最近的5个项目
  const recentProjects = projects?.slice(0, 5) || []

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">最近项目</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">最近项目</h2>
        <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
          <p className="text-sm text-destructive">加载项目失败</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">最近项目</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/projects">
            查看全部
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      {recentProjects.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">还没有项目</p>
          <Button asChild>
            <Link to="/projects">创建第一个项目</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentProjects.map((project, index) => {
            const status =
              statusConfig[project.status as keyof typeof statusConfig] || statusConfig.active

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary/30 hover:bg-accent/50 transition-all duration-200">
                  {/* 项目图标 */}
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>

                  {/* 项目信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{project.name}</h3>
                      <Badge variant="outline" className={`text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>

                    {project.description && (
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(project.updatedAt), {
                          addSuffix: true,
                          locale: zhCN
                        })}
                      </span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

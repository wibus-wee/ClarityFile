import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import { FolderOpen, ArrowRight, Calendar, MoreHorizontal, ExternalLink, Eye } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useProjects, useOpenFileWithSystem } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { formatRelativeTime } from '@renderer/lib/i18n-formatters'
import { SafeImage } from '@renderer/components/ui/safe-image'
import { useTranslation } from 'react-i18next'

export function RecentProjectsSection() {
  const { data: projects, isLoading, error } = useProjects()
  const { trigger: openFileWithSystem } = useOpenFileWithSystem()
  const { t } = useTranslation('dashboard')

  const statusConfig = {
    active: {
      label: t('recentProjects.status.active'),
      color:
        'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'
    },
    on_hold: {
      label: t('recentProjects.status.on_hold'),
      color:
        'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50'
    },
    archived: {
      label: t('recentProjects.status.archived'),
      color: 'bg-muted/50 text-muted-foreground border-border'
    }
  }

  // 获取最近的5个项目
  const recentProjects = projects?.slice(0, 5) || []

  // 处理打开项目文件夹
  const handleOpenProjectFolder = async (project: any) => {
    if (!project.folderPath) {
      toast.error(t('recentProjects.errors.folderNotExists'))
      return
    }

    try {
      await openFileWithSystem({ filePath: project.folderPath })
    } catch (error) {
      console.error('打开项目文件夹失败:', error)
      toast.error(
        `${t('recentProjects.errors.openFolderFailed')} ${error instanceof Error ? error.message : t('recentProjects.errors.unknownError')}`
      )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('recentProjects.loading')}</h2>
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
        <h2 className="text-xl font-semibold">{t('recentProjects.title')}</h2>
        <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
          <p className="text-sm text-destructive">{t('recentProjects.loadError')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('recentProjects.title')}</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/projects">
            {t('recentProjects.viewAll')}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      {recentProjects.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">{t('recentProjects.empty.title')}</p>
          <Button asChild>
            <Link to="/projects">{t('recentProjects.empty.action')}</Link>
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
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: project.id }}
                  className="block"
                >
                  <div className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary/30 hover:bg-accent/50 transition-all duration-200 cursor-pointer">
                    {/* 项目图标 */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${
                        project.coverAsset && project.coverAsset.mimeType?.startsWith('image/')
                          ? ''
                          : 'bg-gradient-to-br from-primary/20 to-primary/10'
                      }`}
                    >
                      {project.coverAsset && project.coverAsset.mimeType?.startsWith('image/') ? (
                        <SafeImage
                          filePath={project.coverAsset.physicalPath}
                          alt={project.name}
                          className="w-full h-full object-cover rounded-lg"
                          fallbackClassName="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg"
                        />
                      ) : (
                        <FolderOpen className="w-5 h-5 text-primary" />
                      )}
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
                        <span>{formatRelativeTime(project.updatedAt.toISOString())}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleOpenProjectFolder(project)
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                              <Eye className="w-4 h-4 mr-2" />
                              {t('recentProjects.actions.viewDetails')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenProjectFolder(project)
                            }}
                          >
                            <FolderOpen className="w-4 h-4 mr-2" />
                            {t('recentProjects.actions.openFolder')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

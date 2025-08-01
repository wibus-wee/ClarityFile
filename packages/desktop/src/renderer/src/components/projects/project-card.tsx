import { Button } from '@clarity/shadcn/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import {
  Calendar,
  Edit,
  FolderOpen,
  MoreHorizontal,
  Trash2,
  Archive,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { Project } from './index'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { SafeImage } from '@renderer/components/ui/safe-image'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
  isDeleting: boolean
  isUpdating: boolean
  viewMode: 'list'
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onStatusChange,
  isDeleting,
  isUpdating
}: ProjectCardProps) {
  console.log(project)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '活跃'
      case 'archived':
        return '已归档'
      case 'on_hold':
        return '暂停'
      default:
        return status
    }
  }

  return (
    <motion.div
      layoutId={`project-${project.id}`}
      className="group flex items-center justify-between py-3 px-4 border-b border-border/50 hover:bg-muted/30 transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        layout: { duration: 0.4 }
      }}
    >
      <Link
        to="/projects/$projectId"
        params={{ projectId: project.id }}
        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
      >
        <motion.div
          layoutId={`project-icon-${project.id}`}
          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 overflow-hidden ${
            project.coverAsset && project.coverAsset.mimeType?.startsWith('image/')
              ? ''
              : 'bg-gradient-to-br from-primary/20 to-primary/10'
          }`}
          transition={{ duration: 0.4 }}
        >
          {project.coverAsset && project.coverAsset.mimeType?.startsWith('image/') ? (
            <SafeImage
              filePath={project.coverAsset.physicalPath}
              alt={project.name}
              className="w-full h-full object-cover rounded-md"
              fallbackClassName="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 rounded-md"
            />
          ) : (
            <FolderOpen className="w-4 h-4 text-primary" />
          )}
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <motion.h3
              layoutId={`project-title-${project.id}`}
              className="font-medium text-sm truncate"
              transition={{ duration: 0.4 }}
            >
              {project.name}
            </motion.h3>
            <motion.span
              layoutId={`project-status-${project.id}`}
              className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium shrink-0',
                getStatusColor(project.status)
              )}
              transition={{ duration: 0.4 }}
            >
              {getStatusText(project.status)}
            </motion.span>
          </div>
          {project.description && (
            <motion.p
              layoutId={`project-description-${project.id}`}
              className="text-xs text-muted-foreground line-clamp-1 mb-1"
              transition={{ duration: 0.4 }}
            >
              {project.description}
            </motion.p>
          )}
          <motion.div
            layoutId={`project-date-${project.id}`}
            className="flex items-center gap-1 text-xs text-muted-foreground"
            transition={{ duration: 0.4 }}
          >
            <Calendar className="w-3 h-3" />
            {new Date(project.createdAt).toLocaleDateString()}
          </motion.div>
        </div>
      </Link>

      <motion.div layoutId={`project-actions-${project.id}`} transition={{ duration: 0.4 }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Edit className="w-4 h-4 mr-2" />
              编辑项目
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* 状态切换选项 */}
            {project.status !== 'active' && (
              <DropdownMenuItem
                onClick={() => onStatusChange(project.id, 'active')}
                disabled={isUpdating}
              >
                <Play className="w-4 h-4 mr-2" />
                激活项目
              </DropdownMenuItem>
            )}

            {project.status !== 'on_hold' && (
              <DropdownMenuItem
                onClick={() => onStatusChange(project.id, 'on_hold')}
                disabled={isUpdating}
              >
                <Pause className="w-4 h-4 mr-2" />
                暂停项目
              </DropdownMenuItem>
            )}

            {project.status !== 'archived' && (
              <DropdownMenuItem
                onClick={() => onStatusChange(project.id, 'archived')}
                disabled={isUpdating}
              >
                <Archive className="w-4 h-4 mr-2" />
                归档项目
              </DropdownMenuItem>
            )}

            {project.status === 'archived' && (
              <DropdownMenuItem
                onClick={() => onStatusChange(project.id, 'active')}
                disabled={isUpdating}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                取消归档
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(project.id)}
              disabled={isDeleting || isUpdating}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              删除项目
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </motion.div>
  )
}

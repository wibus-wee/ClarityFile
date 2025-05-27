import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { MoreHorizontal, Edit, Trash2, Eye, Clock, Tag, FolderOpen, Calendar } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { cn } from '@renderer/lib/utils'
import { motion } from 'framer-motion'

interface DocumentCardProps {
  document: {
    id: string
    name: string
    type: string
    description?: string
    status: string
    createdAt: string
    updatedAt: string
    projectId: string
    // 可能包含的项目信息
    project?: {
      name: string
      color?: string
    }
    // 版本统计信息
    versionCount?: number
    currentVersion?: string
  }
  viewMode: 'grid' | 'list'
  onUpdate: () => void
}

export function DocumentCard({ document, viewMode }: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  const getTypeIcon = (type: string) => {
    // 根据文档类型返回不同的图标
    switch (type.toLowerCase()) {
      case 'ppt':
      case 'presentation':
        return '📊'
      case '商业计划书':
      case 'business-plan':
        return '📋'
      case '项目说明书':
      case 'project-description':
        return '📄'
      case '技术文档':
      case 'technical-doc':
        return '🔧'
      default:
        return '📄'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '活跃'
      case 'archived':
        return '已归档'
      case 'draft':
        return '草稿'
      default:
        return status
    }
  }

  const handleView = () => {
    navigate({
      to: '/documents/$documentId',
      params: { documentId: document.id },
      viewTransition: true
    })
  }

  const handleEdit = () => {
    // 编辑文档
    console.log('编辑文档:', document.id)
  }

  const handleDelete = () => {
    // 删除文档
    console.log('删除文档:', document.id)
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all duration-200 bg-background"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 文档图标和类型 */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <span className="text-lg">{getTypeIcon(document.type)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium truncate">{document.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {document.description || '暂无描述'}
            </p>
          </div>
        </div>

        {/* 项目信息 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FolderOpen className="w-4 h-4" />
          <span>{document.project?.name || '未知项目'}</span>
        </div>

        {/* 类型标签 */}
        <Badge variant="outline" className="whitespace-nowrap">
          {document.type}
        </Badge>

        {/* 状态 */}
        <Badge className={cn('whitespace-nowrap', getStatusColor(document.status))}>
          {getStatusText(document.status)}
        </Badge>

        {/* 版本信息 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{document.versionCount || 0} 个版本</span>
        </div>

        {/* 更新时间 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
        </div>

        {/* 操作菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleView}>
              <Eye className="w-4 h-4 mr-2" />
              查看详情
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="group relative border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-background cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleView}
    >
      {/* 状态标签 */}
      <div className="absolute top-3 right-3">
        <Badge className={cn('text-xs', getStatusColor(document.status))}>
          {getStatusText(document.status)}
        </Badge>
      </div>

      {/* 文档图标和基本信息 */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <span className="text-2xl">{getTypeIcon(document.type)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm line-clamp-2 mb-1">{document.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {document.description || '暂无描述'}
          </p>
        </div>
      </div>

      {/* 项目和类型信息 */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FolderOpen className="w-3 h-3" />
          <span className="truncate">{document.project?.name || '未知项目'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Tag className="w-3 h-3" />
          <span>{document.type}</span>
        </div>
      </div>

      {/* 版本和时间信息 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{document.versionCount || 0} 个版本</span>
        </div>
        <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
      </div>

      {/* 操作按钮 */}
      <div
        className={cn(
          'flex items-center gap-2 transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
          查看详情
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleEdit()
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}

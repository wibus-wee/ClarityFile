import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { FileText, ArrowRight, Calendar, MoreHorizontal, ExternalLink, File } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useManagedFiles } from '@renderer/hooks/use-tipc'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 文件类型图标映射
const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'pdf':
      return { icon: FileText, color: 'text-red-600 dark:text-red-400' }
    case 'doc':
    case 'docx':
      return { icon: FileText, color: 'text-blue-600 dark:text-blue-400' }
    case 'ppt':
    case 'pptx':
      return { icon: FileText, color: 'text-orange-600 dark:text-orange-400' }
    case 'xls':
    case 'xlsx':
      return { icon: FileText, color: 'text-green-600 dark:text-green-400' }
    default:
      return { icon: File, color: 'text-muted-foreground' }
  }
}

export function RecentDocumentsSection() {
  const { data: files, isLoading, error } = useManagedFiles(5, 0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">最近文档</h2>
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
        <h2 className="text-xl font-semibold">最近文档</h2>
        <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
          <p className="text-sm text-destructive">加载文档失败</p>
        </div>
      </div>
    )
  }

  const recentFiles = files || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">最近文档</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/files">
            查看全部
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      {recentFiles.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">还没有文档</p>
          <Button asChild>
            <Link to="/files">添加第一个文档</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentFiles.map((file, index) => {
            const fileIcon = getFileIcon(file.name)
            const FileIcon = fileIcon.icon

            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary/30 hover:bg-accent/50 transition-all duration-200">
                  {/* 文件图标 */}
                  <div className="p-2 bg-accent/50 rounded-lg">
                    <FileIcon className={`w-5 h-5 ${fileIcon.color}`} />
                  </div>

                  {/* 文件信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{file.name}</h3>
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50"
                      >
                        文档
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {file.physicalPath}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(file.updatedAt), {
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

import { motion } from 'framer-motion'
import { Files, HardDrive, Image, FileText, Video, Music, Archive, TrendingUp } from 'lucide-react'
import { Badge } from '@clarity/shadcn/ui/badge'
import { cn } from '@renderer/lib/utils'

interface FileStatsOverviewProps {
  stats: {
    totalFiles: number
    totalSize: number
    fileTypeDistribution: { type: string; count: number; size: number }[]
    projectDistribution: { projectId: string; projectName: string; count: number; size: number }[]
    recentFiles: any[]
  }
}

export function FileStatsOverview({ stats }: FileStatsOverviewProps) {
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'image':
        return Image
      case 'text':
      case 'application':
        return FileText
      case 'video':
        return Video
      case 'audio':
        return Music
      default:
        return Archive
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'image':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'text':
      case 'application':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'video':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'audio':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // 计算最大的文件类型用于进度条
  const maxTypeCount = Math.max(...stats.fileTypeDistribution.map((item) => item.count))

  return (
    <div className="space-y-4">
      {/* 总体统计 */}
      <div className="flex items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-2"
        >
          <Files className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium">{stats.totalFiles.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">总文件数</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-2"
        >
          <HardDrive className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium">{formatFileSize(stats.totalSize)}</p>
            <p className="text-xs text-muted-foreground">总存储空间</p>
          </div>
        </motion.div>

        {stats.recentFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-2"
          >
            <TrendingUp className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{stats.recentFiles.length}</p>
              <p className="text-xs text-muted-foreground">最近文件</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* 文件类型分布 */}
      {stats.fileTypeDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background border border-border rounded-lg p-4"
        >
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Archive className="w-4 h-4" />
            文件类型分布
          </h3>
          <div className="space-y-2">
            {stats.fileTypeDistribution.slice(0, 5).map((item, index) => {
              const TypeIcon = getTypeIcon(item.type)
              const percentage = maxTypeCount > 0 ? (item.count / maxTypeCount) * 100 : 0

              return (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <TypeIcon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium capitalize truncate">{item.type}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className={cn(
                          'h-full rounded-full',
                          getTypeColor(item.type).includes('green') && 'bg-green-500',
                          getTypeColor(item.type).includes('orange') && 'bg-orange-500',
                          getTypeColor(item.type).includes('purple') && 'bg-purple-500',
                          getTypeColor(item.type).includes('blue') && 'bg-blue-500',
                          getTypeColor(item.type).includes('gray') && 'bg-gray-500'
                        )}
                      />
                    </div>

                    <Badge variant="secondary" className="text-xs min-w-fit">
                      {item.count}
                    </Badge>

                    <span className="text-xs text-muted-foreground min-w-fit">
                      {formatFileSize(item.size)}
                    </span>
                  </div>
                </motion.div>
              )
            })}

            {stats.fileTypeDistribution.length > 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-xs text-muted-foreground text-center pt-2"
              >
                还有 {stats.fileTypeDistribution.length - 5} 种文件类型...
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

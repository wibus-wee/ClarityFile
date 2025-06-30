import { motion } from 'framer-motion'
import { Files, HardDrive, TrendingUp } from 'lucide-react'

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
    </div>
  )
}

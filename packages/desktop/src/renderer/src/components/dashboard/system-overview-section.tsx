import { FolderOpen, FileText, Activity, Database, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProjects, useFileSystemStats, useSystemInfo } from '@renderer/hooks/use-tipc'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 border border-border rounded-lg bg-card hover:bg-accent/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{title}</div>
      </div>
    </motion.div>
  )
}

export function SystemOverviewSection() {
  const { data: projects } = useProjects()
  const { data: fileStats } = useFileSystemStats()

  // 计算统计数据
  const fileCount = fileStats?.totalFiles || 0
  const activeProjects = projects?.filter((p) => p.status === 'active').length || 0

  const stats = [
    // {
    //   title: '总项目数',
    //   value: projectCount,
    //   icon: FolderOpen,
    //   color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
    // },
    {
      title: '活跃项目',
      value: activeProjects,
      icon: Activity,
      color: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
    },
    {
      title: '管理文件',
      value: fileCount,
      icon: FileText,
      color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
    }
    // {
    //   title: '逻辑文档',
    //   value: documentCount,
    //   icon: BookOpen,
    //   color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
    // }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">系统概览</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* 系统状态 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="p-4 border border-border rounded-lg bg-card"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">系统状态</span>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>数据库连接</span>
            <span className="text-green-600 dark:text-green-400">正常</span>
          </div>
          <div className="flex justify-between">
            <span>文件系统</span>
            <span className="text-green-600 dark:text-green-400">正常</span>
          </div>
          <div className="flex justify-between">
            <span>最后同步</span>
            <span>刚刚</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

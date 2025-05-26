import { FolderOpen, FileText, HardDrive, TrendingUp, Activity, Database } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProjects, useManagedFiles } from '@renderer/hooks/use-tipc'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 border border-border rounded-lg bg-card hover:bg-accent/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs ${
              trend.isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            <TrendingUp className={`w-3 h-3 ${trend.isPositive ? '' : 'rotate-180'}`} />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
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
  const { data: filesData } = useManagedFiles(1000, 0) // 获取更多文件用于统计

  // 计算统计数据
  const projectCount = projects?.length || 0
  const fileCount = filesData?.length || 0
  const activeProjects = projects?.filter((p) => p.status === 'active').length || 0

  // 模拟存储使用情况（实际应该从系统信息获取）
  const storageUsed = 25 // 模拟数据
  const storageTotal = 100 // 模拟数据
  const storagePercentage = Math.round((storageUsed / storageTotal) * 100)

  const stats = [
    {
      title: '总项目数',
      value: projectCount,
      icon: FolderOpen,
      color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      trend: { value: 12, isPositive: true }
    },
    {
      title: '活跃项目',
      value: activeProjects,
      icon: Activity,
      color: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
      trend: { value: 8, isPositive: true }
    },
    {
      title: '管理文件',
      value: fileCount,
      icon: FileText,
      color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
      trend: { value: 15, isPositive: true }
    },
    {
      title: '存储使用',
      value: `${storagePercentage}%`,
      icon: HardDrive,
      color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
    }
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

      {/* 存储详情 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="p-4 border border-border rounded-lg bg-card"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">存储空间</span>
          <span className="text-xs text-muted-foreground">
            {storageUsed}GB / {storageTotal}GB
          </span>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${storagePercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-2 rounded-full ${
              storagePercentage > 80
                ? 'bg-red-500'
                : storagePercentage > 60
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>可用空间</span>
          <span>{storageTotal - storageUsed}GB</span>
        </div>
      </motion.div>

      {/* 系统状态 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
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

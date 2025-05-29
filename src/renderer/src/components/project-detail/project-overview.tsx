import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Badge } from '@renderer/components/ui/badge'
import { FileText, Image, Trophy, Share2, CreditCard, Calendar, FolderOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProjectDocuments, useSystemInfo } from '@renderer/hooks/use-tipc'

interface ProjectOverviewProps {
  project: {
    id: string
    name: string
    description?: string | null
    status: string
    createdAt: Date
    updatedAt: Date
    folderPath?: string | null
  }
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const { data: documents } = useProjectDocuments(project.id)
  const { data: systemInfo } = useSystemInfo()

  const stats = [
    {
      title: '逻辑文档',
      value: documents?.length || 0,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: '项目资产',
      value: 0, // TODO: 实现项目资产API后更新
      icon: Image,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: '参与赛事',
      value: 0, // TODO: 实现项目赛事API后更新
      icon: Trophy,
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: '关联资源',
      value: 0, // TODO: 实现项目共享资源API后更新
      icon: Share2,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: '经费记录',
      value: 0, // TODO: 实现项目经费API后更新
      icon: CreditCard,
      color: 'text-red-600 dark:text-red-400'
    }
  ]

  const recentActivities = [
    {
      type: 'project_created',
      title: '项目创建',
      description: `项目 "${project.name}" 已创建`,
      timestamp: project.createdAt,
      icon: FolderOpen
    },
    {
      type: 'project_updated',
      title: '项目更新',
      description: '项目信息已更新',
      timestamp: project.updatedAt,
      icon: Calendar
    }
  ]

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 项目信息 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>项目信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">项目名称</label>
                <p className="text-sm">{project.name}</p>
              </div>
              {project.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">项目描述</label>
                  <p className="text-sm">{project.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">项目状态</label>
                <div className="mt-1">
                  <Badge variant="secondary">{project.status}</Badge>
                </div>
              </div>
              {project.folderPath && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">文件夹路径</label>
                  <p className="text-sm font-mono bg-muted p-2 rounded text-xs break-all">
                    {project.folderPath}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">创建时间</label>
                  <p className="text-sm">{new Date(project.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">更新时间</label>
                  <p className="text-sm">{new Date(project.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 最近活动 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

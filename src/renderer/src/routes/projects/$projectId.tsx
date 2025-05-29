import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Edit, Settings, FolderOpen } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useProject } from '@renderer/hooks/use-tipc'
import { ProjectOverview } from '@renderer/components/project-detail/project-overview'
import { ProjectDocuments } from '@renderer/components/project-detail/project-documents'
import { ProjectAssets } from '@renderer/components/project-detail/project-assets'
import { ProjectCompetitions } from '@renderer/components/project-detail/project-competitions'
import { ProjectSharedResources } from '@renderer/components/project-detail/project-shared-resources'
import { ProjectExpenses } from '@renderer/components/project-detail/project-expenses'
import { ProjectSettings } from '@renderer/components/project-detail/project-settings'

export const Route = createFileRoute('/projects/$projectId')({
  component: ProjectDetailPage
})

function ProjectDetailPage() {
  const { projectId } = Route.useParams()
  const [activeTab, setActiveTab] = useState('overview')
  
  const { data: project, error, isLoading } = useProject(projectId)

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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="w-48 h-8 bg-muted rounded animate-pulse" />
            <div className="w-96 h-4 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="w-full h-96 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-500 mb-2">加载项目失败</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error ? '请检查网络连接或稍后重试' : '项目不存在'}
        </p>
        <Link to="/projects">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回项目列表
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* 顶部区域 */}
      <div className="space-y-6">
        {/* 导航栏 */}
        <div className="flex items-center gap-4">
          <Link to="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回项目列表
            </Button>
          </Link>
        </div>

        {/* 项目信息头部 */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <motion.div
              layoutId={`project-icon-${project.id}`}
              className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0"
              transition={{ duration: 0.4 }}
            >
              <FolderOpen className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <motion.h1
                  layoutId={`project-title-${project.id}`}
                  className="text-3xl font-bold tracking-tight"
                  transition={{ duration: 0.4 }}
                >
                  {project.name}
                </motion.h1>
                <motion.div
                  layoutId={`project-status-${project.id}`}
                  transition={{ duration: 0.4 }}
                >
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusText(project.status)}
                  </Badge>
                </motion.div>
              </div>
              {project.description && (
                <motion.p
                  layoutId={`project-description-${project.id}`}
                  className="text-muted-foreground max-w-2xl"
                  transition={{ duration: 0.4 }}
                >
                  {project.description}
                </motion.p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>创建于 {new Date(project.createdAt).toLocaleDateString()}</span>
                <span>更新于 {new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              编辑项目
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              项目设置
            </Button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="documents">文档</TabsTrigger>
          <TabsTrigger value="assets">资产</TabsTrigger>
          <TabsTrigger value="competitions">参与赛事</TabsTrigger>
          <TabsTrigger value="shared-resources">关联资源</TabsTrigger>
          <TabsTrigger value="expenses">经费</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectOverview project={project} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <ProjectDocuments projectId={project.id} />
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <ProjectAssets projectId={project.id} />
        </TabsContent>

        <TabsContent value="competitions" className="space-y-6">
          <ProjectCompetitions projectId={project.id} />
        </TabsContent>

        <TabsContent value="shared-resources" className="space-y-6">
          <ProjectSharedResources projectId={project.id} />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <ProjectExpenses projectId={project.id} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <ProjectSettings project={project} />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

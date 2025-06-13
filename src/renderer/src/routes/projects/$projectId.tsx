import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectDetails } from '@renderer/hooks/use-tipc'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import {
  Edit,
  Settings,
  FileText,
  Image,
  Trophy,
  Share2,
  DollarSign,
  PieChart,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { ProjectStatistics } from '@renderer/components/project-details/project-statistics'
import { DocumentsTab } from '@renderer/components/project-details/documents-tab'
import { AssetsTab } from '@renderer/components/project-details/assets-tab'
import { CompetitionsTab } from '@renderer/components/project-details/competitions-tab'
import { SharedResourcesTab } from '@renderer/components/project-details/shared-resources-tab'
import { ExpensesTab } from '@renderer/components/project-details/expenses-tab'
import { BudgetPoolsTab } from '@renderer/components/project-details/budget-pools-tab'
import { SettingsTab } from '@renderer/components/project-details/settings-tab'
import { InlineNotFound } from '@renderer/components/not-found'

// Tab类型定义
type TabId =
  | 'documents'
  | 'assets'
  | 'competitions'
  | 'shared-resources'
  | 'expenses'
  | 'budget-pools'
  | 'settings'

interface Tab {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// Tab配置
const tabs: Tab[] = [
  { id: 'documents', label: '文档', icon: FileText },
  { id: 'assets', label: '资产', icon: Image },
  { id: 'competitions', label: '参与赛事', icon: Trophy },
  { id: 'shared-resources', label: '关联资源', icon: Share2 },
  { id: 'expenses', label: '经费记录', icon: DollarSign },
  { id: 'budget-pools', label: '经费池', icon: PieChart },
  { id: 'settings', label: '设置', icon: Settings }
]

// 状态颜色映射
function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'archived':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'active':
      return '进行中'
    case 'archived':
      return '已归档'
    case 'on_hold':
      return '暂停'
    default:
      return status
  }
}

export const Route = createFileRoute('/projects/$projectId')({
  component: ProjectDetailsPage
})

function ProjectDetailsPage() {
  const { projectId } = Route.useParams()
  const [activeTab, setActiveTab] = useState<TabId>('documents')
  const [isEditing, setIsEditing] = useState(false)

  const { data: projectDetails, isLoading, error } = useProjectDetails(projectId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (error || !projectDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">加载项目详情失败</div>
      </div>
    )
  }

  const { project } = projectDetails

  return (
    <div className="flex flex-col h-full">
      {/* 顶部导航栏 */}
      <div className="flex items-center gap-4 py-6 border-b border-border/50">
        <Link
          to="/projects"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回项目列表
        </Link>
      </div>

      {/* 项目头部信息 */}
      <div className="py-6 border-b border-border/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <Badge className={cn('text-xs', getStatusColor(project.status))}>
                {getStatusText(project.status)}
              </Badge>
            </div>
            {project.description && (
              <p className="text-muted-foreground mb-4">{project.description}</p>
            )}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>创建时间：{new Date(project.createdAt).toLocaleDateString()}</span>
              <span>更新时间：{new Date(project.updatedAt).toLocaleDateString()}</span>
              {project.folderPath && <span>项目路径：{project.folderPath}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4 mr-2" />
              编辑
            </Button>
          </div>
        </div>

        {/* 项目统计信息 */}
        <div className="mt-6">
          <ProjectStatistics projectDetails={projectDetails} />
        </div>
      </div>

      {/* Tab导航 */}
      <div className="border-b border-border/50">
        <div className="flex items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors relative',
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/5"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab内容区域 */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full pt-6"
          >
            {renderTabContent(activeTab, projectDetails)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// 渲染Tab内容的函数
function renderTabContent(tabId: TabId, projectDetails: any) {
  switch (tabId) {
    case 'documents':
      return <DocumentsTab projectDetails={projectDetails} />
    case 'assets':
      return <AssetsTab projectDetails={projectDetails} />
    case 'competitions':
      return <CompetitionsTab projectDetails={projectDetails} />
    case 'shared-resources':
      return <SharedResourcesTab projectDetails={projectDetails} />
    case 'expenses':
      return <ExpensesTab projectDetails={projectDetails} />
    case 'budget-pools':
      return <BudgetPoolsTab projectDetails={projectDetails} />
    case 'settings':
      return <SettingsTab projectDetails={projectDetails} />
    default:
      return (
        <InlineNotFound title="内容未找到" description="似乎出现了程序组件故障，代码出现问题" />
      )
  }
}

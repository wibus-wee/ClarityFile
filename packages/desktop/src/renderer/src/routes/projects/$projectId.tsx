import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectDetails } from '@renderer/hooks/use-tipc'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Edit, Settings, FileText, Image, Trophy, DollarSign, PieChart } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { ProjectStatistics } from '@renderer/components/project-details/project-statistics'
import { DocumentsTab } from '@renderer/components/project-details/documents-tab'
import { AssetsTab } from '@renderer/components/project-details/assets-tab'
import { CompetitionsTab } from '@renderer/components/project-details/competitions-tab'

import { ExpensesTab } from '@renderer/components/project-details/expenses-tab'
import { BudgetPoolsTab } from '@renderer/components/project-details/budget-pools-tab'
import { SettingsTab } from '@renderer/components/project-details/settings-tab'
import { InlineNotFound } from '@renderer/components/not-found'
import { Shortcut, ShortcutKey, ShortcutProvider } from '@renderer/components/shortcuts'
import { ProjectDrawer } from '@renderer/components/projects/project-drawer'

// Tab类型定义
type TabId = 'documents' | 'assets' | 'competitions' | 'expenses' | 'budget-pools' | 'settings'

interface Tab {
  id: TabId
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
}

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

export const Route = createFileRoute('/projects/$projectId')({
  component: ProjectDetailsPage
})

function ProjectDetailsPage() {
  const { t } = useTranslation('projects')
  const { t: tCommon } = useTranslation('common')
  const { projectId } = Route.useParams()
  const [activeTab, setActiveTab] = useState<TabId>('documents')
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)

  const { data: projectDetails, isLoading, error } = useProjectDetails(projectId)

  // Tab配置 - 移到组件内部以使用 t 函数
  const tabs: Tab[] = [
    { id: 'documents', labelKey: 'tabs.documents', icon: FileText },
    { id: 'assets', labelKey: 'tabs.assets', icon: Image },
    { id: 'competitions', labelKey: 'tabs.competitions', icon: Trophy },
    { id: 'expenses', labelKey: 'tabs.expenses', icon: DollarSign },
    { id: 'budget-pools', labelKey: 'tabs.budgetPools', icon: PieChart },
    { id: 'settings', labelKey: 'tabs.settings', icon: Settings }
  ]

  // 获取状态文本的函数
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return tCommon('states.inProgress')
      case 'archived':
        return tCommon('states.archived')
      case 'on_hold':
        return t('status.on_hold')
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{tCommon('states.loading')}</div>
      </div>
    )
  }

  if (error || !projectDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">{t('messages.loadDetailsFailed')}</div>
      </div>
    )
  }

  const { project } = projectDetails

  // 渲染Tab内容的函数
  const renderTabContent = (tabId: TabId, projectDetails: any) => {
    switch (tabId) {
      case 'documents':
        return <DocumentsTab projectDetails={projectDetails} />
      case 'assets':
        return <AssetsTab projectDetails={projectDetails} />
      case 'competitions':
        return <CompetitionsTab projectDetails={projectDetails} />
      case 'expenses':
        return <ExpensesTab projectDetails={projectDetails} />
      case 'budget-pools':
        return <BudgetPoolsTab projectDetails={projectDetails} />
      case 'settings':
        return <SettingsTab projectDetails={projectDetails} />
      default:
        return (
          <InlineNotFound
            title={tCommon('messages.contentNotFound')}
            description={tCommon('messages.componentError')}
          />
        )
    }
  }

  return (
    <ShortcutProvider scope="project-details-page">
      <div className="flex flex-col h-full">
        {/* 项目头部信息 */}
        <div className="py-6 pt-0 border-b border-border/50">
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
                <span>
                  {tCommon('fields.createdAt')}：{new Date(project.createdAt).toLocaleDateString()}
                </span>
                <span>
                  {tCommon('fields.updatedAt')}：{new Date(project.updatedAt).toLocaleDateString()}
                </span>
                {project.folderPath && (
                  <span>
                    {t('fields.folderPath')}：{project.folderPath}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shortcut shortcut={['cmd', 'e']} description={t('shortcuts.editProject')}>
                <Button variant="outline" size="sm" onClick={() => setEditDrawerOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('editProject')}
                </Button>
              </Shortcut>
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
            {tabs.map((tab, index) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <Shortcut
                  shortcut={['cmd', (index + 1).toString() as ShortcutKey]}
                  key={tab.id}
                  description={t(tab.labelKey as any)}
                >
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors relative',
                      isActive
                        ? 'text-primary border-primary'
                        : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t(tab.labelKey as any)}
                    {isActive && (
                      <motion.div
                        layoutId="activeProjectTab"
                        className="absolute inset-0 bg-primary/5"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                </Shortcut>
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
              className="min-h-[55vh] pt-6"
            >
              {renderTabContent(activeTab, projectDetails)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 项目编辑抽屉 */}
      <ProjectDrawer
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        project={project}
        onSuccess={() => {
          // 编辑成功后可以刷新数据或显示成功提示
          // 数据会通过 SWR 自动重新获取
        }}
      />
    </ShortcutProvider>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import { Plus, Search, TrendingUp, Receipt, PieChart } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { ExpenseOverview } from '@renderer/components/expenses/expense-overview'
import { ExpenseList } from '@renderer/components/expenses/expense-list'
import { BudgetPoolsList } from '@renderer/components/expenses/budget-pools-list'
import { ExpenseFormDrawer } from '@renderer/components/project-details/drawers/expense-form-drawer'

// 视图模式类型
type ViewMode = 'overview' | 'list' | 'budget-pools-list'

interface ViewTab {
  id: ViewMode
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const viewTabs: ViewTab[] = [
  {
    id: 'overview',
    label: '综合概览',
    icon: TrendingUp,
    description: '经费中心和经费池的统一概览'
  },
  {
    id: 'list',
    label: '经费列表',
    icon: Receipt,
    description: '查看和管理所有经费记录'
  },
  {
    id: 'budget-pools-list',
    label: '经费池管理',
    icon: PieChart,
    description: '查看和管理所有经费池'
  }
]

export const Route = createFileRoute('/expenses')({
  component: ExpensesPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      view: (search.view as ViewMode) || 'overview',
      projectId: search.projectId as string | undefined,
      status: search.status as string | undefined
    } as {
      view?: ViewMode
      projectId?: string
      status?: string
    }
  }
})

function ExpensesPage() {
  const { view, projectId, status } = Route.useSearch()
  const [currentView, setCurrentView] = useState<ViewMode>(view || 'overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('application')
  const [filterStatus, setFilterStatus] = useState<string>(status || 'all')

  // Drawer 状态
  const [expenseFormOpen, setExpenseFormOpen] = useState(false)

  const handleSuccess = () => {
    // SWR 会自动重新验证数据
  }

  return (
    <div className="space-y-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">经费中心</h1>
          <p className="text-muted-foreground">管理项目经费、报销记录和财务统计</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setExpenseFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            添加经费记录
          </Button>
        </div>
      </div>

      {/* 视图切换标签 */}
      <div className="border-b border-border">
        <nav className="flex space-x-8" aria-label="Tabs">
          {viewTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={cn(
                  'group relative flex items-center gap-2 py-4 px-1 text-sm font-medium transition-colors',
                  'border-b-2 border-transparent',
                  'hover:text-foreground hover:border-border',
                  currentView === tab.id
                    ? 'text-foreground border-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}

                {/* 活动指示器 */}
                {currentView === tab.id && (
                  <motion.div
                    layoutId="activeExpenseTab"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* 搜索和筛选栏 */}
      {(currentView === 'list' || currentView === 'budget-pools-list') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                currentView === 'budget-pools-list' ? '搜索经费池...' : '搜索经费记录...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              {currentView === 'budget-pools-list' ? (
                <>
                  <SelectItem value="name">名称</SelectItem>
                  <SelectItem value="budget">预算金额</SelectItem>
                  <SelectItem value="used">已使用</SelectItem>
                  <SelectItem value="remaining">剩余金额</SelectItem>
                  <SelectItem value="project">项目</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="application">申请时间</SelectItem>
                  <SelectItem value="amount">金额</SelectItem>
                  <SelectItem value="reimbursement">报销时间</SelectItem>
                  <SelectItem value="status">状态</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              {currentView === 'budget-pools-list' ? (
                <>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="high-usage">高使用率 ({'>'}80%)</SelectItem>
                  <SelectItem value="medium-usage">中使用率 (30-80%)</SelectItem>
                  <SelectItem value="low-usage">低使用率 ({'<'}30%)</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="approved">已批准</SelectItem>
                  <SelectItem value="reimbursed">已报销</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* 主要内容区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
        >
          {currentView === 'overview' && <ExpenseOverview />}
          {currentView === 'list' && (
            <ExpenseList
              searchQuery={searchQuery}
              sortBy={sortBy as 'amount' | 'application' | 'reimbursement' | 'status'}
              filterStatus={filterStatus}
              projectId={projectId}
            />
          )}
          {currentView === 'budget-pools-list' && (
            <BudgetPoolsList
              searchQuery={searchQuery}
              sortBy={sortBy as 'name' | 'budget' | 'used' | 'remaining' | 'project'}
              filterStatus={filterStatus}
              projectId={projectId}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 抽屉组件 */}
      <ExpenseFormDrawer
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        mode="create"
        projectId={projectId} // 可选的项目ID，用于预选项目
        onSuccess={handleSuccess}
      />
    </div>
  )
}

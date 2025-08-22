import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Separator } from '@clarity/shadcn/ui/separator'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import {
  Plus,
  DollarSign,
  AlertCircle,
  Edit,
  Trash2,
  PieChart,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  BarChart3,
  CheckCircle,
  Clock,
  Wallet,
  Target,
  Activity
} from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Shortcut } from '@renderer/components/shortcuts'

import type { ProjectDetailsOutput } from '@main/types/project-schemas'

import { BudgetPoolFormDrawer } from './drawers/budget-pool-form-drawer'
import { BudgetPoolDetailsDialog } from '../budget-pools/budget-pool-details-dialog'
import { DeleteBudgetPoolDialog } from './dialogs/delete-budget-pool-dialog'

// 统计卡片组件
interface BudgetStatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
  delay?: number
}

function BudgetStatCard({ title, value, icon: Icon, color, delay = 0 }: BudgetStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      className="p-4 border border-border rounded-lg bg-card hover:bg-accent/30 transition-colors"
    >
      <div className="flex items-center justify-center mb-3">
        <div className={cn('p-2 rounded-lg', color)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1 text-center">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{title}</div>
      </div>
    </motion.div>
  )
}

interface BudgetPoolsTabProps {
  projectDetails: ProjectDetailsOutput
}

export function BudgetPoolsTab({ projectDetails }: BudgetPoolsTabProps) {
  const { project, budgetOverview } = projectDetails
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'budget' | 'used' | 'remaining'>('name')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Drawer 和 Dialog 状态
  const [poolFormOpen, setPoolFormOpen] = useState(false)
  const [poolFormMode, setPoolFormMode] = useState<'create' | 'edit'>('create')
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedPool, setSelectedPool] = useState<any>(null)

  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [poolToDelete, setPoolToDelete] = useState<any>(null)

  // 处理创建操作
  const handleCreate = () => {
    setPoolFormMode('create')
    setSelectedPool(null)
    setPoolFormOpen(true)
  }

  // 处理编辑操作
  const handleEdit = (pool: any) => {
    setPoolFormMode('edit')
    setSelectedPool(pool)
    setPoolFormOpen(true)
  }

  // 处理查看详情
  const handleViewDetails = (pool: any) => {
    setSelectedPool(pool)
    setDetailsDialogOpen(true)
  }

  // 从详情页面跳转到编辑
  const handleEditFromDetails = (pool: any) => {
    setDetailsDialogOpen(false)
    setSelectedPool(pool)
    setPoolFormMode('edit')
    setPoolFormOpen(true)
  }

  // 处理成功回调
  const handleSuccess = () => {
    // SWR 会自动重新验证数据
  }

  // 处理删除操作
  const handleDelete = (pool: any) => {
    setPoolToDelete(pool)
    setDeleteDialogOpen(true)
  }

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const budgetPools = budgetOverview?.budgetPools || []
  const totalBudget = budgetOverview?.totalBudget || 0
  const usedBudget = budgetOverview?.usedBudget || 0
  const remainingBudget = budgetOverview?.remainingBudget || 0
  const utilizationRate = budgetOverview?.utilizationRate || 0

  // 过滤和排序经费池
  const filteredPools = budgetPools
    .filter((pool) => {
      const matchesSearch =
        pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.description?.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesStatus = true
      if (filterStatus === 'high-usage') {
        matchesStatus = (pool.statistics?.utilizationRate || 0) > 80
      } else if (filterStatus === 'low-usage') {
        matchesStatus = (pool.statistics?.utilizationRate || 0) < 30
      } else if (filterStatus === 'medium-usage') {
        matchesStatus =
          (pool.statistics?.utilizationRate || 0) >= 30 &&
          (pool.statistics?.utilizationRate || 0) <= 80
      }

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'budget':
          return b.budgetAmount - a.budgetAmount
        case 'used':
          return (b.statistics?.usedAmount || 0) - (a.statistics?.usedAmount || 0)
        case 'remaining':
          return (b.statistics?.remainingAmount || 0) - (a.statistics?.remainingAmount || 0)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  // 计算统计数据
  const highUsagePools = budgetPools.filter(
    (pool) => (pool.statistics?.utilizationRate || 0) > 80
  ).length
  const lowUsagePools = budgetPools.filter(
    (pool) => (pool.statistics?.utilizationRate || 0) < 30
  ).length

  // 统计卡片数据
  const statCards = [
    {
      title: '项目总预算',
      value: formatCurrency(totalBudget),
      icon: DollarSign,
      color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
    },
    {
      title: '已使用预算',
      value: formatCurrency(usedBudget),
      icon: CheckCircle,
      color: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
    },
    {
      title: '剩余预算',
      value: formatCurrency(remainingBudget),
      icon: Wallet,
      color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
    },
    {
      title: '整体使用率',
      value: `${Math.round(utilizationRate)}%`,
      icon: BarChart3,
      color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
    },
    {
      title: '高风险经费池',
      value: `${highUsagePools}个`,
      icon: AlertCircle,
      color: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
    },
    {
      title: '低使用率经费池',
      value: `${lowUsagePools}个`,
      icon: Clock,
      color: 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400'
    }
  ]

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <BudgetStatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索经费池..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="high-usage">高使用率 ({'>'}80%)</SelectItem>
              <SelectItem value="medium-usage">中使用率 (30-80%)</SelectItem>
              <SelectItem value="low-usage">低使用率 ({'<'}30%)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">名称</SelectItem>
              <SelectItem value="budget">预算金额</SelectItem>
              <SelectItem value="used">已使用</SelectItem>
              <SelectItem value="remaining">剩余金额</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Shortcut shortcut={['cmd', 'n']} description="创建经费池">
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              创建经费池
            </Button>
          </Shortcut>
        </div>
      </div>

      <Separator />

      {/* 经费池列表 */}
      <div className="space-y-0">
        {filteredPools.length > 0 ? (
          <AnimatePresence>
            {filteredPools.map((pool, index) => (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  delay: index * 0.03,
                  type: 'spring',
                  stiffness: 400,
                  damping: 25
                }}
                className="group flex items-center justify-between py-4 px-4 border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* 左侧：经费池信息 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-base truncate">{pool.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            'text-xs',
                            (pool.statistics?.utilizationRate || 0) > 90
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : (pool.statistics?.utilizationRate || 0) > 70
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          )}
                        >
                          {(pool.statistics?.utilizationRate || 0).toFixed(1)}% 使用率
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {pool.statistics?.expenseCount || 0} 条记录
                        </Badge>
                      </div>
                    </div>

                    {pool.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {pool.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>预算：{formatCurrency(pool.budgetAmount)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>已用：{formatCurrency(pool.statistics?.usedAmount || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        <span>剩余：{formatCurrency(pool.statistics?.remainingAmount || 0)}</span>
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="mt-3">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={cn(
                            'h-2 rounded-full transition-all',
                            (pool.statistics?.utilizationRate || 0) > 90
                              ? 'bg-red-500'
                              : (pool.statistics?.utilizationRate || 0) > 70
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          )}
                          style={{
                            width: `${Math.min(pool.statistics?.utilizationRate || 0, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 右侧：金额和操作 */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(pool.budgetAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">总预算</div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(pool)}>
                        <Edit className="w-3 h-3 mr-1" />
                        编辑
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(pool)}>
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(pool)}>
                            <Edit className="w-4 h-4 mr-2" />
                            编辑信息
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(pool)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除经费池
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <PieChart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">暂无经费池</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all'
                ? '没有找到匹配的经费池'
                : '创建经费池来管理项目的预算分配'}
            </p>
            <Shortcut shortcut={['cmd', 'n']} description="创建经费池">
              <Button onClick={handleCreate} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                创建第一个经费池
              </Button>
            </Shortcut>
          </div>
        )}
      </div>

      {/* 统一的表单抽屉 */}
      <BudgetPoolFormDrawer
        open={poolFormOpen}
        onOpenChange={setPoolFormOpen}
        mode={poolFormMode}
        projectId={project.id}
        budgetPool={selectedPool}
        onSuccess={handleSuccess}
      />

      {/* 详情对话框 */}
      <BudgetPoolDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        budgetPool={selectedPool}
        onEdit={handleEditFromDetails}
      />

      {/* 删除确认对话框 */}
      <DeleteBudgetPoolDialog
        budgetPool={poolToDelete}
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setPoolToDelete(null)
        }}
        onSuccess={() => {
          setPoolToDelete(null)
        }}
      />
    </div>
  )
}

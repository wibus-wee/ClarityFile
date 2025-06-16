import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import {
  PieChart,
  MoreHorizontal,
  Eye,
  Edit,
  Building2,
  Target,
  Activity,
  Wallet
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAllBudgetPools } from '@renderer/hooks/use-tipc'
import { cn } from '@renderer/lib/utils'
import { BudgetPoolDetailsDialog } from '@renderer/components/budget-pools/budget-pool-details-dialog'

interface BudgetPoolsListProps {
  searchQuery: string
  sortBy: 'name' | 'budget' | 'used' | 'remaining' | 'project'
  filterStatus: string
  projectId?: string
}

export function BudgetPoolsList({
  searchQuery,
  sortBy,
  filterStatus,
  projectId
}: BudgetPoolsListProps) {
  const { data: allBudgetPools, isLoading } = useAllBudgetPools()

  // Dialog 状态
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedPool, setSelectedPool] = useState<any>(null)

  // 处理查看详情
  const handleViewDetails = (pool: any) => {
    setSelectedPool(pool)
    setDetailsDialogOpen(true)
  }

  // 处理编辑（跳转到项目详情页）
  const handleEdit = (pool: any) => {
    // 这里可以跳转到项目详情页的经费池管理
    window.location.href = `/projects/${pool.projectId}?tab=budget-pools`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  const budgetPools = allBudgetPools || []

  // 过滤和排序经费池
  const filteredPools = budgetPools
    .filter((pool) => {
      // 搜索过滤
      const matchesSearch =
        pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.project.name.toLowerCase().includes(searchQuery.toLowerCase())

      // 项目过滤
      const matchesProject = !projectId || pool.projectId === projectId

      // 状态过滤
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

      return matchesSearch && matchesProject && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'budget':
          return b.budgetAmount - a.budgetAmount
        case 'used':
          return (b.statistics?.usedAmount || 0) - (a.statistics?.usedAmount || 0)
        case 'remaining':
          return (b.statistics?.remainingAmount || 0) - (a.statistics?.remainingAmount || 0)
        case 'project':
          return a.project.name.localeCompare(b.project.name)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
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
                          <Building2 className="w-3 h-3 mr-1" />
                          {pool.project.name}
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
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to="/projects/$projectId"
                          params={{ projectId: pool.projectId }}
                          search={{ tab: 'budget-pools' }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          管理
                        </Link>
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
                          <DropdownMenuItem asChild>
                            <Link
                              to="/projects/$projectId"
                              params={{ projectId: pool.projectId }}
                              search={{ tab: 'budget-pools' }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              编辑信息
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/projects/$projectId" params={{ projectId: pool.projectId }}>
                              <Building2 className="w-4 h-4 mr-2" />
                              查看项目
                            </Link>
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
                : '创建项目并设置经费池来开始管理预算'}
            </p>
            <Button asChild size="sm">
              <Link to="/projects">
                <Building2 className="w-4 h-4 mr-2" />
                前往项目管理
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* 详情对话框 */}
      <BudgetPoolDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        budgetPool={selectedPool}
        onEdit={handleEdit}
      />
    </div>
  )
}

import { motion } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Separator } from '@clarity/shadcn/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@clarity/shadcn/ui/dialog'
import { PieChart, Activity, Wallet, BarChart3, Edit, Trash2, TrendingUp } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 经费池详情类型定义
type BudgetPoolDetails = {
  id: string
  name: string
  projectId: string
  budgetAmount: number
  description?: string | null
  createdAt: Date
  updatedAt: Date
  statistics?: {
    totalBudget: number
    usedAmount: number
    remainingAmount: number
    expenseCount: number
    utilizationRate: number
  }
}

interface BudgetPoolDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetPool: BudgetPoolDetails | null
  onEdit?: (budgetPool: BudgetPoolDetails) => void
  onDelete?: (budgetPool: BudgetPoolDetails) => void
}

export function BudgetPoolDetailsDialog({
  open,
  onOpenChange,
  budgetPool,
  onEdit,
  onDelete
}: BudgetPoolDetailsDialogProps) {
  if (!budgetPool) return null

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const statistics = budgetPool.statistics
  const utilizationRate = statistics?.utilizationRate || 0
  const usedAmount = statistics?.usedAmount || 0
  const remainingAmount = statistics?.remainingAmount || 0
  const expenseCount = statistics?.expenseCount || 0

  const getUsageColor = (rate: number) => {
    if (rate > 90) return 'text-red-600 dark:text-red-400'
    if (rate > 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getUsageStatus = (rate: number) => {
    if (rate > 90) return '高使用率'
    if (rate > 70) return '中使用率'
    if (rate > 30) return '正常使用'
    return '低使用率'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            经费池详情
          </DialogTitle>
          <DialogDescription>查看经费池的详细信息和使用情况</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{budgetPool.name}</h3>
              <Badge
                className={cn(
                  'text-sm',
                  utilizationRate > 90
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : utilizationRate > 70
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                )}
              >
                {getUsageStatus(utilizationRate)}
              </Badge>
            </div>

            <div className="text-2xl font-bold text-primary">
              {formatCurrency(budgetPool.budgetAmount)}
              <span className="text-sm font-normal text-muted-foreground ml-2">总预算</span>
            </div>

            {/* 使用率进度条 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">预算使用率</span>
                <span className={cn('font-medium', getUsageColor(utilizationRate))}>
                  {utilizationRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className={cn(
                    'h-3 rounded-full transition-all',
                    utilizationRate > 90
                      ? 'bg-red-500'
                      : utilizationRate > 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  )}
                  style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">已使用</span>
              </div>
              <div className="text-xl font-bold text-blue-600">{formatCurrency(usedAmount)}</div>
              <div className="text-xs text-muted-foreground">{expenseCount} 条记录</div>
            </div>

            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">剩余</span>
              </div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(remainingAmount)}
              </div>
              <div className="text-xs text-muted-foreground">可用预算</div>
            </div>

            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">使用率</span>
              </div>
              <div className={cn('text-xl font-bold', getUsageColor(utilizationRate))}>
                {utilizationRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">预算利用率</div>
            </div>
          </div>

          {/* 描述信息 */}
          {budgetPool.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">描述</h4>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">{budgetPool.description}</p>
                </div>
              </div>
            </>
          )}

          {/* 使用建议 */}
          {utilizationRate > 80 && (
            <>
              <Separator />
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      预算使用提醒
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      当前经费池使用率较高，建议关注剩余预算，合理安排后续支出。
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 操作按钮 */}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              创建于 {format(new Date(budgetPool.createdAt), 'PPP', { locale: zhCN })}
              {budgetPool.updatedAt !== budgetPool.createdAt && (
                <span>
                  {' '}
                  · 更新于 {format(new Date(budgetPool.updatedAt), 'PPP', { locale: zhCN })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(budgetPool)}>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="sm" onClick={() => onDelete(budgetPool)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

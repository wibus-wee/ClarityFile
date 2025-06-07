import { motion } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import useSWR from 'swr'
import { tipcClient } from '@renderer/lib/tipc-client'
import { cn } from '@renderer/lib/utils'

// 统计卡片组件
interface ExpenseStatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
  delay?: number
}

function ExpenseStatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  delay = 0
}: ExpenseStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      className="p-4 border border-border rounded-lg bg-card hover:bg-accent/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn('p-2 rounded-lg', color)}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs',
              trend.isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
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

export function ExpenseOverview() {
  // 获取全局经费统计数据
  const { data: allExpenses, isLoading } = useSWR('all-expenses', () => tipcClient.getAllExpenses())

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  const expenses = allExpenses || []

  // 计算统计数据
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const pendingAmount = expenses
    .filter((e) => e.status.toLowerCase() === 'pending')
    .reduce((sum, e) => sum + e.amount, 0)
  const reimbursedAmount = expenses
    .filter((e) => e.status.toLowerCase() === 'reimbursed')
    .reduce((sum, e) => sum + e.amount, 0)
  const rejectedAmount = expenses
    .filter((e) => e.status.toLowerCase() === 'rejected')
    .reduce((sum, e) => sum + e.amount, 0)
  const approvedAmount = expenses
    .filter((e) => e.status.toLowerCase() === 'approved')
    .reduce((sum, e) => sum + e.amount, 0)

  const statusCounts = expenses.reduce(
    (acc, expense) => {
      acc[expense.status] = (acc[expense.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // 计算本月新增（模拟数据，实际应该根据日期计算）
  const currentMonth = new Date().getMonth()
  const thisMonthExpenses = expenses.filter(
    (e) => new Date(e.applicationDate).getMonth() === currentMonth
  )
  const thisMonthAmount = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0)

  // 申请人统计
  const applicantStats = expenses.reduce(
    (acc, expense) => {
      acc[expense.applicant] = {
        count: (acc[expense.applicant]?.count || 0) + 1,
        amount: (acc[expense.applicant]?.amount || 0) + expense.amount
      }
      return acc
    },
    {} as Record<string, { count: number; amount: number }>
  )

  // 计算处理效率
  const processedExpenses = expenses.filter(
    (e) => e.status.toLowerCase() === 'reimbursed' || e.status.toLowerCase() === 'rejected'
  )
  const averageProcessingTime =
    processedExpenses.length > 0
      ? processedExpenses.reduce((sum, expense) => {
          const applicationDate = new Date(expense.applicationDate)
          const processedDate = expense.reimbursementDate
            ? new Date(expense.reimbursementDate)
            : new Date(expense.updatedAt)
          return sum + (processedDate.getTime() - applicationDate.getTime())
        }, 0) /
        processedExpenses.length /
        (1000 * 60 * 60 * 24) // 转换为天数
      : 0

  // 报销率计算
  const reimbursementRate =
    expenses.length > 0 ? ((statusCounts.reimbursed || 0) / expenses.length) * 100 : 0

  // 排序获取前几名申请人
  const topApplicants = Object.entries(applicantStats)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 5)

  // 按月份分组统计
  const monthlyStats = expenses.reduce(
    (acc, expense) => {
      const month = new Date(expense.applicationDate).toISOString().slice(0, 7) // YYYY-MM
      acc[month] = {
        count: (acc[month]?.count || 0) + 1,
        amount: (acc[month]?.amount || 0) + expense.amount
      }
      return acc
    },
    {} as Record<string, { count: number; amount: number }>
  )

  // 获取最近6个月的数据
  const recentMonths = Object.entries(monthlyStats)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)

  // 统计卡片数据
  const statCards = [
    {
      title: '总经费',
      value: `¥${totalAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      trend: { value: 12, isPositive: true }
    },
    {
      title: '已报销',
      value: `¥${reimbursedAmount.toLocaleString()}`,
      icon: CheckCircle,
      color: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
      trend: { value: 8, isPositive: true }
    },
    {
      title: '待处理',
      value: `¥${pendingAmount.toLocaleString()}`,
      icon: Clock,
      color: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
      trend: { value: 5, isPositive: false }
    },
    {
      title: '本月新增',
      value: `¥${thisMonthAmount.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
      trend: { value: 15, isPositive: true }
    }
  ]

  // 状态分布数据
  const totalExpenseCount = expenses.length
  const statusDistribution = [
    {
      name: '待审核',
      count: statusCounts.pending || 0,
      percentage:
        totalExpenseCount > 0 ? ((statusCounts.pending || 0) / totalExpenseCount) * 100 : 0,
      color: 'bg-yellow-500',
      amount: pendingAmount
    },
    {
      name: '已批准',
      count: statusCounts.approved || 0,
      percentage:
        totalExpenseCount > 0 ? ((statusCounts.approved || 0) / totalExpenseCount) * 100 : 0,
      color: 'bg-blue-500',
      amount: approvedAmount
    },
    {
      name: '已报销',
      count: statusCounts.reimbursed || 0,
      percentage:
        totalExpenseCount > 0 ? ((statusCounts.reimbursed || 0) / totalExpenseCount) * 100 : 0,
      color: 'bg-green-500',
      amount: reimbursedAmount
    },
    {
      name: '已拒绝',
      count: statusCounts.rejected || 0,
      percentage:
        totalExpenseCount > 0 ? ((statusCounts.rejected || 0) / totalExpenseCount) * 100 : 0,
      color: 'bg-red-500',
      amount: rejectedAmount
    }
  ]

  // 最近的经费记录
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
    .slice(0, 5)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'reimbursed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '待审核'
      case 'approved':
        return '已批准'
      case 'reimbursed':
        return '已报销'
      case 'rejected':
        return '已拒绝'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <ExpenseStatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            trend={card.trend}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* 状态分布和快速操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 状态分布 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1 p-4 border border-border rounded-lg bg-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">状态分布</h3>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {statusDistribution.map((status, index) => (
              <motion.div
                key={status.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{status.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{status.count}</span>
                    <span className="text-xs text-muted-foreground">
                      ¥{status.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${status.percentage}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                    className={cn('h-2 rounded-full', status.color)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 月度趋势 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 p-4 border border-border rounded-lg bg-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">月度趋势</h3>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {recentMonths.slice(0, 5).map(([month, stats], index) => {
              const maxAmount = Math.max(...recentMonths.map(([, s]) => s.amount))
              const percentage = maxAmount > 0 ? (stats.amount / maxAmount) * 100 : 0

              return (
                <motion.div
                  key={month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">{month}</span>
                    <div className="text-right">
                      <span className="font-medium">¥{stats.amount.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-2">{stats.count}项</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                      className="h-2 rounded-full bg-blue-500"
                    />
                  </div>
                </motion.div>
              )
            })}

            {recentMonths.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">暂无月度数据</p>
              </div>
            )}

            {/* 快速操作按钮 */}
            <div className="pt-2 border-t border-border/50">
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link to="/expenses" search={{ view: 'list' }}>
                  查看详细列表
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 申请人统计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-1 p-4 border border-border rounded-lg bg-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">申请人统计</h3>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {topApplicants.slice(0, 4).map(([applicant, stats], index) => (
              <motion.div
                key={applicant}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                      index === 0
                        ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                        : index === 1
                          ? 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                          : index === 2
                            ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
                            : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm truncate">{applicant}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">¥{stats.amount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{stats.count} 项</div>
                </div>
              </motion.div>
            ))}

            {topApplicants.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">暂无申请记录</p>
              </div>
            )}

            {/* 效率指标 */}
            <div className="pt-3 border-t border-border/50 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">报销率</span>
                <span className="font-medium">{Math.round(reimbursementRate)}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">平均处理时间</span>
                <span className="font-medium">{Math.round(averageProcessingTime)}天</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 最近的经费记录 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="p-4 border border-border rounded-lg bg-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">最近的经费记录</h3>
          <Button asChild variant="outline" size="sm">
            <Link to="/expenses" search={{ view: 'list' }}>
              查看全部
            </Link>
          </Button>
        </div>

        {recentExpenses.length > 0 ? (
          <div className="space-y-0">
            {recentExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                className="flex items-center justify-between py-3 px-2 border-b border-border/50 last:border-b-0 hover:bg-accent/30 transition-colors rounded"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{expense.itemName}</h4>
                    <Badge className={cn('text-xs', getStatusColor(expense.status))}>
                      {getStatusText(expense.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {expense.applicant}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(expense.applicationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    ¥{expense.amount.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无经费记录</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

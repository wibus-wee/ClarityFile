import { motion } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import {
  TrendingUp,
  Receipt,
  AlertCircle,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Plus
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import useSWR from 'swr'
import { tipcClient } from '@renderer/lib/tipc-client'

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

  const statusCounts = expenses.reduce(
    (acc, expense) => {
      acc[expense.status] = (acc[expense.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

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
    <div className="space-y-8">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-300">总经费</span>
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">
            ¥{totalAmount.toLocaleString()}
          </p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            共 {expenses.length} 条记录
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <Receipt className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-blue-800 dark:text-blue-300">已报销</span>
          </div>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            ¥{reimbursedAmount.toLocaleString()}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
            {statusCounts.reimbursed || 0} 条记录
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <span className="font-medium text-yellow-800 dark:text-yellow-300">待处理</span>
          </div>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
            ¥{pendingAmount.toLocaleString()}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
            {statusCounts.pending || 0} 条记录
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-red-600" />
            <span className="font-medium text-red-800 dark:text-red-300">已拒绝</span>
          </div>
          <p className="text-3xl font-bold text-red-900 dark:text-red-100">
            ¥{rejectedAmount.toLocaleString()}
          </p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
            {statusCounts.rejected || 0} 条记录
          </p>
        </motion.div>
      </div>

      {/* 快速操作 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-background border rounded-lg"
      >
        <h3 className="text-lg font-semibold mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild className="h-auto p-4 flex-col gap-2">
            <Link to="/expenses" search={{ view: 'list' }}>
              <Receipt className="w-6 h-6" />
              <span>查看所有经费</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
            <Link to="/expenses" search={{ view: 'statistics' }}>
              <BarChart3 className="w-6 h-6" />
              <span>统计分析</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
            <Link to="/expenses" search={{ view: 'list', status: 'pending' }}>
              <AlertCircle className="w-6 h-6" />
              <span>待处理记录</span>
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* 最近的经费记录 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 bg-background border rounded-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">最近的经费记录</h3>
          <Button asChild variant="outline" size="sm">
            <Link to="/expenses" search={{ view: 'list' }}>
              查看全部
            </Link>
          </Button>
        </div>

        {recentExpenses.length > 0 ? (
          <div className="space-y-4">
            {recentExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium">{expense.itemName}</h4>
                    <Badge className={getStatusColor(expense.status)}>
                      {getStatusText(expense.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {expense.applicant}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(expense.applicationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">¥{expense.amount.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无经费记录</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

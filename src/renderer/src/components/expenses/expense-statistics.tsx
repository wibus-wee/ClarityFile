import { motion } from 'framer-motion'
import { Badge } from '@renderer/components/ui/badge'
import {
  TrendingUp,
  Receipt,
  AlertCircle,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  PieChart
} from 'lucide-react'
import useSWR from 'swr'
import { tipcClient } from '@renderer/lib/tipc-client'

export function ExpenseStatistics() {
  // 获取全局经费数据
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
  const averageAmount = expenses.length > 0 ? totalAmount / expenses.length : 0

  // 按状态分组
  const statusStats = expenses.reduce(
    (acc, expense) => {
      const status = expense.status.toLowerCase()
      acc[status] = {
        count: (acc[status]?.count || 0) + 1,
        amount: (acc[status]?.amount || 0) + expense.amount
      }
      return acc
    },
    {} as Record<string, { count: number; amount: number }>
  )

  // 按申请人分组
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

  // 按月份分组
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

  // 排序获取前几名
  const topApplicants = Object.entries(applicantStats)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 5)

  const recentMonths = Object.entries(monthlyStats)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)

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
      {/* 总体统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-blue-800 dark:text-blue-300">总记录数</span>
          </div>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{expenses.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-300">总金额</span>
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">
            ¥{totalAmount.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-purple-800 dark:text-purple-300">平均金额</span>
          </div>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            ¥{averageAmount.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6 text-orange-600" />
            <span className="font-medium text-orange-800 dark:text-orange-300">申请人数</span>
          </div>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
            {Object.keys(applicantStats).length}
          </p>
        </motion.div>
      </div>

      {/* 状态分布 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-background border rounded-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5" />
          <h3 className="text-lg font-semibold">状态分布</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(statusStats).map(([status, stats]) => (
            <div key={status} className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(status)}>{getStatusText(status)}</Badge>
              </div>
              <p className="text-2xl font-bold">¥{stats.amount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{stats.count} 条记录</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 申请人排行 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 bg-background border rounded-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h3 className="text-lg font-semibold">申请人排行（按金额）</h3>
        </div>
        <div className="space-y-3">
          {topApplicants.map(([applicant, stats], index) => (
            <div key={applicant} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <span className="font-medium">{applicant}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">¥{stats.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stats.count} 条记录</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 月度趋势 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 bg-background border rounded-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" />
          <h3 className="text-lg font-semibold">月度趋势</h3>
        </div>
        <div className="space-y-3">
          {recentMonths.map(([month, stats]) => (
            <div key={month} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{month}</p>
                <p className="text-sm text-muted-foreground">{stats.count} 条记录</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">¥{stats.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

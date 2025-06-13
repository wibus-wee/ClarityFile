import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Calendar,
  FileText,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  User,
  Receipt,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { cn } from '@renderer/lib/utils'

import { ExpenseFormDrawer } from './drawers/expense-form-drawer'
import { ExpenseDetailsDialog } from '../expenses/expense-details-dialog'
import { ExpenseStatusDialog } from '../expenses/expense-status-dialog'
import type { ProjectDetailsOutput } from '@main/types/project-schemas'

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

interface ExpensesTabProps {
  projectDetails: ProjectDetailsOutput
}

export function ExpensesTab({ projectDetails }: ExpensesTabProps) {
  const { expenses, statistics, project } = projectDetails
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'amount' | 'application' | 'reimbursement' | 'status'>(
    'application'
  )
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Drawer 和 Dialog 状态
  const [expenseFormOpen, setExpenseFormOpen] = useState(false)
  const [expenseFormMode, setExpenseFormMode] = useState<'create' | 'edit'>('create')
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)

  // 处理创建操作
  const handleCreate = () => {
    setExpenseFormMode('create')
    setSelectedExpense(null)
    setExpenseFormOpen(true)
  }

  // 处理编辑操作
  const handleEdit = (expense: any) => {
    setExpenseFormMode('edit')
    setSelectedExpense(expense)
    setExpenseFormOpen(true)
  }

  // 处理查看详情
  const handleViewDetails = (expense: any) => {
    setSelectedExpense(expense)
    setDetailsDialogOpen(true)
  }

  // 处理状态更新
  const handleUpdateStatus = (expense: any) => {
    setSelectedExpense(expense)
    setStatusDialogOpen(true)
  }

  // 从详情页面跳转到编辑
  const handleEditFromDetails = (expense: any) => {
    setDetailsDialogOpen(false)
    setSelectedExpense(expense)
    setExpenseFormMode('edit')
    setExpenseFormOpen(true)
  }

  // 处理成功回调
  const handleSuccess = () => {
    // SWR 会自动重新验证数据
  }

  // 获取所有状态
  const statuses = Array.from(new Set(expenses.map((expense) => expense.status)))

  // 过滤和排序经费
  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch =
        expense.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || expense.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount
        case 'application':
          return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()
        case 'reimbursement':
          if (!a.reimbursementDate && !b.reimbursementDate) return 0
          if (!a.reimbursementDate) return 1
          if (!b.reimbursementDate) return -1
          return new Date(b.reimbursementDate).getTime() - new Date(a.reimbursementDate).getTime()
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case '待审核':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'approved':
      case '已批准':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'reimbursed':
      case '已报销':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'rejected':
      case '已拒绝':
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

  // 计算统计数据
  const pendingAmount = expenses
    .filter((e) => e.status.toLowerCase() === 'pending')
    .reduce((sum, e) => sum + e.amount, 0)

  const reimbursedAmount = expenses
    .filter((e) => e.status.toLowerCase() === 'reimbursed')
    .reduce((sum, e) => sum + e.amount, 0)

  const approvedAmount = expenses
    .filter((e) => e.status.toLowerCase() === 'approved')
    .reduce((sum, e) => sum + e.amount, 0)

  const rejectedAmount = expenses
    .filter((e) => e.status.toLowerCase() === 'rejected')
    .reduce((sum, e) => sum + e.amount, 0)

  // 计算实际已使用的经费（只包含已批准和已报销的记录）
  const usedAmount = approvedAmount + reimbursedAmount

  // 计算报销率
  const reimbursementRate =
    expenses.length > 0
      ? (expenses.filter((e) => e.status.toLowerCase() === 'reimbursed').length / expenses.length) *
        100
      : 0

  // 统计卡片数据
  const statCards = [
    {
      title: '已使用经费',
      value: `¥${usedAmount.toLocaleString()}`,
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
      title: '报销率',
      value: `${Math.round(reimbursementRate)}%`,
      icon: BarChart3,
      color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
      trend: { value: 15, isPositive: true }
    }
  ]

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
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

      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索经费记录..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusText(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="application">申请时间</SelectItem>
              <SelectItem value="amount">金额</SelectItem>
              <SelectItem value="reimbursement">报销时间</SelectItem>
              <SelectItem value="status">状态</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            添加新报销
          </Button>
        </div>
      </div>

      <Separator />

      {/* 经费列表 */}
      <div className="space-y-0">
        {filteredExpenses.length > 0 ? (
          <AnimatePresence>
            {filteredExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  delay: index * 0.03,
                  type: 'spring',
                  stiffness: 400,
                  damping: 25
                }}
                className="group flex items-center justify-between py-3 px-4 border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* 左侧：项目信息 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{expense.itemName}</h3>
                      <Badge className={cn('text-xs', getStatusColor(expense.status))}>
                        {getStatusText(expense.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{expense.applicant}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(expense.applicationDate).toLocaleDateString()}</span>
                      </div>

                      {expense.reimbursementDate && (
                        <div className="flex items-center gap-1">
                          <Receipt className="w-3 h-3" />
                          <span>{new Date(expense.reimbursementDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      {expense.invoiceFileName && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>有发票</span>
                        </div>
                      )}
                    </div>

                    {expense.notes && (
                      <div className="mt-2 p-2 bg-muted/20 rounded text-xs text-muted-foreground">
                        <strong>备注：</strong> {expense.notes}
                      </div>
                    )}
                  </div>

                  {/* 右侧：金额和操作 */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        ¥{expense.amount.toLocaleString()}
                      </div>
                      {expense.reimbursementDate && (
                        <div className="text-xs text-muted-foreground">已报销</div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(expense)}>
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
                          <DropdownMenuItem onClick={() => handleViewDetails(expense)}>
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(expense)}>
                            <Edit className="w-4 h-4 mr-2" />
                            编辑信息
                          </DropdownMenuItem>
                          {expense.invoiceFileName && (
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              下载发票
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateStatus(expense)}>
                            <Receipt className="w-4 h-4 mr-2" />
                            更新状态
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">删除记录</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <DollarSign className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="text-base font-medium mb-2">暂无经费记录</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all'
                ? '没有找到匹配的经费记录'
                : '开始添加项目经费记录'}
            </p>
            <Button onClick={handleCreate} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              添加新报销
            </Button>
          </div>
        )}
      </div>

      {/* 统一的表单抽屉 */}
      <ExpenseFormDrawer
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        mode={expenseFormMode}
        projectId={project.id}
        expense={selectedExpense}
        onSuccess={handleSuccess}
      />

      {/* 详情对话框 */}
      <ExpenseDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        expense={selectedExpense}
        onEdit={handleEditFromDetails}
        onUpdateStatus={(expense) => {
          setDetailsDialogOpen(false)
          handleUpdateStatus(expense)
        }}
      />

      {/* 状态更新对话框 */}
      <ExpenseStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        expense={selectedExpense}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

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
  DollarSign,
  Calendar,
  FileText,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  User,
  Receipt,
  Plus
} from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Link } from '@tanstack/react-router'
import useSWR from 'swr'
import { tipcClient } from '@renderer/lib/tipc-client'
import { EditExpenseDrawer } from '@renderer/components/project-details/drawers/edit-expense-drawer'

interface ExpenseListProps {
  searchQuery: string
  sortBy: 'amount' | 'application' | 'reimbursement' | 'status'
  filterStatus: string
  projectId?: string
}

export function ExpenseList({ searchQuery, sortBy, filterStatus, projectId }: ExpenseListProps) {
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)

  // 获取经费数据
  const { data: allExpenses, isLoading } = useSWR('all-expenses', () => tipcClient.getAllExpenses())

  const handleEdit = (expense: any) => {
    setSelectedExpense(expense)
    setEditDrawerOpen(true)
  }

  const handleSuccess = () => {
    // SWR 会自动重新验证数据
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  const expenses = allExpenses || []

  // 过滤和排序经费
  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch =
        expense.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.applicant.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || expense.status === filterStatus
      const matchesProject = !projectId || expense.projectId === projectId
      return matchesSearch && matchesStatus && matchesProject
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
      {/* 经费列表 */}
      <div className="space-y-4">
        {filteredExpenses.length > 0 ? (
          <AnimatePresence>
            {filteredExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-lg p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{expense.itemName}</h3>
                      <Badge className={cn('text-xs', getStatusColor(expense.status))}>
                        {getStatusText(expense.status)}
                      </Badge>
                      <span className="text-lg font-bold text-primary">
                        ¥{expense.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">申请人：</span>
                        <span>{expense.applicant}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">申请时间：</span>
                        <span>{new Date(expense.applicationDate).toLocaleDateString()}</span>
                      </div>

                      {expense.reimbursementDate && (
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">报销时间：</span>
                          <span>{new Date(expense.reimbursementDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {expense.projectId && (
                      <div className="mb-3">
                        <Button asChild variant="link" size="sm" className="p-0 h-auto">
                          <Link to="/projects/$projectId" params={{ projectId: expense.projectId }}>
                            查看关联项目
                          </Link>
                        </Button>
                      </div>
                    )}

                    {expense.notes && (
                      <div className="mb-3 p-3 bg-muted/20 rounded border">
                        <p className="text-sm text-muted-foreground">
                          <strong>备注：</strong> {expense.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(expense)}>
                      <Edit className="w-4 h-4 mr-2" />
                      编辑
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(expense)}>
                          <Edit className="w-4 h-4 mr-2" />
                          编辑信息
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Receipt className="w-4 h-4 mr-2" />
                          更新状态
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">删除记录</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">暂无经费记录</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all'
                ? '没有找到匹配的经费记录'
                : '开始添加经费记录'}
            </p>
            <Button asChild>
              <Link to="/expenses" search={{ view: 'overview' }}>
                <Plus className="w-4 h-4 mr-2" />
                添加经费记录
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* 编辑抽屉 */}
      <EditExpenseDrawer
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        expense={selectedExpense}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

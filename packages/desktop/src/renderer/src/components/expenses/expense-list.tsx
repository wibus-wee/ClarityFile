import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import { DollarSign, Calendar, Edit, Eye, MoreHorizontal, User, Receipt, Plus } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Link } from '@tanstack/react-router'
import useSWR from 'swr'
import { tipcClient } from '@renderer/lib/tipc-client'
import { ExpenseFormDrawer } from '@renderer/components/project-details/drawers/expense-form-drawer'
import { ExpenseDetailsDialog } from './expense-details-dialog'
import { ExpenseStatusDialog } from './expense-status-dialog'
import type { ExpenseTrackingOutput } from '@main/types/expense-schemas'

interface ExpenseListProps {
  searchQuery: string
  sortBy: 'amount' | 'application' | 'reimbursement' | 'status'
  filterStatus: string
  projectId?: string
}

// 使用统一的经费记录输出类型
type ExpenseItem = ExpenseTrackingOutput

export function ExpenseList({ searchQuery, sortBy, filterStatus, projectId }: ExpenseListProps) {
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null)

  // 获取经费数据
  const { data: allExpenses, isLoading } = useSWR('all-expenses', () => tipcClient.getAllExpenses())

  const handleEdit = (expense: ExpenseItem) => {
    setSelectedExpense(expense)
    setEditDrawerOpen(true)
  }

  const handleViewDetails = (expense: ExpenseItem) => {
    setSelectedExpense(expense)
    setDetailsDialogOpen(true)
  }

  const handleEditFromDetails = (expense: ExpenseItem) => {
    setDetailsDialogOpen(false)
    setSelectedExpense(expense)
    setEditDrawerOpen(true)
  }

  const handleUpdateStatus = (expense: ExpenseItem) => {
    setSelectedExpense(expense)
    setStatusDialogOpen(true)
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

                      {expense.projectId && (
                        <Button asChild variant="link" size="sm" className="p-0 h-auto text-xs">
                          <Link to="/projects/$projectId" params={{ projectId: expense.projectId }}>
                            查看项目
                          </Link>
                        </Button>
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
                      {expense.status === 'reimbursed' && expense.reimbursementDate && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(expense.reimbursementDate).toLocaleDateString()}
                        </div>
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
                : '开始添加经费记录'}
            </p>
            <Button asChild size="sm">
              <Link to="/expenses" search={{ view: 'overview' }}>
                <Plus className="w-4 h-4 mr-2" />
                添加经费记录
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* 编辑抽屉 */}
      <ExpenseFormDrawer
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        mode="edit"
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

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
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { cn } from '@renderer/lib/utils'
import type { ProjectDetailsOutput } from '../../../../main/types/outputs'

interface ExpensesTabProps {
  projectDetails: ProjectDetailsOutput
}

export function ExpensesTab({ projectDetails }: ExpensesTabProps) {
  const { expenses, statistics } = projectDetails
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'amount' | 'application' | 'reimbursement' | 'status'>('application')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 获取所有状态
  const statuses = Array.from(new Set(expenses.map(expense => expense.status)))

  // 过滤和排序经费
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
  const pendingAmount = filteredExpenses
    .filter(e => e.status.toLowerCase() === 'pending')
    .reduce((sum, e) => sum + e.amount, 0)
  
  const reimbursedAmount = filteredExpenses
    .filter(e => e.status.toLowerCase() === 'reimbursed')
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-300">总经费</span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            ¥{statistics.totalExpenseAmount.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">已报销</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            ¥{reimbursedAmount.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">待处理</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            ¥{pendingAmount.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">记录数</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {statistics.expenseCount}
          </p>
        </motion.div>
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
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{getStatusText(status)}</SelectItem>
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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            添加新报销
          </Button>
        </div>
      </div>

      <Separator />

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

                    {expense.notes && (
                      <div className="mb-3 p-3 bg-muted/20 rounded border">
                        <p className="text-sm text-muted-foreground">
                          <strong>备注：</strong> {expense.notes}
                        </p>
                      </div>
                    )}

                    {/* 发票信息 */}
                    {expense.invoiceFileName && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800 dark:text-blue-300">
                          发票：{expense.invoiceOriginalFileName}
                        </span>
                        {expense.invoiceFileSizeBytes && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            ({(expense.invoiceFileSizeBytes / 1024).toFixed(1)} KB)
                          </span>
                        )}
                        <Button variant="ghost" size="sm" className="ml-auto">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
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
                        <DropdownMenuItem>
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
                        <DropdownMenuItem>
                          <Receipt className="w-4 h-4 mr-2" />
                          更新状态
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          删除记录
                        </DropdownMenuItem>
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
              {searchQuery || filterStatus !== 'all' ? '没有找到匹配的经费记录' : '开始添加项目经费记录'}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加新报销
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

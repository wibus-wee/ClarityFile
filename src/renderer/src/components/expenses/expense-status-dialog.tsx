import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { Label } from '@renderer/components/ui/label'
import { Textarea } from '@renderer/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Calendar } from '@renderer/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { CalendarIcon, Receipt, AlertCircle } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useUpdateExpenseTracking } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'

// 经费项目类型定义
type ExpenseItem = {
  id: string
  itemName: string
  projectId: string | null
  applicant: string
  amount: number
  applicationDate: Date
  status: string
  reimbursementDate: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  // 发票文件信息
  invoiceFileName: string | null
  invoiceOriginalFileName: string | null
  invoicePhysicalPath: string | null
  invoiceMimeType: string | null
  invoiceFileSizeBytes: number | null
  invoiceUploadedAt: Date | null
}

interface ExpenseStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: ExpenseItem | null
  onSuccess?: () => void
}

const statusOptions = [
  {
    value: 'pending',
    label: '待审核',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
  },
  {
    value: 'approved',
    label: '已批准',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  },
  {
    value: 'reimbursed',
    label: '已报销',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  },
  {
    value: 'rejected',
    label: '已拒绝',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }
]

export function ExpenseStatusDialog({
  open,
  onOpenChange,
  expense,
  onSuccess
}: ExpenseStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<string>('')
  const [reimbursementDate, setReimbursementDate] = useState<Date | undefined>(undefined)
  const [statusNotes, setStatusNotes] = useState('')

  const { trigger: updateExpense, isMutating } = useUpdateExpenseTracking()

  // 当dialog打开时，初始化状态
  const handleOpenChange = (open: boolean) => {
    if (open && expense) {
      setNewStatus(expense.status)
      setReimbursementDate(
        expense.reimbursementDate ? new Date(expense.reimbursementDate) : undefined
      )
      setStatusNotes('')
    } else {
      setNewStatus('')
      setReimbursementDate(undefined)
      setStatusNotes('')
    }
    onOpenChange(open)
  }

  const handleSubmit = async () => {
    if (!expense || !newStatus) return

    try {
      await updateExpense({
        id: expense.id,
        status: newStatus,
        reimbursementDate: reimbursementDate,
        notes: statusNotes.trim()
          ? expense.notes
            ? `${expense.notes}\n\n[状态更新] ${statusNotes}`
            : `[状态更新] ${statusNotes}`
          : expense.notes || undefined
      })

      toast.success('经费状态更新成功')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error('状态更新失败，请重试')
      console.error('更新经费状态失败:', error)
    }
  }

  const getCurrentStatusOption = () => {
    return statusOptions.find((option) => option.value === expense?.status)
  }

  const getNewStatusOption = () => {
    return statusOptions.find((option) => option.value === newStatus)
  }

  if (!expense) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            更新经费状态
          </DialogTitle>
          <DialogDescription>更新「{expense.itemName}」的审核状态</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* 当前状态 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">当前状态</Label>
            <div className="flex items-center gap-2">
              <Badge className={cn('text-sm', getCurrentStatusOption()?.color)}>
                {getCurrentStatusOption()?.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ¥{expense.amount.toLocaleString()} · {expense.applicant}
              </span>
            </div>
          </div>

          {/* 新状态选择 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">更新为</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="选择新状态" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', option.color)} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 报销日期（仅当状态为已报销时显示） */}
          {newStatus === 'reimbursed' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">报销日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !reimbursementDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reimbursementDate ? (
                      format(reimbursementDate, 'PPP', { locale: zhCN })
                    ) : (
                      <span>选择报销日期</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reimbursementDate}
                    onSelect={setReimbursementDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* 状态更新说明 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">更新说明（可选）</Label>
            <Textarea
              placeholder="添加状态更新的说明..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* 状态变更提示 */}
          {newStatus && newStatus !== expense.status && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  状态将从「{getCurrentStatusOption()?.label}」更新为「{getNewStatusOption()?.label}
                  」
                </p>
                {newStatus === 'reimbursed' && !reimbursementDate && (
                  <p className="text-blue-700 dark:text-blue-300 mt-1">建议设置报销日期</p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!newStatus || newStatus === expense.status || isMutating}
          >
            {isMutating ? '更新中...' : '确认更新'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@clarity/shadcn/ui/alert-dialog'
import { AlertTriangle, DollarSign, Calendar } from 'lucide-react'
import { useDeleteExpenseTracking } from '@renderer/hooks/use-tipc'
import type { ExpenseTrackingOutput } from '@main/types/expense-schemas'

interface DeleteExpenseDialogProps {
  expense: ExpenseTrackingOutput | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteExpenseDialog({
  expense,
  open,
  onOpenChange,
  onSuccess
}: DeleteExpenseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteExpense = useDeleteExpenseTracking()

  const handleDelete = async () => {
    if (!expense) return

    setIsDeleting(true)
    try {
      await deleteExpense.trigger({ id: expense.id })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('删除经费记录失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!expense) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            确认删除经费记录
          </AlertDialogTitle>
          <AlertDialogDescription>此操作无法撤销，请确认是否继续。</AlertDialogDescription>
        </AlertDialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{expense.itemName}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    金额：{formatCurrency(expense.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    申请日期：{new Date(expense.applicationDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              ⚠️ 删除后，该经费记录将被永久删除且无法恢复。
            </p>
          </div>

          <p className="text-sm text-muted-foreground">请确认您真的要删除这条经费记录。</p>
        </motion.div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? '删除中...' : '确认删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

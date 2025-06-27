import { ExpenseFormDrawer } from '@renderer/components/project-details/drawers/expense-form-drawer'
import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { toast } from 'sonner'

/**
 * 全局 ExpenseFormDrawer 组件
 * 由全局状态管理控制，支持文件预选择和数据预填充
 */
export function GlobalExpenseFormDrawer() {
  const { expenseForm, closeExpenseForm } = useGlobalDrawersStore()

  // 处理成功回调
  const handleSuccess = () => {
    closeExpenseForm()
    toast.success('报销记录创建成功')
  }

  // 处理关闭
  const handleClose = (open: boolean) => {
    if (!open) {
      closeExpenseForm()
    }
  }

  // 如果没有打开状态，不渲染组件
  if (!expenseForm.isOpen) {
    return null
  }

  return (
    <ExpenseFormDrawer
      open={expenseForm.isOpen}
      onOpenChange={handleClose}
      mode={expenseForm.mode}
      projectId={expenseForm.projectId}
      expense={expenseForm.expense}
      prefilledData={expenseForm.prefilledData}
      preselectedFile={expenseForm.preselectedFile}
      onSuccess={handleSuccess}
    />
  )
}

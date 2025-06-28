import { motion } from 'framer-motion'
import { Receipt } from 'lucide-react'
import { Button } from '@clarity/shadcn/ui/button'
import { DrawerNestedRoot, DrawerTrigger, DrawerContent } from '@clarity/shadcn/ui/drawer'
import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { ImportContextProvider } from '../../core/import-context'
import type { ImportContextData } from '../../core/types'
import { SimpleExpenseFormDrawer } from './simplified-drawers'

/**
 * 发票报销 Drawer 包装器组件
 * 处理发票报销导入的UI交互
 */
export interface ExpenseDrawerWrapperProps {
  contextData: ImportContextData
  disabled: boolean
}

export function ExpenseDrawerWrapper({ contextData, disabled }: ExpenseDrawerWrapperProps) {
  const { openExpenseForm, expenseForm, closeExpenseForm } = useGlobalDrawersStore()

  const handleOpen = () => {
    openExpenseForm({
      mode: 'create',
      projectId: contextData.projectId,
      prefilledData: contextData.prefilledData?.expense,
      preselectedFile: contextData.files[0]
    })
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      closeExpenseForm()
    }
  }

  return (
    <DrawerNestedRoot open={expenseForm.isOpen} onOpenChange={handleClose}>
      <DrawerTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full h-auto p-4 justify-start"
            disabled={disabled}
            onClick={handleOpen}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">发票报销</p>
                <p className="text-sm text-muted-foreground">导入 PDF 发票文件并创建报销记录</p>
              </div>
            </div>
          </Button>
        </motion.div>
      </DrawerTrigger>
      <ImportContextProvider data={contextData}>
        <DrawerContent className="max-h-[80vh]">
          <SimpleExpenseFormDrawer />
        </DrawerContent>
      </ImportContextProvider>
    </DrawerNestedRoot>
  )
}

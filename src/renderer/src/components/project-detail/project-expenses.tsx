import { Button } from '@renderer/components/ui/button'
import { CreditCard, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProjectExpensesProps {
  projectId: string
}

export function ProjectExpenses({ projectId }: ProjectExpensesProps) {
  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">经费管理</h2>
          <p className="text-sm text-muted-foreground">管理项目相关的经费申请和报销记录</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加新报销
        </Button>
      </div>

      {/* 空状态 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">暂无经费记录</h3>
        <p className="text-sm text-muted-foreground mb-4">
          开始记录项目相关的经费申请和报销
        </p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加新报销
        </Button>
      </motion.div>
    </div>
  )
}

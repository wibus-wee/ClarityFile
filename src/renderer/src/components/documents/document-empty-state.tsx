import { FileText, Plus, Filter } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { motion } from 'framer-motion'

interface DocumentEmptyStateProps {
  hasFilters: boolean
  onCreateDocument: () => void
  onClearFilters: () => void
}

export function DocumentEmptyState({ 
  hasFilters, 
  onCreateDocument, 
  onClearFilters 
}: DocumentEmptyStateProps) {
  if (hasFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Filter className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">没有找到匹配的文档</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          当前筛选条件下没有找到任何文档。请尝试调整筛选条件或清除筛选。
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClearFilters}>
            清除筛选
          </Button>
          <Button onClick={onCreateDocument} className="gap-2">
            <Plus className="w-4 h-4" />
            新建文档
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-medium mb-2">还没有任何文档</h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        开始创建您的第一个文档，建立项目的文档库。文档将按照智能命名规则自动组织和管理。
      </p>
      <Button onClick={onCreateDocument} size="lg" className="gap-2">
        <Plus className="w-5 h-5" />
        创建第一个文档
      </Button>
      
      {/* 功能提示 */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📄</span>
          </div>
          <h4 className="font-medium mb-1">智能分类</h4>
          <p className="text-sm text-muted-foreground">
            自动按类型和项目组织文档
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔄</span>
          </div>
          <h4 className="font-medium mb-1">版本管理</h4>
          <p className="text-sm text-muted-foreground">
            追踪文档的每个版本变化
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🎯</span>
          </div>
          <h4 className="font-medium mb-1">智能命名</h4>
          <p className="text-sm text-muted-foreground">
            自动生成规范的文件名
          </p>
        </div>
      </div>
    </motion.div>
  )
}

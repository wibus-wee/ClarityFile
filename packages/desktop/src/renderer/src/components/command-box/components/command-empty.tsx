import { Command } from 'cmdk'
import { Search, FileQuestion } from 'lucide-react'
import { motion } from 'framer-motion'

interface CommandEmptyProps {
  searchQuery?: string
  className?: string
}

/**
 * Command Box 空状态组件
 * 当没有搜索结果或命令项目时显示
 */
export function CommandEmpty({ searchQuery, className }: CommandEmptyProps) {
  const hasSearchQuery = searchQuery && searchQuery.trim().length > 0
  
  return (
    <Command.Empty className={className}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center py-12 px-4 text-center"
      >
        {hasSearchQuery ? (
          <>
            {/* 搜索无结果 */}
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-2">
              未找到相关结果
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              没有找到与 "<span className="font-medium">{searchQuery}</span>" 相关的项目、文档或操作
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>尝试：</p>
              <ul className="mt-1 space-y-1">
                <li>• 检查拼写是否正确</li>
                <li>• 使用更简短的关键词</li>
                <li>• 尝试搜索项目名称或文档标题</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* 无可用命令 */}
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <FileQuestion className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-2">
              暂无可用操作
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              当前没有可用的命令或操作。请尝试搜索项目、文档或其他内容。
            </p>
          </>
        )}
      </motion.div>
    </Command.Empty>
  )
}

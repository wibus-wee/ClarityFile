import { useState } from 'react'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { 
  Search, 
  Clock,
  TrendingUp,
  Hash
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// 模拟的热门搜索和最近搜索
const popularSearches = [
  '商业计划书',
  '项目汇报',
  'PPT模板',
  '技术文档',
  '比赛资料'
]

const recentSearches = [
  '挑战杯',
  '创新创业',
  '专利申请'
]

export function QuickSearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // 这里可以实现实际的搜索逻辑
      console.log('搜索:', query)
      setSearchQuery('')
      setIsFocused(false)
    }
  }

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag)
    handleSearch(tag)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">快速搜索</h2>
      
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目、文档、标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchQuery)
              }
            }}
            className="pl-10 pr-4 h-11 bg-background border-border focus:border-primary/50 transition-colors"
          />
        </div>

        {/* 搜索建议下拉 */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 p-3"
            >
              <div className="space-y-3">
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-auto p-2"
                    onClick={() => handleSearch(searchQuery)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    搜索 "{searchQuery}"
                  </Button>
                )}
                
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">最近搜索</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {recentSearches.map((search) => (
                        <Badge
                          key={search}
                          variant="secondary"
                          className="cursor-pointer hover:bg-accent text-xs"
                          onClick={() => handleTagClick(search)}
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 热门搜索标签 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">热门搜索</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search) => (
            <motion.div
              key={search}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent hover:border-primary/50 transition-colors text-xs"
                onClick={() => handleTagClick(search)}
              >
                <Hash className="w-3 h-3 mr-1" />
                {search}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 搜索提示 */}
      <div className="p-3 bg-muted/30 rounded-lg border border-dashed border-border">
        <p className="text-xs text-muted-foreground">
          💡 提示：使用 <kbd className="px-1 py-0.5 bg-background border rounded text-xs">Cmd+K</kbd> 快速打开全局搜索
        </p>
      </div>
    </div>
  )
}

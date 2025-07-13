import { useState } from 'react'
import { Input } from '@clarity/shadcn/ui/input'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Search, Clock, TrendingUp, Hash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export function QuickSearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { t } = useTranslation('dashboard')

  // 从翻译中获取搜索数据
  const popularSearches = t('quickSearch.popularTags', { returnObjects: true }) as string[]
  const recentSearches = t('quickSearch.recentTags', { returnObjects: true }) as string[]

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
      <h2 className="text-xl font-semibold">{t('quickSearch.title')}</h2>

      {/* 搜索输入框 */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('quickSearch.placeholder')}
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
                    {t('quickSearch.searchFor')} &quot;{searchQuery}&quot;
                  </Button>
                )}

                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {t('quickSearch.recentSearches')}
                      </span>
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
          <span className="text-sm font-medium">{t('quickSearch.popularSearches')}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search) => (
            <motion.div key={search} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
          {t('quickSearch.tip')}{' '}
          <kbd className="px-1 py-0.5 bg-background border rounded text-xs">Cmd+K</kbd>{' '}
          {t('quickSearch.globalSearchShortcut')}
        </p>
      </div>
    </div>
  )
}

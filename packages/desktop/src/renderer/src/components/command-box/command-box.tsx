import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Command } from 'cmdk'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useCommandBox } from './stores/command-box-store'
import { useKeyboard, useSearchKeyboard } from './hooks/use-keyboard'
import { useSearch, useSearchActions } from './hooks/use-search'
import { CommandGroup } from './components/command-group'
import { CommandItem } from './components/command-item'
import { CommandEmpty } from './components/command-empty'
import { SearchResultItem } from './components/search-result-item'

/**
 * Command Box 主组件
 * 全功能的命令面板，支持搜索、导航、快捷操作等
 */
export function CommandBox() {
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const {
    isOpen,
    searchQuery,
    selectedIndex,
    close,
    setSearchQuery,
    setSelectedIndex,
    selectNext,
    selectPrevious,
    selectItem,
    getAllVisibleItems
  } = useCommandBox()

  // 搜索功能
  const { searchResults, isSearching, highlightText } = useSearch(searchQuery)
  const { executeSearchAction } = useSearchActions()

  // 获取显示的项目列表
  const allItems = searchQuery.trim()
    ? searchResults.map((result) => ({
        id: result.id,
        type: 'search-result' as const,
        title: result.title,
        description: result.description,
        icon: undefined,
        action: () => executeSearchAction(result),
        metadata: result
      }))
    : getAllVisibleItems()

  // 键盘导航
  const { handleKeyDown } = useKeyboard({
    selectedIndex,
    setSelectedIndex,
    totalItems: allItems.length,
    onSelect: selectItem,
    onClose: close
  })

  // 搜索输入框键盘处理
  const { handleKeyDown: handleSearchKeyDown } = useSearchKeyboard({
    onArrowDown: selectNext,
    onArrowUp: selectPrevious,
    onEnter: () => selectItem(selectedIndex),
    onEscape: close
  })

  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // 自动滚动到选中项目
  useEffect(() => {
    if (!isOpen || !listRef.current || allItems.length === 0) return

    // 使用更可靠的方式查找选中的元素
    const allCommandItems = listRef.current.querySelectorAll('[data-slot="command-item"]')
    const selectedElement = allCommandItems[selectedIndex] as HTMLElement

    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }, [selectedIndex, isOpen, allItems.length])

  // 全局键盘事件监听
  useEffect(() => {
    if (!isOpen) return

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // 如果焦点在输入框上，让输入框处理
      if (document.activeElement === inputRef.current) {
        return
      }

      handleKeyDown(event)
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isOpen, handleKeyDown])

  // 点击外部关闭
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      close()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94] // macOS 风格的缓动函数
        }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/20 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            y: -30
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: -20
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            mass: 0.8,
            opacity: { duration: 0.2 }
          }}
          style={{ willChange: 'transform, opacity' }} // GPU 加速
          className={cn(
            'w-full max-w-2xl mx-4',
            'bg-card/95 backdrop-blur-xl',
            'border border-border/20',
            'rounded-xl shadow-2xl',
            'overflow-hidden',
            // macOS 风格的阴影
            'shadow-black/10 dark:shadow-black/30'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Command className="bg-transparent">
            {/* 搜索输入框 */}
            <motion.div
              className="flex items-center gap-3 px-4 py-3 border-b border-border/10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 35,
                delay: 0.1
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 600,
                  damping: 25,
                  delay: 0.15
                }}
              >
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              </motion.div>
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="搜索项目、文档、操作..."
                className={cn(
                  'flex-1 bg-transparent',
                  'text-sm placeholder:text-muted-foreground',
                  'outline-none border-none',
                  'focus:outline-none focus:ring-0',
                  'transition-all duration-200'
                )}
              />
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30
                    }}
                  >
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 命令列表 */}
            <motion.div
              ref={listRef}
              className="max-h-[400px] overflow-y-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                delay: 0.2
              }}
            >
              <Command.List>
                {allItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                      delay: 0.3
                    }}
                  >
                    <CommandEmpty searchQuery={searchQuery} />
                  </motion.div>
                ) : (
                  <motion.div
                    className="py-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                      delay: 0.25
                    }}
                  >
                    {searchQuery.trim() ? (
                      // 搜索结果
                      <CommandGroup title={`搜索结果 (${allItems.length})`}>
                        {allItems.map((item, index) => (
                          <SearchResultItem
                            key={item.id}
                            item={item}
                            isSelected={index === selectedIndex}
                            onSelect={() => selectItem(index)}
                            highlightText={highlightText}
                          />
                        ))}
                      </CommandGroup>
                    ) : (
                      // 默认分组显示
                      <>
                        {/* 导航分组 */}
                        <CommandGroup title="导航" icon="navigation">
                          {allItems
                            .filter((item) => item.type === 'navigation')
                            .map((item) => {
                              const itemIndex = allItems.findIndex((i) => i.id === item.id)
                              return (
                                <CommandItem
                                  key={item.id}
                                  item={item}
                                  isSelected={itemIndex === selectedIndex}
                                  onSelect={() => selectItem(itemIndex)}
                                />
                              )
                            })}
                        </CommandGroup>

                        {/* 操作分组 */}
                        <CommandGroup title="操作" icon="action">
                          {allItems
                            .filter((item) => item.type === 'action')
                            .map((item) => {
                              const itemIndex = allItems.findIndex((i) => i.id === item.id)
                              return (
                                <CommandItem
                                  key={item.id}
                                  item={item}
                                  isSelected={itemIndex === selectedIndex}
                                  onSelect={() => selectItem(itemIndex)}
                                />
                              )
                            })}
                        </CommandGroup>

                        {/* 最近访问分组 */}
                        <CommandGroup title="最近访问" icon="recent">
                          {allItems
                            .filter((item) => item.type === 'recent')
                            .map((item) => {
                              const itemIndex = allItems.findIndex((i) => i.id === item.id)
                              return (
                                <CommandItem
                                  key={item.id}
                                  item={item}
                                  isSelected={itemIndex === selectedIndex}
                                  onSelect={() => selectItem(itemIndex)}
                                />
                              )
                            })}
                        </CommandGroup>
                      </>
                    )}
                  </motion.div>
                )}
              </Command.List>
            </motion.div>

            {/* 底部提示 */}
            <motion.div
              className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground bg-muted/20 border-t border-border/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: 0.35
              }}
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
                  导航
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
                  选择
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
                  关闭
                </span>
              </div>
              <div className="text-xs">{allItems.length} 个结果</div>
            </motion.div>
          </Command>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

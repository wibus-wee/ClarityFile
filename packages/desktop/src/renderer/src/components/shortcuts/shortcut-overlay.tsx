import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@renderer/lib/utils'
import type { ShortcutOverlayProps } from './types/shortcut.types'
import { useShortcutStore } from './stores/shortcut-store'
import { ShortcutDisplay } from './shortcut'

/**
 * 快捷键提示 Overlay 组件
 * 长按⌘键显示当前页面可用的快捷键
 */
export function ShortcutOverlay({ isVisible, className = '' }: ShortcutOverlayProps) {
  // 从 store 获取状态和数据
  const overlayState = useShortcutStore((state) => state.overlay)
  const getGroupedShortcuts = useShortcutStore((state) => state.getGroupedShortcuts)
  const hideOverlay = useShortcutStore((state) => state.hideOverlay)

  // 使用传入的 isVisible 或 store 中的状态
  const shouldShow = isVisible !== undefined ? isVisible : overlayState.isVisible

  // 获取分组的快捷键
  const shortcutGroups = getGroupedShortcuts()

  // 如果没有快捷键，不显示 overlay
  if (shortcutGroups.length === 0) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94] // macOS 风格的缓动函数
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={hideOverlay}
        >
          {/* Overlay 内容 */}
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
              'shadow-black/10 dark:shadow-black/30',
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题 */}
            <motion.div
              className="flex items-center justify-between p-6 pb-4 border-b border-border/10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 35,
                delay: 0.1
              }}
            >
              <h2 className="text-lg font-semibold text-foreground">可用快捷键</h2>
              <div className="text-xs text-muted-foreground">松开 ⌘ 键关闭</div>
            </motion.div>

            {/* 快捷键分组 */}
            <motion.div
              className="p-6 pt-4 space-y-6 max-h-[400px] overflow-y-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                delay: 0.2
              }}
            >
              {shortcutGroups.map((group, groupIndex) => (
                <motion.div
                  key={group.name}
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    delay: 0.25 + groupIndex * 0.05
                  }}
                >
                  {/* 分组标题 */}
                  <h3 className="text-sm font-medium text-muted-foreground border-b border-border/30 pb-1">
                    {group.name}
                  </h3>

                  {/* 分组内的快捷键 */}
                  <div className="space-y-1">
                    {group.shortcuts.map((shortcut, shortcutIndex) => (
                      <motion.div
                        key={shortcut.id}
                        className="flex items-center justify-between py-2.5 px-3 mx-1 rounded-lg hover:bg-accent/50 transition-all duration-150"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 35,
                          delay: 0.3 + groupIndex * 0.05 + shortcutIndex * 0.02
                        }}
                      >
                        {/* 快捷键描述 */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {shortcut.description || '未命名操作'}
                          </div>
                          {shortcut.scope !== 'global' && (
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">
                              作用域: {shortcut.scope}
                            </div>
                          )}
                        </div>

                        {/* 快捷键显示 */}
                        <div className="ml-4 flex-shrink-0">
                          <ShortcutDisplay
                            shortcut={shortcut.keys}
                            variant="key"
                            className="text-xs"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* 底部提示 */}
            <motion.div
              className="px-6 py-4 border-t border-border/10 bg-muted/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                delay: 0.4
              }}
            >
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘</kbd>
                  长按显示
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
                  关闭
                </span>
                <span>点击背景关闭</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * 快捷键提示 Hook
 * 提供便捷的 overlay 控制方法
 */
export function useShortcutOverlay() {
  const overlayState = useShortcutStore((state) => state.overlay)
  const showOverlay = useShortcutStore((state) => state.showOverlay)
  const hideOverlay = useShortcutStore((state) => state.hideOverlay)
  const startLongPress = useShortcutStore((state) => state.startLongPress)
  const cancelLongPress = useShortcutStore((state) => state.cancelLongPress)

  return {
    isVisible: overlayState.isVisible,
    isLongPressing: overlayState.isLongPressing,
    show: showOverlay,
    hide: hideOverlay,
    startLongPress,
    cancelLongPress
  }
}

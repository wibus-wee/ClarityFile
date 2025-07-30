import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@renderer/lib/utils'
import type { ShortcutOverlayProps } from './types/shortcut.types'
import { useShortcutStore } from './stores/shortcut-store'
import { ShortcutDisplay } from './shortcut'

/**
 * 快捷键提示 Overlay 组件
 * 长按⌘键显示当前页面可用的快捷键
 * 轻量级设计，固定在右下角，不遮挡主要内容
 */
export function ShortcutOverlay({ isVisible, className = '' }: ShortcutOverlayProps) {
  // 从 store 获取状态和数据
  const overlayState = useShortcutStore((state) => state.overlay)
  const getGroupedShortcuts = useShortcutStore((state) => state.getGroupedShortcuts)

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
          initial={{
            opacity: 0,
            x: 20,
            y: 20,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            x: 20,
            y: 10,
            scale: 0.98
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 35,
            mass: 0.6,
            opacity: { duration: 0.15 }
          }}
          style={{ willChange: 'transform, opacity' }} // GPU 加速
          className={cn(
            // 固定在右下角
            'fixed bottom-6 right-6 z-50',
            // 尺寸限制
            'w-80 max-h-[500px]',
            // 增强对比度的背景样式
            'bg-background/50 border border-border/50',
            'rounded-lg shadow-xl',
            // 增强的阴影效果，提供更好的层次感
            'shadow-black/10 dark:shadow-black/40',
            // 添加内阴影增强边界感
            'ring-1 ring-white/10 dark:ring-white/5',
            // 防止内容溢出
            'overflow-hidden',
            // 增强的毛玻璃效果
            'backdrop-filter backdrop-blur-md backdrop-saturate-150',
            // 自定义样式
            className
          )}
        >
          {/* 标题栏 */}
          <motion.div
            className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 600,
              damping: 40,
              delay: 0.05
            }}
          >
            <h3 className="text-sm font-semibold text-foreground">快捷键</h3>
            <div className="text-xs text-muted-foreground/80">松开 ⌘ 关闭</div>
          </motion.div>

          {/* 快捷键列表 */}
          <motion.div
            className="p-3 space-y-1 max-h-[420px] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 35,
              delay: 0.1
            }}
          >
            {shortcutGroups.map((group, groupIndex) => (
              <motion.div
                key={group.name}
                className="space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 35,
                  delay: 0.15 + groupIndex * 0.03
                }}
              >
                {/* 分组标题 - 更紧凑 */}
                {group.name !== 'default' && (
                  <div className="text-xs font-semibold text-muted-foreground/90 px-2 py-1 border-b border-border/30 mb-1">
                    {group.name}
                  </div>
                )}

                {/* 分组内的快捷键 - 紧凑布局 */}
                <div className="space-y-0.5">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <motion.div
                      key={shortcut.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-accent/50 hover:ring-1 hover:ring-accent/20 transition-all duration-150"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 600,
                        damping: 40,
                        delay: 0.18 + groupIndex * 0.03 + shortcutIndex * 0.01
                      }}
                    >
                      {/* 快捷键描述 */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">
                          {shortcut.description || '未命名操作'}
                        </div>
                      </div>

                      {/* 快捷键显示 */}
                      <div className="ml-3 flex-shrink-0">
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}

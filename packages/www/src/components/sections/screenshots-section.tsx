import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { AppScreenshot } from '../AppScreenshot'
import { ScreenshotContainer } from '../ScreenshotContainer'
import { Monitor, Palette, Zap } from 'lucide-react'

export function ScreenshotsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '5%'])
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.6, 0.2])

  return (
    <motion.section
      ref={sectionRef}
      className="relative py-32 px-6 overflow-hidden"
      style={{ y: backgroundY }}
    >
      {/* 简化的背景效果 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3"
        style={{ opacity: backgroundOpacity }}
      />

      {/* 更微妙的装饰元素 */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gradient-to-br from-blue-500/3 to-purple-500/3 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-br from-green-500/3 to-blue-500/3 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* 区块标题 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            直观的界面设计
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            简洁优雅的风格界面，让文档管理变得轻松愉悦。 支持浅色和深色主题，完美适配您的工作环境。
          </motion.p>
        </motion.div>

        {/* 截图展示 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <ScreenshotContainer className="w-full">
            <AppScreenshot className="w-full" alt="ClarityFile 应用界面展示" />
          </ScreenshotContainer>
        </motion.div>

        {/* 特性说明 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-100/80 border border-blue-200/50 dark:bg-blue-900/30 dark:border-blue-800/30 flex items-center justify-center">
              <Monitor className="w-6 h-6 rounded" />
            </div>
            <h3 className="text-lg font-semibold mb-2">响应式设计</h3>
            <p className="text-muted-foreground text-sm">
              完美适配各种屏幕尺寸，无论桌面还是移动设备
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-100/80 border border-purple-200/50 dark:bg-purple-900/30 dark:border-purple-800/30 flex items-center justify-center">
              <Palette className="w-6 h-6 rounded" />
            </div>
            <h3 className="text-lg font-semibold mb-2">主题切换</h3>
            <p className="text-muted-foreground text-sm">
              支持浅色、深色主题，跟随系统设置自动切换
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-green-100/80 border border-green-200/50 dark:bg-green-900/30 dark:border-green-800/30 flex items-center justify-center">
              <Zap className="w-6 h-6 rounded" />
            </div>
            <h3 className="text-lg font-semibold mb-2">流畅动画</h3>
            <p className="text-muted-foreground text-sm">精心设计的动画效果，提供丝滑的用户体验</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

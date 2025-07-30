import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

interface ScreenshotContainerProps {
  children: ReactNode
  className?: string
}

export function ScreenshotContainer({ children, className = '' }: ScreenshotContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 滚动视差效果
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  // 3D 变换效果 - 更微妙的角度
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8])
  const rotateY = useTransform(scrollYProgress, [0, 1], [-3, 3])
  const y = useTransform(scrollYProgress, [0, 1], ['5%', '-5%'])

  return (
    <div
      ref={containerRef}
      className={`relative perspective-1000 ${className}`}
      style={{ perspective: '1000px' }}
    >
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 渐变背景 */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
          style={{
            y: useTransform(scrollYProgress, [0, 1], ['0%', '20%']),
            opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3])
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-3xl"
          style={{
            y: useTransform(scrollYProgress, [0, 1], ['0%', '-20%']),
            opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3])
          }}
        />
      </div>

      {/* 主要内容容器 */}
      <motion.div
        className="relative z-10"
        style={{
          rotateX,
          rotateY,
          y,
          transformStyle: 'preserve-3d'
        }}
        whileHover={{
          transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
        }}
      >
        {/* 优化的阴影效果 */}
        <motion.div
          className="absolute inset-0 bg-black/10 dark:bg-black/30 rounded-xl blur-2xl"
          style={{
            transform: 'translateZ(-30px) translateY(15px)',
            opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.4, 0.2])
          }}
        />

        {/* 截图内容 */}
        <div className="relative">{children}</div>
      </motion.div>
    </div>
  )
}

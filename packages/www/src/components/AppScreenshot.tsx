import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

interface AppScreenshotProps {
  className?: string
  lightSrc?: string
  darkSrc?: string
  alt?: string
}

export function AppScreenshot({
  className = '',
  lightSrc = '/screenshots/app-screenshot-light.png',
  darkSrc = '/screenshots/app-screenshot-dark.png',
  alt = 'ClarityFile 应用截图'
}: AppScreenshotProps) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // 确保组件在客户端挂载后再渲染，避免 hydration 问题
  useEffect(() => {
    setMounted(true)
  }, [])

  // 确定当前应该显示的截图
  const getCurrentScreenshot = () => {
    if (!mounted) return lightSrc // 默认显示浅色截图

    const currentTheme = theme === 'system' ? systemTheme : theme
    return currentTheme === 'dark' ? darkSrc : lightSrc
  }

  const currentSrc = getCurrentScreenshot()

  // 预加载图片
  useEffect(() => {
    if (mounted) {
      const preloadImages = [lightSrc, darkSrc]
      preloadImages.forEach((src) => {
        const img = new Image()
        img.src = src
      })
    }
  }, [mounted, lightSrc, darkSrc])

  if (!mounted) {
    return (
      <div className={`bg-muted animate-pulse rounded-xl ${className}`}>
        <div className="aspect-[16/10] w-full" />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          className="w-full h-auto object-contain"
          initial={{ opacity: 0 }}
          animate={{
            opacity: imageLoaded ? 1 : 0
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          onLoad={() => setImageLoaded(true)}
        />
      </AnimatePresence>

      {/* 加载状态 */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-xl flex items-center justify-center">
          <div className="text-muted-foreground text-sm">加载中...</div>
        </div>
      )}
    </div>
  )
}

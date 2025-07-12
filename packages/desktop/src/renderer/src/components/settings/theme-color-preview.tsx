/**
 * 主题色彩预览组件
 * 显示主题的主要颜色
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ThemeColorExtractor } from '@renderer/lib/theme-color-extractor'

interface ThemeColorPreviewProps {
  cssContent: string
  className?: string
}

export function ThemeColorPreview({ cssContent, className = '' }: ThemeColorPreviewProps) {
  const previewColors = useMemo(() => {
    return ThemeColorExtractor.getPreviewColors(cssContent)
  }, [cssContent])

  if (previewColors.length === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {previewColors.slice(0, 5).map((color, index) => (
        <motion.div
          key={`${color}-${index}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: index * 0.05,
            type: 'spring',
            stiffness: 400,
            damping: 25
          }}
          className="w-3 h-3 rounded-full border border-border/50 shadow-sm"
          style={{ backgroundColor: color }}
          title={`颜色: ${color}`}
        />
      ))}
    </div>
  )
}

interface DetailedThemeColorPreviewProps {
  cssContent: string
  className?: string
}

export function DetailedThemeColorPreview({
  cssContent,
  className = ''
}: DetailedThemeColorPreviewProps) {
  const extractedColors = useMemo(() => {
    return ThemeColorExtractor.extractColors(cssContent)
  }, [cssContent])

  return (
    <div className={`flex flex-row gap-20 space-y-3 ${className}`}>
      {/* Light Mode Colors */}
      <div className="space-y-2 w-full">
        <h5 className="text-xs font-medium text-muted-foreground">浅色模式</h5>
        <div className="grid grid-cols-3 gap-2">
          <ColorSwatch
            label="主色"
            color={extractedColors.light.primary}
            textColor={extractedColors.light.foreground}
          />
          <ColorSwatch
            label="背景"
            color={extractedColors.light.background}
            textColor={extractedColors.light.foreground}
          />
          <ColorSwatch
            label="强调"
            color={extractedColors.light.accent}
            textColor={extractedColors.light.foreground}
          />
        </div>
      </div>

      {/* Dark Mode Colors */}
      <div className="space-y-2 w-full">
        <h5 className="text-xs font-medium text-muted-foreground">深色模式</h5>
        <div className="grid grid-cols-3 gap-2">
          <ColorSwatch
            label="主色"
            color={extractedColors.dark.primary}
            textColor={extractedColors.dark.foreground}
          />
          <ColorSwatch
            label="背景"
            color={extractedColors.dark.background}
            textColor={extractedColors.dark.foreground}
          />
          <ColorSwatch
            label="强调"
            color={extractedColors.dark.accent}
            textColor={extractedColors.dark.foreground}
          />
        </div>
      </div>
    </div>
  )
}

interface ColorSwatchProps {
  label: string
  color: string
  textColor: string
}

function ColorSwatch({ label, color, textColor }: ColorSwatchProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div
        className="w-full h-8 rounded border border-border/50 shadow-sm flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <span
          className="text-xs font-medium opacity-80 group-hover:opacity-100 transition-opacity"
          style={{ color: textColor }}
        >
          {label}
        </span>
      </div>
      <div className="absolute -bottom-5 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-muted-foreground bg-background/80 px-1 rounded">{color}</span>
      </div>
    </motion.div>
  )
}

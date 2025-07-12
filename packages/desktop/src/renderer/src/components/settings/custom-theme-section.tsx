/**
 * 自定义主题管理组件 - 简化版本
 * 集成到外观设置页面中
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Palette, Plus, Eye, Trash2, Download, Sparkles, Check, X } from 'lucide-react'

import { Button } from '@clarity/shadcn/ui/button'
import { Textarea } from '@clarity/shadcn/ui/textarea'
import { Input } from '@clarity/shadcn/ui/input'
import { Label } from '@clarity/shadcn/ui/label'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Separator } from '@clarity/shadcn/ui/separator'

import { useTheme } from '@renderer/hooks/use-theme'
import { ThemeImportUtils } from '@renderer/lib/theme-import-utils'
import { SettingsSection } from './components'

export function CustomThemeSection() {
  const {
    customThemes,
    activeCustomTheme,
    applyCustomTheme,
    removeCustomTheme,
    saveCustomTheme,
    previewTheme,
    clearPreview,
    hasCustomTheme,
    switchToDefaultTheme
  } = useTheme()

  const [showImportForm, setShowImportForm] = useState(false)
  const [cssContent, setCssContent] = useState('')
  const [themeName, setThemeName] = useState('')
  const [themeDescription, setThemeDescription] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  // 处理主题导入
  const handleImportTheme = async () => {
    if (!cssContent.trim() || !themeName.trim()) {
      toast.error('请输入主题名称和 CSS 内容')
      return
    }

    setIsImporting(true)
    try {
      const result = await ThemeImportUtils.importFromCSS(cssContent, themeName, {
        description: themeDescription || undefined,
        author: 'User'
      })

      if (result.success) {
        toast.success(`主题 "${themeName}" 导入成功！`)
        setCssContent('')
        setThemeName('')
        setThemeDescription('')
        setShowImportForm(false)
        clearPreview()
        setIsPreviewing(false)
      } else {
        toast.error(result.error || '导入失败')
      }
    } catch (error) {
      toast.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsImporting(false)
    }
  }

  // 处理主题预览
  const handlePreviewTheme = () => {
    if (!cssContent.trim()) {
      toast.error('请输入 CSS 内容进行预览')
      return
    }

    try {
      previewTheme(cssContent)
      setIsPreviewing(true)
      toast.success('预览已应用')
    } catch (error) {
      toast.error('预览失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  // 处理清除预览
  const handleClearPreview = () => {
    clearPreview()
    setIsPreviewing(false)
    toast.success('预览已清除')
  }

  // 处理应用主题
  const handleApplyTheme = async (themeId: string) => {
    try {
      await applyCustomTheme(themeId)
      toast.success('主题已应用')
    } catch (error) {
      toast.error('应用失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  // 处理删除主题
  const handleDeleteTheme = async (themeId: string) => {
    try {
      await removeCustomTheme(themeId)
      toast.success('主题已删除')
    } catch (error) {
      toast.error('删除失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  // 处理导出主题
  const handleExportTheme = async (themeId: string) => {
    try {
      const theme = customThemes.find((t) => t.id === themeId)
      if (!theme) {
        toast.error('主题不存在')
        return
      }

      const exportData = JSON.stringify(theme, null, 2)
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `${theme.name.replace(/[^a-zA-Z0-9]/g, '-')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('主题已导出')
    } catch (error) {
      toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  // 处理切回默认主题
  const handleSwitchToDefault = async () => {
    try {
      await switchToDefaultTheme()
      toast.success('已切换到默认主题')
    } catch (error) {
      toast.error('切换失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  // 加载主题模板
  const handleLoadTemplate = () => {
    const template = ThemeImportUtils.generateThemeTemplate('我的自定义主题')
    setCssContent(template)
    setThemeName('我的自定义主题')
    setThemeDescription('基于默认模板的自定义主题')
    toast.success('主题模板已加载')
  }

  return (
    <SettingsSection title="自定义主题" description="导入和管理您的自定义主题">
      <div className="space-y-4">
        {/* 当前状态显示 */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm">
                {hasCustomTheme
                  ? `当前使用自定义主题 (${customThemes.length} 个可用)`
                  : `${customThemes.length} 个自定义主题可用`}
              </span>
              {hasCustomTheme && (
                <span className="text-xs text-muted-foreground">
                  自定义主题会覆盖上方的基础主题设置
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasCustomTheme && (
              <Button size="sm" variant="ghost" onClick={handleSwitchToDefault} type="button">
                切回默认
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowImportForm(!showImportForm)}
              type="button"
            >
              <Plus className="w-4 h-4 mr-1" />
              {showImportForm ? '收起' : '导入主题'}
            </Button>
          </div>
        </div>

        {/* 主题导入表单 */}
        <AnimatePresence>
          {showImportForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border rounded-lg p-4 bg-card"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme-name">主题名称</Label>
                    <Input
                      id="theme-name"
                      value={themeName}
                      onChange={(e) => setThemeName(e.target.value)}
                      placeholder="例如：Ocean Blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme-description">描述 (可选)</Label>
                    <Input
                      id="theme-description"
                      value={themeDescription}
                      onChange={(e) => setThemeDescription(e.target.value)}
                      placeholder="主题描述"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="css-content">CSS 内容</Label>
                  <Textarea
                    id="css-content"
                    value={cssContent}
                    onChange={(e) => setCssContent(e.target.value)}
                    placeholder="粘贴您的主题 CSS 代码..."
                    className="min-h-[100px] max-h-[200px] font-mono text-sm resize-none border-dashed bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={handleImportTheme}
                    disabled={isImporting || !cssContent.trim() || !themeName.trim()}
                    size="sm"
                    type="button"
                  >
                    {isImporting ? '导入中...' : '导入主题'}
                  </Button>
                  <Button
                    onClick={handlePreviewTheme}
                    variant="outline"
                    disabled={!cssContent.trim()}
                    size="sm"
                    type="button"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    预览
                  </Button>
                  {isPreviewing && (
                    <Button onClick={handleClearPreview} variant="outline" size="sm" type="button">
                      <X className="w-4 h-4 mr-1" />
                      清除预览
                    </Button>
                  )}
                  <Button onClick={handleLoadTemplate} variant="ghost" size="sm" type="button">
                    <Sparkles className="w-4 h-4 mr-1" />
                    加载模板
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 主题列表 */}
        {customThemes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">已保存的主题</h4>
              <div className="space-y-2">
                <AnimatePresence>
                  {customThemes.map((theme) => (
                    <motion.div
                      key={theme.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium truncate">{theme.name}</h5>
                          {activeCustomTheme === theme.id && (
                            <Badge variant="default" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              已应用
                            </Badge>
                          )}
                        </div>
                        {theme.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {theme.description}
                          </p>
                        )}
                        {theme.author && (
                          <p className="text-xs text-muted-foreground">作者: {theme.author}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApplyTheme(theme.id)}
                          disabled={activeCustomTheme === theme.id}
                          title={activeCustomTheme === theme.id ? '已应用' : '应用主题'}
                        >
                          <Palette className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExportTheme(theme.id)}
                          title="导出主题"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTheme(theme.id)}
                          title="删除主题"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>
    </SettingsSection>
  )
}

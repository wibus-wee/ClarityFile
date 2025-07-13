/**
 * 自定义主题管理组件 - 简化版本
 * 集成到外观设置页面中
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Palette, Plus, Eye, Trash2, Download, Sparkles, Check, X, Edit } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@clarity/shadcn/ui/button'
import { Textarea } from '@clarity/shadcn/ui/textarea'
import { Input } from '@clarity/shadcn/ui/input'
import { Label } from '@clarity/shadcn/ui/label'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Separator } from '@clarity/shadcn/ui/separator'

import { useTheme } from '@renderer/hooks/use-theme'
import { ThemeImportUtils } from '@renderer/lib/theme-import-utils'
import { SettingsSection } from './components'
import { ThemeColorPreview, DetailedThemeColorPreview } from './theme-color-preview'
import { FontDetectionDisplay } from './font-detection-display'
import type { CustomTheme } from '@renderer/types/theme'
import { formatFriendlyDate } from '@renderer/lib/i18n-formatters'

export function CustomThemeSection() {
  const { t } = useTranslation('settings')
  const { t: tCommon } = useTranslation('common')
  const {
    customThemes,
    activeCustomTheme,
    applyCustomTheme,
    removeCustomTheme,
    saveCustomTheme,
    updateCustomTheme,
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

  // 编辑相关状态
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null)
  const [editCssContent, setEditCssContent] = useState('')
  const [editThemeName, setEditThemeName] = useState('')
  const [editThemeDescription, setEditThemeDescription] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // 处理主题导入
  const handleImportTheme = async () => {
    if (!cssContent.trim() || !themeName.trim()) {
      toast.error(t('appearance.customTheme.errors.nameAndCssRequired'))
      return
    }

    setIsImporting(true)
    try {
      // 验证 CSS 内容
      const validation = ThemeImportUtils.validateThemeCSS(cssContent)
      if (!validation.isValid) {
        toast.error(
          t('appearance.customTheme.errors.validationFailed', {
            errors: validation.errors.join(', ')
          })
        )
        return
      }

      // 检查主题名称是否已存在
      const nameExists = customThemes.some(
        (theme) => theme.name.toLowerCase() === themeName.toLowerCase()
      )
      if (nameExists) {
        toast.error(t('appearance.customTheme.errors.nameExists'))
        return
      }

      // 使用 provider 的 saveCustomTheme 方法，这样会自动更新本地状态
      await saveCustomTheme({
        name: themeName,
        description: themeDescription || undefined,
        cssContent
      })
      setCssContent('')
      setThemeName('')
      setThemeDescription('')
      setShowImportForm(false)
      clearPreview()
      setIsPreviewing(false)
    } catch (error) {
      toast.error(
        t('appearance.customTheme.errors.importFailed', {
          error: error instanceof Error ? error.message : tCommon('unknownError')
        })
      )
    } finally {
      setIsImporting(false)
    }
  }

  // 处理主题预览
  const handlePreviewTheme = () => {
    if (!cssContent.trim()) {
      toast.error(t('appearance.customTheme.errors.cssRequired'))
      return
    }

    try {
      previewTheme(cssContent)
      setIsPreviewing(true)
    } catch (error) {
      toast.error(
        t('appearance.customTheme.errors.previewFailed', {
          error: error instanceof Error ? error.message : tCommon('unknownError')
        })
      )
    }
  }

  // 处理清除预览
  const handleClearPreview = () => {
    clearPreview()
    setIsPreviewing(false)
  }

  // 处理应用主题
  const handleApplyTheme = async (themeId: string) => {
    try {
      await applyCustomTheme(themeId)
    } catch (error) {
      toast.error(
        t('appearance.customTheme.errors.applyFailed', {
          error: error instanceof Error ? error.message : tCommon('unknownError')
        })
      )
    }
  }

  // 处理删除主题
  const handleDeleteTheme = async (themeId: string) => {
    try {
      await removeCustomTheme(themeId)
    } catch (error) {
      toast.error(
        t('appearance.customTheme.errors.deleteFailed', {
          error: error instanceof Error ? error.message : tCommon('unknownError')
        })
      )
    }
  }

  // 处理导出主题
  const handleExportTheme = async (themeId: string) => {
    try {
      const theme = customThemes.find((t) => t.id === themeId)
      if (!theme) {
        toast.error(t('appearance.customTheme.errors.themeNotFound'))
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
    } catch (error) {
      toast.error(
        t('appearance.customTheme.errors.exportFailed', {
          error: error instanceof Error ? error.message : tCommon('unknownError')
        })
      )
    }
  }

  // 处理切回默认主题
  const handleSwitchToDefault = async () => {
    try {
      await switchToDefaultTheme()
    } catch (error) {
      toast.error(
        t('appearance.customTheme.errors.switchFailed', {
          error: error instanceof Error ? error.message : tCommon('unknownError')
        })
      )
    }
  }

  // 开始编辑主题
  const handleStartEdit = (theme: CustomTheme) => {
    // 如果正在编辑其他主题，先取消
    if (editingThemeId && editingThemeId !== theme.id) {
      handleCancelEdit()
    }

    setEditingThemeId(theme.id)
    setEditThemeName(theme.name)
    setEditThemeDescription(theme.description || '')
    setEditCssContent(theme.cssContent)
    setShowImportForm(false) // 关闭导入表单
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingThemeId(null)
    setEditThemeName('')
    setEditThemeDescription('')
    setEditCssContent('')
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingThemeId || !editThemeName.trim() || !editCssContent.trim()) {
      toast.error(t('appearance.customTheme.errors.completeInfo'))
      return
    }

    setIsUpdating(true)
    try {
      // 验证 CSS 内容
      const validation = ThemeImportUtils.validateThemeCSS(editCssContent)
      if (!validation.isValid) {
        toast.error(
          t('appearance.customTheme.errors.validationFailed', {
            errors: validation.errors.join(', ')
          })
        )
        return
      }

      // 检查名称是否与其他主题重复
      const nameExists = customThemes.some(
        (theme) =>
          theme.id !== editingThemeId && theme.name.toLowerCase() === editThemeName.toLowerCase()
      )
      if (nameExists) {
        toast.error(t('appearance.customTheme.errors.nameExists'))
        return
      }

      await updateCustomTheme(editingThemeId, {
        name: editThemeName,
        description: editThemeDescription || undefined,
        cssContent: editCssContent
      })
      handleCancelEdit()
    } catch (error) {
      toast.error(
        t('appearance.customTheme.errors.updateFailed', {
          error: error instanceof Error ? error.message : tCommon('unknownError')
        })
      )
    } finally {
      setIsUpdating(false)
    }
  }

  // 获取主题时间信息
  const getThemeTimeInfo = (theme: CustomTheme) => {
    const createdTime = new Date(theme.createdAt).getTime()
    const updatedTime = new Date(theme.updatedAt).getTime()

    // 如果更新时间比创建时间晚超过1分钟，显示更新时间
    if (updatedTime - createdTime > 60000) {
      return `${formatFriendlyDate(theme.updatedAt)}${t('appearance.customTheme.updated')}`
    } else {
      return `${formatFriendlyDate(theme.createdAt)}${t('appearance.customTheme.created')}`
    }
  }

  // 加载主题模板
  const handleLoadTemplate = () => {
    const templateName = t('appearance.customTheme.themeName')
    const template = ThemeImportUtils.generateThemeTemplate(templateName)
    setCssContent(template)
    setThemeName(templateName)
    setThemeDescription(t('appearance.customTheme.sectionDescription'))
  }

  return (
    <SettingsSection
      title={t('appearance.customTheme.title')}
      description={t('appearance.customTheme.sectionDescription')}
    >
      <div className="space-y-4">
        {/* 当前状态显示 */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm">
                {hasCustomTheme
                  ? t('appearance.customTheme.currentStatus', { count: customThemes.length })
                  : t('appearance.customTheme.availableThemes', { count: customThemes.length })}
              </span>
              {hasCustomTheme && (
                <span className="text-xs text-muted-foreground">
                  {t('appearance.customTheme.overrideNotice')}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasCustomTheme && (
              <Button size="sm" variant="ghost" onClick={handleSwitchToDefault} type="button">
                {t('appearance.customTheme.switchToDefault')}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowImportForm(!showImportForm)}
              type="button"
            >
              <Plus className="w-4 h-4 mr-1" />
              {showImportForm
                ? t('appearance.customTheme.collapse')
                : t('appearance.customTheme.importTheme')}
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
                    <Label htmlFor="theme-name">{t('appearance.customTheme.themeName')}</Label>
                    <Input
                      id="theme-name"
                      value={themeName}
                      onChange={(e) => setThemeName(e.target.value)}
                      placeholder={t('appearance.customTheme.themeNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme-description">
                      {t('appearance.customTheme.themeDescription')}
                    </Label>
                    <Input
                      id="theme-description"
                      value={themeDescription}
                      onChange={(e) => setThemeDescription(e.target.value)}
                      placeholder={t('appearance.customTheme.descriptionPlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="css-content">{t('appearance.customTheme.cssContent')}</Label>
                  <Textarea
                    id="css-content"
                    value={cssContent}
                    onChange={(e) => setCssContent(e.target.value)}
                    placeholder={t('appearance.customTheme.cssContentPlaceholder')}
                    className="min-h-[100px] max-h-[200px] font-mono text-sm resize-none border-dashed bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>

                {/* 智能字体检测显示 */}
                {cssContent.trim() && <FontDetectionDisplay cssContent={cssContent} />}

                {/* 色彩预览 */}
                {cssContent.trim() && (
                  <div className="p-3 border rounded-lg bg-muted/20">
                    <h5 className="text-sm font-medium mb-2">
                      {t('appearance.customTheme.colorPreview')}
                    </h5>
                    <DetailedThemeColorPreview cssContent={cssContent} />
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={handleImportTheme}
                    disabled={isImporting || !cssContent.trim() || !themeName.trim()}
                    size="sm"
                    type="button"
                  >
                    {isImporting
                      ? t('appearance.customTheme.importing')
                      : t('appearance.customTheme.importTheme')}
                  </Button>
                  <Button
                    onClick={handlePreviewTheme}
                    variant="outline"
                    disabled={!cssContent.trim()}
                    size="sm"
                    type="button"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t('appearance.customTheme.preview')}
                  </Button>
                  {isPreviewing && (
                    <Button onClick={handleClearPreview} variant="outline" size="sm" type="button">
                      <X className="w-4 h-4 mr-1" />
                      {t('appearance.customTheme.clearPreview')}
                    </Button>
                  )}
                  <Button onClick={handleLoadTemplate} variant="ghost" size="sm" type="button">
                    <Sparkles className="w-4 h-4 mr-1" />
                    {t('appearance.customTheme.loadTemplate')}
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
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('appearance.customTheme.savedThemes')}
              </h4>
              <div className="space-y-2">
                <AnimatePresence>
                  {customThemes.map((theme) => (
                    <motion.div
                      key={theme.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border rounded-lg bg-card"
                    >
                      {editingThemeId === theme.id ? (
                        // 编辑模式
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`edit-name-${theme.id}`}>
                                {t('appearance.customTheme.themeName')}
                              </Label>
                              <Input
                                id={`edit-name-${theme.id}`}
                                value={editThemeName}
                                onChange={(e) => setEditThemeName(e.target.value)}
                                placeholder={t('appearance.customTheme.themeNamePlaceholder')}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edit-desc-${theme.id}`}>
                                {t('appearance.customTheme.themeDescription')}
                              </Label>
                              <Input
                                id={`edit-desc-${theme.id}`}
                                value={editThemeDescription}
                                onChange={(e) => setEditThemeDescription(e.target.value)}
                                placeholder={t('appearance.customTheme.descriptionPlaceholder')}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`edit-css-${theme.id}`}>
                              {t('appearance.customTheme.cssContent')}
                            </Label>
                            <Textarea
                              id={`edit-css-${theme.id}`}
                              value={editCssContent}
                              onChange={(e) => setEditCssContent(e.target.value)}
                              placeholder={t('appearance.customTheme.cssContentPlaceholder')}
                              className="min-h-[100px] max-h-[200px] font-mono text-sm resize-none border-dashed bg-muted/20 focus:bg-background transition-colors"
                            />
                          </div>

                          {/* 智能字体检测显示 */}
                          {editCssContent.trim() && (
                            <FontDetectionDisplay cssContent={editCssContent} />
                          )}

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={handleSaveEdit}
                              disabled={
                                isUpdating || !editThemeName.trim() || !editCssContent.trim()
                              }
                              size="sm"
                              type="button"
                            >
                              {isUpdating
                                ? t('appearance.customTheme.saving')
                                : t('appearance.customTheme.save')}
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              variant="outline"
                              size="sm"
                              type="button"
                            >
                              {t('appearance.customTheme.cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // 正常显示模式
                        <div className="flex items-center justify-between p-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium truncate">{theme.name}</h5>
                              {activeCustomTheme === theme.id && (
                                <Badge variant="default" className="text-xs">
                                  <Check className="w-3 h-3 mr-1" />
                                  {t('appearance.customTheme.applied')}
                                </Badge>
                              )}
                            </div>

                            {/* 色彩预览 */}
                            <div className="flex items-center gap-2 mt-1 mb-2">
                              <ThemeColorPreview cssContent={theme.cssContent} />
                              <span className="text-xs text-muted-foreground">
                                {t('appearance.customTheme.themeColors')}
                              </span>
                            </div>

                            {theme.description && (
                              <p className="text-xs text-muted-foreground truncate mb-2">
                                {theme.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {getThemeTimeInfo(theme)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApplyTheme(theme.id)}
                              disabled={activeCustomTheme === theme.id}
                              title={
                                activeCustomTheme === theme.id
                                  ? t('appearance.customTheme.applied')
                                  : t('appearance.customTheme.applyTheme')
                              }
                            >
                              <Palette className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEdit(theme)}
                              title={t('appearance.customTheme.editTheme')}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExportTheme(theme.id)}
                              title={t('appearance.customTheme.exportTheme')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTheme(theme.id)}
                              title={t('appearance.customTheme.deleteTheme')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
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

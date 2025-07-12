/**
 * 主题演示组件
 * 用于测试和演示 Phase 1 自定义主题功能
 */

import { useState } from 'react'
import { Button } from '@clarity/shadcn/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@clarity/shadcn/ui/card'
import { Textarea } from '@clarity/shadcn/ui/textarea'
import { Input } from '@clarity/shadcn/ui/input'
import { Label } from '@clarity/shadcn/ui/label'
import { useTheme } from '@renderer/hooks/use-theme'
import { ThemeImportUtils } from '@renderer/lib/theme-import-utils'
import { ThemeTestSuite } from '@renderer/lib/theme-test'

export function ThemeDemo() {
  const {
    customThemes,
    activeCustomTheme,
    applyCustomTheme,
    removeCustomTheme,
    previewTheme,
    clearPreview,
    hasCustomTheme
  } = useTheme()

  const [cssContent, setCssContent] = useState('')
  const [themeName, setThemeName] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState('')

  // 处理主题导入
  const handleImportTheme = async () => {
    if (!cssContent.trim() || !themeName.trim()) {
      setMessage('请输入主题名称和 CSS 内容')
      return
    }

    setIsImporting(true)
    try {
      const result = await ThemeImportUtils.importFromCSS(cssContent, themeName, {
        description: '通过演示组件导入的主题',
        author: 'Demo User'
      })

      if (result.success) {
        setMessage(`✅ 主题 "${themeName}" 导入成功！`)
        setCssContent('')
        setThemeName('')
      } else {
        setMessage(`❌ 导入失败: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ 导入失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsImporting(false)
    }
  }

  // 处理主题预览
  const handlePreviewTheme = () => {
    if (!cssContent.trim()) {
      setMessage('请输入 CSS 内容进行预览')
      return
    }

    try {
      previewTheme(cssContent)
      setMessage('🎨 主题预览已应用，刷新页面可恢复原始主题')
    } catch (error) {
      setMessage(`❌ 预览失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 处理清除预览
  const handleClearPreview = () => {
    clearPreview()
    setMessage('🔄 预览已清除')
  }

  // 处理应用主题
  const handleApplyTheme = async (themeId: string) => {
    try {
      await applyCustomTheme(themeId)
      setMessage(`✅ 主题已应用`)
    } catch (error) {
      setMessage(`❌ 应用失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 处理删除主题
  const handleDeleteTheme = async (themeId: string) => {
    try {
      await removeCustomTheme(themeId)
      setMessage(`🗑️ 主题已删除`)
    } catch (error) {
      setMessage(`❌ 删除失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 运行测试套件
  const handleRunTests = async () => {
    setMessage('🧪 正在运行测试套件...')
    try {
      const result = await ThemeTestSuite.runFullTestSuite()
      setMessage(result ? '✅ 所有测试通过！' : '❌ 部分测试失败，请查看控制台')
    } catch (error) {
      setMessage(`❌ 测试失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 创建示例主题
  const handleCreateSamples = async () => {
    setMessage('🎨 正在创建示例主题...')
    try {
      const themes = await ThemeTestSuite.createSampleThemes()
      setMessage(`✅ 创建了 ${themes.length} 个示例主题`)
    } catch (error) {
      setMessage(`❌ 创建失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 加载模板
  const handleLoadTemplate = () => {
    const template = ThemeImportUtils.generateThemeTemplate('我的自定义主题')
    setCssContent(template)
    setThemeName('我的自定义主题')
    setMessage('📝 主题模板已加载')
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>自定义主题管理系统演示</CardTitle>
          <CardDescription>
            Phase 1 核心功能测试 - 当前有 {customThemes.length} 个自定义主题
            {hasCustomTheme && ` (激活: ${activeCustomTheme})`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 消息显示 */}
          {message && (
            <div className="p-3 bg-muted rounded-md text-sm">
              {message}
            </div>
          )}

          {/* 测试按钮 */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleRunTests} variant="outline">
              🧪 运行测试套件
            </Button>
            <Button onClick={handleCreateSamples} variant="outline">
              🎨 创建示例主题
            </Button>
            <Button onClick={handleLoadTemplate} variant="outline">
              📝 加载主题模板
            </Button>
            <Button onClick={handleClearPreview} variant="outline">
              🔄 清除预览
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 主题导入 */}
      <Card>
        <CardHeader>
          <CardTitle>导入自定义主题</CardTitle>
          <CardDescription>
            输入主题名称和 CSS 内容来创建新的自定义主题
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="css-content">CSS 内容</Label>
            <Textarea
              id="css-content"
              value={cssContent}
              onChange={(e) => setCssContent(e.target.value)}
              placeholder="粘贴您的主题 CSS 代码..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleImportTheme} 
              disabled={isImporting || !cssContent.trim() || !themeName.trim()}
            >
              {isImporting ? '导入中...' : '💾 导入主题'}
            </Button>
            <Button 
              onClick={handlePreviewTheme} 
              variant="outline"
              disabled={!cssContent.trim()}
            >
              👁️ 预览主题
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 主题列表 */}
      <Card>
        <CardHeader>
          <CardTitle>已保存的主题</CardTitle>
          <CardDescription>
            管理您的自定义主题
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customThemes.length === 0 ? (
            <p className="text-muted-foreground">暂无自定义主题</p>
          ) : (
            <div className="space-y-3">
              {customThemes.map((theme) => (
                <div
                  key={theme.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{theme.name}</h4>
                    {theme.description && (
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                    )}
                    {theme.author && (
                      <p className="text-xs text-muted-foreground">作者: {theme.author}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApplyTheme(theme.id)}
                      disabled={activeCustomTheme === theme.id}
                    >
                      {activeCustomTheme === theme.id ? '✅ 已应用' : '🎨 应用'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTheme(theme.id)}
                    >
                      🗑️ 删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

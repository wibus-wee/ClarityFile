import React from 'react'
import { useTranslation } from 'react-i18next'
import { Command, Zap, Package, Hash, MousePointer, Eye, Brain, RotateCcw } from 'lucide-react'
import { SettingsSection, SettingsSliderField } from './components'
import { useRegisteredPlugins } from '@renderer/components/command-palette/plugins/plugin-registry'
import { usePluginCommands } from '@renderer/components/command-palette/hooks/use-plugin-commands'
import { useRecommendationConfig } from '@renderer/components/command-palette/hooks/use-recommendation-config'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@clarity/shadcn/ui/card'
import { Button } from '@clarity/shadcn/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@clarity/shadcn/ui/form'
import { toast } from 'sonner'

// 推荐配置 Schema
const recommendationConfigSchema = z.object({
  frequencyWeight: z.number().min(0).max(1),
  recencyWeight: z.number().min(0).max(1),
  contextWeight: z.number().min(0).max(1),
  decayHalfLife: z.number().min(1).max(30),
  maxSuggestions: z.number().min(1).max(10)
})

type RecommendationConfigForm = z.infer<typeof recommendationConfigSchema>

export function FeaturesSettings() {
  const { t } = useTranslation('settings')
  const registeredPlugins = useRegisteredPlugins()
  const pluginCommands = usePluginCommands()

  // 推荐配置管理
  const { config, updateConfig, resetConfig, isUpdating, isResetting } = useRecommendationConfig()

  // 推荐配置表单
  const recommendationForm = useForm<RecommendationConfigForm>({
    resolver: zodResolver(recommendationConfigSchema),
    defaultValues: {
      frequencyWeight: config.frequencyWeight,
      recencyWeight: config.recencyWeight,
      contextWeight: config.contextWeight,
      decayHalfLife: config.decayHalfLife,
      maxSuggestions: config.maxSuggestions
    }
  })

  // 监听配置变化，更新表单默认值
  React.useEffect(() => {
    recommendationForm.reset({
      frequencyWeight: config.frequencyWeight,
      recencyWeight: config.recencyWeight,
      contextWeight: config.contextWeight,
      decayHalfLife: config.decayHalfLife,
      maxSuggestions: config.maxSuggestions
    })
  }, [config, recommendationForm])

  // 保存推荐配置
  const handleSaveRecommendationConfig = async (data: RecommendationConfigForm) => {
    try {
      await updateConfig(data)
      toast.success(t('recommendationConfig.updateSuccess'))
    } catch (error) {
      toast.error(t('recommendationConfig.updateError'))
    }

    // 重置推荐配置
    const handleResetRecommendationConfig = async () => {
      try {
        await resetConfig()
        toast.success(t('recommendationConfig.resetSuccess'))
      } catch (error) {
        toast.error(t('recommendationConfig.resetError'))
      }
    }

    return (
      <div className="space-y-6">
        {/* 命令面板概览 */}
        <SettingsSection
          title={t('features.commandPalette.title')}
          description={t('features.commandPalette.description')}
        >
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Command className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{t('features.commandPalette.title')}</h3>
              <p className="text-sm text-muted-foreground">
                快捷键: <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">⌘K</kbd> 或{' '}
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+K</kbd>
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* 智能推荐配置 */}
        <SettingsSection
          title={t('features.recommendation.title')}
          description={t('features.recommendation.description')}
          showSeparator={true}
        >
          <Form {...recommendationForm}>
            <form
              onSubmit={recommendationForm.handleSubmit(handleSaveRecommendationConfig)}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{t('features.recommendation.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('features.recommendation.description')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetRecommendationConfig}
                    disabled={isResetting}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    重置
                  </Button>
                  <Button type="submit" size="sm" disabled={isUpdating}>
                    保存配置
                  </Button>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">权重配置</h4>
                  <div className="grid gap-4">
                    <SettingsSliderField
                      control={recommendationForm.control}
                      name="frequencyWeight"
                      label="使用频率权重"
                      description="基于命令使用频率的推荐权重"
                      min={0}
                      max={1}
                      step={0.1}
                      formatValue={(value) => `${Math.round(value * 100)}%`}
                    />

                    <SettingsSliderField
                      control={recommendationForm.control}
                      name="recencyWeight"
                      label="时间衰减权重"
                      description="基于最近使用时间的推荐权重"
                      min={0}
                      max={1}
                      step={0.1}
                      formatValue={(value) => `${Math.round(value * 100)}%`}
                    />

                    <SettingsSliderField
                      control={recommendationForm.control}
                      name="contextWeight"
                      label="上下文权重"
                      description="基于使用场景和时间段的推荐权重"
                      min={0}
                      max={1}
                      step={0.1}
                      formatValue={(value) => `${Math.round(value * 100)}%`}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">算法参数</h4>
                  <div className="grid gap-4">
                    <SettingsSliderField
                      control={recommendationForm.control}
                      name="decayHalfLife"
                      label="时间衰减半衰期"
                      description="命令推荐权重减半的天数"
                      min={1}
                      max={30}
                      step={1}
                      formatValue={(value) => `${value} 天`}
                    />

                    <SettingsSliderField
                      control={recommendationForm.control}
                      name="maxSuggestions"
                      label="最大推荐数量"
                      description="在建议区域显示的最大命令数量"
                      min={1}
                      max={10}
                      step={1}
                      formatValue={(value) => `${value} 个`}
                    />
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </SettingsSection>

        {/* 插件管理 */}
        <SettingsSection
          title="插件管理"
          description="查看当前注册的命令面板插件和它们发布的命令"
          showSeparator={true}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>
                已注册 {registeredPlugins.length} 个插件，发布了 {pluginCommands.length} 个命令
              </span>
            </div>

            {registeredPlugins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>暂无注册的插件</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {registeredPlugins.map((plugin) => {
                  const commands = pluginCommands.filter((cmd) => cmd.pluginId === plugin.id)
                  return (
                    <Card key={plugin.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                              <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{plugin.name}</CardTitle>
                              <CardDescription className="text-sm">
                                {plugin.description}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            ID: {plugin.id}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Hash className="h-4 w-4" />
                            <span>发布了 {commands.length} 个命令</span>
                          </div>

                          {commands.length > 0 && (
                            <div className="space-y-2">
                              {commands.map((command) => (
                                <div
                                  key={command.id}
                                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    {command.icon && (
                                      <command.icon className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm">{command.title}</div>
                                      {command.subtitle && (
                                        <div className="text-xs text-muted-foreground truncate">
                                          {command.subtitle}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {'action' in command ? (
                                      <Badge variant="outline" className="text-xs">
                                        <MousePointer className="h-3 w-3 mr-1" />
                                        Action
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs">
                                        <Eye className="h-3 w-3 mr-1" />
                                        Render
                                      </Badge>
                                    )}
                                    {command.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {command.category}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </SettingsSection>
      </div>
    )
  }

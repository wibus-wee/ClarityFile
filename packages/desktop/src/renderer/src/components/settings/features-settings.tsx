import { useTranslation } from 'react-i18next'
import { Command, Zap, Package, Hash, MousePointer, Eye } from 'lucide-react'
import { SettingsSection } from './components'
import { useRegisteredPlugins } from '@renderer/components/command-palette/plugins/plugin-registry'
import { usePluginCommands } from '@renderer/components/command-palette/hooks/use-plugin-commands'
import { useCommandPaletteData } from '@renderer/components/command-palette/hooks/use-command-palette-data'
import { Badge } from '@clarity/shadcn/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@clarity/shadcn/ui/card'
import { Switch } from '@clarity/shadcn/ui/switch'
import { Label } from '@clarity/shadcn/ui/label'
import { toast } from 'sonner'

export function FeaturesSettings() {
  const { t } = useTranslation('settings')
  const registeredPlugins = useRegisteredPlugins()
  const pluginCommands = usePluginCommands()

  // 插件配置管理
  const { pluginConfigs, updatePluginConfig, isUpdatingConfig } = useCommandPaletteData()

  // 处理插件开关切换
  const handlePluginToggle = async (pluginId: string, enabled: boolean) => {
    try {
      const currentConfig = pluginConfigs[pluginId] || {
        id: pluginId,
        enabled: true,
        order: 0
      }

      await updatePluginConfig({
        pluginId,
        config: {
          ...currentConfig,
          enabled
        }
      })
    } catch (error) {
      console.error('Failed to toggle plugin:', error)
      toast.error(t('features.commandPalette.pluginManagement.toggleError'), {
        description: t('features.commandPalette.pluginManagement.toggleErrorDescription')
      })
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
              {t('features.commandPalette.shortcut')
                .split(/(\s+)/)
                .map((part, index) => {
                  const trimmedPart = part.trim()
                  if (trimmedPart === '⌘K' || trimmedPart === 'Ctrl+K') {
                    return (
                      <kbd key={index} className="px-1.5 py-0.5 text-xs bg-muted rounded mx-1">
                        {trimmedPart}
                      </kbd>
                    )
                  }
                  return <span key={index}>{part}</span>
                })}
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* 插件管理 */}
      <SettingsSection
        title={t('features.commandPalette.pluginManagement.title')}
        description={t('features.commandPalette.pluginManagement.description')}
        showSeparator={true}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>
              {t('features.commandPalette.pluginManagement.stats', {
                pluginCount: registeredPlugins.length,
                commandCount: pluginCommands.length
              })}
            </span>
          </div>

          {registeredPlugins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('features.commandPalette.pluginManagement.noPlugins')}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {registeredPlugins.map((plugin) => {
                const commands = pluginCommands.filter((cmd) => cmd.pluginId === plugin.id)
                const pluginConfig = pluginConfigs[plugin.id]
                const isEnabled = pluginConfig?.enabled !== false // 默认启用

                return (
                  <Card key={plugin.id} className={isEnabled ? '' : 'opacity-60'}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                            <Zap className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">{plugin.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {plugin.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`plugin-${plugin.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {isEnabled
                                ? t('features.commandPalette.pluginManagement.enabled')
                                : t('features.commandPalette.pluginManagement.disabled')}
                            </Label>
                            <Switch
                              id={`plugin-${plugin.id}`}
                              checked={isEnabled}
                              disabled={isUpdatingConfig}
                              onCheckedChange={(checked) => handlePluginToggle(plugin.id, checked)}
                            />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            ID: {plugin.id}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Hash className="h-4 w-4" />
                          <span>
                            {t('features.commandPalette.pluginManagement.commandsPublished', {
                              count: commands.length
                            })}
                          </span>
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
                                      {t('features.commandPalette.commandTypes.action')}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      <Eye className="h-3 w-3 mr-1" />
                                      {t('features.commandPalette.commandTypes.render')}
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

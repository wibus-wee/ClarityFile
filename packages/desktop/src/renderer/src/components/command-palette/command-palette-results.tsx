import { useMemo } from 'react'
import { Command } from 'cmdk'
import {
  useCommandPaletteQuery,
  useCommandPaletteActivePlugin,
  useCommandPaletteActions
} from './stores/command-palette-store'
import { useCommandPaletteContext } from './command-palette-context'

/**
 * Command Palette 结果显示组件
 *
 * 功能：
 * - 渲染不同的结果部分（收藏、建议、搜索结果）
 * - 处理 "Use with..." 功能
 * - 支持键盘导航
 * - 显示插件特定的结果格式
 */
export function CommandPaletteResults() {
  const query = useCommandPaletteQuery()
  const activePlugin = useCommandPaletteActivePlugin()
  const { close } = useCommandPaletteActions()
  const { routeRegistry, commandRegistry } = useCommandPaletteContext()

  // 搜索路由命令
  const routeCommands = useMemo(() => {
    if (!routeRegistry) {
      return []
    }
    if (!query.trim()) {
      // 空查询时返回所有路由
      return routeRegistry.getAllRoutes()
    }
    return routeRegistry.search(query)
  }, [routeRegistry, query])

  // 搜索插件命令
  const pluginCommands = useMemo(() => {
    if (!commandRegistry || !query.trim()) {
      return []
    }
    return commandRegistry.search(query)
  }, [commandRegistry, query])

  // 获取可搜索的插件
  const searchablePlugins = useMemo(() => {
    if (!commandRegistry) {
      return []
    }
    return commandRegistry.getSearchablePlugins()
  }, [commandRegistry])

  // 如果有激活的插件，显示插件视图
  if (activePlugin) {
    return (
      <Command.List className="max-h-[300px] overflow-y-auto">
        <div className="p-4">
          <div className="text-sm text-muted-foreground">插件视图: {activePlugin}</div>
          <div className="mt-2 text-sm">查询: &quot;{query}&quot;</div>
          {/* 这里将来会渲染插件的具体内容 */}
        </div>
      </Command.List>
    )
  }

  // 主要结果视图
  return (
    <Command.List className="max-h-[300px] overflow-y-auto">
      {query.length === 0 ? (
        // 空查询时显示收藏、路由和建议
        <div>
          <Command.Group heading="收藏">
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>暂无收藏命令</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="建议">
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>创建新项目</span>
            </Command.Item>
            <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground">
              <span>搜索文件</span>
            </Command.Item>
          </Command.Group>

          {/* 显示所有路由 */}
          {routeCommands.length > 0 && (
            <Command.Group heading="页面导航">
              {routeCommands.map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.id}
                  onSelect={() => {
                    command.action()
                    close()
                  }}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  {command.icon && <command.icon className="h-4 w-4" />}
                  <span>{command.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{command.path}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </div>
      ) : (
        // 有查询时显示搜索结果
        <div>
          {/* 路由命令结果 */}
          {routeCommands.length > 0 && (
            <Command.Group heading="页面导航">
              {routeCommands.map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.id}
                  onSelect={() => {
                    command.action()
                    close()
                  }}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  {command.icon && <command.icon className="h-4 w-4" />}
                  <span>{command.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{command.path}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* 插件命令结果 */}
          {pluginCommands.length > 0 && (
            <Command.Group heading="命令">
              {pluginCommands.map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.id}
                  onSelect={() => {
                    command.action()
                    close()
                  }}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  {command.icon && <command.icon className="h-4 w-4" />}
                  <span>{command.title}</span>
                  {command.category && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {command.category}
                    </span>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* 空结果提示 */}
          {routeCommands.length === 0 && pluginCommands.length === 0 && (
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              未找到相关命令
            </Command.Empty>
          )}

          {/* "Use with..." 部分 */}
          {searchablePlugins.length > 0 && (
            <Command.Group heading={`使用 "${query}" 搜索...`}>
              {searchablePlugins.map((plugin) => (
                <Command.Item
                  key={plugin.id}
                  value={`plugin:${plugin.id}`}
                  onSelect={() => {
                    // 激活插件
                    // setActivePlugin(plugin.id)
                  }}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  {plugin.icon && <plugin.icon className="h-4 w-4" />}
                  <span>{plugin.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {plugin.description}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </div>
      )}
    </Command.List>
  )
}

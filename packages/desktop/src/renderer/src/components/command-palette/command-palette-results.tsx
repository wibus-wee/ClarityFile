import { Command } from 'cmdk'
import {
  useCommandPaletteActiveCommand,
  useCommandPaletteActions,
  useEnhancedResults,
  useCommandPaletteQuery
} from './stores/command-palette-store'
import { useCommandExecution } from './hooks/use-command-execution'
import { CommandItem } from './components/CommandItem'
import { CommandView } from './components/CommandView'
import { FavoritesSection } from './components/FavoritesSection'
import { SuggestionsSection } from './components/SuggestionsSection'
import { UseWithSection } from './components/UseWithSection'
import type { Command as CommandType, CommandWithAction, CommandWithRender } from './types'

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
  const activeCommand = useCommandPaletteActiveCommand()
  const { setActiveCommand } = useCommandPaletteActions()

  const query = useCommandPaletteQuery()
  const { categorizedResults, hasQuery } = useEnhancedResults()
  const { executeCommand: executeCmd } = useCommandExecution()

  // 命令执行辅助函数
  const executeCommand = async (command: CommandType) => {
    if ('action' in command) {
      await executeCmd(command.id, (command as CommandWithAction).action)
    } else if ('render' in command) {
      // 激活命令视图
      setActiveCommand(command.id)
    }
  }

  // 处理 "Use with..." 命令选择
  const handleUseWithCommand = (command: CommandWithRender) => {
    setActiveCommand(command.id)
  }

  // 处理建议选择
  const handleSuggestionSelect = (suggestion: string) => {
    // 这里可以根据建议类型执行不同的操作
    console.log('Selected suggestion:', suggestion)
    // 例如：设置查询、导航到特定页面等
  }

  // 使用新架构的分类结果
  const { routes: routeCommands, plugins: pluginCommands } = categorizedResults

  // 如果有激活的命令，显示命令视图
  if (activeCommand) {
    return <CommandView />
  }

  // 主要结果视图 - 使用重构后的组件
  return (
    <Command.List className="max-h-[300px] overflow-y-auto">
      {/* 如果没有查询，显示收藏和建议 */}
      {!hasQuery && (
        <>
          <FavoritesSection onExecuteCommand={executeCommand} />
          <SuggestionsSection onSuggestionSelect={handleSuggestionSelect} />
        </>
      )}

      {/* 统一显示搜索结果（包括无查询时的所有命令） */}
      <>
        {routeCommands.length > 0 && (
          <Command.Group heading="页面导航">
            {routeCommands.map((command) => (
              <CommandItem
                key={command.id}
                command={command}
                onSelect={() => executeCommand(command)}
              />
            ))}
          </Command.Group>
        )}

        {/* 插件命令结果 */}
        {pluginCommands.length > 0 && (
          <Command.Group heading="命令">
            {pluginCommands.map((command) => (
              <CommandItem
                key={command.id}
                command={command}
                onSelect={() => executeCommand(command)}
              />
            ))}
          </Command.Group>
        )}

        {/* "Use with..." 部分 */}
        <UseWithSection query={query} onCommandSelect={handleUseWithCommand} />
      </>
    </Command.List>
  )
}

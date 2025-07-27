import { Command } from 'cmdk'
import { Plus, Search, Settings, FileText } from 'lucide-react'

/**
 * 建议命令区域组件
 *
 * 功能：
 * - 显示常用的建议操作
 * - 提供快速访问常见功能的入口
 */
interface SuggestionsSectionProps {
  onSuggestionSelect?: (suggestion: string) => void
}

export function SuggestionsSection({ onSuggestionSelect }: SuggestionsSectionProps) {
  const suggestions = [
    {
      id: 'create-project',
      title: '创建新项目',
      icon: Plus,
      action: () => onSuggestionSelect?.('create-project')
    },
    {
      id: 'search-files',
      title: '搜索文件',
      icon: Search,
      action: () => onSuggestionSelect?.('search-files')
    },
    {
      id: 'open-settings',
      title: '打开设置',
      icon: Settings,
      action: () => onSuggestionSelect?.('open-settings')
    },
    {
      id: 'recent-files',
      title: '最近文件',
      icon: FileText,
      action: () => onSuggestionSelect?.('recent-files')
    }
  ]

  return (
    <Command.Group heading="建议">
      {suggestions.map((suggestion) => (
        <Command.Item
          key={suggestion.id}
          value={suggestion.id}
          onSelect={suggestion.action}
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
        >
          <suggestion.icon className="h-4 w-4 shrink-0" />
          <span>{suggestion.title}</span>
        </Command.Item>
      ))}
    </Command.Group>
  )
}

import { Search } from 'lucide-react'
import { CommandPalettePlugin, PluginContext } from '../../types'
import { FileSearchView } from './view'

/**
 * FileSearch 插件 - 文件搜索功能
 *
 * 功能：
 * - 集成 ManagedFileService 进行文件搜索
 * - 支持模糊搜索文件名和元数据
 * - 提供文件预览和快速操作
 * - 支持文件类型过滤和分类
 */

export const FileSearchPlugin: CommandPalettePlugin = {
  id: 'file-search',
  name: 'File Search Plugin',
  description: '提供强大的文件搜索功能，支持模糊搜索、类型过滤和快速预览',

  publishCommands: () => [
    // 命令1: 文件搜索（带render，支持查询）
    {
      id: 'file-search-command',
      title: '搜索文件',
      subtitle: '在所有管理的文件中搜索',
      icon: Search,
      keywords: ['file', 'search', 'document', '文件', '搜索', '文档', 'find', '查找'],
      category: '文件管理',
      source: 'plugin' as const,
      pluginId: 'file-search',
      canHandleQuery: (query) => {
        // 可以处理任何非空查询
        return query.trim().length > 0
      },
      render: (context: PluginContext) => {
        return <FileSearchView context={context} />
      }
    }
  ]
}

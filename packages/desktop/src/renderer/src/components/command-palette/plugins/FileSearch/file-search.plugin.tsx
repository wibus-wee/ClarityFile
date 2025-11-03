import { Search } from 'lucide-react'
import type {
  CommandPalettePlugin,
  CommandPalettePluginManifest,
  CommandPalettePluginModule,
  PluginTranslationResources
} from '../../types'
import { FileSearchView } from './view'

const manifest: CommandPalettePluginManifest = {
  id: 'file-search',
  name: 'File Search Plugin',
  description: '提供强大的文件搜索功能，支持模糊搜索、类型过滤和快速预览',
  version: '0.1.0',
  author: 'Clarity Team',
  source: 'builtin',
  i18nNamespace: 'commandPalette.plugins.fileSearch'
}

const translations: PluginTranslationResources = {
  'en-US': {
    name: 'File search',
    description: 'Search across your managed files with filters and instant preview.',
    category: 'File management',
    commands: {
      search: {
        title: 'Search files',
        subtitle: 'Look across all indexed files',
        keywords: ['file', 'search', 'document', 'lookup', 'finder']
      }
    },
    view: {
      title: {
        search: 'File search',
        recent: 'Recent files',
        favorites: 'Favorite files'
      },
      loading: 'Searching files…',
      error: 'Search failed, please try again.',
      empty: {
        title: 'No files found',
        withoutQuery: 'Try adjusting your filters or keywords.',
        withQuery: 'No files found containing “{{query}}”.'
      },
      infoMore: 'Showing {{count}} files. There are more results available.',
      originalName: 'Original name: {{name}}',
      badges: {
        default: 'File',
        image: 'Image',
        video: 'Video',
        audio: 'Audio',
        pdf: 'PDF',
        text: 'Text',
        document: 'Document',
        sheet: 'Spreadsheet',
        presentation: 'Presentation',
        archive: 'Archive',
        application: 'Application'
      },
      actions: {
        previewFallback: 'Failed to preview the file.',
        openFallback: 'Opening with the default system application.'
      }
    }
  },
  'zh-CN': {
    name: '文件搜索',
    description: '在所有受管文件中进行搜索，支持模糊匹配与快速预览。',
    category: '文件管理',
    commands: {
      search: {
        title: '搜索文件',
        subtitle: '在所有已索引文件中查找内容',
        keywords: ['file', 'search', 'document', '文件', '搜索', '文档']
      }
    },
    view: {
      title: {
        search: '文件搜索',
        recent: '最近文件',
        favorites: '收藏文件'
      },
      loading: '正在搜索文件…',
      error: '搜索失败，请重试。',
      empty: {
        title: '没有找到文件',
        withoutQuery: '尝试调整搜索条件或过滤器。',
        withQuery: '没有找到包含 “{{query}}” 的文件。'
      },
      infoMore: '已显示 {{count}} 个文件，还有更多结果。',
      originalName: '原始文件名：{{name}}',
      badges: {
        default: '文件',
        image: '图片',
        video: '视频',
        audio: '音频',
        pdf: 'PDF',
        text: '文本',
        document: '文档',
        sheet: '表格',
        presentation: '演示',
        archive: '压缩包',
        application: '应用'
      },
      actions: {
        previewFallback: '预览失败。',
        openFallback: '尝试使用系统默认应用打开。'
      }
    }
  }
}

export const commandPalettePluginModule: CommandPalettePluginModule = {
  manifest,
  translations,
  activate: ({ runtime, manifest }) => {
    const t = runtime.i18n.t

    const resolveKeywords = () =>
      t<string[]>('commands.search.keywords', {
        returnObjects: true,
        defaultValue: ['file', 'search', 'document']
      })

    const plugin: CommandPalettePlugin = {
      id: manifest.id,
      name: t('name', { defaultValue: manifest.name }),
      description: t('description', { defaultValue: manifest.description }),
      version: manifest.version,
      source: manifest.source,
      manifest,
      publishCommands: () => [
        {
          id: 'file-search-command',
          title: t('commands.search.title', { defaultValue: 'Search files' }),
          subtitle: t('commands.search.subtitle', {
            defaultValue: 'Search across all managed files'
          }),
          icon: Search,
          keywords: resolveKeywords(),
          category: t('category', { defaultValue: 'File management' }),
          source: 'plugin' as const,
          pluginId: manifest.id,
          canHandleQuery: (query) => query.trim().length > 0,
          render: (context) => <FileSearchView context={context} />
        }
      ]
    }

    return plugin
  }
}

export default commandPalettePluginModule

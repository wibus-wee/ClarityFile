import { MessageCircle, Sparkles } from 'lucide-react'
import type {
  CommandPalettePlugin,
  CommandPalettePluginManifest,
  CommandPalettePluginModule,
  PluginTranslationResources
} from '../../types'
import { HelloWorldView } from './view'
import type { PluginContext } from '../types'

const manifest: CommandPalettePluginManifest = {
  id: 'hello-world',
  name: 'Hello World Plugin',
  description: '用于测试命令面板插件系统的示例插件',
  version: '0.1.0',
  author: 'Clarity Team',
  source: 'builtin' as const,
  keywords: ['hello', 'world', 'demo', 'example'],
  i18nNamespace: 'commandPalette.plugins.helloWorld'
}

const translations: PluginTranslationResources = {
  'en-US': {
    name: 'Hello World Plugin',
    description: 'A sample plugin that showcases the command palette architecture.',
    category: 'Sample plugins',
    commands: {
      greet: {
        title: 'Greet the world',
        subtitle: 'Show a friendly greeting notification',
        keywords: ['hello', 'world', 'greet', 'demo'],
        notification: 'Hello, World! The plugin system is working.'
      },
      demo: {
        title: 'Feature showcase',
        subtitle: 'Explore the rich detail view components',
        keywords: ['demo', 'example', 'components', 'showcase'],
        queryDescription: 'This query comes from the command palette input.'
      },
      navigate: {
        title: 'Navigation test',
        subtitle: 'Log routing behaviour and show a toast',
        keywords: ['navigate', 'router', 'test'],
        notification: 'Navigation test triggered. Check the console output.'
      }
    },
    view: {
      sidebarTitle: 'Categories',
      sidebar: {
        overview: 'Overview',
        search: 'Search',
        favorites: 'Favorites',
        settings: 'Settings'
      },
      overview: {
        title: 'Plugin overview',
        statusOk: 'HelloWorld plugin is running correctly',
        queryLabel: 'Current query',
        queryDescription: 'This query comes from the command palette input box',
        infoTitle: 'Plugin information',
        infoSubtitle: 'Version {{version}}',
        infoDescription: 'A complete example that demonstrates the detail view component library.',
        infoBadge: 'Example',
        featuresTitle: 'Highlights',
        readyTitle: 'Ready to use',
        readySubtitle: 'No extra configuration required',
        readyDescription: 'Plugin developers can focus on building functionality.'
      },
      search: {
        title: 'Search demo',
        placeholder: 'Search files… (type “error” to simulate a failure)',
        run: 'Search',
        reset: 'Reset',
        statusSuccess: 'Search completed',
        statusError: 'Search failed, please try again',
        resultsTitle: 'Search results',
        loading: 'Searching files…',
        emptyTitle: 'No files found',
        emptyDescription: 'Try a different keyword or filter.',
        emptyAction: 'Reset search',
        moreResults: 'Showing {{count}} files. There are more results available.',
        openMessage: 'Opening file: {{name}}',
        items: {
          'item-1': {
            name: 'Important-document.txt',
            type: 'Document',
            modified: '2 hours ago',
            size: '2.3 KB'
          },
          'item-2': {
            name: 'Project-screenshot.png',
            type: 'Image',
            modified: '1 day ago',
            size: '1.2 MB'
          },
          'item-3': {
            name: 'Configuration.json',
            type: 'Configuration',
            modified: '3 days ago',
            size: '856 B'
          },
          'item-4': {
            name: 'Backup.zip',
            type: 'Archive',
            modified: '1 week ago',
            size: '15.7 MB'
          }
        }
      },
      favorites: {
        title: 'Favorite items',
        empty: 'You can collect items from the search results.',
        addAction: 'Save',
        removeAction: 'Remove'
      },
      settings: {
        title: 'Settings',
        description: 'Settings demo coming soon.'
      }
    }
  },
  'zh-CN': {
    name: 'Hello World 插件',
    description: '用于展示命令面板插件架构的示例插件。',
    category: '示例插件',
    commands: {
      greet: {
        title: '问候世界',
        subtitle: '显示一条友好的欢迎通知',
        keywords: ['hello', 'world', '问候', '测试'],
        notification: 'Hello, World！插件系统运行正常。'
      },
      demo: {
        title: '功能演示',
        subtitle: '体验丰富的详情视图组件库',
        keywords: ['demo', '示例', '组件', '演示'],
        queryDescription: '这是从命令面板输入框传递过来的查询条件。'
      },
      navigate: {
        title: '导航测试',
        subtitle: '记录路由行为并显示提示',
        keywords: ['导航', '路由', '测试'],
        notification: '已触发导航测试，请查看控制台输出。'
      }
    },
    view: {
      sidebarTitle: '分类',
      sidebar: {
        overview: '概览',
        search: '搜索',
        favorites: '收藏',
        settings: '设置'
      },
      overview: {
        title: '插件概览',
        statusOk: 'HelloWorld 插件运行正常',
        queryLabel: '当前查询',
        queryDescription: '这是从命令面板传递过来的查询参数。',
        infoTitle: '插件信息',
        infoSubtitle: '版本 {{version}}',
        infoDescription: '一个展示详情视图组件库的完整插件示例。',
        infoBadge: '示例',
        featuresTitle: '功能亮点',
        readyTitle: '开箱即用',
        readySubtitle: '无需复杂配置',
        readyDescription: '插件开发者可以专注于功能实现。'
      },
      search: {
        title: '搜索演示',
        placeholder: '搜索文件…（输入 “error” 测试错误状态）',
        run: '搜索',
        reset: '重置',
        statusSuccess: '搜索完成',
        statusError: '搜索失败，请重试',
        resultsTitle: '搜索结果',
        loading: '正在搜索文件…',
        emptyTitle: '没有找到文件',
        emptyDescription: '尝试调整搜索关键词或过滤条件。',
        emptyAction: '重置搜索',
        moreResults: '共显示 {{count}} 个文件，还有更多结果。',
        openMessage: '打开文件：{{name}}',
        items: {
          'item-1': {
            name: '重要文档.txt',
            type: '文档',
            modified: '2 小时前',
            size: '2.3 KB'
          },
          'item-2': {
            name: '项目截图.png',
            type: '图片',
            modified: '1 天前',
            size: '1.2 MB'
          },
          'item-3': {
            name: '配置文件.json',
            type: '配置',
            modified: '3 天前',
            size: '856 B'
          },
          'item-4': {
            name: '数据备份.zip',
            type: '压缩包',
            modified: '1 周前',
            size: '15.7 MB'
          }
        }
      },
      favorites: {
        title: '收藏项目',
        empty: '可以在搜索结果中收藏常用项目。',
        addAction: '收藏',
        removeAction: '取消收藏'
      },
      settings: {
        title: '设置',
        description: '设置演示即将到来。'
      }
    }
  }
}

function withPluginContext(render: (context: PluginContext) => JSX.Element) {
  return (context: PluginContext) => render(context)
}

export const commandPalettePluginModule: CommandPalettePluginModule = {
  manifest,
  translations,
  activate: ({ runtime, manifest }) => {
    const t = runtime.i18n.t

    const resolveKeywords = (key: string, fallback: string[]) =>
      t<string[]>(key, { defaultValue: fallback, returnObjects: true })

    const category = t('category', { defaultValue: 'Sample plugins' })

    const plugin: CommandPalettePlugin = {
      id: manifest.id,
      name: t('name', { defaultValue: manifest.name }),
      description: t('description', { defaultValue: manifest.description }),
      version: manifest.version,
      source: manifest.source,
      manifest,
      publishCommands: () => [
        {
          id: 'hello-world-greet',
          title: t('commands.greet.title', { defaultValue: 'Greet the world' }),
          subtitle: t('commands.greet.subtitle', { defaultValue: 'Show a friendly greeting notification' }),
          icon: MessageCircle,
          keywords: resolveKeywords('commands.greet.keywords', ['hello', 'world', 'greet', 'demo']),
          category,
          source: 'plugin' as const,
          pluginId: manifest.id,
          action: () => {
            runtime.logger.info('Executing hello-world greet command')
            const message = t('commands.greet.notification', {
              defaultValue: 'Hello, World! The plugin system is working.'
            })
            window.alert(message)
          }
        },
        {
          id: 'hello-world-demo',
          title: t('commands.demo.title', { defaultValue: 'Feature showcase' }),
          subtitle: t('commands.demo.subtitle', { defaultValue: 'Explore the rich detail view components' }),
          icon: Sparkles,
          keywords: resolveKeywords('commands.demo.keywords', ['demo', 'example', 'components', 'showcase']),
          category,
          source: 'plugin' as const,
          pluginId: manifest.id,
          canHandleQuery: (query: string) => query.trim().length > 0,
          render: withPluginContext((context) => (
            <HelloWorldView context={context} version={manifest.version} />
          ))
        },
        {
          id: 'hello-world-navigate',
          title: t('commands.navigate.title', { defaultValue: 'Navigation test' }),
          subtitle: t('commands.navigate.subtitle', { defaultValue: 'Log routing behaviour and show a toast' }),
          icon: MessageCircle,
          keywords: resolveKeywords('commands.navigate.keywords', ['navigate', 'router', 'test']),
          category,
          source: 'plugin' as const,
          pluginId: manifest.id,
          action: () => {
            runtime.logger.info('Executing hello-world navigation test command')
            const message = t('commands.navigate.notification', {
              defaultValue: 'Navigation test triggered. Check the console output.'
            })
            window.alert(message)
          }
        }
      ]
    }

    return plugin
  }
}

export default commandPalettePluginModule

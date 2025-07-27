import { MessageCircle, Sparkles } from 'lucide-react'
import type { CommandPalettePlugin, PluginContext } from '../types'

/**
 * HelloWorld 插件 - 用于测试插件系统
 *
 * 功能：
 * - 提供简单的问候命令
 * - 测试插件注册和命令执行
 * - 验证插件上下文传递
 */

/**
 * HelloWorld 渲染组件
 */
function HelloWorldView({ context }: { context: PluginContext }) {
  const query = context.commandPalette.getQuery()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-semibold">Hello World Plugin</h2>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          这是一个测试插件，用于验证命令面板的插件系统。
        </p>

        {query && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>当前查询:</strong> "{query}"
            </p>
          </div>
        )}

        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">✅ 插件系统工作正常！</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">测试功能:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 插件注册和发现</li>
          <li>• 命令发布和执行</li>
          <li>• 上下文传递</li>
          <li>• 查询处理</li>
        </ul>
      </div>
    </div>
  )
}

/**
 * HelloWorld 插件定义
 */
export const HelloWorldPlugin: CommandPalettePlugin = {
  id: 'hello-world',
  name: 'Hello World Plugin',
  description: '用于测试命令面板插件系统的简单插件',

  publishCommands: () => [
    // 命令1: 简单的问候命令（带action）
    {
      id: 'hello-world-greet',
      title: '问候世界',
      subtitle: '显示一个简单的问候消息',
      icon: MessageCircle,
      keywords: ['hello', 'world', '问候', '世界', 'test', '测试'],
      category: '测试',
      source: 'plugin' as const,
      pluginId: 'hello-world',
      action: () => {
        alert('Hello, World! 插件系统工作正常！')
      }
    },

    // 命令2: 可搜索的命令（带render）
    {
      id: 'hello-world-search',
      title: '搜索测试',
      subtitle: '测试插件的搜索功能',
      icon: Sparkles,
      keywords: ['search', 'test', '搜索', '测试', 'hello'],
      category: '测试',
      source: 'plugin' as const,
      pluginId: 'hello-world',
      canHandleQuery: (query: string) => {
        // 可以处理任何非空查询
        return query.trim().length > 0
      },
      render: (context: PluginContext) => {
        return <HelloWorldView context={context} />
      }
    },

    // 命令3: 导航测试命令
    {
      id: 'hello-world-navigate',
      title: '导航测试',
      subtitle: '测试插件的路由导航功能',
      icon: MessageCircle,
      keywords: ['navigate', 'router', '导航', '路由', 'test'],
      category: '测试',
      source: 'plugin' as const,
      pluginId: 'hello-world',
      action: () => {
        // 测试路由导航
        console.log('HelloWorld Plugin: 导航测试')
        alert('导航测试 - 检查控制台输出')
      }
    }
  ]
}

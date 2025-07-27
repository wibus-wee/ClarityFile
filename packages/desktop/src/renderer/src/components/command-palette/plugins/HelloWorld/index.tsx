import { MessageCircle, Sparkles } from 'lucide-react'
import { CommandPalettePlugin, PluginContext } from '../../types'
import { HelloWorldView } from './view'

/**
 * HelloWorld 插件 - 用于测试插件系统
 *
 * 功能：
 * - 提供简单的问候命令
 * - 测试插件注册和命令执行
 * - 验证插件上下文传递
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
      category: '测试插件',
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
      category: '测试插件',
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
      category: '测试插件',
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

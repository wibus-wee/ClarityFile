import { Sparkles } from 'lucide-react'
import { PluginContext } from '../plugin-context'

/**
 * HelloWorld 渲染组件
 */
export function HelloWorldView({ context }: { context: PluginContext }) {
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
              <strong>当前查询:</strong> &quot;{query}&quot;
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

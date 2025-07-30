import React, { ReactNode } from 'react'
import { PluginErrorBoundary } from './plugin-error-boundary'

/**
 * 插件错误边界的 HOC 版本
 * 用于函数组件中包装插件内容
 */
export function withPluginErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  pluginId?: string,
  fallback?: ReactNode
) {
  const WrappedComponent = React.memo((props: T) => {
    return (
      <PluginErrorBoundary pluginId={pluginId} fallback={fallback}>
        <Component {...props} />
      </PluginErrorBoundary>
    )
  })

  WrappedComponent.displayName = `withPluginErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

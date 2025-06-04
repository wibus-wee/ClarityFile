import { PropsWithChildren } from 'react'
import { toast } from 'sonner'
import { SWRConfig } from 'swr'

export function SWRProvider({ children }: PropsWithChildren) {
  return (
    <SWRConfig
      value={{
        // 全局配置
        revalidateOnFocus: false, // 窗口获得焦点时不重新验证
        revalidateOnReconnect: true, // 网络重连时重新验证
        dedupingInterval: 2000, // 2秒内的重复请求会被去重
        errorRetryCount: 3, // 错误重试次数
        errorRetryInterval: 5000, // 错误重试间隔

        // 错误处理
        onError: (error, key) => {
          console.error('SWR Error:', error, 'Key:', key)
          toast(`数据加载失败: ${error.message}`)
        },

        // // 成功处理
        // onSuccess: (_, key) => {
        //   // 可以在这里添加全局成功处理逻辑
        //   console.log('SWR Success:', key)
        // },

        // 加载状态处理
        onLoadingSlow: () => {
          // console.warn('SWR Loading Slow:', key)
          // 可以在这里显示加载慢的提示
          toast('数据似乎加载状态很缓慢，有可能陷入了加载死循环')
        }
      }}
    >
      {children}
    </SWRConfig>
  )
}

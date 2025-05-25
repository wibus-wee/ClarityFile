import { createClient } from '@egoist/tipc/renderer'
import type { Router } from '../../../main/tipc'

// 创建 TIPC 客户端
export const tipcClient = createClient<Router>({
  ipcInvoke: window.api.ipcInvoke
})

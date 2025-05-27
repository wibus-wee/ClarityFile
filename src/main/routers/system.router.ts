import { SystemService } from '../services/system.service'

export function systemRouter(t: any) {
  return {
    // 获取系统信息
    getSystemInfo: t.procedure.action(async () => {
      return await SystemService.getSystemInfo()
    })
  }
}

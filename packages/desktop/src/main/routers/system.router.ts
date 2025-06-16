import { SystemService } from '../services/system.service'
import { ITipc } from '../types'

export function systemRouter(t: ITipc) {
  return {
    // 获取系统信息
    getSystemInfo: t.procedure.action(async () => {
      return await SystemService.getSystemInfo()
    })
  }
}

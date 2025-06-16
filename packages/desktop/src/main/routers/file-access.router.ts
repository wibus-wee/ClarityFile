import { FileAccessService } from '../services/file-access.service'
import type { GetFileDataInput } from '../services/file-access.service'
import { ITipc } from '../types'

export function fileAccessRouter(t: ITipc) {
  return {
    // 获取文件数据（base64 格式）
    getFileData: t.procedure.input<GetFileDataInput>().action(async ({ input }) => {
      return await FileAccessService.getFileData(input)
    }),

    // 生成文件 data URL
    generateFileDataUrl: t.procedure.input<{ filePath: string }>().action(async ({ input }) => {
      return await FileAccessService.generateFileDataUrl(input.filePath)
    }),

    // 检查是否为图片文件
    isImageFile: t.procedure.input<{ filePath: string }>().action(async ({ input }) => {
      return FileAccessService.isImageFile(input.filePath)
    })
  }
}

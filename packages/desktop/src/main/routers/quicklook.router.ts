import { QuickLookService } from '../services/quicklook.service'
import type {
  QuickLookPreviewInput,
  QuickLookPreviewByPathInput
} from '../services/quicklook.service'
import { ITipc } from '../types'

export function quickLookRouter(t: ITipc) {
  return {
    // 通过文件ID预览文件
    previewFileById: t.procedure.input<QuickLookPreviewInput>().action(async ({ input }) => {
      return await QuickLookService.previewFileById(input)
    }),

    // 通过文件路径预览文件
    previewFileByPath: t.procedure
      .input<QuickLookPreviewByPathInput>()
      .action(async ({ input }) => {
        return await QuickLookService.previewFileByPath(input)
      }),

    // 检查 QuickLook 是否可用
    isQuickLookAvailable: t.procedure.action(async () => {
      const isAvailable = await QuickLookService.isQuickLookAvailable()
      return { available: isAvailable }
    }),

    // 获取支持的文件类型
    getSupportedFileTypes: t.procedure.action(async () => {
      const supportedTypes = QuickLookService.getSupportedFileTypes()
      return { supportedTypes }
    }),

    // 检查文件是否支持预览
    isFileSupported: t.procedure.input<{ fileName: string }>().action(async ({ input }) => {
      const isSupported = QuickLookService.isFileSupported(input.fileName)
      return { supported: isSupported }
    })
  }
}

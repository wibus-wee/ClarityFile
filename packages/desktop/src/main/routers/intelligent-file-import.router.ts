import { IntelligentFileImportService } from '../services/intelligent/intelligent-file-import.service'
import type { FileImportContext } from '../services/intelligent/intelligent-file-import.service'
import { ITipc } from '../types'

export function intelligentFileImportRouter(t: ITipc) {
  return {
    // 导入单个文件
    importFile: t.procedure.input<FileImportContext>().action(async ({ input }) => {
      return await IntelligentFileImportService.importFile(input)
    }),

    // 预览文件导入方案
    previewImport: t.procedure.input<FileImportContext>().action(async ({ input }) => {
      return await IntelligentFileImportService.previewImport(input)
    }),

    // 批量导入文件
    batchImportFiles: t.procedure
      .input<{ contexts: FileImportContext[] }>()
      .action(async ({ input }) => {
        return await IntelligentFileImportService.batchImportFiles(input.contexts)
      }),

    // 获取支持的文件类型
    getSupportedFileTypes: t.procedure.action(async () => {
      return IntelligentFileImportService.getSupportedFileTypes()
    }),

    // 验证文件类型是否支持
    isFileTypeSupported: t.procedure
      .input<{ fileName: string; importType: string }>()
      .action(async ({ input }) => {
        return IntelligentFileImportService.isFileTypeSupported(input.fileName, input.importType)
      }),

    // 生成导入预览的完整信息
    generateImportPreview: t.procedure.input<FileImportContext>().action(async ({ input }) => {
      try {
        // 获取预览信息
        const preview = await IntelligentFileImportService.previewImport(input)

        // 获取文件类型支持信息
        const isSupported = IntelligentFileImportService.isFileTypeSupported(
          input.originalFileName,
          input.importType
        )

        // 获取支持的文件类型列表
        const supportedTypes = IntelligentFileImportService.getSupportedFileTypes()

        return {
          ...preview,
          fileTypeSupported: isSupported,
          supportedExtensions: supportedTypes[input.importType] || [],
          importType: input.importType,
          originalFileName: input.originalFileName
        }
      } catch (error) {
        return {
          generatedFileName: '',
          targetPath: '',
          relativePath: '',
          fullPath: '',
          isValid: false,
          errors: [error instanceof Error ? error.message : '预览生成失败'],
          warnings: [],
          fileTypeSupported: false,
          supportedExtensions: [],
          importType: input.importType,
          originalFileName: input.originalFileName
        }
      }
    })
  }
}

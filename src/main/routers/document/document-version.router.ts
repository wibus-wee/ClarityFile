import { DocumentVersionService } from '../../services/document/document-version.service'
import { IntelligentFileImportService } from '../../services/intelligent/intelligent-file-import.service'
import type {
  CreateDocumentVersionInput,
  UpdateDocumentVersionInput,
  GetDocumentVersionInput,
  DeleteDocumentVersionInput,
  GetLogicalDocumentVersionsInput
} from '../../types/inputs'
import type { FileImportContext } from '../../services/intelligent/intelligent-file-import.service'
import { ITipc } from '../../types'

export function documentVersionRouter(t: ITipc) {
  return {
    // 创建文档版本
    createDocumentVersion: t.procedure
      .input<CreateDocumentVersionInput>()
      .action(async ({ input }) => {
        return await DocumentVersionService.createDocumentVersion(input)
      }),

    // 获取单个文档版本
    getDocumentVersion: t.procedure.input<GetDocumentVersionInput>().action(async ({ input }) => {
      return await DocumentVersionService.getDocumentVersion(input)
    }),

    // 获取逻辑文档的所有版本
    getLogicalDocumentVersions: t.procedure
      .input<GetLogicalDocumentVersionsInput>()
      .action(async ({ input }) => {
        return await DocumentVersionService.getLogicalDocumentVersions(input)
      }),

    // 更新文档版本
    updateDocumentVersion: t.procedure
      .input<UpdateDocumentVersionInput>()
      .action(async ({ input }) => {
        return await DocumentVersionService.updateDocumentVersion(input)
      }),

    // 删除文档版本
    deleteDocumentVersion: t.procedure
      .input<DeleteDocumentVersionInput>()
      .action(async ({ input }) => {
        return await DocumentVersionService.deleteDocumentVersion(input)
      }),

    // 复制文档版本
    duplicateDocumentVersion: t.procedure
      .input<{ versionId: string; newVersionTag: string }>()
      .action(async ({ input }) => {
        const { versionId, newVersionTag } = input
        return await DocumentVersionService.duplicateDocumentVersion(versionId, newVersionTag)
      }),

    // 获取版本统计信息
    getVersionStats: t.procedure
      .input<{ logicalDocumentId: string }>()
      .action(async ({ input }) => {
        const { logicalDocumentId } = input
        return await DocumentVersionService.getVersionStats(logicalDocumentId)
      }),

    // 按文件类型分组版本
    getVersionsByFileType: t.procedure
      .input<{ logicalDocumentId: string }>()
      .action(async ({ input }) => {
        const { logicalDocumentId } = input
        return await DocumentVersionService.getVersionsByFileType(logicalDocumentId)
      }),

    // 智能文档上传（原子操作）
    uploadDocumentVersion: t.procedure.input<FileImportContext>().action(async ({ input }) => {
      const importContext = input
      // 验证导入类型必须是 document
      if (importContext.importType !== 'document') {
        throw new Error('此接口只支持文档类型的导入')
      }

      // 使用智能文件导入服务处理文档上传
      const result = await IntelligentFileImportService.importFile(importContext)

      if (!result.success) {
        throw new Error(`文档上传失败: ${result.errors?.join(', ')}`)
      }

      return {
        success: true,
        managedFileId: result.managedFileId,
        logicalDocumentId: result.logicalDocumentId,
        documentVersionId: result.documentVersionId,
        finalPath: result.finalPath,
        relativePath: result.relativePath,
        generatedFileName: result.generatedFileName,
        warnings: result.warnings
      }
    }),

    // 预览文档上传方案
    previewDocumentUpload: t.procedure.input<FileImportContext>().action(async ({ input }) => {
      const importContext = input
      // 验证导入类型必须是 document
      if (importContext.importType !== 'document') {
        throw new Error('此接口只支持文档类型的预览')
      }

      // 使用智能文件导入服务预览文档上传
      return await IntelligentFileImportService.previewImport(importContext)
    }),

    // 检查文件上传能力
    checkFileUploadAbility: t.procedure.input<{ filePath: string }>().action(async ({ input }) => {
      const { filePath } = input
      try {
        // 检查文件是否存在
        const fs = await import('fs')
        const fileExists = fs.existsSync(filePath)

        if (!fileExists) {
          return {
            canUpload: false,
            reason: '文件不存在'
          }
        }

        // 检查文件类型是否支持
        const isSupported = IntelligentFileImportService.isFileTypeSupported(filePath, 'document')

        if (!isSupported) {
          return {
            canUpload: false,
            reason: '不支持的文件类型'
          }
        }

        return {
          canUpload: true,
          reason: '文件可以上传'
        }
      } catch (error) {
        return {
          canUpload: false,
          reason: error instanceof Error ? error.message : '检查失败'
        }
      }
    }),

    // 生成版本标签
    generateVersionTag: t.procedure.input<{ prefix?: string }>().action(async ({ input }) => {
      const { prefix } = input
      const now = new Date()
      const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
      const prefixValue = prefix || 'v'

      return {
        versionTag: `${prefixValue}${timestamp}`
      }
    })
  }
}

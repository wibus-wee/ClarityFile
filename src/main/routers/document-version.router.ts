import { DocumentVersionService } from '../services/document-version.service'
import type {
  CreateDocumentVersionInput,
  UpdateDocumentVersionInput,
  GetDocumentVersionInput,
  DeleteDocumentVersionInput,
  GetLogicalDocumentVersionsInput
} from '../services/document-version.service'

export function documentVersionRouter(t: any) {
  return {
    // 创建文档版本
    createDocumentVersion: t.procedure
      .input()
      .action(async ({ input }: { input: CreateDocumentVersionInput }) => {
        return await DocumentVersionService.createDocumentVersion(input)
      }),

    // 获取单个文档版本
    getDocumentVersion: t.procedure
      .input()
      .action(async ({ input }: { input: GetDocumentVersionInput }) => {
        return await DocumentVersionService.getDocumentVersion(input)
      }),

    // 获取逻辑文档的所有版本
    getLogicalDocumentVersions: t.procedure
      .input()
      .action(async ({ input }: { input: GetLogicalDocumentVersionsInput }) => {
        return await DocumentVersionService.getLogicalDocumentVersions(input)
      }),

    // 更新文档版本
    updateDocumentVersion: t.procedure
      .input()
      .action(async ({ input }: { input: UpdateDocumentVersionInput }) => {
        return await DocumentVersionService.updateDocumentVersion(input)
      }),

    // 删除文档版本
    deleteDocumentVersion: t.procedure
      .input()
      .action(async ({ input }: { input: DeleteDocumentVersionInput }) => {
        return await DocumentVersionService.deleteDocumentVersion(input)
      }),

    // 复制文档版本
    duplicateDocumentVersion: t.procedure
      .input()
      .action(async ({ input }: { input: { versionId: string; newVersionTag: string } }) => {
        return await DocumentVersionService.duplicateDocumentVersion(
          input.versionId,
          input.newVersionTag
        )
      }),

    // 获取版本统计信息
    getVersionStats: t.procedure
      .input()
      .action(async ({ input }: { input: { logicalDocumentId: string } }) => {
        return await DocumentVersionService.getVersionStats(input.logicalDocumentId)
      }),

    // 按文件类型分组版本
    getVersionsByFileType: t.procedure
      .input()
      .action(async ({ input }: { input: { logicalDocumentId: string } }) => {
        return await DocumentVersionService.getVersionsByFileType(input.logicalDocumentId)
      })
  }
}

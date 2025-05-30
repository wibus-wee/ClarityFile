import { LogicalDocumentService } from '../../services/document/logical-document.service'
import type {
  CreateLogicalDocumentInput,
  UpdateLogicalDocumentInput,
  GetLogicalDocumentInput,
  DeleteLogicalDocumentInput,
  GetProjectDocumentsInput
} from '../../services/document/logical-document.service'
import { ITipc } from '../../types'

export function logicalDocumentRouter(t: ITipc) {
  return {
    // 创建逻辑文档
    createLogicalDocument: t.procedure
      .input<CreateLogicalDocumentInput>()
      .action(async ({ input }) => {
        return await LogicalDocumentService.createLogicalDocument(input)
      }),

    // 获取单个逻辑文档
    getLogicalDocument: t.procedure.input<GetLogicalDocumentInput>().action(async ({ input }) => {
      return await LogicalDocumentService.getLogicalDocument(input)
    }),

    // 获取所有逻辑文档
    getAllDocuments: t.procedure.action(async () => {
      return await LogicalDocumentService.getAllDocuments()
    }),

    // 获取项目的所有逻辑文档
    getProjectDocuments: t.procedure.input<GetProjectDocumentsInput>().action(async ({ input }) => {
      return await LogicalDocumentService.getProjectDocuments(input)
    }),

    // 更新逻辑文档
    updateLogicalDocument: t.procedure
      .input<UpdateLogicalDocumentInput>()
      .action(async ({ input }) => {
        return await LogicalDocumentService.updateLogicalDocument(input)
      }),

    // 删除逻辑文档
    deleteLogicalDocument: t.procedure
      .input<DeleteLogicalDocumentInput>()
      .action(async ({ input }) => {
        return await LogicalDocumentService.deleteLogicalDocument(input)
      }),

    // 获取逻辑文档详细信息（包含版本列表）
    getLogicalDocumentWithVersions: t.procedure
      .input<GetLogicalDocumentInput>()
      .action(async ({ input }) => {
        return await LogicalDocumentService.getLogicalDocumentWithVersions(input)
      }),

    // 设置当前官方版本
    setCurrentOfficialVersion: t.procedure
      .input<{ documentId: string; versionId: string }>()
      .action(async ({ input }) => {
        return await LogicalDocumentService.setCurrentOfficialVersion(
          input.documentId,
          input.versionId
        )
      }),

    // 获取文档类型列表
    getDocumentTypes: t.procedure.action(async () => {
      return await LogicalDocumentService.getDocumentTypes()
    })
  }
}

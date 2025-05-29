import {
  LogicalDocumentService,
  type CreateLogicalDocumentInput,
  type GetProjectDocumentsInput
} from '../services/document/logical-document.service'
import { ITipc } from '../types'

export function documentRouter(t: ITipc) {
  return {
    // 获取项目的逻辑文档
    getProjectDocuments: t.procedure.input<GetProjectDocumentsInput>().action(async ({ input }) => {
      return await LogicalDocumentService.getProjectDocuments(input)
    }),

    // 创建逻辑文档
    createLogicalDocument: t.procedure
      .input<CreateLogicalDocumentInput>()
      .action(async ({ input }) => {
        return await LogicalDocumentService.createLogicalDocument(input)
      })
  }
}

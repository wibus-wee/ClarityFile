import {
  LogicalDocumentService,
  type CreateLogicalDocumentInput,
  type GetProjectDocumentsInput
} from '../services/document/logical-document.service'

export function documentRouter(t: any) {
  return {
    // 获取项目的逻辑文档
    getProjectDocuments: t.procedure
      .input()
      .action(async ({ input }: { input: GetProjectDocumentsInput }) => {
        return await LogicalDocumentService.getProjectDocuments(input)
      }),

    // 创建逻辑文档
    createLogicalDocument: t.procedure
      .input()
      .action(async ({ input }: { input: CreateLogicalDocumentInput }) => {
        return await LogicalDocumentService.createLogicalDocument(input)
      })
  }
}

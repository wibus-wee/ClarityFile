import { DocumentService } from '../services/document.service'
import type { GetProjectDocumentsInput, CreateLogicalDocumentInput } from '../types/inputs'

export function documentRouter(t: any) {
  return {
    // 获取项目的逻辑文档
    getProjectDocuments: t.procedure
      .input()
      .action(async ({ input }: { input: GetProjectDocumentsInput }) => {
        return await DocumentService.getProjectDocuments(input)
      }),

    // 创建逻辑文档
    createLogicalDocument: t.procedure
      .input()
      .action(async ({ input }: { input: CreateLogicalDocumentInput }) => {
        return await DocumentService.createLogicalDocument(input)
      })
  }
}

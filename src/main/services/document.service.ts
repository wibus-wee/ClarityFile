import { db } from '../db'
import { logicalDocuments } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import type {
  GetProjectDocumentsInput,
  CreateLogicalDocumentInput
} from '../types/inputs'

export class DocumentService {
  // 获取项目的逻辑文档
  static async getProjectDocuments(input: GetProjectDocumentsInput) {
    const result = await db
      .select()
      .from(logicalDocuments)
      .where(eq(logicalDocuments.projectId, input.projectId))
      .orderBy(desc(logicalDocuments.updatedAt))
    return result
  }

  // 创建逻辑文档
  static async createLogicalDocument(input: CreateLogicalDocumentInput) {
    const result = await db.insert(logicalDocuments).values(input).returning()
    return result[0]
  }
}

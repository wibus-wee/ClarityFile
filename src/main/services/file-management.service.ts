import { db } from '../db'
import { managedFiles } from '../../db/schema'
import { desc } from 'drizzle-orm'
import type { GetManagedFilesInput, CreateManagedFileInput } from '../types/inputs'

export class FileManagementService {
  // 获取管理的文件
  static async getManagedFiles(input: GetManagedFilesInput) {
    const limit = input.limit || 50
    const offset = input.offset || 0

    const result = await db
      .select()
      .from(managedFiles)
      .orderBy(desc(managedFiles.createdAt))
      .limit(limit)
      .offset(offset)
    return result
  }

  // 创建管理的文件记录
  static async createManagedFile(input: CreateManagedFileInput) {
    const result = await db.insert(managedFiles).values(input).returning()
    return result[0]
  }
}

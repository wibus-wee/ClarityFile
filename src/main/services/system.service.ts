import { db } from '../db'
import { projects, logicalDocuments, managedFiles } from '../../db/schema'
import type { SystemInfoOutput } from '../types/outputs'

export class SystemService {
  // 获取系统信息
  static async getSystemInfo(): Promise<SystemInfoOutput> {
    const projectCount = await db
      .select()
      .from(projects)
      .then((r) => r.length)
    const documentCount = await db
      .select()
      .from(logicalDocuments)
      .then((r) => r.length)
    const fileCount = await db
      .select()
      .from(managedFiles)
      .then((r) => r.length)

    return {
      projectCount,
      documentCount,
      fileCount,
      timestamp: new Date().toISOString()
    }
  }
}

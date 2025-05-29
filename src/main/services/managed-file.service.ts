import { db } from '../db'
import { managedFiles } from '../../db/schema'
import { eq, like, count, sum } from 'drizzle-orm'
import { FilesystemOperations } from '../utils/filesystem-operations'
import crypto from 'crypto'
import fs from 'fs'
import type { SuccessResponse } from '../types/outputs'

export interface CreateManagedFileInput {
  name: string
  originalFileName: string
  physicalPath: string
  mimeType?: string
  fileSizeBytes?: number
}

export interface UpdateManagedFileInput {
  id: string
  name?: string
}

export interface GetManagedFileInput {
  id: string
}

export interface DeleteManagedFileInput {
  id: string
  deletePhysicalFile?: boolean
}

export interface GetManagedFilesInput {
  limit?: number
  offset?: number
}

/**
 * 受管文件服务
 * 负责 managed_files 表的 CRUD 操作和文件物理层管理
 *
 * 职责：
 * - 管理 managed_files 表的数据操作
 * - 处理文件的物理存储、哈希计算、去重
 * - 文件完整性验证
 *
 * 不负责：
 * - 文件导入的业务逻辑（由 IntelligentFileImportService 处理）
 * - 文件路径和命名规则（由专门的算法服务处理）
 * - MIME类型检测（由 IntelligentFileImportService 处理）
 */
export class ManagedFileService {
  /**
   * 计算文件哈希值
   */
  private static async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256')
      const stream = fs.createReadStream(filePath)

      stream.on('data', (data) => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }

  /**
   * 创建受管文件记录
   */
  static async createManagedFile(input: CreateManagedFileInput) {
    const result = await db
      .insert(managedFiles)
      .values({
        name: input.name,
        originalFileName: input.originalFileName,
        physicalPath: input.physicalPath,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes
      })
      .returning()

    console.log(`受管文件记录创建成功: ${input.name}`)
    return result[0]
  }

  /**
   * 获取受管文件
   */
  static async getManagedFile(input: GetManagedFileInput) {
    const result = await db
      .select()
      .from(managedFiles)
      .where(eq(managedFiles.id, input.id))
      .limit(1)

    return result[0] || null
  }

  /**
   * 分页获取受管文件列表
   */
  static async getManagedFiles(input: GetManagedFilesInput) {
    const limit = input.limit || 50
    const offset = input.offset || 0

    const result = await db
      .select()
      .from(managedFiles)
      .orderBy(managedFiles.createdAt)
      .limit(limit)
      .offset(offset)

    return result
  }

  /**
   * 更新受管文件
   */
  static async updateManagedFile(input: UpdateManagedFileInput) {
    const { id, ...updateData } = input

    const result = await db
      .update(managedFiles)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(managedFiles.id, id))
      .returning()

    if (result.length === 0) {
      throw new Error('受管文件不存在')
    }

    console.log(`受管文件 "${result[0].name}" 更新成功`)
    return result[0]
  }

  /**
   * 删除受管文件
   */
  static async deleteManagedFile(input: DeleteManagedFileInput): Promise<SuccessResponse> {
    const file = await this.getManagedFile({ id: input.id })
    if (!file) {
      throw new Error('受管文件不存在')
    }

    // 删除数据库记录
    await db.delete(managedFiles).where(eq(managedFiles.id, input.id))

    // 删除物理文件（如果需要）
    if (input.deletePhysicalFile && file.physicalPath) {
      const deleteSuccess = await FilesystemOperations.deleteFile(file.physicalPath)
      if (deleteSuccess) {
        console.log(`物理文件已删除: ${file.physicalPath}`)
      } else {
        console.warn(`物理文件删除失败: ${file.physicalPath}`)
      }
    }

    console.log(`受管文件 "${file.name}" 删除成功`)
    return { success: true }
  }

  /**
   * 搜索受管文件
   */
  static async searchManagedFiles(query: string) {
    const result = await db
      .select()
      .from(managedFiles)
      .where(like(managedFiles.name, `%${query}%`))
      .orderBy(managedFiles.createdAt)

    return result
  }

  /**
   * 检查文件是否存在
   */
  static async checkFileExists(filePath: string) {
    const result = await db
      .select()
      .from(managedFiles)
      .where(eq(managedFiles.physicalPath, filePath))
      .limit(1)

    return result.length > 0
  }

  /**
   * 验证文件完整性
   */
  static async validateFileIntegrity(fileId: string) {
    const file = await this.getManagedFile({ id: fileId })
    if (!file) {
      throw new Error('受管文件不存在')
    }

    // 检查物理文件是否存在
    const physicalExists = await FilesystemOperations.fileExists(file.physicalPath)
    if (!physicalExists) {
      return {
        isValid: false,
        error: '物理文件不存在'
      }
    }

    // 验证文件哈希（如果有）
    if (file.fileHash) {
      const currentHash = await this.calculateFileHash(file.physicalPath)
      if (currentHash !== file.fileHash) {
        return {
          isValid: false,
          error: '文件哈希不匹配，文件可能已被修改'
        }
      }
    }

    return {
      isValid: true,
      error: null
    }
  }

  /**
   * 获取文件统计信息
   */
  static async getFileStats() {
    const result = await db
      .select({
        totalFiles: count(),
        totalSize: sum(managedFiles.fileSizeBytes)
      })
      .from(managedFiles)

    return result[0] || { totalFiles: 0, totalSize: 0 }
  }
}

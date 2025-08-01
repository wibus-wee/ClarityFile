import { db } from '../db'
import {
  managedFiles,
  documentVersions,
  logicalDocuments,
  projectAssets,
  expenseTrackings
} from '../../db/schema'
import { eq, like, count, sum } from 'drizzle-orm'
import { FilesystemOperations } from '../utils/filesystem-operations'
import { MimeTypeUtils } from '../utils/mime-type-utils'
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
  physicalPath?: string
  originalFileName?: string
  mimeType?: string
  fileSizeBytes?: number
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

export interface GetGlobalFilesInput {
  limit?: number
  offset?: number
  search?: string
  type?: string
  projectId?: string
  sortBy?: 'name' | 'date' | 'size' | 'type'
  sortOrder?: 'asc' | 'desc'
}

export interface FileSystemStatsOutput {
  totalFiles: number
  totalSize: number
  fileTypeDistribution: { type: string; count: number; size: number }[]
  projectDistribution: { projectId: string; projectName: string; count: number; size: number }[]
  recentFiles: any[]
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

  /**
   * 获取全局文件列表（支持搜索、筛选、排序）
   */
  static async getGlobalFiles(input: GetGlobalFilesInput = {}) {
    const {
      limit = 50,
      offset = 0,
      search,
      type,
      projectId,
      sortBy = 'date',
      sortOrder = 'desc'
    } = input

    // 简化查询，先获取所有文件然后在内存中过滤
    // TODO: 优化为数据库级别的过滤
    const allFiles = await db.select().from(managedFiles)

    let filteredFiles = allFiles

    // 项目过滤（支持多选）
    if (projectId) {
      const projectIds = projectId.split(',').map((id) => id.trim())
      console.log(`筛选项目: ${projectIds.join(', ')}`)

      // 获取与这些项目相关的文件ID
      const relatedFileIds = new Set<string>()

      for (const pid of projectIds) {
        // 1. 通过文档版本关联的文件
        const docVersionFiles = await db
          .select({ managedFileId: documentVersions.managedFileId })
          .from(documentVersions)
          .innerJoin(logicalDocuments, eq(documentVersions.logicalDocumentId, logicalDocuments.id))
          .where(eq(logicalDocuments.projectId, pid))

        docVersionFiles.forEach((f) => relatedFileIds.add(f.managedFileId))

        // 2. 通过项目资产关联的文件
        const assetFiles = await db
          .select({ managedFileId: projectAssets.managedFileId })
          .from(projectAssets)
          .where(eq(projectAssets.projectId, pid))

        assetFiles.forEach((f) => relatedFileIds.add(f.managedFileId))

        // 3. 通过经费记录关联的文件
        const expenseFiles = await db
          .select({ managedFileId: expenseTrackings.invoiceManagedFileId })
          .from(expenseTrackings)
          .where(eq(expenseTrackings.projectId, pid))

        expenseFiles.forEach((f) => f.managedFileId && relatedFileIds.add(f.managedFileId))
      }

      // 筛选出相关的文件
      filteredFiles = filteredFiles.filter((file) => relatedFileIds.has(file.id))
      console.log(`项目筛选后文件数量: ${filteredFiles.length}`)
    }

    // 搜索过滤
    if (search) {
      filteredFiles = filteredFiles.filter(
        (file) =>
          file.name.toLowerCase().includes(search.toLowerCase()) ||
          file.originalFileName?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // 类型过滤（支持多选）
    if (type) {
      const types = type.split(',').map((t) => t.trim())
      console.log(`筛选类型: ${types.join(', ')}`)
      console.log(`筛选前文件数量: ${filteredFiles.length}`)

      filteredFiles = filteredFiles.filter((file) => {
        if (!file.mimeType) {
          console.log(`文件 ${file.name} 没有MIME类型`)
          return false
        }

        // 检查文件是否匹配任一选中的类型
        return types.some((selectedType) => {
          let matches = false
          switch (selectedType) {
            case 'image':
              matches = file.mimeType?.startsWith('image/') || false
              break
            case 'video':
              matches = file.mimeType?.startsWith('video/') || false
              break
            case 'audio':
              matches = file.mimeType?.startsWith('audio/') || false
              break
            case 'text':
              matches = MimeTypeUtils.isDocumentFile(file.physicalPath || file.name)
              break
            case 'application':
              matches =
                (file.mimeType?.startsWith('application/') || false) &&
                !MimeTypeUtils.isDocumentFile(file.physicalPath || file.name)
              break
            default:
              matches = file.mimeType?.startsWith(selectedType) || false
          }
          return matches
        })
      })

      console.log(`筛选后文件数量: ${filteredFiles.length}`)
    }

    // 排序
    filteredFiles.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'size':
          aValue = a.fileSizeBytes || 0
          bValue = b.fileSizeBytes || 0
          break
        case 'type':
          aValue = a.mimeType || ''
          bValue = b.mimeType || ''
          break
        case 'date':
        default:
          aValue = a.createdAt
          bValue = b.createdAt
          break
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    const total = filteredFiles.length
    const files = filteredFiles.slice(offset, offset + limit)

    return {
      files,
      total,
      hasMore: offset + files.length < total
    }
  }

  /**
   * 获取文件系统统计信息
   */
  static async getFileSystemStats(): Promise<FileSystemStatsOutput> {
    // 简化实现，先获取所有文件然后在内存中统计
    const allFiles = await db.select().from(managedFiles)

    const totalFiles = allFiles.length
    const totalSize = allFiles.reduce((sum, file) => sum + (file.fileSizeBytes || 0), 0)

    // 文件类型分布统计
    const typeMap = new Map<string, { count: number; size: number }>()

    allFiles.forEach((file) => {
      const type = file.mimeType?.split('/')[0] || 'unknown'
      const existing = typeMap.get(type) || { count: 0, size: 0 }
      typeMap.set(type, {
        count: existing.count + 1,
        size: existing.size + (file.fileSizeBytes || 0)
      })
    })

    const fileTypeDistribution = Array.from(typeMap.entries()).map(([type, stats]) => ({
      type,
      count: stats.count,
      size: stats.size
    }))

    // 最近文件（按创建时间排序）
    const recentFiles = allFiles
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    return {
      totalFiles,
      totalSize,
      fileTypeDistribution,
      projectDistribution: [], // TODO: 实现项目分布统计
      recentFiles
    }
  }
}

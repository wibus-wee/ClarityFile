import { db } from '../db'
import { managedFiles } from '../../db/schema'
import { eq, like, count, sum } from 'drizzle-orm'
import { FilesystemOperations } from '../utils/filesystem-operations'
import { PathUtils } from '../utils/path-utils'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
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

export interface ImportFileInput {
  sourcePath: string
  targetDirectory: string
  displayName?: string
  preserveOriginalName?: boolean
}

/**
 * 受管文件服务
 * 负责文件的导入、存储、管理和元数据处理
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
   * 获取文件MIME类型
   */
  private static getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed'
    }

    return mimeTypes[ext] || 'application/octet-stream'
  }

  /**
   * 导入文件到受管存储
   */
  static async importFile(input: ImportFileInput) {
    try {
      // 检查源文件是否存在
      if (!(await FilesystemOperations.fileExists(input.sourcePath))) {
        throw new Error('源文件不存在')
      }

      // 获取文件信息
      const stats = await FilesystemOperations.getFileStats(input.sourcePath)
      if (!stats) {
        throw new Error('无法获取文件信息')
      }

      const originalFileName = path.basename(input.sourcePath)
      const displayName = input.displayName || originalFileName

      // 生成目标文件名
      let targetFileName = originalFileName
      if (!input.preserveOriginalName) {
        const ext = path.extname(originalFileName)
        const baseName = path.basename(originalFileName, ext)
        const sanitizedName = PathUtils.sanitizeFileName(baseName)
        targetFileName = `${sanitizedName}${ext}`
      }

      // 确保目标目录存在
      await PathUtils.ensurePathExists(input.targetDirectory)

      // 生成唯一的目标路径
      let targetPath = path.join(input.targetDirectory, targetFileName)
      let counter = 1
      while (await FilesystemOperations.fileExists(targetPath)) {
        const ext = path.extname(targetFileName)
        const baseName = path.basename(targetFileName, ext)
        targetPath = path.join(input.targetDirectory, `${baseName}_${counter}${ext}`)
        counter++
      }

      // 复制文件
      const copySuccess = await FilesystemOperations.copyFile(input.sourcePath, targetPath)
      if (!copySuccess) {
        throw new Error('文件复制失败')
      }

      // 计算文件哈希
      const fileHash = await this.calculateFileHash(targetPath)

      // 检查是否已存在相同哈希的文件
      const existingFile = await db
        .select()
        .from(managedFiles)
        .where(eq(managedFiles.fileHash, fileHash))
        .limit(1)

      if (existingFile.length > 0) {
        // 删除刚复制的文件，使用已存在的文件
        await FilesystemOperations.deleteFile(targetPath)
        console.log(`文件已存在，使用现有文件: ${existingFile[0].name}`)
        return existingFile[0]
      }

      // 创建受管文件记录
      const managedFile = await this.createManagedFile({
        name: displayName,
        originalFileName,
        physicalPath: targetPath,
        mimeType: this.getMimeType(targetPath),
        fileSizeBytes: stats.size
      })

      // 更新文件哈希
      await db.update(managedFiles).set({ fileHash }).where(eq(managedFiles.id, managedFile.id))

      console.log(`文件导入成功: ${displayName}`)
      return { ...managedFile, fileHash }
    } catch (error) {
      console.error('文件导入失败:', error)
      throw new Error(`文件导入失败: ${error instanceof Error ? error.message : String(error)}`)
    }
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

import { shell, dialog, BrowserWindow } from 'electron'
import path from 'path'
import { FilesystemOperations } from '../utils/filesystem-operations'
import { ManagedFileService } from './managed-file.service'
import type { SuccessResponse } from '../types/outputs'

export interface RenameFileInput {
  fileId: string
  newName: string
}

export interface CopyFileToDirectoryInput {
  fileId: string
  targetDirectory?: string // 如果不提供，会弹出选择对话框
}

export interface OpenFileWithSystemInput {
  filePath: string
}

export interface MoveFileToTrashInput {
  fileId: string
}

export interface SaveFileAsInput {
  fileId: string
  targetPath?: string // 如果不提供，会弹出保存对话框
}

/**
 * 文件系统操作服务
 * 负责高级文件操作，包括重命名、复制、预览、删除等
 */
export class FileSystemOperationsService {
  /**
   * 重命名文件（同时更新物理文件和数据库记录）
   */
  static async renameFile(input: RenameFileInput): Promise<SuccessResponse> {
    try {
      const { fileId, newName } = input

      // 获取文件记录
      const file = await ManagedFileService.getManagedFile({ id: fileId })
      if (!file) {
        throw new Error('文件不存在')
      }

      // 验证新文件名
      if (!newName || newName.trim().length === 0) {
        throw new Error('文件名不能为空')
      }

      // 获取文件扩展名
      const oldPath = file.physicalPath
      const directory = path.dirname(oldPath)
      const extension = path.extname(file.originalFileName)
      const newFileName = newName.endsWith(extension) ? newName : `${newName}${extension}`
      const newPath = path.join(directory, newFileName)

      // 检查新文件名是否已存在
      if (await FilesystemOperations.fileExists(newPath)) {
        throw new Error('目标文件名已存在')
      }

      // 重命名物理文件
      const renameSuccess = await FilesystemOperations.moveFile(oldPath, newPath)
      if (!renameSuccess) {
        throw new Error('重命名物理文件失败')
      }

      // 更新数据库记录
      await ManagedFileService.updateManagedFile({
        id: fileId,
        name: newName,
        physicalPath: newPath,
        originalFileName: newFileName
      })

      console.log(`文件重命名成功: ${oldPath} -> ${newPath}`)
      return { success: true }
    } catch (error) {
      console.error('重命名文件失败:', error)
      throw new Error(error instanceof Error ? error.message : '重命名文件失败')
    }
  }

  /**
   * 复制文件到指定目录
   */
  static async copyFileToDirectory(
    input: CopyFileToDirectoryInput,
    context?: any
  ): Promise<{ success: boolean; targetPath?: string }> {
    try {
      const { fileId, targetDirectory } = input

      // 获取文件记录
      const file = await ManagedFileService.getManagedFile({ id: fileId })
      if (!file) {
        throw new Error('文件不存在')
      }

      let finalTargetDirectory = targetDirectory

      // 如果没有指定目标目录，弹出选择对话框
      if (!finalTargetDirectory && context) {
        const browserWindow = BrowserWindow.fromWebContents(context.sender)
        if (browserWindow) {
          const result = await dialog.showOpenDialog(browserWindow, {
            title: '选择保存位置',
            properties: ['openDirectory', 'createDirectory'],
            buttonLabel: '选择文件夹'
          })

          if (result.canceled || result.filePaths.length === 0) {
            return { success: false }
          }

          finalTargetDirectory = result.filePaths[0]
        }
      }

      if (!finalTargetDirectory) {
        throw new Error('未指定目标目录')
      }

      // 生成目标文件路径
      const fileName = path.basename(file.physicalPath)
      const targetPath = path.join(finalTargetDirectory, fileName)

      // 检查目标文件是否已存在
      if (await FilesystemOperations.fileExists(targetPath)) {
        // 生成唯一文件名
        const baseName = path.parse(fileName).name
        const extension = path.parse(fileName).ext
        let counter = 1
        let uniquePath = targetPath

        while (await FilesystemOperations.fileExists(uniquePath)) {
          const uniqueName = `${baseName} (${counter})${extension}`
          uniquePath = path.join(finalTargetDirectory, uniqueName)
          counter++
        }

        // 复制文件
        const copySuccess = await FilesystemOperations.copyFile(file.physicalPath, uniquePath)
        if (!copySuccess) {
          throw new Error('复制文件失败')
        }

        console.log(`文件复制成功: ${file.physicalPath} -> ${uniquePath}`)
        return { success: true, targetPath: uniquePath }
      } else {
        // 复制文件
        const copySuccess = await FilesystemOperations.copyFile(file.physicalPath, targetPath)
        if (!copySuccess) {
          throw new Error('复制文件失败')
        }

        console.log(`文件复制成功: ${file.physicalPath} -> ${targetPath}`)
        return { success: true, targetPath }
      }
    } catch (error) {
      console.error('复制文件失败:', error)
      throw new Error(error instanceof Error ? error.message : '复制文件失败')
    }
  }

  /**
   * 使用系统默认应用打开文件
   */
  static async openFileWithSystem(input: OpenFileWithSystemInput): Promise<SuccessResponse> {
    try {
      const { filePath } = input

      // 验证文件是否存在
      if (!(await FilesystemOperations.fileExists(filePath))) {
        throw new Error('文件不存在')
      }

      // 使用系统默认应用打开文件
      const result = await shell.openPath(filePath)

      if (result) {
        // 如果返回非空字符串，表示出现错误
        throw new Error(`打开文件失败: ${result}`)
      }

      console.log(`文件已用系统默认应用打开: ${filePath}`)
      return { success: true }
    } catch (error) {
      console.error('打开文件失败:', error)
      throw new Error(error instanceof Error ? error.message : '打开文件失败')
    }
  }

  /**
   * 移动文件到回收站
   */
  static async moveFileToTrash(input: MoveFileToTrashInput): Promise<SuccessResponse> {
    try {
      const { fileId } = input

      // 获取文件记录
      const file = await ManagedFileService.getManagedFile({ id: fileId })
      if (!file) {
        throw new Error('文件不存在')
      }

      // 验证物理文件是否存在
      if (!(await FilesystemOperations.fileExists(file.physicalPath))) {
        console.warn(`物理文件不存在，仅删除数据库记录: ${file.physicalPath}`)
      } else {
        // 移动到回收站
        await shell.trashItem(file.physicalPath)
        console.log(`文件已移动到回收站: ${file.physicalPath}`)
      }

      // 删除数据库记录
      await ManagedFileService.deleteManagedFile({ id: fileId, deletePhysicalFile: false })

      return { success: true }
    } catch (error) {
      console.error('移动文件到回收站失败:', error)
      throw new Error(error instanceof Error ? error.message : '移动文件到回收站失败')
    }
  }

  /**
   * 另存为文件
   */
  static async saveFileAs(
    input: SaveFileAsInput,
    context?: any
  ): Promise<{ success: boolean; targetPath?: string }> {
    try {
      const { fileId, targetPath } = input

      // 获取文件记录
      const file = await ManagedFileService.getManagedFile({ id: fileId })
      if (!file) {
        throw new Error('文件不存在')
      }

      let finalTargetPath = targetPath

      // 如果没有指定目标路径，弹出保存对话框
      if (!finalTargetPath && context) {
        const browserWindow = BrowserWindow.fromWebContents(context.sender)
        if (browserWindow) {
          const result = await dialog.showSaveDialog(browserWindow, {
            title: '另存为',
            defaultPath: file.originalFileName,
            filters: [{ name: '所有文件', extensions: ['*'] }]
          })

          if (result.canceled || !result.filePath) {
            return { success: false }
          }

          finalTargetPath = result.filePath
        }
      }

      if (!finalTargetPath) {
        throw new Error('未指定目标路径')
      }

      // 复制文件
      const copySuccess = await FilesystemOperations.copyFile(file.physicalPath, finalTargetPath)
      if (!copySuccess) {
        throw new Error('保存文件失败')
      }

      console.log(`文件另存为成功: ${file.physicalPath} -> ${finalTargetPath}`)
      return { success: true, targetPath: finalTargetPath }
    } catch (error) {
      console.error('另存为文件失败:', error)
      throw new Error(error instanceof Error ? error.message : '另存为文件失败')
    }
  }

  /**
   * 批量移动文件到回收站
   */
  static async batchMoveFilesToTrash(fileIds: string[]): Promise<{
    success: boolean
    results: Array<{ fileId: string; success: boolean; error?: string }>
  }> {
    const results: Array<{ fileId: string; success: boolean; error?: string }> = []

    for (const fileId of fileIds) {
      try {
        await this.moveFileToTrash({ fileId })
        results.push({ fileId, success: true })
      } catch (error) {
        results.push({
          fileId,
          success: false,
          error: error instanceof Error ? error.message : '删除失败'
        })
      }
    }

    const allSuccess = results.every((r) => r.success)
    return { success: allSuccess, results }
  }

  /**
   * 批量复制文件到目录
   */
  static async batchCopyFilesToDirectory(
    fileIds: string[],
    targetDirectory: string
  ): Promise<{
    success: boolean
    results: Array<{ fileId: string; success: boolean; targetPath?: string; error?: string }>
  }> {
    const results: Array<{
      fileId: string
      success: boolean
      targetPath?: string
      error?: string
    }> = []

    for (const fileId of fileIds) {
      try {
        const result = await this.copyFileToDirectory({ fileId, targetDirectory })
        results.push({ fileId, success: result.success, targetPath: result.targetPath })
      } catch (error) {
        results.push({
          fileId,
          success: false,
          error: error instanceof Error ? error.message : '复制失败'
        })
      }
    }

    const allSuccess = results.every((r) => r.success)
    return { success: allSuccess, results }
  }
}

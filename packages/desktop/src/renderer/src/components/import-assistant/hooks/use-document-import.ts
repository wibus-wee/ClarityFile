import { useCallback } from 'react'
import type { DroppedFileInfo, DocumentImportConfig, ImportHandlerResult } from '../core/types'
import { validateFileForImportType } from '../core/utils'
import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { tipcClient } from '@renderer/lib/tipc-client'
import { toast } from 'sonner'

/**
 * 文档导入自定义Hook
 * 处理文档导入流程并集成到相关 drawer 组件
 */
export function useDocumentImportHandler() {
  const { openDocumentForm, openDocumentVersionForm, updateDocumentForm } = useGlobalDrawersStore()

  /**
   * 验证文件是否适合文档导入
   */
  const validateFiles = useCallback((files: DroppedFileInfo[]): ImportHandlerResult => {
    if (files.length === 0) {
      return {
        success: false,
        error: '没有选择文件'
      }
    }

    if (files.length > 1) {
      return {
        success: false,
        error: '文档导入一次只能导入一个文件'
      }
    }

    const file = files[0]
    const validation = validateFileForImportType(file, 'document')

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.reason
      }
    }

    return {
      success: true
    }
  }, [])

  /**
   * 查找项目中是否已有对应的逻辑文档
   */
  const findExistingDocument = useCallback(
    async (file: DroppedFileInfo, projectId: string): Promise<any | null> => {
      try {
        // 获取项目的所有文档
        const documents = await tipcClient.getProjectDocuments({ projectId })

        // 根据文件名推断文档名称
        const inferredDocumentName = DocumentImportUtils.inferDocumentNameFromFile(file)

        // 查找名称相似的文档
        const matchingDocument = documents.find(
          (doc) =>
            doc.name.toLowerCase().includes(inferredDocumentName.toLowerCase()) ||
            inferredDocumentName.toLowerCase().includes(doc.name.toLowerCase())
        )

        return matchingDocument || null
      } catch (error) {
        console.error('查找现有文档失败:', error)
        return null
      }
    },
    []
  )

  /**
   * 选择现有文档并添加版本
   */
  const selectExistingDocumentForVersion = useCallback(
    async (file: DroppedFileInfo, config: DocumentImportConfig): Promise<void> => {
      try {
        // 获取项目的所有文档
        const documents = await tipcClient.getProjectDocuments({ projectId: config.projectId })

        if (documents.length === 0) {
          toast.error('项目中没有现有文档，请选择创建新文档')
          return
        }

        // 这里应该打开一个文档选择界面，但为了简化，我们先选择第一个文档
        // TODO: 实现文档选择界面
        const selectedDocument = documents[0]

        await addVersionToExistingDocument(file, selectedDocument, config)
      } catch (error) {
        console.error('选择现有文档失败:', error)
        toast.error('选择现有文档失败')
      }
    },
    [openDocumentVersionForm]
  )

  /**
   * 为现有文档添加版本
   */
  const addVersionToExistingDocument = useCallback(
    async (file: DroppedFileInfo, document: any, config: DocumentImportConfig): Promise<void> => {
      // 获取文档详情（包含版本信息）
      const documentWithVersions = await tipcClient.getLogicalDocumentWithVersions({
        id: document.id
      })

      if (!documentWithVersions) {
        throw new Error('获取文档版本信息失败')
      }

      // 生成版本标签
      const versionTag =
        config.versionTag || DocumentImportUtils.generateVersionTag(documentWithVersions.versions)

      openDocumentVersionForm({
        mode: 'create',
        document: documentWithVersions,
        preselectedFile: file,
        prefilledData: {
          versionTag,
          notes: config.notes || `导入文件：${file.name}`,
          isGenericVersion: config.isGenericVersion ?? true
        }
      })

      toast.success(`准备为文档 "${document.name}" 添加新版本`, {
        description: '正在打开版本表单...'
      })
    },
    [openDocumentVersionForm]
  )

  /**
   * 创建新文档并添加第一个版本
   */
  const createNewDocumentWithVersion = useCallback(
    async (file: DroppedFileInfo, config: DocumentImportConfig): Promise<void> => {
      // 推断文档信息
      const inferredDocumentName =
        config.logicalDocumentName || DocumentImportUtils.inferDocumentNameFromFile(file)
      const inferredDocumentType =
        config.logicalDocumentType || DocumentImportUtils.inferDocumentTypeFromFile(file)

      openDocumentForm({
        mode: 'create',
        projectId: config.projectId,
        prefilledData: {
          name: inferredDocumentName,
          type: inferredDocumentType,
          description: `从文件 ${file.name} 导入`
        }
      })

      // 暂存文件信息，用于后续创建版本
      updateDocumentForm({
        preselectedFile: file
      })

      toast.success(`准备创建新文档：${inferredDocumentName}`, {
        description: '正在打开文档表单...'
      })
    },
    [openDocumentForm, updateDocumentForm]
  )

  /**
   * 处理文档导入
   */
  const handleImport = useCallback(
    async (
      files: DroppedFileInfo[],
      config: DocumentImportConfig
    ): Promise<ImportHandlerResult> => {
      try {
        // 验证文件
        const validationResult = validateFiles(files)
        if (!validationResult.success) {
          return validationResult
        }

        // 验证必需的配置
        if (!config.projectId) {
          return {
            success: false,
            error: '请先选择目标项目'
          }
        }

        // 目前只支持单个文件导入
        const file = files[0]

        // 根据配置决定导入方式
        if (config.forceCreateNew) {
          // 强制创建新文档
          await createNewDocumentWithVersion(file, config)
        } else if (config.forceAddVersion) {
          // 强制为现有文档添加版本，需要用户选择文档
          await selectExistingDocumentForVersion(file, config)
        } else {
          // 自动检查（保留原有逻辑，但现在不会被使用）
          const existingDocument = await findExistingDocument(file, config.projectId)

          if (existingDocument) {
            // 如果有现有文档，直接添加版本
            await addVersionToExistingDocument(file, existingDocument, config)
          } else {
            // 如果没有现有文档，创建新文档
            await createNewDocumentWithVersion(file, config)
          }
        }

        return {
          success: true,
          processedCount: 1
        }
      } catch (error) {
        console.error('文档导入失败:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : '导入失败'
        }
      }
    },
    [
      validateFiles,
      createNewDocumentWithVersion,
      selectExistingDocumentForVersion,
      findExistingDocument,
      addVersionToExistingDocument
    ]
  )

  return {
    handleImport,
    validateFiles,
    findExistingDocument,
    selectExistingDocumentForVersion,
    addVersionToExistingDocument,
    createNewDocumentWithVersion
  }
}

/**
 * 文档导入工具函数
 * 提供文件解析和验证的纯函数
 */
export const DocumentImportUtils = {
  /**
   * 从文件名推断文档名称
   */
  inferDocumentNameFromFile(file: DroppedFileInfo): string {
    const fileName = file.name

    // 移除文件扩展名
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')

    // 移除常见的版本标识
    const cleanName = nameWithoutExt
      .replace(/[_\-\s]*v?\d+(\.\d+)*[_\-\s]*$/i, '') // 移除版本号
      .replace(/[_\-\s]*final[_\-\s]*$/i, '') // 移除 final
      .replace(/[_\-\s]*draft[_\-\s]*$/i, '') // 移除 draft
      .replace(/[_\-\s]*\d{4}[_\-\s]*\d{1,2}[_\-\s]*\d{1,2}[_\-\s]*$/i, '') // 移除日期

    // 替换下划线和连字符为空格，并清理多余空格
    return (
      cleanName
        .replace(/[_\-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || '新文档'
    )
  },

  /**
   * 从文件名推断文档类型
   */
  inferDocumentTypeFromFile(file: DroppedFileInfo): string {
    const fileName = file.name.toLowerCase()

    // 文档类型关键词映射
    const typeKeywords = {
      requirements: ['需求', 'requirement', 'req', '规格'],
      design_doc: ['设计', 'design', '架构', 'architecture'],
      technical_doc: ['技术', 'technical', 'tech', 'api'],
      business_plan: ['商业', 'business', '计划', 'plan'],
      presentation: ['演示', 'presentation', 'ppt', '汇报'],
      meeting_minutes: ['会议', 'meeting', '纪要', 'minutes'],
      project_report: ['报告', 'report', '总结', 'summary'],
      specification: ['说明', 'specification', 'spec', '文档']
    }

    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some((keyword) => fileName.includes(keyword))) {
        return type
      }
    }

    // 根据文件扩展名推断
    switch (file.extension) {
      case 'ppt':
      case 'pptx':
        return 'presentation'
      case 'md':
        return 'technical_doc'
      default:
        return 'other'
    }
  },

  /**
   * 生成版本标签
   */
  generateVersionTag(existingVersions: any[]): string {
    const versionNumber = existingVersions.length + 1
    return `v${versionNumber}`
  },

  /**
   * 检查文件是否为文档文件
   */
  isDocumentFile(file: DroppedFileInfo): boolean {
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'md', 'ppt', 'pptx']
    return documentExtensions.includes(file.extension.toLowerCase())
  }
}

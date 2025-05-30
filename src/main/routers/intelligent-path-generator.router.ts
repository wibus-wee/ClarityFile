import { IntelligentPathGeneratorService } from '../services/intelligent/intelligent-path-generator.service'
import { ITipc } from '../types'

export function intelligentPathGeneratorRouter(t: ITipc) {
  return {
    // 生成项目文档路径
    generateDocumentPath: t.procedure
      .input<{
        projectName: string
        projectId: string
        logicalDocumentName: string
        clarityFileRoot?: string
      }>()
      .action(async ({ input }) => {
        return await IntelligentPathGeneratorService.generateDocumentPath(input)
      }),

    // 生成项目资产路径
    generateProjectAssetPath: t.procedure
      .input<{
        projectName: string
        projectId: string
        assetType: string
        clarityFileRoot?: string
      }>()
      .action(async ({ input }) => {
        return await IntelligentPathGeneratorService.generateProjectAssetPath(input)
      }),

    // 生成项目经费报销路径
    generateProjectExpensePath: t.procedure
      .input<{
        projectName: string
        projectId: string
        expenseDescription: string
        applicantName?: string
        clarityFileRoot?: string
      }>()
      .action(async ({ input }) => {
        return await IntelligentPathGeneratorService.generateProjectExpensePath(input)
      }),

    // 生成共享资源路径
    generateSharedResourcePath: t.procedure
      .input<{
        resourceType: string
        clarityFileRoot?: string
      }>()
      .action(async ({ input }) => {
        return await IntelligentPathGeneratorService.generateSharedResourcePath(input)
      }),

    // 生成比赛资料路径
    generateCompetitionPath: t.procedure
      .input<{
        seriesName: string
        levelName: string
        clarityFileRoot?: string
      }>()
      .action(async ({ input }) => {
        return await IntelligentPathGeneratorService.generateCompetitionPath(input)
      }),

    // 生成临时文件路径（Inbox）
    generateInboxPath: t.procedure
      .input<{
        clarityFileRoot?: string
        date?: string
      }>()
      .action(async ({ input }) => {
        const params = {
          ...input,
          date: input.date ? new Date(input.date) : undefined
        }
        return await IntelligentPathGeneratorService.generateInboxPath(params)
      }),

    // 生成系统文件路径
    generateSystemPath: t.procedure
      .input<{
        subType: 'database' | 'config' | 'logs' | 'temp'
        clarityFileRoot?: string
      }>()
      .action(async ({ input }) => {
        return await IntelligentPathGeneratorService.generateSystemPath(input)
      }),

    // 生成完整文件路径
    generateCompleteFilePath: t.procedure
      .input<{
        type: 'document' | 'asset' | 'expense' | 'shared' | 'competition' | 'inbox'
        pathParams: any
        fileName: string
      }>()
      .action(async ({ input }) => {
        return await IntelligentPathGeneratorService.generateCompleteFilePath(input)
      }),

    // 确保路径存在
    ensurePathExists: t.procedure
      .input<{
        targetPath: string
      }>()
      .action(async ({ input }) => {
        return await IntelligentPathGeneratorService.ensurePathExists(input.targetPath)
      }),

    // 验证路径
    validatePath: t.procedure
      .input<{
        filePath: string
      }>()
      .action(async ({ input }) => {
        return IntelligentPathGeneratorService.validatePath(input.filePath)
      }),

    // 获取相对显示路径
    getRelativeDisplayPath: t.procedure
      .input<{
        fullPath: string
        clarityFileRoot?: string
      }>()
      .action(async ({ input }) => {
        return IntelligentPathGeneratorService.getRelativeDisplayPath(
          input.fullPath,
          input.clarityFileRoot
        )
      }),

    // 预览完整的文件存储方案
    previewFileStorageScheme: t.procedure
      .input<{
        type: 'document' | 'asset' | 'expense' | 'shared' | 'competition' | 'inbox'
        pathParams: any
        fileName: string
        clarityFileRoot?: string
      }>()
      .action(async ({ input }) => {
        try {
          const { type, pathParams, fileName, clarityFileRoot } = input

          // 生成目录路径
          let directoryPath: string
          switch (type) {
            case 'document':
              directoryPath = await IntelligentPathGeneratorService.generateDocumentPath({
                ...pathParams,
                clarityFileRoot
              })
              break
            case 'asset':
              directoryPath = await IntelligentPathGeneratorService.generateProjectAssetPath({
                ...pathParams,
                clarityFileRoot
              })
              break
            case 'expense':
              directoryPath = await IntelligentPathGeneratorService.generateProjectExpensePath({
                ...pathParams,
                clarityFileRoot
              })
              break
            case 'shared':
              directoryPath = await IntelligentPathGeneratorService.generateSharedResourcePath({
                ...pathParams,
                clarityFileRoot
              })
              break
            case 'competition':
              directoryPath = await IntelligentPathGeneratorService.generateCompetitionPath({
                ...pathParams,
                clarityFileRoot
              })
              break
            case 'inbox':
              directoryPath = await IntelligentPathGeneratorService.generateInboxPath({
                ...pathParams,
                clarityFileRoot
              })
              break
            default:
              throw new Error(`不支持的文件类型: ${type}`)
          }

          // 生成完整文件路径
          const fullPath = await IntelligentPathGeneratorService.generateCompleteFilePath({
            type,
            pathParams: { ...pathParams, clarityFileRoot },
            fileName
          })

          // 验证路径
          const validation = IntelligentPathGeneratorService.validatePath(fullPath)

          // 获取相对显示路径
          const relativePath = IntelligentPathGeneratorService.getRelativeDisplayPath(
            fullPath,
            clarityFileRoot
          )

          return {
            directoryPath,
            fullPath,
            relativePath,
            fileName,
            isValid: validation.isValid,
            errors: validation.errors,
            pathLength: fullPath.length
          }
        } catch (error) {
          return {
            directoryPath: '',
            fullPath: '',
            relativePath: '',
            fileName: input.fileName || '',
            isValid: false,
            errors: [error instanceof Error ? error.message : '路径生成失败'],
            pathLength: 0
          }
        }
      })
  }
}

import { IntelligentPathGeneratorService } from '../services/intelligent-path-generator.service'

export function intelligentPathGeneratorRouter(t: any) {
  return {
    // 生成项目文档路径
    generateDocumentPath: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          projectName: string
          projectId: string
          logicalDocumentName: string
          clarityFileRoot?: string
        }
      }) => {
        return await IntelligentPathGeneratorService.generateDocumentPath(input)
      }),

    // 生成项目资产路径
    generateProjectAssetPath: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          projectName: string
          projectId: string
          assetType: string
          clarityFileRoot?: string
        }
      }) => {
        return await IntelligentPathGeneratorService.generateProjectAssetPath(input)
      }),

    // 生成项目经费报销路径
    generateProjectExpensePath: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          projectName: string
          projectId: string
          expenseDescription: string
          applicantName?: string
          clarityFileRoot?: string
        }
      }) => {
        return await IntelligentPathGeneratorService.generateProjectExpensePath(input)
      }),

    // 生成共享资源路径
    generateSharedResourcePath: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          resourceType: string
          clarityFileRoot?: string
        }
      }) => {
        return await IntelligentPathGeneratorService.generateSharedResourcePath(input)
      }),

    // 生成比赛资料路径
    generateCompetitionPath: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          seriesName: string
          levelName: string
          clarityFileRoot?: string
        }
      }) => {
        return await IntelligentPathGeneratorService.generateCompetitionPath(input)
      }),

    // 生成临时文件路径（Inbox）
    generateInboxPath: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          clarityFileRoot?: string
          date?: string
        }
      }) => {
        const params = {
          ...input,
          date: input.date ? new Date(input.date) : undefined
        }
        return await IntelligentPathGeneratorService.generateInboxPath(params)
      }),

    // 生成系统文件路径
    generateSystemPath: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          subType: 'database' | 'config' | 'logs' | 'temp'
          clarityFileRoot?: string
        }
      }) => {
        return await IntelligentPathGeneratorService.generateSystemPath(input)
      }),

    // 生成完整文件路径
    generateCompleteFilePath: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          type: 'document' | 'asset' | 'expense' | 'shared' | 'competition' | 'inbox'
          pathParams: any
          fileName: string
        }
      }) => {
        return await IntelligentPathGeneratorService.generateCompleteFilePath(input)
      }),

    // 确保路径存在
    ensurePathExists: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          targetPath: string
        }
      }) => {
        return await IntelligentPathGeneratorService.ensurePathExists(input.targetPath)
      }),

    // 验证路径
    validatePath: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          filePath: string
        }
      }) => {
        return IntelligentPathGeneratorService.validatePath(input.filePath)
      }),

    // 获取相对显示路径
    getRelativeDisplayPath: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          fullPath: string
          clarityFileRoot?: string
        }
      }) => {
        return IntelligentPathGeneratorService.getRelativeDisplayPath(input.fullPath, input.clarityFileRoot)
      }),

    // 预览完整的文件存储方案
    previewFileStorageScheme: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          type: 'document' | 'asset' | 'expense' | 'shared' | 'competition' | 'inbox'
          pathParams: any
          fileName: string
          clarityFileRoot?: string
        }
      }) => {
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
          const relativePath = IntelligentPathGeneratorService.getRelativeDisplayPath(fullPath, clarityFileRoot)

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
            fileName,
            isValid: false,
            errors: [error instanceof Error ? error.message : '路径生成失败'],
            pathLength: 0
          }
        }
      })
  }
}

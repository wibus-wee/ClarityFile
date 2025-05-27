import { IntelligentNamingService } from '../services/intelligent-naming.service'

export function intelligentNamingRouter(t: any) {
  return {
    // 为文档版本生成智能文件名
    generateDocumentVersionFileName: t.procedure
      .input()
      .action(async ({ input }: { 
        input: {
          documentType: string
          versionTag: string
          isGenericVersion: boolean
          competitionInfo?: {
            seriesName?: string
            levelName?: string
            projectName?: string
          }
          originalFileName: string
          createdAt?: string
        }
      }) => {
        const params = {
          ...input,
          createdAt: input.createdAt ? new Date(input.createdAt) : undefined
        }
        return IntelligentNamingService.generateDocumentVersionFileName(params)
      }),

    // 为项目资产生成智能文件名
    generateProjectAssetFileName: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          assetType: string
          assetName: string
          originalFileName: string
          createdAt?: string
        }
      }) => {
        const params = {
          ...input,
          createdAt: input.createdAt ? new Date(input.createdAt) : undefined
        }
        return IntelligentNamingService.generateProjectAssetFileName(params)
      }),

    // 为共享资源生成智能文件名
    generateSharedResourceFileName: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          resourceName: string
          resourceType: string
          customFields?: Record<string, any>
          originalFileName: string
          createdAt?: string
        }
      }) => {
        const params = {
          ...input,
          createdAt: input.createdAt ? new Date(input.createdAt) : undefined
        }
        return IntelligentNamingService.generateSharedResourceFileName(params)
      }),

    // 为比赛通知生成智能文件名
    generateCompetitionNotificationFileName: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          seriesName: string
          levelName: string
          originalFileName: string
          year?: number
        }
      }) => {
        return IntelligentNamingService.generateCompetitionNotificationFileName(input)
      }),

    // 生成唯一文件名（处理冲突）
    generateUniqueFileName: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          baseFileName: string
          existingFiles: string[]
        }
      }) => {
        return IntelligentNamingService.generateUniqueFileName(input.baseFileName, input.existingFiles)
      }),

    // 验证文件名
    validateFileName: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          fileName: string
        }
      }) => {
        return IntelligentNamingService.validateFileName(input.fileName)
      }),

    // 获取文档类型缩写列表
    getDocumentTypeAbbreviations: t.procedure.action(async () => {
      return {
        'business_plan': 'BP',
        'presentation': 'PPT',
        'report': 'RPT',
        'proposal': 'PROP',
        'specification': 'SPEC',
        'manual': 'MAN',
        'contract': 'CONT',
        'other': 'DOC'
      }
    }),

    // 获取资产类型缩写列表
    getAssetTypeAbbreviations: t.procedure.action(async () => {
      return {
        'screenshot': 'Screenshot',
        'logo': 'Logo',
        'icon': 'Icon',
        'diagram': 'Diagram',
        'photo': 'Photo',
        'video': 'Video',
        'audio': 'Audio',
        'other': 'Asset'
      }
    }),

    // 预览文件名生成结果
    previewFileName: t.procedure
      .input()
      .action(async ({ input }: {
        input: {
          type: 'document' | 'asset' | 'shared' | 'competition'
          params: any
        }
      }) => {
        const { type, params } = input
        
        try {
          let fileName: string
          
          switch (type) {
            case 'document':
              fileName = IntelligentNamingService.generateDocumentVersionFileName({
                ...params,
                createdAt: params.createdAt ? new Date(params.createdAt) : undefined
              })
              break
              
            case 'asset':
              fileName = IntelligentNamingService.generateProjectAssetFileName({
                ...params,
                createdAt: params.createdAt ? new Date(params.createdAt) : undefined
              })
              break
              
            case 'shared':
              fileName = IntelligentNamingService.generateSharedResourceFileName({
                ...params,
                createdAt: params.createdAt ? new Date(params.createdAt) : undefined
              })
              break
              
            case 'competition':
              fileName = IntelligentNamingService.generateCompetitionNotificationFileName(params)
              break
              
            default:
              throw new Error('不支持的文件类型')
          }
          
          const validation = IntelligentNamingService.validateFileName(fileName)
          
          return {
            fileName,
            isValid: validation.isValid,
            errors: validation.errors,
            length: fileName.length
          }
        } catch (error) {
          return {
            fileName: '',
            isValid: false,
            errors: [error instanceof Error ? error.message : '生成失败'],
            length: 0
          }
        }
      })
  }
}

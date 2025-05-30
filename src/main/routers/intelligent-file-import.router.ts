import { IntelligentFileImportService } from '../services/intelligent/intelligent-file-import.service'
import type { FileImportContext } from '../services/intelligent/intelligent-file-import.service'
import { ITipc } from '../types'

export function intelligentFileImportRouter(t: ITipc) {
  return {
    // 导入单个文件
    importFile: t.procedure.input<FileImportContext>().action(async ({ input }) => {
      return await IntelligentFileImportService.importFile(input)
    }),

    // 预览文件导入方案
    previewImport: t.procedure.input<FileImportContext>().action(async ({ input }) => {
      return await IntelligentFileImportService.previewImport(input)
    }),

    // 批量导入文件
    batchImportFiles: t.procedure
      .input<{ contexts: FileImportContext[] }>()
      .action(async ({ input }) => {
        return await IntelligentFileImportService.batchImportFiles(input.contexts)
      }),

    // 获取支持的文件类型
    getSupportedFileTypes: t.procedure.action(async () => {
      return IntelligentFileImportService.getSupportedFileTypes()
    }),

    // 验证文件类型是否支持
    isFileTypeSupported: t.procedure
      .input<{ fileName: string; importType: string }>()
      .action(async ({ input }) => {
        return IntelligentFileImportService.isFileTypeSupported(input.fileName, input.importType)
      }),

    // 获取导入向导的配置选项
    getImportWizardOptions: t.procedure.action(async () => {
      return {
        importTypes: [
          {
            value: 'document',
            label: '项目文档',
            description: '项目相关的文档文件，如商业计划书、PPT等',
            icon: '📄',
            requiredFields: [
              'projectId',
              'projectName',
              'logicalDocumentName',
              'logicalDocumentType',
              'versionTag'
            ],
            optionalFields: ['logicalDocumentId', 'isGenericVersion', 'competitionInfo', 'notes']
          },
          {
            value: 'asset',
            label: '项目资产',
            description: '项目相关的资产文件，如截图、Logo等',
            icon: '🖼️',
            requiredFields: ['projectId', 'projectName', 'assetType', 'assetName'],
            optionalFields: ['notes']
          },
          {
            value: 'expense',
            label: '经费报销',
            description: '项目经费报销相关的文件，如发票、收据等',
            icon: '💰',
            requiredFields: ['projectId', 'projectName', 'expenseDescription'],
            optionalFields: ['applicantName', 'notes']
          },
          {
            value: 'shared',
            label: '共享资源',
            description: '团队共享的资源文件，如专利、资质等',
            icon: '🤝',
            requiredFields: ['resourceType', 'resourceName'],
            optionalFields: ['customFields', 'notes']
          },
          {
            value: 'competition',
            label: '比赛资料',
            description: '比赛相关的官方文件，如通知、章程等',
            icon: '🏆',
            requiredFields: ['seriesName', 'levelName'],
            optionalFields: ['year', 'notes']
          },
          {
            value: 'inbox',
            label: '临时文件',
            description: '暂时存放的文件，稍后整理分类',
            icon: '📥',
            requiredFields: [],
            optionalFields: ['notes']
          }
        ],
        documentTypes: [
          { value: 'business_plan', label: '商业计划书', abbreviation: 'BP' },
          { value: 'presentation', label: 'PPT演示', abbreviation: 'PPT' },
          { value: 'report', label: '项目报告', abbreviation: 'RPT' },
          { value: 'proposal', label: '项目提案', abbreviation: 'PROP' },
          { value: 'specification', label: '项目说明书', abbreviation: 'SPEC' },
          { value: 'manual', label: '使用手册', abbreviation: 'MAN' },
          { value: 'contract', label: '合同协议', abbreviation: 'CONT' },
          { value: 'other', label: '其他文档', abbreviation: 'DOC' }
        ],
        assetTypes: [
          { value: 'screenshot', label: '软件截图', abbreviation: 'Screenshot' },
          { value: 'logo', label: '项目Logo', abbreviation: 'Logo' },
          { value: 'icon', label: '图标素材', abbreviation: 'Icon' },
          { value: 'diagram', label: '流程图表', abbreviation: 'Diagram' },
          { value: 'photo', label: '照片图片', abbreviation: 'Photo' },
          { value: 'video', label: '视频文件', abbreviation: 'Video' },
          { value: 'audio', label: '音频文件', abbreviation: 'Audio' },
          { value: 'other', label: '其他资产', abbreviation: 'Asset' }
        ],
        resourceTypes: [
          { value: '专利成果', label: '专利成果' },
          { value: '红头文件', label: '红头文件' },
          { value: '团队资质', label: '团队资质' },
          { value: '通用PPT模板', label: '通用PPT模板' },
          { value: '法律文件', label: '法律文件' },
          { value: '技术标准', label: '技术标准' },
          { value: '其他资源', label: '其他资源' }
        ],
        competitionSeries: [
          { value: '挑战杯', label: '挑战杯' },
          { value: '互联网+大学生创新创业大赛', label: '互联网+大学生创新创业大赛' },
          { value: '大学生创新创业训练计划', label: '大学生创新创业训练计划' },
          { value: '全国大学生数学建模竞赛', label: '全国大学生数学建模竞赛' },
          { value: '蓝桥杯', label: '蓝桥杯' },
          { value: 'ACM', label: 'ACM' },
          { value: '其他比赛', label: '其他比赛' }
        ],
        competitionLevels: [
          { value: '校级初赛', label: '校级初赛' },
          { value: '省级复赛', label: '省级复赛' },
          { value: '国家级决赛', label: '国家级决赛' },
          { value: '校级', label: '校级' },
          { value: '省级', label: '省级' },
          { value: '国家级', label: '国家级' },
          { value: '市级', label: '市级' },
          { value: '区级', label: '区级' }
        ]
      }
    }),

    // 验证导入上下文
    validateImportContext: t.procedure.input<FileImportContext>().action(async ({ input }) => {
      // 使用私有方法的逻辑来验证
      const errors: string[] = []

      // 基本信息验证
      if (!input.sourcePath) {
        errors.push('源文件路径不能为空')
      }
      if (!input.originalFileName) {
        errors.push('原始文件名不能为空')
      }
      if (!input.importType) {
        errors.push('导入类型不能为空')
      }

      // 根据导入类型验证必需字段
      switch (input.importType) {
        case 'document':
          if (!input.projectId) errors.push('项目ID不能为空')
          if (!input.projectName) errors.push('项目名称不能为空')
          if (!input.logicalDocumentName) errors.push('逻辑文档名称不能为空')
          if (!input.logicalDocumentType) errors.push('逻辑文档类型不能为空')
          if (!input.versionTag) errors.push('版本标签不能为空')
          break

        case 'asset':
          if (!input.projectId) errors.push('项目ID不能为空')
          if (!input.projectName) errors.push('项目名称不能为空')
          if (!input.assetType) errors.push('资产类型不能为空')
          if (!input.assetName) errors.push('资产名称不能为空')
          break

        case 'expense':
          if (!input.projectId) errors.push('项目ID不能为空')
          if (!input.projectName) errors.push('项目名称不能为空')
          if (!input.expenseDescription) errors.push('报销事项描述不能为空')
          break

        case 'shared':
          if (!input.resourceType) errors.push('资源类型不能为空')
          if (!input.resourceName) errors.push('资源名称不能为空')
          break

        case 'competition':
          if (!input.seriesName) errors.push('赛事系列名称不能为空')
          if (!input.levelName) errors.push('赛事级别不能为空')
          break

        case 'inbox':
          // Inbox 类型不需要额外验证
          break

        default:
          errors.push('不支持的导入类型')
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    }),

    // 生成导入预览的完整信息
    generateImportPreview: t.procedure.input<FileImportContext>().action(async ({ input }) => {
      try {
        // 获取预览信息
        const preview = await IntelligentFileImportService.previewImport(input)

        // 获取文件类型支持信息
        const isSupported = IntelligentFileImportService.isFileTypeSupported(
          input.originalFileName,
          input.importType
        )

        // 获取支持的文件类型列表
        const supportedTypes = IntelligentFileImportService.getSupportedFileTypes()

        return {
          ...preview,
          fileTypeSupported: isSupported,
          supportedExtensions: supportedTypes[input.importType] || [],
          importType: input.importType,
          originalFileName: input.originalFileName
        }
      } catch (error) {
        return {
          generatedFileName: '',
          targetPath: '',
          relativePath: '',
          fullPath: '',
          isValid: false,
          errors: [error instanceof Error ? error.message : '预览生成失败'],
          warnings: [],
          fileTypeSupported: false,
          supportedExtensions: [],
          importType: input.importType,
          originalFileName: input.originalFileName
        }
      }
    })
  }
}

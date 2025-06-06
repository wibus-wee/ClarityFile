// 基础响应类型
export interface SuccessResponse {
  success: boolean
}

// 系统信息输出类型
export interface SystemInfoOutput {
  projectCount: number
  documentCount: number
  fileCount: number
  timestamp: string
}

// 文件选择输出类型
export interface SelectDirectoryOutput {
  canceled: boolean
  path: string | null
}

export interface SelectFileOutput {
  canceled: boolean
  path: string | null
  filePaths?: string[]
}

// 设置分类输出类型
export type SettingsCategoriesOutput = string[]

// 项目详情输出类型
export interface ProjectDetailsOutput {
  // 项目ID（顶级字段）
  id: string

  // 项目基本信息
  project: {
    id: string
    name: string
    description: string | null
    status: string
    currentCoverAssetId: string | null
    folderPath: string | null
    createdAt: Date
    updatedAt: Date
  }

  // 项目封面资产
  coverAsset: {
    id: string
    name: string
    assetType: string
    contextDescription: string | null
    versionInfo: string | null
    customFields: unknown
    createdAt: Date
    updatedAt: Date
    fileName: string
    originalFileName: string
    physicalPath: string
    mimeType: string | null
    fileSizeBytes: number | null
    uploadedAt: Date
  } | null

  // 文档相关
  documents: Array<{
    id: string
    name: string
    type: string
    description: string | null
    defaultStoragePathSegment: string | null
    status: string
    currentOfficialVersionId: string | null
    createdAt: Date
    updatedAt: Date
    versions: Array<{
      id: string
      versionTag: string
      isGenericVersion: boolean
      competitionMilestoneId: string | null
      competitionProjectName: string | null
      notes: string | null
      createdAt: Date
      updatedAt: Date
      fileName: string
      originalFileName: string
      physicalPath: string
      mimeType: string | null
      fileSizeBytes: number | null
      uploadedAt: Date
    }>
  }>

  // 资产相关
  assets: Array<{
    id: string
    name: string
    assetType: string
    contextDescription: string | null
    versionInfo: string | null
    customFields: Record<string, any> | null
    createdAt: Date
    updatedAt: Date
    fileName: string
    originalFileName: string
    physicalPath: string
    mimeType: string | null
    fileSizeBytes: number | null
    uploadedAt: Date
  }>

  // 经费相关
  expenses: Array<{
    id: string
    itemName: string
    applicant: string
    amount: number
    applicationDate: Date
    status: string
    reimbursementDate: Date | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    invoiceFileName: string | null
    invoiceOriginalFileName: string | null
    invoicePhysicalPath: string | null
    invoiceMimeType: string | null
    invoiceFileSizeBytes: number | null
    invoiceUploadedAt: Date | null
  }>

  // 共享资源相关
  sharedResources: Array<{
    usageDescription: string | null
    associatedAt: Date
    resourceId: string
    resourceName: string
    resourceType: string
    resourceDescription: string | null
    resourceCustomFields: Record<string, any> | null
    resourceCreatedAt: Date
    resourceUpdatedAt: Date
    fileName: string
    originalFileName: string
    physicalPath: string
    mimeType: string | null
    fileSizeBytes: number | null
    uploadedAt: Date
  }>

  // 赛事相关
  competitions: Array<{
    statusInMilestone: string | null
    milestoneNotes: string | null
    participatedAt: Date
    milestoneId: string
    levelName: string
    dueDateMilestone: Date | null
    milestoneCreatedAt: Date
    milestoneUpdatedAt: Date
    seriesId: string
    seriesName: string
    seriesNotes: string | null
    seriesCreatedAt: Date
    seriesUpdatedAt: Date
    notificationFileName: string | null
    notificationOriginalFileName: string | null
    notificationPhysicalPath: string | null
    notificationMimeType: string | null
    notificationFileSizeBytes: number | null
    notificationUploadedAt: Date | null
  }>

  // 标签相关
  tags: Array<{
    tagId: string
    tagName: string
    tagColor: string | null
    tagCreatedAt: Date
  }>

  // 统计信息
  statistics: {
    documentCount: number
    versionCount: number
    assetCount: number
    expenseCount: number
    totalExpenseAmount: number
    sharedResourceCount: number
    competitionCount: number
    tagCount: number
  }
}

// 单独的文档版本类型
export interface DocumentVersionOutput {
  id: string
  versionTag: string
  isGenericVersion: boolean
  competitionMilestoneId: string | null
  competitionProjectName: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  fileName: string
  originalFileName: string
  physicalPath: string
  mimeType: string | null
  fileSizeBytes: number | null
  uploadedAt: Date
}

// 带版本的逻辑文档类型
export interface LogicalDocumentWithVersionsOutput {
  id: string
  name: string
  type: string
  description: string | null
  defaultStoragePathSegment: string | null
  status: string
  currentOfficialVersionId: string | null
  createdAt: Date
  updatedAt: Date
  versions: DocumentVersionOutput[]
}

// 赛事中心相关输出类型
export interface CompetitionSeriesWithStatsOutput {
  id: string
  name: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
  milestoneCount: number
}

export interface CompetitionOverviewOutput {
  seriesWithStats: CompetitionSeriesWithStatsOutput[]
  totalStats: {
    totalSeries: number
    totalMilestones: number
    totalParticipations: number
  }
}

export interface MilestoneWithProjectsOutput {
  id: string
  levelName: string
  dueDate: Date | null
  notes: string | null
  seriesId: string
  seriesName: string
  participatingProjectsCount: number
}

export interface CompetitionTimelineItemOutput {
  id: string
  type: string
  title: string
  date: Date | null
  description: string | null
  seriesId: string
  seriesName: string
  participatingProjectsCount: number
}

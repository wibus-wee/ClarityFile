# 项目详情聚合API文档

## 概述

新增的 `getProjectDetails` API 提供了获取项目完整详细信息的功能，包括项目的所有关联数据。这个API是为项目详情页设计的，一次调用即可获取页面所需的所有数据。

## API 端点

### `getProjectDetails(projectId: string)`

**描述**: 获取指定项目的完整详细信息，包括所有关联的文档、资产、经费、共享资源、赛事参与情况和标签。

**输入参数**:

```typescript
{
  id: string // 项目ID
}
```

**返回数据结构**:

```typescript
{
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

  // 项目封面资产（如果设置了封面）
  coverAsset: ProjectAsset | null

  // 文档相关 - 逻辑文档及其版本
  documents: Array<{
    // 逻辑文档信息
    id: string
    name: string
    type: string
    description: string | null
    // 该逻辑文档的所有版本
    versions: Array<DocumentVersion>
  }>

  // 项目资产（截图、Logo等）
  assets: Array<ProjectAsset>

  // 经费记录
  expenses: Array<{
    id: string
    itemName: string
    applicant: string
    amount: number
    applicationDate: Date
    status: string
    // 发票文件信息（可能为空）
    invoiceFileName: string | null
    // ... 其他发票文件字段
  }>

  // 关联的共享资源
  sharedResources: Array<{
    usageDescription: string | null
    associatedAt: Date
    // 共享资源详细信息
    resourceId: string
    resourceName: string
    resourceType: string
    // ... 其他共享资源字段
  }>

  // 参与的赛事里程碑
  competitions: Array<{
    statusInMilestone: string | null
    participatedAt: Date
    // 里程碑信息
    milestoneId: string
    levelName: string
    dueDateMilestone: Date | null
    // 赛事系列信息
    seriesId: string
    seriesName: string
    // 通知文件信息（可能为空）
    notificationFileName: string | null
    // ... 其他字段
  }>

  // 项目标签
  tags: Array<{
    tagId: string
    tagName: string
    tagColor: string | null
    tagCreatedAt: Date
  }>

  // 统计信息
  statistics: {
    documentCount: number // 逻辑文档数量
    versionCount: number // 文档版本总数
    assetCount: number // 资产数量
    expenseCount: number // 经费记录数量
    totalExpenseAmount: number // 经费总金额
    sharedResourceCount: number // 共享资源数量
    competitionCount: number // 参与赛事数量
    tagCount: number // 标签数量
  }
}
```

## 使用示例

### 在主进程中使用

```typescript
import { ProjectService } from './services/project.service'

const projectDetails = await ProjectService.getProjectDetails({ id: 'project-id' })
if (projectDetails) {
  console.log('项目名称:', projectDetails.project.name)
  console.log('文档数量:', projectDetails.statistics.documentCount)
  console.log('总经费:', projectDetails.statistics.totalExpenseAmount)
}
```

### 在渲染进程中使用（通过TIPC）

```typescript
import { useTipc } from '@/hooks/use-tipc'

function ProjectDetailPage({ projectId }: { projectId: string }) {
  const { data: projectDetails, error, isLoading } = useTipc('getProjectDetails', { id: projectId })

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败: {error.message}</div>
  if (!projectDetails) return <div>项目不存在</div>

  return (
    <div>
      <h1>{projectDetails.project.name}</h1>
      <p>{projectDetails.project.description}</p>

      {/* 统计信息 */}
      <div className="stats">
        <div>文档: {projectDetails.statistics.documentCount}</div>
        <div>资产: {projectDetails.statistics.assetCount}</div>
        <div>经费: ¥{projectDetails.statistics.totalExpenseAmount}</div>
      </div>

      {/* 文档列表 */}
      <section>
        <h2>项目文档</h2>
        {projectDetails.documents.map(doc => (
          <div key={doc.id}>
            <h3>{doc.name}</h3>
            <p>版本数: {doc.versions.length}</p>
          </div>
        ))}
      </section>

      {/* 其他模块... */}
    </div>
  )
}
```

## 性能考虑

1. **数据量**: 这个API会返回大量数据，适合项目详情页这种需要展示完整信息的场景
2. **缓存**: 建议在前端使用SWR等工具进行数据缓存
3. **分页**: 如果某个项目的关联数据过多，未来可能需要考虑分页加载

## 数据完整性

- 所有关联查询都使用了适当的JOIN类型（INNER JOIN 或 LEFT JOIN）
- 文件信息通过 `managedFiles` 表关联获取
- 删除的或非活跃状态的数据会被过滤掉
- 数据按照创建时间或更新时间排序

## 错误处理

- 如果项目不存在，返回 `null`
- 数据库查询错误会抛出异常
- 所有可选字段都正确标记为 `| null`

## 后续扩展

这个API为项目详情页提供了完整的数据基础。如果需要添加新的关联数据类型，只需要：

1. 在数据库查询中添加新的JOIN
2. 在返回对象中添加新的字段
3. 更新 `ProjectDetailsOutput` 类型定义
4. 在统计信息中添加相应的计数

## 相关文件

- 服务实现: `src/main/services/project.service.ts`
- 路由定义: `src/main/routers/project.router.ts`
- 类型定义: `src/main/types/project-schemas.ts`
- 数据库模型: `src/db/schema.ts`

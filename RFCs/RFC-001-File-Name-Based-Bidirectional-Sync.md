# RFC-001: 基于文件名解析的双向同步功能

**状态**: 修订版 (Revised)  
**作者**: ClarityFile 开发团队  
**创建日期**: 2025-01-18  
**最后更新**: 2025-06-18

## 摘要 (Abstract)

本RFC提出为ClarityFile项目实现基于文件名和路径解析的双向同步功能。该功能将允许用户直接在文件系统中操作文件（移动、重命名、删除等），同时保持与ClarityFile数据库的同步。通过解析标准化的文件名和路径结构，我们可以实现可靠的文件识别和关联，特别适用于网盘同步等场景。

## 修订说明 (Revision Notes)

**原方案问题**: 基于文件扩展属性（xattr）的方案在测试中发现，网盘服务（如百度网盘、阿里云盘等）会在文件上传下载过程中自动清理扩展属性，导致元数据丢失，同步机制完全失效。

**新方案优势**: 改为基于文件名模式识别的硬编码解析方式，完全不依赖文件元数据，确保在网盘同步场景下的可靠性和稳定性。

## 动机和背景 (Motivation & Background)

### 当前问题

ClarityFile当前采用单向同步架构：

```
Frontend → Backend → Database → File System
```

存在以下限制：

1. **用户无法直接操作文件系统** - 所有文件操作必须通过ClarityFile界面
2. **网盘同步兼容性差** - 扩展属性在网盘同步过程中会丢失
3. **缺乏灵活性** - 无法与其他文件管理工具协同工作
4. **用户体验受限** - 无法利用操作系统原生的文件管理功能

### 技术挑战

**扩展属性方案的致命缺陷**：

- 网盘服务（百度网盘、阿里云盘、OneDrive等）在文件上传时会清理扩展属性
- 从网盘下载的文件失去所有自定义元数据
- 跨平台兼容性复杂（Windows ADS、macOS/Linux xattr）
- 第三方软件可能意外清除扩展属性

### 目标

实现双向同步功能，使ClarityFile能够：

1. **检测文件系统变化** - 自动发现用户在文件系统中的操作
2. **保持数据一致性** - 确保数据库与文件系统状态同步
3. **网盘同步兼容** - 在网盘同步场景下保持文件识别能力
4. **利用现有命名规范** - 基于已建立的智能命名系统进行解析

## 详细设计 (Detailed Design)

### 核心架构

新的双向同步架构：

```
Frontend ↔ Backend ↔ Database ↔ File Discovery Service ↔ File System (standardized naming)
                    ↑
              File Watcher Service
                    ↑
            File Name Parser + Path Parser
```

### 文件名解析设计

#### 解析目标数据结构

```typescript
interface ParsedFileInfo {
  // 核心标识
  type: 'document' | 'asset' | 'shared' | 'competition' | 'expense'

  // 项目关联
  projectId?: string // 从路径中提取的项目ID
  projectName?: string // 从路径中提取的项目名称

  // 文档相关
  documentType?: string // 文档类型（从缩写反向查找）
  versionTag?: string // 版本标签
  isGenericVersion?: boolean // 是否为通用版本
  competitionInfo?: {
    // 比赛信息
    seriesName?: string
    levelName?: string
    projectName?: string
  }

  // 资产相关
  assetType?: string // 资产类型
  assetName?: string // 资产名称

  // 共享资源相关
  resourceType?: string // 资源类型
  resourceName?: string // 资源名称
  customFields?: Record<string, any> // 自定义字段

  // 解析元信息
  confidence: number // 解析置信度 0-1
  extractedDate?: Date // 从文件名提取的日期
  originalFileName: string // 原始文件名
  filePath: string // 完整文件路径
  errors: string[] // 解析错误
  warnings: string[] // 解析警告
}
```

#### 文件名解析模式

基于现有的 `IntelligentNamingService` 生成规则，建立反向解析模式：

**1. 文档版本文件名解析**

```typescript
// 模式：{documentTypeAbbr}_{versionTag}_{targetIdentifier}_{dateStr}.{ext}
// 示例：BP_国赛最终版V2_参赛作品名A_挑战杯国赛_20231026.pdf
const DOCUMENT_PATTERN = /^([A-Z]+)_(.+?)_(.+?)_(\d{8})\.([\w]+)$/

// 解析规则：
// - documentTypeAbbr: 通过 DOCUMENT_TYPE_ABBREVIATIONS 反向查找
// - versionTag: 版本标签
// - targetIdentifier: 通用/专用/比赛信息
// - dateStr: YYYYMMDD 格式日期
```

**2. 项目资产文件名解析**

```typescript
// 模式：{assetTypeAbbr}_{assetName}_{dateStr}.{ext}
// 示例：Screenshot_用户登录界面_20231001.png
const ASSET_PATTERN = /^([A-Za-z]+)_(.+?)_(\d{8})\.([\w]+)$/

// 解析规则：
// - assetTypeAbbr: 通过 ASSET_TYPE_ABBREVIATIONS 反向查找
// - assetName: 资产名称（截取前20字符）
// - dateStr: YYYYMMDD 格式日期
```

**3. 共享资源文件名解析**

```typescript
// 模式：{resourceTypePrefix}_{resourceName}_{customInfo}_{dateStr}.{ext}
// 示例：专利_一种新型AI算法_ZL2023X001_20231001.pdf
const SHARED_PATTERN = /^([^_]+)_(.+?)_(.+?)_(\d{8})\.([\w]+)$/

// 解析规则：
// - resourceTypePrefix: 资源类型前缀
// - resourceName: 资源名称
// - customInfo: 自定义字段信息（可选）
// - dateStr: YYYYMMDD 格式日期
```

**4. 比赛通知文件名解析**

```typescript
// 模式：通知_{competitionInfo}_{yearStr}.{ext}
// 示例：通知_挑战杯校赛_2024版.pdf
const COMPETITION_PATTERN = /^通知_(.+?)_(\d{4}版)\.([\w]+)$/

// 解析规则：
// - 固定前缀：通知
// - competitionInfo: 赛事缩写+赛段缩写
// - yearStr: YYYY版 格式年份
```

### 路径解析设计

基于 DIRECTORY_DESIGN.md 中的路径规范建立解析规则：

**1. 项目文档路径解析**

```typescript
// 路径模式：CLARITY_FILE_ROOT/Projects/{projectFolderName}/Documents/{logicalDocumentName}/
// 示例：/Projects/核心项目A_智慧校园助手_a1b2/Documents/商业计划书/
const PROJECT_DOC_PATH = /\/Projects\/(.+?)\/Documents\/(.+?)\//

// 解析规则：
// - projectFolderName格式：{projectName}_{shortProjectId}
// - 从项目文件夹名提取项目ID后缀
// - logicalDocumentName即为逻辑文档名称
```

**2. 项目资产路径解析**

```typescript
// 路径模式：CLARITY_FILE_ROOT/Projects/{projectFolderName}/_Assets/{assetType}/
// 示例：/Projects/核心项目A_a1b2/_Assets/软件截图/
const PROJECT_ASSET_PATH = /\/Projects\/(.+?)\/_Assets\/(.+?)\//

// 解析规则：
// - 同样从projectFolderName提取项目信息
// - assetType为资产类型目录名
```

**3. 共享资源路径解析**

```typescript
// 路径模式：CLARITY_FILE_ROOT/SharedResources/{resourceType}/
// 示例：/SharedResources/专利成果/
const SHARED_RESOURCE_PATH = /\/SharedResources\/(.+?)\//

// 解析规则：
// - resourceType为资源类型目录名
```

**4. 比赛资料路径解析**

```typescript
// 路径模式：CLARITY_FILE_ROOT/Competitions/{seriesName}/{levelName}/
// 示例：/Competitions/挑战杯/校级初赛/
const COMPETITION_PATH = /\/Competitions\/(.+?)\/(.+?)\//

// 解析规则：
// - seriesName为赛事系列名
// - levelName为赛段名称
```

### 核心服务架构

```typescript
/**
 * 文件名解析服务
 */
class FileNameParserService {
  static parseDocumentFileName(fileName: string): DocumentFileInfo | null
  static parseAssetFileName(fileName: string): AssetFileInfo | null
  static parseSharedResourceFileName(fileName: string): SharedResourceFileInfo | null
  static parseCompetitionFileName(fileName: string): CompetitionFileInfo | null

  // 通用解析入口
  static parseFileName(fileName: string, filePath: string): ParsedFileInfo | null
}

/**
 * 路径解析服务
 */
class PathParserService {
  static parseProjectPath(filePath: string): ProjectPathInfo | null
  static parseSharedResourcePath(filePath: string): SharedResourcePathInfo | null
  static parseCompetitionPath(filePath: string): CompetitionPathInfo | null

  // 通用路径解析入口
  static parsePath(filePath: string): PathInfo | null
}

/**
 * 文件发现和同步服务
 */
class FileDiscoveryService {
  async scanDirectory(rootPath: string): Promise<DiscoveredFile[]>
  async matchWithDatabase(discoveredFiles: DiscoveredFile[]): Promise<MatchResult[]>
  async syncToDatabase(matchResults: MatchResult[]): Promise<SyncResult[]>
  async handleOrphanedFiles(orphanedFiles: string[]): Promise<void>
  async resolveConflicts(conflicts: ConflictInfo[]): Promise<void>
}

/**
 * 双向同步协调器
 */
class BidirectionalSyncService {
  startFileWatcher(rootPath: string): void
  handleFileSystemChange(event: FileSystemEvent): Promise<void>
  handleDatabaseChange(event: DatabaseEvent): Promise<void>

  // 手动同步触发
  async performFullSync(): Promise<SyncReport>
  async performIncrementalSync(): Promise<SyncReport>
}
```

### 错误处理和容错机制

#### 解析失败处理策略

1. **降级解析**: 如果完整解析失败，尝试部分解析
2. **模糊匹配**: 通过文件名相似度匹配可能的记录
3. **用户确认**: 对于无法自动解析的文件，提供用户界面进行手动关联
4. **孤儿文件管理**: 建立孤儿文件队列，定期提醒用户处理
5. **解析日志**: 记录所有解析过程，便于调试和改进

#### 容错机制

```typescript
interface ParseResult {
  success: boolean
  confidence: number // 0-1，解析置信度
  parsedInfo?: ParsedFileInfo
  fallbackInfo?: Partial<ParsedFileInfo> // 降级解析结果
  errors: string[]
  suggestions: string[] // 修复建议
}

class FaultTolerantParser {
  // 多模式匹配
  static parseWithFallback(fileName: string, filePath: string): ParseResult

  // 正则表达式匹配（灵活匹配）
  static flexiblePatternMatch(fileName: string): ParseResult

  // 上下文推断（结合路径信息）
  static contextualInference(fileName: string, filePath: string): ParseResult

  // 数据库辅助解析
  static databaseAssistedParsing(fileName: string, existingRecords: ManagedFile[]): ParseResult
}
```

## 实现计划 (Implementation Plan)

### Phase 1: 解析引擎开发 (2周)

**目标**: 建立文件名和路径解析能力

**任务**:

- [ ] 实现 `FileNameParserService` 核心解析逻辑
- [ ] 实现 `PathParserService` 路径解析功能
- [ ] 建立缩写映射的反向查找表
- [ ] 实现正则表达式解析规则
- [ ] 单元测试覆盖所有解析场景
- [ ] 性能基准测试

**交付物**:

- 完整的文件名解析服务
- 路径解析服务
- 解析规则文档和测试报告

### Phase 2: 文件发现服务 (2周)

**目标**: 实现文件系统扫描和匹配逻辑

**任务**:

- [ ] 实现 `FileDiscoveryService` 文件扫描功能
- [ ] 建立文件与数据库记录的匹配算法
- [ ] 实现置信度评分系统
- [ ] 处理解析失败和边界情况
- [ ] 实现孤儿文件检测和管理
- [ ] 集成测试

**交付物**:

- 文件发现和匹配服务
- 置信度评分算法
- 孤儿文件处理机制

### Phase 3: 双向同步核心 (3周)

**目标**: 实现完整的双向同步功能

**任务**:

- [ ] 实现 `BidirectionalSyncService` 同步协调器
- [ ] 集成 chokidar 文件监控
- [ ] 实现数据库变更监听
- [ ] 建立冲突检测和解决机制
- [ ] 实现增量同步和全量同步
- [ ] 错误处理和恢复机制
- [ ] 性能优化

**交付物**:

- 完整的双向同步服务
- 冲突解决机制
- 同步性能报告

### Phase 4: 用户界面集成 (2周)

**目标**: 提供用户友好的同步管理界面

**任务**:

- [ ] 开发孤儿文件管理界面
- [ ] 实现手动文件关联功能
- [ ] 添加解析状态和进度显示
- [ ] 提供解析错误的用户反馈
- [ ] 实现同步日志查看
- [ ] 用户设置和配置选项

**交付物**:

- 同步管理用户界面
- 手动关联工具
- 用户操作指南

### Phase 5: 迁移和兼容性 (2周)

**目标**: 处理现有文件的迁移和系统兼容

**任务**:

- [ ] 开发现有文件的批量解析工具
- [ ] 实现与现有系统的兼容模式
- [ ] 数据迁移和验证工具
- [ ] 向后兼容性测试
- [ ] 迁移进度跟踪和回滚机制

**交付物**:

- 文件迁移工具
- 兼容性验证报告
- 迁移操作文档

### Phase 6: 测试和部署 (1周)

**目标**: 全面测试和生产部署

**任务**:

- [ ] 端到端集成测试
- [ ] 网盘同步场景专项测试
- [ ] 性能压力测试
- [ ] 用户验收测试
- [ ] 生产环境部署
- [ ] 监控和告警配置

**交付物**:

- 完整的测试报告
- 部署文档
- 运维监控方案

**总计**: 12周开发时间

## 风险评估 (Risk Assessment)

### 技术风险

#### 高风险

- **解析准确性**: 文件名解析可能存在歧义或错误
  - **缓解措施**: 多重验证、置信度评分、用户确认机制
  - **检测方式**: 解析结果与数据库记录的一致性检查

#### 中风险

- **用户行为依赖**: 依赖用户不手动修改文件名和路径

  - **缓解措施**: 用户教育、文件锁定、变更检测
  - **监控指标**: 非标准文件名的检测率

- **性能影响**: 大量文件的解析可能影响性能
  - **缓解措施**: 异步处理、增量扫描、缓存机制
  - **监控指标**: 解析时间、内存使用量

#### 低风险

- **命名规范演进**: 未来命名规范变化需要向后兼容
  - **缓解措施**: 版本化解析规则、渐进式升级
  - **测试覆盖**: 多版本命名格式的兼容性测试

### 业务风险

#### 中风险

- **用户学习成本**: 用户需要理解新的同步机制

  - **缓解措施**: 详细的用户文档、渐进式功能启用
  - **用户支持**: 在线帮助、常见问题解答

- **数据一致性**: 同步过程中可能出现数据不一致
  - **缓解措施**: 事务性操作、冲突检测、数据校验
  - **回滚计划**: 完整的数据恢复机制

#### 低风险

- **功能复杂性增加**: 系统复杂性增加可能影响维护
  - **缓解措施**: 良好的代码架构、充分的测试覆盖
  - **文档维护**: 详细的技术文档和API文档

## 备选方案对比 (Alternatives Comparison)

### 原方案 vs 新方案

| 维度             | 扩展属性方案    | 文件名解析方案    |
| ---------------- | --------------- | ----------------- |
| **网盘兼容性**   | ❌ 不兼容       | ✅ 完全兼容       |
| **跨平台一致性** | ⚠️ 复杂         | ✅ 一致           |
| **实现复杂度**   | 🔴 高           | 🟡 中等           |
| **用户可读性**   | ⚠️ 隐藏         | ✅ 可读           |
| **调试友好性**   | ⚠️ 困难         | ✅ 容易           |
| **维护成本**     | 🔴 高           | 🟢 低             |
| **可靠性**       | ⚠️ 依赖文件系统 | ✅ 基于标准化命名 |

### 决策理由

选择文件名解析方案的主要原因：

1. **网盘同步兼容性**: 这是最关键的技术要求
2. **实现简单性**: 不需要处理复杂的跨平台扩展属性
3. **用户友好性**: 文件名本身包含有意义的信息
4. **维护便利性**: 解析逻辑相对简单，便于调试和维护
5. **现有基础**: 可以直接利用已有的智能命名系统

## 向后兼容性 (Backward Compatibility)

### 现有文件处理

#### 自动解析迁移

- 启动时扫描现有的 `managed_files` 记录
- 根据现有文件路径和文件名进行解析
- 对于解析成功的文件，建立新的关联关系
- 对于解析失败的文件，标记为需要手动处理

#### 渐进式迁移

- 用户可选择立即迁移或渐进式迁移
- 渐进式迁移在文件被访问时进行解析
- 提供迁移进度跟踪和状态显示

#### 兼容模式

- 支持同时运行新旧两套系统
- 新导入文件使用标准化命名和解析系统
- 旧文件继续使用原有的路径关联方式
- 逐步迁移到纯解析系统

### API兼容性

- 现有API保持不变
- 新增文件解析相关的API端点
- 内部实现逐步切换到解析系统
- 提供解析状态查询接口

## 结论

基于文件名解析的双向同步功能将显著提升ClarityFile在网盘同步场景下的可靠性和用户体验。通过利用现有的智能命名系统，我们可以实现稳定的文件识别和关联，同时保持与现有系统的兼容性。

该方案的主要优势：

- **网盘兼容**: 完全不依赖文件元数据，适用于所有网盘服务
- **实现简单**: 基于现有命名规范，开发复杂度可控
- **用户友好**: 文件名具有可读性，便于用户理解
- **维护便利**: 解析逻辑透明，便于调试和优化

建议按照分阶段实施计划推进，优先实现核心解析功能，然后逐步完善用户界面和高级特性。

## 参考资料

- [ClarityFile DIRECTORY_DESIGN.md](../packages/desktop/DIRECTORY_DESIGN.md)
- [IntelligentNamingService 实现](../packages/desktop/src/main/services/intelligent/intelligent-naming.service.ts)
- [IntelligentPathGeneratorService 实现](../packages/desktop/src/main/services/intelligent/intelligent-path-generator.service.ts)
- [chokidar - File watching library](https://github.com/paulmillr/chokidar)

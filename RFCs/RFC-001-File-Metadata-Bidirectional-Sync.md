# RFC-001: 基于文件元数据的双向同步功能

**状态**: 草案 (Draft)  
**作者**: ClarityFile 开发团队  
**创建日期**: 2025-01-18  
**最后更新**: 2025-01-18  

## 摘要 (Abstract)

本RFC提出为ClarityFile项目实现基于文件扩展属性的双向同步功能。该功能将允许用户直接在文件系统中操作文件（移动、重命名、删除等），同时保持与ClarityFile数据库的同步。通过在文件中嵌入元数据，我们可以实现位置无关的文件管理，大幅提升用户体验和系统灵活性。

## 动机和背景 (Motivation & Background)

### 当前问题

ClarityFile当前采用单向同步架构：
```
Frontend → Backend → Database → File System
```

存在以下限制：
1. **用户无法直接操作文件系统** - 所有文件操作必须通过ClarityFile界面
2. **文件位置强依赖** - 文件路径由复杂的命名规则生成，用户移动文件会破坏关联
3. **缺乏灵活性** - 无法与其他文件管理工具协同工作
4. **用户体验受限** - 无法利用操作系统原生的文件管理功能

### 目标

实现双向同步功能，使ClarityFile能够：
1. **检测文件系统变化** - 自动发现用户在文件系统中的操作
2. **保持数据一致性** - 确保数据库与文件系统状态同步
3. **支持文件自由移动** - 文件可以在任意位置，元数据跟随文件
4. **提供人类友好的文件名** - 不再依赖复杂的命名规则

## 详细设计 (Detailed Design)

### 核心架构

新的双向同步架构：
```
Frontend ↔ Backend ↔ Database ↔ Metadata Index ↔ File System (with embedded metadata)
                    ↑
              File Watcher Service
```

### 元数据格式设计

#### 元数据结构
```typescript
interface ClarityFileMetadata {
  // 核心标识
  managedFileId: string           // UUID，对应 managed_files.id
  
  // 项目关联
  projectId?: string              // 关联的项目ID
  
  // 文档相关
  logicalDocumentId?: string      // 逻辑文档ID
  documentVersionId?: string      // 文档版本ID
  versionTag?: string             // 版本标签
  
  // 资产相关
  assetType?: string              // 资产类型
  
  // 通用属性
  importType: 'document' | 'asset' | 'shared'  // 导入类型
  createdAt: string               // 创建时间 (ISO 8601)
  lastModified: string            // 最后修改时间
  
  // 元数据版本
  metadataVersion: string         // 元数据格式版本，用于未来升级
}
```

#### 存储格式
使用扩展属性存储，命名空间为 `clarityfile.*`：
```
clarityfile.managedFileId = "uuid-string"
clarityfile.projectId = "uuid-string"
clarityfile.importType = "document"
clarityfile.metadataVersion = "1.0"
```

### 跨平台兼容性方案

#### 主要存储方式
- **macOS/Linux**: Extended Attributes (xattr)
- **Windows**: NTFS Alternate Data Streams (ADS)

#### 备用存储方式
当扩展属性不可用时，使用隐藏的伴随文件：
```
document.pdf              # 原文件
document.pdf.clarityfile  # 隐藏的元数据文件
```

#### 实现策略
```typescript
class CrossPlatformMetadataService {
  async writeMetadata(filePath: string, metadata: ClarityFileMetadata): Promise<void> {
    try {
      // 优先使用扩展属性
      await this.writeExtendedAttributes(filePath, metadata)
    } catch (error) {
      // 降级到伴随文件
      await this.writeSidecarFile(filePath, metadata)
    }
  }
  
  async readMetadata(filePath: string): Promise<ClarityFileMetadata | null> {
    try {
      return await this.readExtendedAttributes(filePath)
    } catch (error) {
      return await this.readSidecarFile(filePath)
    }
  }
}
```

### 索引系统架构

#### 内存索引
```typescript
interface MetadataIndex {
  // 主索引：managedFileId -> 文件路径
  filePathIndex: Map<string, string>
  
  // 反向索引：文件路径 -> 元数据
  metadataIndex: Map<string, ClarityFileMetadata>
  
  // 项目索引：projectId -> managedFileId[]
  projectIndex: Map<string, Set<string>>
  
  // 类型索引：importType -> managedFileId[]
  typeIndex: Map<string, Set<string>>
}
```

#### 索引服务
```typescript
class MetadataIndexService {
  private index: MetadataIndex
  private lastScanTime: number = 0
  private readonly SCAN_INTERVAL = 5 * 60 * 1000 // 5分钟
  
  async buildIndex(rootPath: string): Promise<void>
  async incrementalUpdate(filePath: string, operation: 'add' | 'remove' | 'change'): Promise<void>
  async findFileByManagedId(managedFileId: string): Promise<string | null>
  async findFilesByProject(projectId: string): Promise<string[]>
  async getMetadata(filePath: string): Promise<ClarityFileMetadata | null>
}
```

### 文件监控机制

使用 `chokidar` 库实现跨平台文件监控：

```typescript
class FileWatcherService {
  private watcher: chokidar.FSWatcher
  private indexService: MetadataIndexService
  
  startWatching(rootPath: string): void {
    this.watcher = chokidar.watch(rootPath, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: true
    })
    
    this.watcher
      .on('add', this.handleFileAdded.bind(this))
      .on('unlink', this.handleFileDeleted.bind(this))
      .on('change', this.handleFileChanged.bind(this))
      .on('addDir', this.handleDirectoryAdded.bind(this))
      .on('unlinkDir', this.handleDirectoryDeleted.bind(this))
  }
  
  private async handleFileAdded(filePath: string): Promise<void>
  private async handleFileDeleted(filePath: string): Promise<void>
  private async handleFileChanged(filePath: string): Promise<void>
}
```

### 双向同步逻辑

#### 文件发现服务
```typescript
class FileDiscoveryService {
  async discoverNewFiles(rootPath: string): Promise<DiscoveryResult[]>
  async syncFileToDatabase(filePath: string, metadata: ClarityFileMetadata): Promise<void>
  async handleOrphanedFiles(orphanedFiles: string[]): Promise<void>
  async resolveConflicts(conflicts: ConflictInfo[]): Promise<void>
}

interface DiscoveryResult {
  filePath: string
  metadata: ClarityFileMetadata | null
  status: 'new' | 'existing' | 'orphaned' | 'conflict'
  conflictReason?: string
}
```

#### 同步策略
1. **新文件发现**: 检测到有元数据的新文件，自动同步到数据库
2. **孤儿文件处理**: 数据库中存在但文件系统中不存在的文件
3. **冲突解决**: 元数据与数据库不一致时的处理策略

## 实现计划 (Implementation Plan)

### Phase 1: 基础设施 (2周)
**目标**: 建立元数据读写能力

**任务**:
- [ ] 集成 `fs-xattr` npm包
- [ ] 实现 `FileMetadataService`
- [ ] 实现 `CrossPlatformMetadataService`
- [ ] 跨平台兼容性测试
- [ ] 单元测试覆盖

**交付物**:
- 可读写文件元数据的基础服务
- 跨平台兼容性验证报告

### Phase 2: 写入集成 (1周)
**目标**: 为新文件自动写入元数据

**任务**:
- [ ] 修改 `IntelligentFileImportService`，添加元数据写入
- [ ] 修改所有文件创建流程
- [ ] 确保元数据格式一致性
- [ ] 集成测试

**交付物**:
- 所有新导入文件都包含元数据
- 元数据写入流程文档

### Phase 3: 索引系统 (3周)
**目标**: 建立高效的文件索引系统

**任务**:
- [ ] 实现 `MetadataIndexService`
- [ ] 实现文件扫描和索引构建
- [ ] 实现增量索引更新
- [ ] 性能优化和测试
- [ ] 索引持久化机制

**交付物**:
- 完整的索引系统
- 性能基准测试报告

### Phase 4: 文件监控 (3周)
**目标**: 实时监控文件系统变化

**任务**:
- [ ] 实现 `FileWatcherService`
- [ ] 集成 chokidar 文件监控
- [ ] 实现事件处理逻辑
- [ ] 处理批量操作和性能优化
- [ ] 错误处理和恢复机制

**交付物**:
- 实时文件监控功能
- 事件处理性能报告

### Phase 5: 双向同步 (3周)
**目标**: 完整的双向同步功能

**任务**:
- [ ] 实现 `FileDiscoveryService`
- [ ] 实现数据库同步逻辑
- [ ] 实现冲突检测和解决
- [ ] 用户界面集成
- [ ] 端到端测试

**交付物**:
- 完整的双向同步功能
- 用户操作指南

### Phase 6: 迁移工具 (2周)
**目标**: 为现有文件添加元数据

**任务**:
- [ ] 实现现有文件扫描
- [ ] 实现元数据推断逻辑
- [ ] 批量元数据写入工具
- [ ] 迁移进度跟踪
- [ ] 回滚机制

**交付物**:
- 现有文件迁移工具
- 迁移操作文档

**总计**: 14周开发时间

## 风险评估 (Risk Assessment)

### 技术风险

#### 高风险
- **扩展属性兼容性**: 某些文件系统或网络存储可能不支持扩展属性
  - **缓解措施**: 实现伴随文件备用方案
  - **检测方式**: 启动时检测扩展属性支持情况

#### 中风险
- **性能影响**: 大量文件的索引构建可能影响性能
  - **缓解措施**: 异步处理、增量更新、用户可配置的扫描间隔
  - **监控指标**: 索引构建时间、内存使用量

- **第三方软件干扰**: 其他软件可能清除或修改扩展属性
  - **缓解措施**: 定期验证元数据完整性、提供修复工具
  - **检测方式**: 元数据校验和机制

#### 低风险
- **跨平台差异**: 不同操作系统的文件系统行为差异
  - **缓解措施**: 充分的跨平台测试
  - **测试覆盖**: Windows、macOS、Linux主要发行版

### 业务风险

#### 中风险
- **用户学习成本**: 用户需要理解新的文件管理方式
  - **缓解措施**: 详细的用户文档、渐进式功能启用
  - **用户支持**: 在线帮助、常见问题解答

- **数据迁移复杂性**: 现有用户的文件迁移可能复杂
  - **缓解措施**: 自动化迁移工具、分批迁移选项
  - **回滚计划**: 完整的迁移回滚机制

#### 低风险
- **功能复杂性增加**: 系统复杂性增加可能影响维护
  - **缓解措施**: 良好的代码架构、充分的测试覆盖
  - **文档维护**: 详细的技术文档和API文档

## 备选方案 (Alternatives Considered)

### 方案A: 基于路径解析的同步
**描述**: 通过解析文件路径和文件名来推断元数据

**优势**:
- 不需要修改文件本身
- 与现有命名规则兼容

**劣势**:
- 路径解析逻辑复杂且脆弱
- 用户重命名文件会破坏关联
- 难以处理文件移动

**决策**: 已拒绝，复杂度过高且用户体验差

### 方案B: 中央索引数据库
**描述**: 使用独立的数据库存储文件路径到元数据的映射

**优势**:
- 不依赖文件系统特性
- 查询性能可控

**劣势**:
- 文件移动后索引失效
- 需要复杂的路径同步机制
- 无法处理外部文件操作

**决策**: 已拒绝，无法解决核心问题

### 方案C: 混合方案
**描述**: 结合元数据嵌入和中央索引

**优势**:
- 兼具两种方案的优势
- 更好的性能和可靠性

**劣势**:
- 实现复杂度更高
- 维护成本增加

**决策**: 考虑在未来版本中实现

## 向后兼容性 (Backward Compatibility)

### 现有文件处理

#### 自动迁移
- 启动时扫描现有的 `managed_files` 记录
- 根据数据库信息为现有文件生成元数据
- 批量写入元数据到文件

#### 渐进式迁移
- 用户可选择立即迁移或渐进式迁移
- 渐进式迁移在文件被访问时添加元数据
- 提供迁移进度跟踪

#### 兼容模式
- 支持同时运行新旧两套系统
- 新文件使用元数据系统
- 旧文件继续使用路径解析
- 逐步迁移到纯元数据系统

### API兼容性
- 现有API保持不变
- 新增元数据相关的API端点
- 内部实现逐步切换到元数据系统

## 结论

基于文件元数据的双向同步功能将显著提升ClarityFile的用户体验和系统灵活性。通过将元数据直接嵌入文件，我们可以实现真正的位置无关文件管理，同时保持与现有系统的兼容性。

该方案的实现风险可控，通过分阶段实施可以确保系统稳定性。建议优先实现核心功能，然后逐步完善高级特性。

## 参考资料

- [Extended Attributes - Wikipedia](https://en.wikipedia.org/wiki/Extended_file_attributes)
- [NTFS Alternate Data Streams](https://docs.microsoft.com/en-us/windows/win32/fileio/file-streams)
- [fs-xattr npm package](https://www.npmjs.com/package/fs-xattr)
- [chokidar - File watching library](https://github.com/paulmillr/chokidar)

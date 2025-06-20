# RFC-001: 智能文件管理与双向同步系统

- **状态**: 修订版 v2 (Revised v2) - 采用TIPC事件驱动架构
- **作者**: ClarityFile 开发团队
- **创建日期**: 2025-06-18
- **最后更新**: 2025-06-19
- **修订原因**: 采用TIPC事件系统替代轮询机制，实现真正的实时同步

## 概述

本RFC提出了一个智能文件管理与双向同步系统，旨在实现ClarityFile应用与项目文件夹之间的无缝同步，自动检测文件变化，并提供智能的项目结构解析和导入功能。

## 背景与动机

### 当前痛点

1. **手动文件管理**：用户需要手动在应用中导入和管理文件
2. **文件夹与应用脱节**：项目文件夹的变化无法自动反映到应用中
3. **重复工作**：用户可能在文件夹中组织好文件，但还需要在应用中重新组织
4. **项目导入复杂**：新项目的导入需要大量手动操作

### 目标

1. **事件驱动的双向同步**：基于TIPC事件系统实现文件夹与应用数据库的实时双向同步
2. **实时智能检测**：自动检测文件夹变化并通过事件立即推送到前端
3. **自动导入**：选择工作目录后自动解析项目结构
4. **用户确认机制**：重要操作需要用户确认，保证数据安全
5. **SWR集成**：事件触发自动重新验证，避免手动状态管理

## 核心功能

### 1. 双向同步机制

系统通过事件驱动模型，实现了应用与文件系统之间无缝、实时的双向数据同步。其核心是两条清晰的数据流：从应用到文件系统，以及从文件系统到应用。

#### 1.1 数据流：从应用到文件系统 (App → FS)

```mermaid
graph LR
    A[应用内操作 重命名A为B] --> B[同步管理器接收请求]
    B --> C[标记为内部操作]
    C --> D[执行文件系统操作 rename]
    D --> E{操作成功?}
    E -- Yes --> F[更新数据库]
    F --> G[UI状态更新]
    E -- No --> H[回滚并通知用户]
    D --> M[FSWatcher检测到B创建]
    M --> N[内部操作标记?]
    N -- Yes --> O[忽略事件]
```

#### 1.2 数据流：从文件系统到应用 (FS → App)

```mermaid
graph LR
    A[外部编辑器修改文件A] --> B[FSWatcher检测变化]
    B --> C[变化检测引擎分析]
    C --> D[通过TIPC事件发送file-changed]
    D --> E[前端事件监听器接收]
    E --> F[触发SWR重新验证]
    F --> G[请求最新数据]
    G --> H[后端返回新数据]
    H --> I[React组件重新渲染]
    I --> J[UI界面更新]
```

### 2. 智能项目结构解析

#### 2.1 目录结构识别

基于现有的目录设计规范，自动识别：

- Documents/ - 文档文件
- Assets/ - 项目资产
- Resources/ - 共享资源
- Exports/ - 导出文件
- Archive/ - 归档文件

#### 2.2 文件类型推断

- 基于文件扩展名推断资产类型
- 基于文件名模式推断文档类型
- 基于目录位置推断用途

#### 2.3 自动分类

- 文档自动分类为逻辑文档组
- 资产自动分类为不同资产类型
- 版本文件自动关联

### 3. 用户确认与交互

#### 3.1 实时变化通知

- 通过TIPC事件实时推送文件变化到前端
- 前端监听事件，自动触发SWR重新验证
- 提供变化详情和预览
- 支持批量确认和单个确认
- 无需轮询，真正的实时响应

#### 3.2 冲突解决机制

当文件在应用内外同时被修改，系统将不再简单地让用户"二选一"，而是启动智能合并流程以保全所有工作。

```mermaid
graph LR
    subgraph 检测阶段
        A[外部文件被修改] --> C[计算H_fs]
        B[应用内数据被修改] --> D[读取H_db]
        C --> E{H_fs != H_db?}
        D --> E
    end
    subgraph 判定阶段
        E -- Yes --> F[比较H_base]
        F --> G{H_fs != H_base 且 H_db != H_base?}
    end
    subgraph 处理阶段
        G -- Yes --> H[判定为内容冲突]
        H --> I[暂存冲突版本:conflict.md]
        I --> J[UI通知]
        J --> K{用户点击解决}
        K --> L[三方合并视图]
        L --> M[用户手动合并]
        M --> N[保存最终版本]
    end
    E -- No --> Z[正常同步]
    G -- No --> Z
```

#### 3.3 自动重命名

- 确认后自动按照命名规范重命名文件
- 保持文件系统与数据库的一致性

### 4. 性能与可扩展性考量

#### 4.1 忽略机制 (`.clarityignore`)

- **必要性**: 为了避免索引不必要的文件（如 `node_modules`, `.git`, 临时文件），系统将支持 `.clarityignore` 文件。
- **语法**: 语法与 `.gitignore` 保持一致，允许用户自定义忽略规则，从而显著提升大规模项目的扫描和监控性能。

#### 4.2 事件节流与防抖 (Throttling & Debouncing)

为应对 `git checkout` 等操作引发的事件风暴，系统采用防抖机制，将短时间内的大量文件变化合并为单次更新。

```mermaid
sequenceDiagram
    participant FS as 文件系统
    participant Watcher as 文件监控
    participant Debouncer as 事件防抖器
    participant Sync as 同步管理器

    FS->>Watcher: 文件A修改 (t=0ms)
    Watcher->>Debouncer: 收到事件A, 启动500ms计时器
    FS->>Watcher: 文件B修改 (t=150ms)
    Watcher->>Debouncer: 收到事件B, 重置计时器
    FS->>Watcher: 文件C修改 (t=400ms)
    Watcher->>Debouncer: 收到事件C, 重置计时器
    Note over Debouncer: 500ms过去，无新事件
    Debouncer->>Sync: 触发一次总体验证
    Sync->>FS: 请求最新状态
```

#### 4.3 增量与智能检测

- **大文件处理**: 对于大型文件（如视频、PSD），避免每次都计算完整哈希。优先通过检查文件大小和修改日期进行快速判断。
- **首次索引优化**: 首次导入大规模项目时，提供进度反馈，并允许用户优先使用部分已索引的内容。

### 5. 健壮性与错误处理

#### 5.1 离线变更与追赶同步 (Offline Changes & Catch-up Sync)

当应用在离线后重启，它必须能智能地识别并处理此期间发生的所有文件变更。此"追赶同步"机制流程如下：

```mermaid
graph LR
    A[应用启动] --> B[读取数据库快照S_db]
    B --> C[扫描项目文件夹得S_fs]
    C --> D[比对S_fs和S_db]
    D --> E[生成变更报告]
    E --> F{变更为空?}
    F -- Yes --> G[同步完成]
    F -- No --> H[UI摘要通知:检测到N处变更]
    H --> I{用户确认}
    I --> J[应用变更到数据库]
    J --> G
```

#### 5.2 事务性操作与回滚

- **原子性**: 复杂操作（如重命名文件夹）将被视为一个事务。如果操作中途失败（如磁盘空间不足、权限问题），系统将自动回滚到操作前的状态，避免数据不一致。
- **操作队列**: 所有文件操作将进入一个持久化队列，支持失败重试机制，以应对文件被临时占用等情况。

#### 5.3 外部驱动器与网络共享

- **状态管理**: 系统能检测到项目文件夹所在的驱动器是否已断开连接。
- **优雅处理**: 在驱动器断开时，系统会暂停同步并通知用户。一旦驱动器重新连接，将自动恢复同步状态。

### 6. 安全与边界情况

#### 6.1 符号链接 (Symbolic Links) 处理

- **策略**: 默认情况下，系统将记录符号链接本身，但不会跟随它进入链接指向的目录。这可以防止无限循环扫描和潜在的安全风险。用户可在设置中更改此行为。

#### 6.2 文件系统权限

- **权限尊重**: 系统将读取并尊重文件的读/写权限。对于只读文件，应用内的编辑功能将被禁用。

#### 6.3 沙箱化操作

- **范围限制**: 所有文件操作将严格限制在用户选定的项目工作目录内，防止任何意外操作影响到目录之外的文件系统。

## 技术架构

### 事件驱动系统架构图

```mermaid
graph TB
    subgraph "前端层 (Renderer Process)"
        UI[React组件]
        SWR[SWR缓存]
        EventListener[TIPC事件监听器]
        Notification[实时通知]
    end

    subgraph "通信层"
        TIPC[TIPC事件系统]
        IPC[Electron IPC]
    end

    subgraph "主进程层 (Main Process)"
        SyncManager[文件同步管理器]
        FSWatcher[文件系统监控服务]
        ChangeDetector[变化检测引擎]
        ProjectParser[项目解析器]
        ConflictResolver[冲突解决器]
    end

    subgraph "数据层"
        Database[(SQLite数据库)]
        SyncStates[(同步状态表)]
        ChangeLogs[(变化日志表)]
    end

    subgraph "文件系统"
        ProjectFolder[项目文件夹]
        Documents[Documents/]
        Assets[Assets/]
        Resources[Resources/]
    end

    %% 事件驱动数据流
    ProjectFolder --> FSWatcher
    Documents --> FSWatcher
    Assets --> FSWatcher
    Resources --> FSWatcher

    FSWatcher --> ChangeDetector
    ChangeDetector --> SyncManager
    SyncManager --> Database
    SyncManager --> TIPC

    %% 实时事件推送
    TIPC --> EventListener
    EventListener --> SWR
    SWR --> UI
    EventListener --> Notification

    %% 用户操作反向流
    UI --> TIPC
    TIPC --> SyncManager
    SyncManager --> ProjectFolder
    SyncManager --> ConflictResolver

    %% 样式
    classDef frontendLayer fill:#e3f2fd
    classDef commLayer fill:#f3e5f5
    classDef mainLayer fill:#e8f5e8
    classDef dataLayer fill:#fff3e0
    classDef fileSystem fill:#fce4ec

    class UI,SWR,EventListener,Notification frontendLayer
    class TIPC,IPC commLayer
    class SyncManager,FSWatcher,ChangeDetector,ProjectParser,ConflictResolver mainLayer
    class Database,SyncStates,ChangeLogs dataLayer
    class ProjectFolder,Documents,Assets,Resources fileSystem
```

### 事件驱动的双向同步流程图

```mermaid
sequenceDiagram
    participant FS as 文件系统
    participant Watcher as 文件监控服务
    participant SyncMgr as 同步管理器
    participant TIPC as TIPC事件系统
    participant Frontend as 前端应用
    participant SWR as SWR缓存
    participant DB as 数据库

    %% 文件系统到应用的同步
    Note over FS,DB: 文件变化检测与事件推送
    FS->>Watcher: 文件系统变化事件
    Watcher->>SyncMgr: 处理文件变化
    SyncMgr->>DB: 记录变化日志
    SyncMgr->>TIPC: 发送文件变化事件
    TIPC->>Frontend: 推送实时事件
    Frontend->>SWR: 触发数据重新验证
    SWR->>Frontend: 更新UI显示
    Frontend->>Frontend: 显示变化通知

    %% 用户确认流程
    Note over Frontend,DB: 用户交互确认
    Frontend->>TIPC: 用户确认变化
    TIPC->>SyncMgr: 处理确认请求
    SyncMgr->>DB: 更新确认状态
    SyncMgr->>FS: 执行文件重命名(如需要)
    SyncMgr->>TIPC: 发送确认完成事件
    TIPC->>Frontend: 推送确认结果
    Frontend->>SWR: 重新验证相关数据

    %% 应用到文件系统的同步
    Note over Frontend,FS: 应用内操作同步
    Frontend->>TIPC: 用户在应用中操作
    TIPC->>SyncMgr: 处理应用内操作
    SyncMgr->>DB: 更新数据库
    SyncMgr->>FS: 同步到文件系统
    SyncMgr->>SyncMgr: 标记为内部操作
    FS->>Watcher: 文件变化事件
    Watcher->>SyncMgr: 检测到变化
    SyncMgr->>SyncMgr: 识别为内部操作，跳过通知
```

### 1. TIPC事件系统接口

```typescript
// 主进程向渲染进程发送的事件类型
export type RendererHandlers = {
  fileChanged: (data: {
    projectId: string
    changeEvent: FileChangeEvent
    fileInfo?: FileInfo
  }) => void
  syncStateUpdated: (data: { projectId: string; syncStates: SyncState[] }) => void
  conflictDetected: (data: { projectId: string; conflicts: FileConflict[] }) => void
}

// 文件系统监控服务
interface FileSystemWatcherService extends EventEmitter {
  startWatching(projectId: string, folderPath: string): Promise<void>
  stopWatching(projectId: string, folderPath: string): Promise<void>
  // 事件: 'fileChange', 'initialScan', 'error'
}
```

### 2. 事件驱动同步管理器

```typescript
interface FileSyncManager {
  startProjectWatching(projectId: string): Promise<void>
  stopProjectWatching(projectId: string): Promise<void>
  startAllProjectWatching(): Promise<void>

  // 内部事件处理
  private handleFileChange(projectId: string, changeEvent: FileChangeEvent): Promise<void>
  private sendEventToRenderer(eventName: string, data: any): void
}
```

### 3. 前端事件监听器

```typescript
// 前端监听TIPC事件
const handlers = createEventHandlers<RendererHandlers>({
  on: window.electron.ipcRenderer.on,
  send: window.ipcRenderer.send
})

// React Hook示例
function useFileSyncEvents(projectId: string) {
  useEffect(() => {
    const unlisten = handlers.fileChanged.listen((data) => {
      if (data.projectId === projectId) {
        // 触发SWR重新验证
        mutate(['project-sync-states', projectId])
        mutate(['project-change-logs', projectId])

        // 显示通知
        showFileChangeNotification(data)
      }
    })
    return unlisten
  }, [projectId])
}
```

### 4. SWR集成模式

```typescript
// 自动重新验证的Hook
export function useProjectSyncStates(projectId: string) {
  const { data, mutate } = useSWR(['project-sync-states', projectId], () =>
    tipcClient.getProjectSyncStates({ projectId })
  )

  // 监听实时事件
  useEffect(() => {
    const unlisten = handlers.syncStateUpdated.listen((eventData) => {
      if (eventData.projectId === projectId) {
        mutate() // 自动重新验证
      }
    })
    return unlisten
  }, [projectId, mutate])

  return { data, mutate }
}
```

## 数据模型扩展

### 1. 同步状态跟踪

```sql
CREATE TABLE sync_states (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  file_path TEXT NOT NULL,
  last_sync_hash TEXT,
  last_sync_timestamp INTEGER,
  sync_status TEXT NOT NULL, -- 'synced', 'pending', 'conflict'
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### 2. 变化日志

```sql
CREATE TABLE change_logs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  change_type TEXT NOT NULL, -- 'file_added', 'file_removed', 'file_modified'
  file_path TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  user_confirmed BOOLEAN DEFAULT FALSE,
  applied_at INTEGER,
  created_at INTEGER NOT NULL
);
```

## 实现阶段

### Phase 1: 基础监控与事件系统 (2周)

- ✅ 实现文件系统监控服务 (FileSystemWatcherService)
- ✅ 基础变化检测引擎 (ChangeDetector)
- ✅ 数据模型扩展 (sync_states, change_logs表)
- 🔄 TIPC事件系统集成
- 🔄 前端事件监听器实现

### Phase 2: 双向同步与SWR集成 (3周)

- 完整的事件驱动同步引擎
- 前端SWR自动重新验证机制
- 冲突解决机制
- 用户确认流程
- 实时通知系统

### Phase 3: 智能解析与用户体验 (4周)

- 项目结构解析
- 自动分类算法
- 导入计划生成
- 用户界面优化
- 通知系统完善

### Phase 4: 高级功能与性能优化 (3周)

- 批量操作支持
- 性能优化 (事件防抖、智能缓存)
- 错误恢复机制
- 跨平台兼容性测试

## 风险与挑战

### 技术风险

1. **性能问题**：大量文件监控可能影响性能
   - **缓解**：事件防抖、智能过滤、批量处理
2. **事件风暴**：频繁的TIPC事件可能影响性能
   - **缓解**：事件聚合、防抖机制、优先级队列
3. **文件锁定**：文件被其他程序占用时的处理
   - **缓解**：重试机制、错误恢复、用户提示
4. **跨平台兼容性**：不同操作系统的文件系统差异
   - **缓解**：平台特定适配、充分测试

### 用户体验风险

1. **过度通知**：频繁的变化通知可能干扰用户
   - **缓解**：智能聚合、用户设置、通知优先级
2. **数据丢失**：同步错误可能导致数据丢失
   - **缓解**：事务性操作、自动备份、操作日志
3. **学习成本**：新功能的学习成本
   - **缓解**：渐进式引导、智能默认、帮助文档

### 缓解策略

1. **事件驱动优势**：实时响应，避免轮询开销
2. **增量实现**：分阶段实现，每个阶段都是可用状态
3. **用户控制**：提供详细的设置选项
4. **备份机制**：重要操作前自动备份
5. **回滚功能**：支持操作回滚
6. **性能监控**：实时监控事件处理性能

## 成功指标

1. **同步准确性**：99%以上的文件变化正确同步
2. **实时响应**：文件变化事件推送延迟小于1秒
3. **事件处理性能**：单个事件处理时间小于100ms
4. **用户满意度**：用户反馈评分4.5+/5.0
5. **错误率**：同步错误率低于1%
6. **事件可靠性**：事件传递成功率99.9%以上

## 未来扩展

1. **云同步集成**：与云存储服务集成
2. **协作功能**：多用户协作时的同步
3. **版本控制**：集成Git等版本控制系统
4. **AI辅助**：使用AI进行更智能的文件分类

## 结论

基于TIPC事件系统的智能文件管理与双向同步系统将显著提升ClarityFile的用户体验，实现真正的实时同步。通过事件驱动架构，避免了轮询的性能开销，提供了更好的响应性和用户体验。

### 关键优势

1. **真正的实时同步**：基于事件推送，无延迟响应
2. **高性能**：避免轮询开销，事件驱动更高效
3. **类型安全**：TIPC提供端到端类型安全
4. **SWR集成**：自动缓存管理和数据重新验证
5. **可扩展性**：事件系统易于扩展新功能

通过分阶段实现和充分的用户测试，可以确保系统的稳定性和可用性。当前Phase 1的基础架构已经完成，为后续功能奠定了坚实基础。

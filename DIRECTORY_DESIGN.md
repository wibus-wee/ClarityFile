太棒了！数据库设计告一段落，现在我们来探讨同样至关重要的**文件系统映射策略**。你的需求非常明确：“保持文件夹结构也是可视化的，不能乱七八糟”，这对于用户体验和与云同步软件的兼容性都至关重要。

我们的目标是设计一个既能满足数据库记录需求，又能生成清晰、可预测、易于人类理解和导航的本地文件夹结构。这个结构将由你的应用程序（ClarityFile / 明档）根据数据库中的元数据**强制智能生成和管理**。

**核心原则：**

1.  **可预测性 (Predictability):** 用户应该能够根据项目的元数据大致推断出文件可能存放的位置。
2.  **一致性 (Consistency):** 相同类型的实体应遵循相同的存储规则。
3.  **层级清晰 (Clear Hierarchy):** 避免过深或过于扁平的文件夹结构。
4.  **人类可读 (Human-Readable):** 文件夹和文件名应包含有意义的标识符。
5.  **避免冲突 (Conflict Avoidance):** 确保文件名和路径的唯一性。
6.  **与数据库同步 (Synchronization with Database):** 文件夹结构和文件名是数据库中 `managed_files.physical_path` 的直接体现。

**整体根目录结构设想：**

假设用户在 ClarityFile 应用中设置了一个唯一的“团队云盘根目录”（我们称之为 `CLARITY_FILE_ROOT`）。所有由 ClarityFile 管理的文件都将存放在这个根目录下。

```
CLARITY_FILE_ROOT/
├── Projects/                     # 所有项目相关的文件
├── SharedResources/              # 独立于项目的共享资源
├── System/                       # (可选) 应用系统文件，如配置、临时文件等
└── Inbox/                        # (可选) 未整理文件的临时入口，应用处理后会移走
```

**一、项目相关文件 (`Projects/`)**

这是最核心的部分，需要细致设计。

- **一级子目录：项目本身**

  - 命名规则：`[项目ID]_[项目名称]` 或 `[项目名称]` (如果项目名称保证唯一性，或者通过ID确保文件夹唯一性)。为了简洁和美观，可能更倾向于直接用项目名称，但需要处理名称中不合规的字符（如 `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`）并确保唯一性。如果项目名称可变，使用ID作为前缀更稳定。
  - **折中方案：`[项目名称_简短ID后几位]`** 这样既可读又能在名称相似时区分。
  - 例如：`CLARITY_FILE_ROOT/Projects/核心项目A_智慧校园助手_a1b2/`

- **二级子目录：项目内的内容分类 (基于 `logical_documents.type` 或 `project_assets.asset_type`)**

  - **文档类 (来自 `logical_documents` 和 `document_versions`)**:
    - 文件夹名可以基于 `logical_documents.name` 或 `logical_documents.default_storage_path_segment` (如果设置了)。
    - 例如：`CLARITY_FILE_ROOT/Projects/核心项目A_a1b2/商业计划书/`
    - 例如：`CLARITY_FILE_ROOT/Projects/核心项目A_a1b2/PPT模块库/`
  - **项目资产类 (来自 `project_assets`)**:
    - 可以有一个统一的 `_Assets/` 文件夹，内部再按 `project_assets.asset_type` 分类。
    - 例如：`CLARITY_FILE_ROOT/Projects/核心项目A_a1b2/_Assets/软件截图/`
    - 例如：`CLARITY_FILE_ROOT/Projects/核心项目A_a1b2/_Assets/封面图片/`
  - **比赛相关资料 (来自 `competition_milestones.notification_managed_file_id`，如果通知文件归属于项目下的比赛)**
    - 可以按“赛事系列 - 赛段”组织。
    - 例如：`CLARITY_FILE_ROOT/Projects/核心项目A_a1b2/_CompetitionDocs/挑战杯/校级初赛_通知.pdf`
    - 或者，如果一个项目只参与少量比赛，也可以更扁平：`CLARITY_FILE_ROOT/Projects/核心项目A_a1b2/挑战杯_校级初赛_通知.pdf` (这种方式下，比赛通知文件更像一个独立的文档版本)。
    - **考虑到我们 `competition_milestones` 已经是独立实体，且通知文件直接关联到它，比赛通知更适合放在一个专门的全局比赛资料库，而不是项目下。除非这个通知是项目团队针对比赛自己编写的材料。** (见后文“全局赛事资料”)

- **文件名规范 (`managed_files.physical_path` 的文件名部分)：**
  - **对于 `document_versions`：**
    - 核心要素：`[逻辑文档类型缩写]_[版本标签]_[针对比赛/通用]_[日期或其他标识].[后缀]`
    - 例如：`BP_国赛最终版V2_挑战杯国赛_20231026.pdf`
    - 例如：`PPT_模块_市场分析_v1.2_通用.pptx`
    - `[针对比赛/通用]` 部分：
      - 如果 `is_generic_version` 为 true，则为 `通用`。
      - 如果关联了 `competition_milestone_id`，则为 `[赛事系列名缩写]_[赛段名缩写]`，例如 `挑战杯_国赛`。
      - 如果 `competition_project_name` 有值，也可以包含在内，例如 `参赛作品名A_挑战杯国赛`。
    - **完整路径示例：** `CLARITY_FILE_ROOT/Projects/核心项目A_a1b2/商业计划书/BP_国赛最终版V2_参赛作品名A_挑战杯国赛_20231026.pdf`
  - **对于 `project_assets`：**
    - 核心要素：`[资产类型缩写]_[资产名称/描述关键部分]_[日期或其他标识].[后缀]`
    - 例如：`Screenshot_用户登录界面_20231001.png`
    - 例如：`Logo_项目主视觉_最终版.svg`
    - **完整路径示例：** `CLARITY_FILE_ROOT/Projects/核心项目A_a1b2/_Assets/软件截图/Screenshot_用户登录界面_20231001.png`

**二、共享资源 (`SharedResources/`)**

这些资源不直接隶属于单一项目，或者是团队级别的共享。

- **一级子目录：资源类型 (`shared_resources.type`)**

  - 例如：`CLARITY_FILE_ROOT/SharedResources/专利成果/`
  - 例如：`CLARITY_FILE_ROOT/SharedResources/红头文件/`
  - 例如：`CLARITY_FILE_ROOT/SharedResources/团队资质/`
  - 例如：`CLARITY_FILE_ROOT/SharedResources/通用PPT模板/`

- **文件名规范：**
  - 核心要素：`[资源名称核心部分]_[自定义字段关键信息]_[日期或其他标识].[后缀]`
  - 例如：`专利_一种新型AI算法_ZL2023X001_受理通知书.pdf` (假设“ZL2023X001”来自自定义字段)
  - 例如：`红头文件_关于XX的决定_2023年第5号.pdf`
  - **完整路径示例：** `CLARITY_FILE_ROOT/SharedResources/专利成果/专利_一种新型AI算法_ZL2023X001_受理通知书.pdf`

**三、全局赛事资料 (`Competitions/` - 替代原项目下的比赛资料思路)**

存放官方下发的、与具体项目提交物无关的比赛通知、章程等。

- **一级子目录：赛事系列 (`competition_series.name`)**

  - 例如：`CLARITY_FILE_ROOT/Competitions/挑战杯/`
  - 例如：`CLARITY_FILE_ROOT/Competitions/互联网+大学生创新创业大赛/`

- **二级子目录：赛事里程碑/赛段 (`competition_milestones.level_name`)**

  - 例如：`CLARITY_FILE_ROOT/Competitions/挑战杯/校级初赛/`
  - 例如：`CLARITY_FILE_ROOT/Competitions/挑战杯/省级复赛/`

- **文件名规范 (针对 `competition_milestones.notification_managed_file_id` 指向的文件)：**
  - 核心要素：`通知_[赛段关键信息]_[年份或其他标识].[后缀]`
  - 例如：`通知_挑战杯校赛章程_2024版.pdf`
  - **完整路径示例：** `CLARITY_FILE_ROOT/Competitions/挑战杯/校级初赛/通知_挑战杯校赛章程_2024版.pdf`

**四、经费报销相关文件 (`ExpenseTracking/` - 可选，如果发票等也本地管理)**

如果发票等也作为受管文件。

- **一级子目录：年份或项目 (如果大部分报销与项目相关)**

  - 例如：`CLARITY_FILE_ROOT/ExpenseTracking/2024/`
  - 或者，如果与项目强关联：`CLARITY_FILE_ROOT/Projects/核心项目A_a1b2/_Expenses/` (这种更符合项目为中心)

- **二级子目录 (如果按年份)：报销事项或申请人**

  - 例如：`CLARITY_FILE_ROOT/ExpenseTracking/2024/购买打印机_张三_20240115/`

- **文件名规范 (针对 `expense_trackings.invoice_managed_file_id` 指向的文件)：**
  - `发票_[事项关键信息]_[金额]_[日期].[后缀]`
  - 例如：`发票_购买打印机_599元_20240115.pdf`
  - **完整路径示例 (如果放在项目下)：** `CLARITY_FILE_ROOT/Projects/核心项目A_a1b2/_Expenses/购买打印机_张三_20240115/发票_购买打印机_599元_20240115.pdf`
  - **我更倾向于将经费报销的发票附件也放在项目文件夹下（如果关联了项目），这样更集中。**

**五、`System/` 和 `Inbox/`**

- `System/`: 存放应用的SQLite数据库文件 (`clarityfile.db`)、配置文件、日志等。这些通常对用户不可见或不直接操作。
- `Inbox/`: 用户拖拽或通过“快速添加”功能导入但尚未完全填写元数据的文件，可以先临时存放在这里。应用引导用户完善信息后，再将其按规则移动到上述正式的结构中。这是一个重要的缓冲区域。

**文件名和文件夹名处理细节：**

1.  **字符清理：** 所有从用户输入或元数据生成的文件夹名和文件名，都需要清理掉操作系统不允许的特殊字符（如 `/ \ : * ? " < > |`），通常替换为空格或下划线。
2.  **长度限制：** 注意路径总长度和单个文件名/文件夹名的长度限制（不同操作系统有差异）。应避免生成过长的名称。
3.  **唯一性保证：**
    - **文件夹：** 项目文件夹如果重名，可以通过ID后缀区分。其他层级文件夹如果基于类型或固定名称，通常是唯一的。
    - **文件名：** 在同一文件夹下，文件名必须唯一。可以通过在文件名中加入更精确的日期时间戳 (精确到秒或毫秒)、随机字符串、或递增序号来确保。例如，如果用户在同一秒内上传了两个同名文件，且其他元数据完全一致，则文件名可以加上 `_1`, `_2` 后缀。`managed_files.id` (UUID) 本身也可以作为确保文件名绝对唯一的一部分，例如：`[有意义的文件名部分]_[managed_file_id的简短形式].[后缀]`。**但为了人类可读性，不推荐将完整UUID直接放在常用文件名中，除非作为最后的保险手段。**
4.  **大小写敏感性：** Windows文件名不区分大小写，macOS默认不区分但可配置，Linux区分。为了跨平台兼容和避免混淆，应用层面最好将所有生成的名称统一转换为小写（或大写），或者在比较时忽略大小写。
5.  **模板化配置 (高级)：** 未来可以允许用户在应用设置中自定义一部分命名和路径模板规则，以适应更个性化的需求。但初期应有一套稳健的默认规则。

**应用如何实现“强制智能命名和摆放”：**

1.  **用户添加文件/创建记录时：**
    - ClarityFile 应用引导用户输入必要的元数据（项目、文档类型、版本标签、比赛信息等）。
    - 应用根据这些元数据和预设的映射规则，动态生成目标文件夹路径和标准化的文件名。
    - 应用在 `managed_files` 表中创建一条新记录，`physical_path` 字段就存储这个生成的完整路径。
    - 应用将用户提供的物理文件复制或移动到这个生成的 `physical_path` 位置。
    - 相关的业务表（如 `document_versions`）通过 `managed_file_id` 引用这条记录。
2.  **用户修改元数据时：**
    - 如果修改的元数据影响了文件路径或文件名（例如，修改了项目名称、版本标签、关联的比赛等）。
    - 应用需要重新计算新的 `physical_path`。
    - 应用将物理文件从旧路径移动/重命名到新路径。
    - 应用更新 `managed_files` 表中对应记录的 `physical_path` 字段。
    - **这是一个关键且复杂的操作，需要保证事务性，避免文件丢失或数据库与文件系统不一致。**
3.  **用户删除记录时：**
    - 当删除一个 `document_versions` 或 `project_assets` 等记录时。
    - 应用需要找到其关联的 `managed_files` 记录。
    - **关键决策：** 是否同时删除物理文件？这应该是一个可配置的选项，或者有明确的回收站机制。
    - 如果决定删除物理文件，应用会从磁盘上删除该文件，并删除 `managed_files` 中的记录（或标记为已删除）。

**总结这个文件系统映射策略：**

它的核心是**以数据库中的元数据为驱动，通过应用逻辑在本地文件系统上构建一个与之一致的、清晰的、可预测的虚拟化组织结构。** 用户不应该直接去手动修改这个由 ClarityFile 管理的文件夹结构和文件名，所有操作都应通过 ClarityFile 应用界面进行，以保证数据的一致性。

这个策略是否符合你的预期？有没有哪些方面你觉得需要进一步细化或调整？

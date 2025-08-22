# Project Overview

- ClarityFile项目正在开发Phase 0阶段，实现最小可行骨架包括项目创建、文件导入和数据库记录等核心功能。
- 用户偏好增量式重构和开发方法，完成一个功能后立即停止并汇报结果，等待确认后再继续下一个任务。
- 用户偏好在实现RFC之前进行详细的架构分析和实现规划，包括文件修改清单、架构重构分析、实现优先级划分和风险评估。
- ClarityFile需要双向同步功能监测本地文件变化并提醒用户确认，系统以项目为中心设计，基于整个工作目录进行全局监控。
- 项目目录名称遵循DIRECTORY_DESIGN中定义的特定格式，用于自动识别和映射到数据库中的项目记录。

# Tech Stack & Development Practices

- 技术栈：TypeScript、React, pnpm, @tanstack/react-router, SWR, shadcn/ui, framer-motion, zod, react-hook-form
- 用户偏好使用Context/zustand进行状态管理，使用SWR而非React Query进行数据请求。
- 用户强调应完全使用main/types中的类型定义，不应在前端代码中手动编写类型定义。
- 用户偏好将组件拆分到独立文件中，而不是在单个文件中定义多个组件，以提高代码可维护性。
- 用户偏好使用string类型而不是enum定义文档和资产类型，原因包括数据库存储简化、扩展性需求和后端schema一致性。
- 用户偏好使用TIPC的事件系统(on event)进行实时通信，而不是轮询式API调用。
- 用户偏好在快速开发阶段进行破坏性更改，而不是保持向后兼容性，完全移除废弃功能而非维护向后兼容性。

# UI/UX Design Preferences

- 用户强烈反对使用Card组件，偏好模仿Linear和GitHub等产品的设计模式，使用轻量border+bg_card设计。
- 用户偏好使用macOS风格的颜色设计系统，包括轻量的阴影设计以保持macOS风格的简洁性。
- 用户偏好在ClarityFile项目中使用绿色系配色而不是蓝色配色进行界面设计。
- 用户偏好使用framer-motion库添加非线性的弹性动画效果，但偏好更微妙自然的动画效果，反对过于强烈的动效。
- 用户偏好使用drawer组件而不是sheet组件进行UI开发，简单操作使用Dialog组件，复杂表单使用Drawer组件。
- 用户偏好在ClarityFile项目中实现苹果QuickLook风格的文件预览功能，而不是使用shell.openPath直接打开文件。
- 用户偏好更高对比度的UI设计，具有更好的视觉层次结构和图层分离，不喜欢缺乏清晰度的低对比度白色设计。
- 用户偏好在深色模式中使用更微妙的边框，认为深色模式下过于明显的边框设计不佳。
- User prefers complete redesign over incremental fixes when components don't meet design standards, and emphasizes studying more reference implementations for better design patterns.

# Component Architecture

- ClarityFile项目的设置组件已抽象为通用组件：SettingsForm、SettingsSection、SettingsSwitchField等。
- 用户定义了项目列表页设计规格：支持卡片/列表视图切换、项目筛选排序搜索、右键菜单快捷操作等功能。
- 用户定义了项目详情页设计规格：多Tab布局包含概览、文档、资产、参与赛事、关联资源、经费、设置等模块。
- 用户偏好将统一的模块重构模式：创建zod Schema文件、更新服务层集成验证、重构前端表单管理为react-hook-form+zod、合并创建/编辑组件。

# File & Document Handling

- ClarityFile项目创建时需要创建文件夹，有默认项目路径配置项，文件夹设计方案在DIRECTORY_DESIGN.md中。
- 用户要求导入功能应根据项目资源类型将文件放置到项目子文件夹的对应位置，严格按照directory design文档实现。
- 用户要求文件管理页面的选择行为遵循标准操作系统文件管理器交互模式，文件删除应移动到回收站而非永久删除。

# Global Hotkey & Internationalization

- ClarityFile项目需要实现统一的快捷键和按钮操作管理系统，支持按钮点击和键盘快捷键触发、自动添加快捷键提示tooltip。
- ClarityFile项目需要实现快捷键提示功能：长按⌘键显示当前页面可用快捷键的overlay组件，使用macOS风格显示格式。
- ClarityFile项目需要实现i18n国际化功能，使用react-i18next，支持中英文动态切换，采用命名空间组织翻译文件。
- 用户偏好TypeScript类型安全的i18n翻译键，支持自动完成、错误检查和从JSON文件生成类型，使用zh-CN作为基础。
- ClarityFile项目的i18n迁移工作要求逐个组件进行迁移，每完成一个组件后暂停汇报结果等待确认，使用project-details命名空间组织翻译键，保持组件API不变仅内部添加i18n支持。

# ClarityFile 后端架构重构

## 概述

✅ **重构完成！** 这次重构将原本耦合在 `tipc.ts` 中的所有 API 端点按功能模块进行了分离，提高了代码的可维护性和扩展性。

## 重构成果

- ✅ 将 359 行的单一文件拆分为模块化架构
- ✅ 创建了 9 个服务类，5 个路由模块
- ✅ 建立了统一的类型定义系统
- ✅ 为未来的智能功能预留了扩展框架
- ✅ 通过了 TypeScript 类型检查

## 目录结构

```
src/main/
├── services/           # 业务逻辑服务层
│   ├── project.service.ts              # 项目相关业务逻辑
│   ├── document.service.ts             # 文档相关业务逻辑
│   ├── file-management.service.ts      # 文件管理业务逻辑
│   ├── tag.service.ts                  # 标签相关业务逻辑
│   ├── settings.service.ts             # 设置相关业务逻辑
│   ├── system.service.ts               # 系统信息业务逻辑
│   ├── filesystem.service.ts           # 文件系统操作业务逻辑
│   ├── intelligent-naming.service.ts   # 智能命名服务（未来功能）
│   └── auto-structure.service.ts       # 自动结构服务（未来功能）
├── routers/            # API 路由层
│   ├── project.router.ts               # 项目相关路由
│   ├── document.router.ts              # 文档相关路由
│   ├── file.router.ts                  # 文件相关路由
│   ├── settings.router.ts              # 设置相关路由
│   └── system.router.ts                # 系统相关路由
├── types/              # 类型定义
│   ├── inputs.ts                       # 输入参数类型
│   └── outputs.ts                      # 输出结果类型
├── tipc.ts             # 主路由聚合器
├── db.ts               # 数据库连接
└── index.ts            # 主入口文件
```

## 架构设计原则

### 1. 分层架构

- **路由层 (Routers)**: 负责处理 API 请求和响应，参数验证
- **服务层 (Services)**: 负责业务逻辑处理，数据操作
- **类型层 (Types)**: 统一管理输入输出类型定义

### 2. 单一职责原则

每个服务类只负责一个特定的业务领域：

- `ProjectService`: 项目的 CRUD 操作
- `DocumentService`: 文档管理
- `FileManagementService`: 文件管理
- `SettingsService`: 应用设置
- `SystemService`: 系统信息
- `FilesystemService`: 文件系统操作

### 3. 依赖注入和解耦

- 服务层不直接依赖路由层
- 路由层通过调用服务层方法实现功能
- 类型定义独立管理，便于维护

## 未来扩展

### 智能功能服务

为未来的智能功能预留了服务框架：

1. **智能命名服务 (`intelligent-naming.service.ts`)**

   - 文件内容分析
   - 智能名称生成
   - 批量重命名
   - 命名建议

2. **自动结构服务 (`auto-structure.service.ts`)**
   - 文件夹结构分析
   - 自动文件整理
   - 结构模板应用
   - 优化建议

## 使用方式

### 添加新的 API 端点

1. **在对应的服务类中添加业务逻辑方法**

```typescript
// 在 ProjectService 中添加新方法
static async archiveProject(input: ArchiveProjectInput) {
  // 业务逻辑实现
}
```

2. **在类型文件中定义输入输出类型**

```typescript
// 在 inputs.ts 中添加
export interface ArchiveProjectInput {
  id: string
  archiveReason?: string
}
```

3. **在对应的路由中添加端点**

```typescript
// 在 project.router.ts 中添加
archiveProject: t.procedure.input<ArchiveProjectInput>().action(async ({ input }) => {
  return await ProjectService.archiveProject(input)
})
```

### 添加新的业务模块

1. 创建新的服务类 `src/main/services/new-feature.service.ts`
2. 创建对应的路由 `src/main/routers/new-feature.router.ts`
3. 在 `src/main/types/inputs.ts` 和 `outputs.ts` 中添加相关类型
4. 在 `src/main/tipc.ts` 中导入并注册新路由

## 优势

1. **可维护性**: 代码按功能模块组织，易于定位和修改
2. **可扩展性**: 新功能可以独立开发，不影响现有代码
3. **可测试性**: 每个服务类可以独立进行单元测试
4. **类型安全**: 统一的类型定义确保 API 的类型安全
5. **代码复用**: 服务层方法可以在不同的路由中复用

## 注意事项

1. 所有数据库操作都应该在服务层进行
2. 路由层只负责参数处理和调用服务层方法
3. 新增功能时要同步更新类型定义
4. 保持服务类的静态方法设计，便于调用和测试

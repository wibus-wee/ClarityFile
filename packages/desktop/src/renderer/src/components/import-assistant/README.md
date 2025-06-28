# Import Assistant 模块

智能文件导入助手模块，支持发票报销和项目文档的拖拽导入功能。

## 📁 文件夹结构

```
import-assistant/
├── 📄 index.ts                    # 统一导出入口
├── 📄 README.md                   # 模块说明文档
├── 📁 core/                       # 核心逻辑
│   ├── types.ts                   # 类型定义
│   ├── utils.ts                   # 工具函数
│   └── import-context.tsx         # 导入上下文
├── 📁 hooks/                      # 自定义Hooks
│   ├── use-expense-import.ts      # 发票报销导入Hook
│   ├── use-document-import.ts     # 文档导入Hook
│   └── use-import-context-data.ts # 导入上下文数据Hook
├── 📁 components/                 # UI组件
│   ├── nested-import-assistant.tsx # 主要导入助手组件
│   ├── 📁 drawers/                # Drawer组件
│   │   ├── expense-drawer-wrapper.tsx      # 发票报销Drawer
│   │   ├── document-drawer-wrapper.tsx     # 文档导入Drawer
│   │   └── simplified-drawers.tsx          # 简化版Drawer组件
│   └── 📁 global/                 # 全局组件
│       ├── file-drop-listener.tsx          # 全局文件拖拽监听器
│       ├── file-drop-overlay.tsx           # 全局拖拽覆盖层
│       ├── document-drawers.tsx            # 全局文档Drawer
│       └── expense-form-drawer.tsx         # 全局发票表单Drawer
├── 📁 context/                    # Context Providers
│   └── drag-drop-context.tsx      # 拖拽状态Context
└── 📁 styles/                     # 样式文件
    └── global-file-drop.css       # 全局拖拽样式
```

## 🚀 使用方式

### 基本导入

```typescript
import {
  // 主要组件
  NestedImportAssistant,
  
  // 全局组件
  GlobalFileDropListener,
  GlobalFileDropOverlay,
  DragDropProvider,
  
  // Hooks
  useExpenseImportHandler,
  useDocumentImportHandler,
  useImportContextData,
  
  // 类型
  DroppedFileInfo,
  ImportContextData
} from '@renderer/components/import-assistant'
```

### 在布局中使用

```typescript
import { DragDropProvider, GlobalFileDropListener, GlobalFileDropOverlay } from '@renderer/components/import-assistant'

function Layout({ children }) {
  return (
    <DragDropProvider>
      <div>
        {children}
        <GlobalFileDropListener />
        <GlobalFileDropOverlay />
      </div>
    </DragDropProvider>
  )
}
```

## 🏗️ 架构设计

### 核心原则

1. **关注点分离**: 按功能模块组织代码
2. **单一职责**: 每个组件和Hook职责明确
3. **可复用性**: 组件和Hook可在不同场景复用
4. **类型安全**: 完整的TypeScript类型定义

### 数据流

```
用户拖拽文件 → GlobalFileDropListener → ImportAssistantStore → NestedImportAssistant → 具体Drawer组件
```

### 状态管理

- **全局状态**: 使用Zustand管理导入助手和全局Drawer状态
- **Context状态**: 使用React Context管理拖拽状态和导入上下文
- **本地状态**: 组件内部使用useState管理UI状态

## 🔧 开发指南

### 添加新的导入类型

1. 在 `core/types.ts` 中添加新的配置类型
2. 在 `hooks/` 中创建对应的自定义Hook
3. 在 `components/drawers/` 中创建对应的Drawer组件
4. 在 `index.ts` 中导出新的组件和Hook

### 修改现有功能

1. **修改类型定义**: 编辑 `core/types.ts`
2. **修改业务逻辑**: 编辑对应的Hook文件
3. **修改UI组件**: 编辑对应的组件文件
4. **更新导出**: 确保 `index.ts` 中的导出是最新的

## 📝 最佳实践

1. **使用统一导出**: 始终从 `index.ts` 导入，避免深层路径导入
2. **遵循命名规范**: 组件使用PascalCase，Hook使用camelCase
3. **保持类型安全**: 所有函数和组件都应有完整的类型定义
4. **单元测试**: 为关键的Hook和工具函数编写测试
5. **文档更新**: 修改功能时同步更新相关文档

## 🐛 故障排除

### 常见问题

1. **导入路径错误**: 确保使用 `@renderer/components/import-assistant` 导入
2. **类型错误**: 检查 `core/types.ts` 中的类型定义是否最新
3. **Context错误**: 确保组件被正确的Provider包装
4. **样式问题**: 确保导入了 `styles/global-file-drop.css`

### 调试技巧

1. 使用React DevTools查看Context状态
2. 在Hook中添加console.log调试数据流
3. 检查Zustand store的状态变化
4. 使用TypeScript编译器检查类型错误

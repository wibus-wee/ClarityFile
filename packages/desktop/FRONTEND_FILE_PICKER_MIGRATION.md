# 前端文件选择器迁移指南

## 概述

将文件选择功能从后端 IPC 路由迁移到前端原生实现，简化架构并减少不必要的 IPC 通信。

## 新的实现方案

### 1. 前端文件选择器 Hook

创建了 `useFilePicker` hook，使用原生 HTML `input[type="file"]` API：

```typescript
// packages/desktop/src/renderer/src/hooks/use-file-picker.ts
export function useFilePicker() {
  const pickFile = async (accept?: string) => {
    /* ... */
  }
  const pickFiles = async (options: FilePickerOptions) => {
    /* ... */
  }
  // 注意：pickDirectory 有限制，见下方说明
}
```

### 2. 优势

- **简化架构**：文件选择无需 IPC 通信，直接在前端获取文件路径
- **减少延迟**：避免主进程和渲染进程之间的通信开销
- **更好的用户体验**：原生文件选择器响应更快
- **代码简化**：减少部分后端路由和服务层代码

### 3. 重要限制

**文件夹选择的限制**：

- Web API 的 `webkitdirectory` 只能获取文件夹内的文件，无法直接获取文件夹路径
- 空文件夹无法通过此方法获取路径
- 因此，**文件夹选择仍需保留后端 `selectDirectory` 路由**

## 迁移步骤

### 第一步：替换文件选择逻辑

**之前的实现：**

```typescript
const { trigger: selectFile } = useSelectFile()

const handleSelectFile = async () => {
  const result = await selectFile({
    title: '选择文件',
    filters: [{ name: '所有文件', extensions: ['*'] }]
  })

  if (!result.canceled && result.path) {
    setSelectedFile(result.path)
  }
}
```

**新的实现：**

```typescript
const { pickFile } = useFilePicker()

const handleSelectFile = async () => {
  const result = await pickFile('*/*')

  if (!result.canceled && result.path) {
    setSelectedFile(result.path)
  }
}
```

### 第二步：文件夹选择保持不变

**由于 Web API 限制，文件夹选择功能保持使用后端路由：**

```typescript
const { trigger: selectDirectory } = useSelectDirectory()

const handleSelectDirectory = async () => {
  const result = await selectDirectory({
    title: '选择文件夹'
  })

  if (!result.canceled && result.path) {
    setSelectedPath(result.path)
  }
}
```

**不要迁移文件夹选择功能**，因为前端无法可靠地获取文件夹路径。

## 需要迁移的文件

### 已完成迁移：

1. ✅ `asset-form-drawer.tsx` - 资产文件选择
2. ✅ `document-version-form-drawer.tsx` - 文档版本文件选择
3. ✅ `expense-form-drawer.tsx` - 发票文件选择
4. ✅ `use-file-actions.ts` - 全局文件上传

### 待迁移：

无 - 所有文件选择功能已完成迁移

## 迁移后可删除的代码

### 已完成清理：

1. ✅ `packages/desktop/src/main/routers/file.router.ts` 中的 `selectFile` 路由（已删除，保留 `selectDirectory`）
2. ✅ `packages/desktop/src/main/services/filesystem.service.ts` 中的 `selectFile` 方法（已删除，保留 `selectDirectory`）
3. ✅ `packages/desktop/src/renderer/src/hooks/use-tipc.ts` 中的 `useSelectFile`（已删除，保留 `useSelectDirectory`）
4. ✅ `packages/desktop/src/main/types/inputs.ts` 中的 `SelectFileInput` 类型（已删除）
5. ✅ `packages/desktop/src/main/types/outputs.ts` 中的 `SelectFileOutput` 类型（已删除）

## 注意事项

1. **文件路径获取**：依赖于之前实现的 `window.api.getPathForFile` 方法
2. **错误处理**：如果无法获取文件路径，会回退到使用文件名
3. **浏览器兼容性**：`webkitdirectory` 属性在所有现代浏览器中都支持
4. **用户体验**：原生文件选择器可能在样式上与 Electron 的 dialog 略有不同

## 测试清单

- [ ] 文件选择功能正常工作
- [ ] 文件夹选择功能正常工作
- [ ] 文件路径正确获取
- [ ] 错误处理正常
- [ ] 取消操作正常处理
- [ ] 多文件选择功能正常

## 完成迁移后的清理

1. ✅ 删除后端不必要的路由和服务
2. ✅ 更新类型定义
3. ✅ 清理未使用的导入
4. ✅ 更新文档

## 迁移完成总结

### 成功迁移的功能：

- 资产文件选择（asset-form-drawer.tsx）
- 文档版本文件选择（document-version-form-drawer.tsx）
- 发票文件选择（expense-form-drawer.tsx）
- 全局文件上传（use-file-actions.ts）

### 保留的功能：

- 文件夹选择（selectDirectory）- 由于 Web API 限制

### 架构改进：

- 减少了 4 个 IPC 调用路径
- 简化了文件选择流程
- 提高了响应速度
- 保持了类型安全

### 代码清理：

- 删除了 5 个不再使用的代码片段
- 清理了相关类型定义
- 移除了未使用的导入

迁移工作已全部完成！🎉

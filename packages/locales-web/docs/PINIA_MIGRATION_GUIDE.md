# Pinia 迁移指南

本文档描述了从原有的 Composables 模式迁移到 Pinia 状态管理的过程和使用方法。

## 迁移概述

### 迁移前（Composables 模式）
```typescript
// 使用模块级别的 ref 管理全局状态
const activeNamespace = ref<string>('')
const namespaces = ref<Namespace[]>([])

export const useTranslations = () => {
  // 返回状态和方法
  return {
    activeNamespace: readonly(activeNamespace),
    namespaces: readonly(namespaces),
    // ...
  }
}
```

### 迁移后（Pinia 模式）
```typescript
// 使用 Pinia store 管理状态
export const useTranslationsStore = defineStore('translations', {
  state: (): TranslationsState => ({
    activeNamespace: '',
    namespaces: [],
    // ...
  }),
  getters: {
    // 计算属性
  },
  actions: {
    // 方法
  }
})
```

## 新的使用方式

### 1. 翻译状态管理

```typescript
// 在组件中使用
import { useTranslationsNew } from '~/composables/useTranslationsNew'

const translations = useTranslationsNew()

// 访问状态
console.log(translations.activeNamespace.value)
console.log(translations.translationEntries.value)

// 调用方法
await translations.selectNamespace('common')
await translations.saveAllChanges()
```

### 2. 设置管理

```typescript
import { useSettingsNew } from '~/composables/useSettingsNew'

const settings = useSettingsNew()

// 响应式设置
settings.theme.value = 'dark'
settings.autoSave.value = true

// 方法调用
settings.toggleDark()
settings.resetSettings()
```

### 3. 文件系统操作

```typescript
import { useFileSystemNew } from '~/composables/useFileSystemNew'

const fileSystem = useFileSystemNew()

// 文件操作
await fileSystem.loadNamespaces()
const content = await fileSystem.readNamespaceFile('common', 'en-US')
```

## 新增功能

### 1. 自动保存
```typescript
// 自动保存会在有未保存更改时自动触发（5秒延迟）
// 可以手动控制
translations.scheduleAutoSave()
translations.cancelAutoSave()
```

### 2. 批量操作
```typescript
// 批量更新翻译
const updates = [
  { path: 'key1', languageCode: 'en-US', value: 'Value 1' },
  { path: 'key2', languageCode: 'en-US', value: 'Value 2' }
]
const result = await translations.batchUpdateTranslations(updates)

// 批量删除
const result = await translations.batchDeleteTranslationKeys(['key1', 'key2'])
```

### 3. 导出功能
```typescript
// 导出为 JSON
const jsonData = translations.exportTranslations('json')

// 导出为 CSV
const csvData = translations.exportTranslations('csv')
```

### 4. 状态持久化
```typescript
// 设置会自动持久化到 localStorage
// 翻译状态在页面刷新后会保持
```

## 开发工具支持

### 1. Pinia DevTools
- 安装 Vue DevTools 浏览器扩展
- 在开发模式下可以查看所有 store 状态
- 支持时间旅行调试

### 2. 日志记录
```typescript
// 开发模式下会自动记录 store actions 和状态变化
// 在浏览器控制台查看详细日志
```

## 错误处理

### 1. 统一错误处理
```typescript
// 所有 store actions 都有统一的错误处理
// 错误会被记录到控制台并可以上报
```

### 2. 重试机制
```typescript
// 使用 retryOperation 工具函数
import { retryOperation } from '~/utils/storeHelpers'

const result = await retryOperation(
  () => someAsyncOperation(),
  3, // 最大重试次数
  1000 // 延迟时间
)
```

## 性能优化

### 1. 计算属性缓存
```typescript
// Pinia getters 会自动缓存计算结果
// 只有依赖的状态改变时才会重新计算
```

### 2. 防抖和节流
```typescript
import { debounce, throttle } from '~/utils/storeHelpers'

// 防抖搜索
const debouncedSearch = debounce(searchFunction, 300)

// 节流滚动
const throttledScroll = throttle(scrollHandler, 100)
```

## 测试

### 1. 测试页面
访问 `/test-pinia` 页面可以测试所有 Pinia 功能：
- 状态管理
- 批量操作
- 导出功能
- 持久化
- 错误处理

### 2. 单元测试
```typescript
// 测试 store
import { setActivePinia, createPinia } from 'pinia'
import { useTranslationsStore } from '~/stores/translations'

describe('TranslationsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should update translation', () => {
    const store = useTranslationsStore()
    store.updateTranslation('test.key', 'en-US', 'Test Value')
    // 断言...
  })
})
```

## 迁移检查清单

- [x] 配置 Pinia 模块
- [x] 创建 stores (translations, settings, fileSystem)
- [x] 创建兼容性 composables
- [x] 更新现有组件使用新的 composables
- [x] 添加自动保存功能
- [x] 添加批量操作功能
- [x] 添加错误处理和日志
- [x] 创建测试页面
- [x] 编写迁移文档

## 后续步骤

1. 逐步将所有组件迁移到新的 composables
2. 删除旧的 composables 文件
3. 添加更多单元测试
4. 优化性能和用户体验
5. 考虑添加更多高级功能（如撤销/重做）

## 常见问题

### Q: 为什么要迁移到 Pinia？
A: Pinia 提供更好的 TypeScript 支持、DevTools 集成、状态持久化和模块化管理。

### Q: 迁移会影响现有功能吗？
A: 不会，我们保持了完全的向后兼容性，现有组件无需修改。

### Q: 如何调试 Pinia 状态？
A: 使用 Vue DevTools 的 Pinia 面板，或查看浏览器控制台的日志。

### Q: 自动保存如何工作？
A: 当有未保存更改时，系统会在 5 秒后自动保存，可以手动控制。

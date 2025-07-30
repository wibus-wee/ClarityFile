# Command Palette Migration Guide

本指南帮助你从旧的"God Hook"架构迁移到新的域驱动hook架构。

## 快速迁移检查清单

### 1. 更新 Provider 组件

**之前:**
```tsx
import { useRouteCommandsSync, usePluginCommandsSync } from './hooks/...'

function CommandPaletteProvider({ children }) {
  const router = useRouter()
  useRouteCommandsSync(router)
  usePluginCommandsSync()
  // ...
}
```

**之后:**
```tsx
import { useCommandDataSync } from './hooks/use-command-data-sync'

function CommandPaletteProvider({ children }) {
  useCommandDataSync() // 一个hook搞定所有数据同步
  // ...
}
```

### 2. 更新组件中的hook使用

**之前 (God Hook):**
```tsx
function MyComponent() {
  const {
    searchResults,
    executeCommand,
    toggleFavorite,
    pluginStats,
    isLoading,
    // ... 20+ other properties
  } = useCommandPalette()
  
  // 组件只需要搜索和执行功能，但获得了所有数据
}
```

**之后 (Focused Hooks):**
```tsx
function MyComponent() {
  const { results } = useCommandResults()
  const { executeCommand } = useCommandExecution()
  
  // 组件只获得它需要的数据
}
```

### 3. 更新搜索相关代码

**之前:**
```tsx
const { searchResults, query } = useCommandSearch()
const hasQuery = query.trim().length > 0
```

**之后:**
```tsx
const { results, hasQuery, query } = useCommandResults()
// 或者如果只需要搜索逻辑
const { searchResults, hasQuery, query } = useCommandSearch()
```

### 4. 更新收藏功能

**之前:**
```tsx
const { favorites, toggleFavorite } = useCommandPalette()
const isFav = favorites.includes(commandId)
```

**之后:**
```tsx
const { isFavorite, toggleFavorite } = useCommandFavorites()
const isFav = isFavorite(commandId)
```

### 5. 更新插件管理

**之前:**
```tsx
const { 
  pluginConfigs, 
  updatePluginConfig, 
  getPluginStats 
} = useCommandPalette()
const stats = getPluginStats()
```

**之后:**
```tsx
const { 
  pluginConfigs, 
  updatePluginConfig, 
  pluginStats 
} = usePluginManagement()
// stats 是实时计算的，不需要调用函数
```

## 常见迁移场景

### 场景1: 显示命令列表的组件

**之前:**
```tsx
function CommandList() {
  const { searchResults, executeCommand, favorites } = useCommandPalette()
  
  return (
    <div>
      {searchResults.map(command => (
        <div key={command.id}>
          <button onClick={() => executeCommand(command.id, command.action)}>
            {command.title}
          </button>
          {favorites.includes(command.id) && <span>⭐</span>}
        </div>
      ))}
    </div>
  )
}
```

**之后:**
```tsx
function CommandList() {
  const { results } = useCommandResults() // 已经包含isFavorite信息
  const { executeCommand } = useCommandExecution()
  
  return (
    <div>
      {results.map(command => (
        <div key={command.id}>
          <button onClick={() => executeCommand(command.id, command.action)}>
            {command.title}
          </button>
          {command.isFavorite && <span>⭐</span>}
        </div>
      ))}
    </div>
  )
}
```

### 场景2: 收藏按钮组件

**之前:**
```tsx
function FavoriteButton({ commandId }) {
  const { favorites, toggleFavorite } = useCommandPalette()
  const isFav = favorites.includes(commandId)
  
  return (
    <button onClick={() => toggleFavorite(commandId)}>
      {isFav ? '⭐' : '☆'}
    </button>
  )
}
```

**之后:**
```tsx
function FavoriteButton({ commandId }) {
  const { isFavorite, toggleFavorite } = useCommandFavorites()
  
  return (
    <button onClick={() => toggleFavorite(commandId)}>
      {isFavorite(commandId) ? '⭐' : '☆'}
    </button>
  )
}
```

### 场景3: 设置页面

**之前:**
```tsx
function SettingsPage() {
  const { 
    pluginConfigs, 
    updatePluginConfig, 
    getPluginStats,
    favorites 
  } = useCommandPalette()
  
  const stats = getPluginStats()
  
  return (
    <div>
      <div>插件总数: {stats.total}</div>
      <div>收藏数: {favorites.length}</div>
      {/* ... */}
    </div>
  )
}
```

**之后:**
```tsx
function SettingsPage() {
  const { pluginConfigs, updatePluginConfig, pluginStats } = usePluginManagement()
  const { favorites } = useCommandFavorites()
  
  return (
    <div>
      <div>插件总数: {pluginStats.total}</div>
      <div>收藏数: {favorites.length}</div>
      {/* ... */}
    </div>
  )
}
```

## 性能优化建议

### 1. 只使用需要的hooks
```tsx
// ❌ 不好 - 获取了不需要的数据
function SearchBox() {
  const palette = useCommandPalette() // 获取所有数据
  return <input onChange={palette.setQuery} />
}

// ✅ 好 - 只获取需要的数据
function SearchBox() {
  const { setQuery } = useCommandPaletteActions()
  return <input onChange={setQuery} />
}
```

### 2. 使用 useCommandResults 获取增强的显示数据
```tsx
// ❌ 不好 - 在组件中进行复杂计算
function CommandList() {
  const { searchResults } = useCommandSearch()
  const { isFavorite } = useCommandFavorites()
  
  const enhancedResults = useMemo(() => {
    return searchResults.results.map(cmd => ({
      ...cmd,
      isFavorite: isFavorite(cmd.id)
    }))
  }, [searchResults.results, isFavorite])
  
  // ...
}

// ✅ 好 - 使用预计算的数据
function CommandList() {
  const { results } = useCommandResults() // 已经包含isFavorite
  // ...
}
```

### 3. 在顶层使用数据同步
```tsx
// ✅ 在应用顶层使用一次
function CommandPaletteProvider() {
  useCommandDataSync() // 只在这里使用
  return <CommandPaletteOverlay />
}

// ❌ 不要在多个地方使用
function SomeComponent() {
  useCommandDataSync() // 不要这样做
}
```

## 测试迁移

### 之前的测试
```tsx
// 测试复杂的God Hook很困难
test('command palette functionality', () => {
  const { result } = renderHook(() => useCommandPalette())
  // 需要模拟很多依赖...
})
```

### 之后的测试
```tsx
// 可以独立测试每个hook
test('command execution', () => {
  const { result } = renderHook(() => useCommandExecution())
  // 只需要模拟执行相关的依赖
})

test('command favorites', () => {
  const { result } = renderHook(() => useCommandFavorites())
  // 只需要模拟收藏相关的依赖
})
```

## 故障排除

### 问题1: "useCommandResults 返回空数据"
**原因**: 没有在顶层使用 `useCommandDataSync`
**解决**: 确保在 `CommandPaletteProvider` 中调用 `useCommandDataSync()`

### 问题2: "收藏状态不更新"
**原因**: 使用了旧的 `favorites.includes()` 模式
**解决**: 使用 `useCommandFavorites()` 的 `isFavorite()` 函数

### 问题3: "插件统计不准确"
**原因**: 使用了旧的 `getPluginStats()` 函数调用
**解决**: 使用 `usePluginManagement()` 的 `pluginStats` 属性

### 问题4: "搜索结果没有收藏信息"
**原因**: 使用了 `useCommandSearch` 而不是 `useCommandResults`
**解决**: 对于显示组件，使用 `useCommandResults` 获取增强的数据

## 迁移检查清单

- [ ] 更新 Provider 使用 `useCommandDataSync`
- [ ] 替换 `useCommandPalette` 为具体的focused hooks
- [ ] 更新搜索相关代码使用 `useCommandResults`
- [ ] 更新收藏功能使用 `useCommandFavorites`
- [ ] 更新插件管理使用 `usePluginManagement`
- [ ] 移除不必要的 `useMemo` 和复杂计算
- [ ] 更新测试使用独立的hook测试
- [ ] 验证性能改进（减少不必要的重渲染）

完成迁移后，你的代码将更加：
- 🎯 **专注** - 每个hook只做一件事
- 🧪 **可测试** - 可以独立测试每个功能
- ⚡ **高性能** - 减少不必要的重渲染
- 🔧 **可维护** - 更容易理解和修改
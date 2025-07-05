# 快捷键系统迁移指南

本指南帮助你将现有的快捷键功能迁移到新的统一快捷键管理系统。

## 🔄 迁移 Command Box 全局快捷键

### 旧代码 (command-box-provider.tsx)

```tsx
// 旧的实现
import { useGlobalKeyboard } from './hooks/use-keyboard'

export function CommandBoxProvider({ children }) {
  const { toggle } = useCommandBox()
  
  // 全局快捷键
  useGlobalKeyboard(toggle)
  
  return (
    <div>
      {children}
      <CommandBox />
    </div>
  )
}
```

### 新代码

```tsx
// 新的实现
import { ShortcutProvider, Shortcut } from '@renderer/components/shortcuts'

export function CommandBoxProvider({ children }) {
  const { toggle } = useCommandBox()
  
  return (
    <ShortcutProvider scope="global">
      {/* 使用新的快捷键系统 */}
      <Shortcut 
        shortcut={["cmd", "k"]} 
        scope="global"
        description="打开命令面板"
        priority={100}
      >
        <div style={{ display: 'none' }} onClick={toggle} />
      </Shortcut>
      
      <div>
        {children}
        <CommandBox />
      </div>
    </ShortcutProvider>
  )
}
```

## 🔄 迁移页面级快捷键

### 旧代码 (手动事件监听)

```tsx
// 旧的实现
function ProjectListPage() {
  const handleCreateProject = () => { /* ... */ }
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'n' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        handleCreateProject()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCreateProject])
  
  return (
    <div>
      <Button onClick={handleCreateProject}>新建项目</Button>
    </div>
  )
}
```

### 新代码

```tsx
// 新的实现
import { ShortcutProvider, Shortcut } from '@renderer/components/shortcuts'

function ProjectListPage() {
  const handleCreateProject = () => { /* ... */ }
  
  return (
    <ShortcutProvider scope="project-list">
      <div>
        <Shortcut shortcut={["cmd", "n"]} description="创建新项目">
          <Button onClick={handleCreateProject}>新建项目</Button>
        </Shortcut>
      </div>
    </ShortcutProvider>
  )
}
```

## 🔄 迁移 Command Box 内部快捷键

### 更新导入

```tsx
// 旧的导入
import { useKeyboard, useGlobalKeyboard, useSearchKeyboard } from './hooks/use-keyboard'

// 新的导入
import { 
  useCommandBoxKeyboard, 
  useCommandBoxSearchKeyboard 
} from './hooks/use-keyboard'
// 注意：useGlobalKeyboard 已删除，使用新的快捷键系统替代
```

### 更新函数调用

```tsx
// 旧代码
const { handleKeyDown } = useKeyboard({
  selectedIndex,
  setSelectedIndex,
  totalItems: allItems.length,
  onSelect: selectItem,
  onClose: close
})

const { handleKeyDown: handleSearchKeyDown } = useSearchKeyboard({
  onArrowDown: selectNext,
  onArrowUp: selectPrevious,
  onEnter: () => selectItem(selectedIndex),
  onEscape: close
})

// 新代码
const { handleKeyDown } = useCommandBoxKeyboard({
  selectedIndex,
  setSelectedIndex,
  totalItems: allItems.length,
  onSelect: selectItem,
  onClose: close
})

const { handleKeyDown: handleSearchKeyDown } = useCommandBoxSearchKeyboard({
  onArrowDown: selectNext,
  onArrowUp: selectPrevious,
  onEnter: () => selectItem(selectedIndex),
  onEscape: close
})
```

## 🔄 迁移现有按钮

### 简单按钮迁移

```tsx
// 旧代码
<Button onClick={handleAction}>操作</Button>

// 新代码 - 零破坏性改动
<Shortcut shortcut={["cmd", "n"]}>
  <Button onClick={handleAction}>操作</Button>
</Shortcut>
```

### 带条件的按钮迁移

```tsx
// 旧代码
<Button 
  onClick={handleDelete}
  disabled={selectedItems.length === 0}
>
  删除
</Button>

// 新代码
<Shortcut 
  shortcut={["cmd", "shift", "d"]}
  enabled={selectedItems.length > 0}
  condition={() => selectedItems.length > 0}
  description="删除选中项目"
>
  <Button 
    onClick={handleDelete}
    disabled={selectedItems.length === 0}
  >
    删除
  </Button>
</Shortcut>
```

## 🔄 迁移全局状态管理

### 旧代码 (全局 drawers)

```tsx
// 旧的实现
function SomeComponent() {
  const { openExpenseForm } = useGlobalDrawersStore()
  
  // 手动快捷键处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'e' && event.metaKey) {
        event.preventDefault()
        openExpenseForm()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openExpenseForm])
  
  return <Button onClick={openExpenseForm}>添加支出</Button>
}
```

### 新代码

```tsx
// 新的实现
function SomeComponent() {
  const { openExpenseForm } = useGlobalDrawersStore()
  
  return (
    <Shortcut 
      shortcut={["cmd", "e"]} 
      description="添加新支出"
      scope="global"
    >
      <Button onClick={openExpenseForm}>添加支出</Button>
    </Shortcut>
  )
}
```

## 📋 迁移检查清单

### ✅ 必须完成的迁移

- [ ] 更新 `command-box-provider.tsx` 中的全局快捷键
- [ ] 更新所有使用 `useGlobalKeyboard` 的地方
- [ ] 将 `useKeyboard` 改为 `useCommandBoxKeyboard`
- [ ] 将 `useSearchKeyboard` 改为 `useCommandBoxSearchKeyboard`

### ✅ 推荐完成的迁移

- [ ] 为主要操作按钮添加快捷键支持
- [ ] 使用 `ShortcutProvider` 包装页面组件
- [ ] 添加快捷键描述和 tooltip
- [ ] 设置合理的优先级

### ✅ 可选的改进

- [ ] 启用调试模式检查冲突
- [ ] 添加快捷键帮助面板
- [ ] 使用条件性快捷键
- [ ] 添加自定义 tooltip 内容

## 🚨 注意事项

### 1. 向后兼容性

为了保持向后兼容性，旧的函数名仍然可用：

```tsx
// 这些别名仍然有效
import { useKeyboard, useSearchKeyboard } from './hooks/use-keyboard'

// 但推荐使用新的名称
import { useCommandBoxKeyboard, useCommandBoxSearchKeyboard } from './hooks/use-keyboard'
```

### 2. 快捷键冲突

新系统会自动检测快捷键冲突。如果遇到冲突：

1. 检查控制台警告
2. 调整快捷键优先级
3. 使用不同的快捷键组合
4. 启用调试模式查看详细信息

### 3. 作用域管理

确保正确设置快捷键作用域：

- `scope="global"` - 全局快捷键，在任何地方都生效
- `scope="page"` - 页面级快捷键，只在当前页面生效

### 4. 性能考虑

新系统使用事件委托，性能比手动添加事件监听器更好。但仍需注意：

- 避免在循环中创建大量 `Shortcut` 组件
- 合理使用条件性启用
- 及时清理不需要的快捷键注册

## 🔧 调试技巧

### 启用调试模式

```tsx
<ShortcutProvider debug={true}>
  <YourComponent />
  <ShortcutDebugPanel />
</ShortcutProvider>
```

### 使用浏览器控制台

```javascript
// 查看快捷键注册表
window.__shortcutRegistry

// 查看所有注册的快捷键
window.__shortcutRegistry.state.registrations

// 查看冲突
window.__shortcutRegistry.state.conflicts
```

### 常见问题排查

1. **快捷键不生效**
   - 检查是否在 `ShortcutProvider` 内部
   - 确认快捷键格式正确
   - 检查 `enabled` 和 `condition` 属性

2. **快捷键冲突**
   - 查看控制台警告
   - 调整优先级
   - 使用调试面板查看详情

3. **Tooltip 不显示**
   - 确认 `showTooltip={true}`
   - 检查子组件是否支持 tooltip
   - 确认快捷键验证通过

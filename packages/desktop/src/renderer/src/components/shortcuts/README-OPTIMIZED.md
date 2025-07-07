# 快捷键管理系统 (React.dev 最佳实践优化版)

基于 React.dev 最佳实践重构的快捷键管理系统，使用自定义 Hooks 分离关注点，提供更好的可维护性和开发体验。

## 🚀 优化亮点

### React.dev 最佳实践应用

- ✅ **分离关注点**: 使用多个专用的自定义 Hooks
- ✅ **单一职责**: 每个 Hook 都有明确的职责
- ✅ **正确的 useEffect 使用**: 按功能分离不同的副作用
- ✅ **性能优化**: 合理使用 useMemo 和 useCallback
- ✅ **组件简化**: 主组件专注于渲染逻辑

### 架构改进

**重构前的问题**:
- 单个组件承担太多职责 (256 行代码)
- 一个 useEffect 处理多个关注点 (验证+注册+警告)
- 复杂的依赖数组管理 (16 个依赖项)
- 难以测试和维护

**重构后的优势**:
- 模块化的自定义 Hooks (4 个专用 Hooks)
- 清晰的职责分离 (主组件仅 81 行)
- 更好的代码复用性
- 易于测试和维护

## 🔧 新增的自定义 Hooks

### `useShortcutValidation` - 快捷键验证

专门处理快捷键配置的验证逻辑：

```tsx
import { useShortcutValidation } from '@/components/shortcuts'

function MyComponent() {
  const validation = useShortcutValidation({
    keys: ['cmd', 'n'],
    scope: 'page',
    priority: 50,
    enabled: true,
    description: '创建新项目'
  })
  
  // validation.isValid, validation.errors, validation.warnings
}
```

### `useChildComponentHandler` - 子组件处理

专门处理子组件的 onClick 提取和 ref 合并：

```tsx
import { useChildComponentHandler } from '@/components/shortcuts'

function MyComponent() {
  const button = <Button>点击我</Button>
  const { renderChild, actionRef } = useChildComponentHandler(
    button,
    () => console.log('自定义操作')
  )
  
  return renderChild()
}
```

### `useShortcutRegistration` - 快捷键注册

专门处理快捷键的注册和注销生命周期：

```tsx
import { useShortcutRegistration } from '@/components/shortcuts'

function MyComponent() {
  const actionRef = useRef(() => console.log('操作'))
  
  useShortcutRegistration({
    keys: ['cmd', 'n'],
    scope: 'page',
    priority: 50,
    enabled: true,
    description: '创建新项目',
    validation: { isValid: true, errors: [], warnings: [] },
    actionRef
  })
}
```

### `useTooltipContent` - Tooltip 内容管理

专门处理 tooltip 内容的生成和显示逻辑：

```tsx
import { useTooltipContent } from '@/components/shortcuts'

function MyComponent() {
  const { shouldShowTooltip, tooltipContent } = useTooltipContent({
    shortcut: ['cmd', 'n'],
    description: '创建新项目',
    showTooltip: true
  })
}
```

## 📊 重构对比

### 重构前 (复杂的单体组件)

```tsx
// 🔴 问题：一个组件做太多事情 (256 行)
export function Shortcut(props) {
  // 验证逻辑
  const validation = useMemo(() => validateShortcut(...), [...])
  
  // 子组件处理逻辑
  const extractChildAction = useCallback(() => {...}, [...])
  
  // 注册逻辑 + 验证 + 警告处理 (违反分离关注点)
  useEffect(() => {
    // 验证
    if (!validation.isValid) { ... }
    
    // 注册
    register(...)
    
    // 警告
    if (warnings.length > 0) { ... }
    
    return () => unregister(...)
  }, [/* 16 个依赖项的数组 */])
  
  // 复杂的渲染逻辑
  // ...
}
```

### 重构后 (模块化的组件)

```tsx
// ✅ 优化：清晰的职责分离 (81 行)
export function Shortcut(props) {
  // 1. 验证快捷键配置
  const validation = useShortcutValidation({...})
  
  // 2. 处理子组件逻辑
  const { renderChild, actionRef } = useChildComponentHandler(...)
  
  // 3. 注册快捷键
  useShortcutRegistration({...})
  
  // 4. 处理 tooltip 内容
  const { shouldShowTooltip, tooltipContent } = useTooltipContent({...})
  
  // 5. 简洁的渲染逻辑
  return shouldShowTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{renderChild()}</TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : renderChild()
}
```

## 🎯 使用示例

### 基本用法 (API 保持不变)

```tsx
import { Shortcut } from '@/components/shortcuts'

function MyComponent() {
  return (
    <Shortcut
      shortcut={['cmd', 'n']}
      description="创建新项目"
      action={() => console.log('新建项目')}
    >
      <Button>新建项目</Button>
    </Shortcut>
  )
}
```

### 高级用法 (使用新的 Hooks)

```tsx
import { 
  useShortcutValidation,
  useChildComponentHandler,
  useShortcutRegistration 
} from '@/components/shortcuts'

function AdvancedComponent() {
  // 分步使用各个 Hook
  const validation = useShortcutValidation({...})
  const { renderChild, actionRef } = useChildComponentHandler(...)
  useShortcutRegistration({...})
  
  return renderChild()
}
```

## 🧪 测试友好

重构后的 Hooks 更容易进行单元测试：

```tsx
// 测试验证逻辑
test('useShortcutValidation should validate correctly', () => {
  const { result } = renderHook(() => useShortcutValidation({...}))
  expect(result.current.isValid).toBe(true)
})

// 测试子组件处理
test('useChildComponentHandler should extract onClick', () => {
  const button = <Button onClick={mockFn}>Test</Button>
  const { result } = renderHook(() => useChildComponentHandler(button))
  // 测试逻辑...
})
```

## 📈 性能优化

### 优化前的问题
- 大的 useEffect 依赖数组导致不必要的重新执行
- 复杂的计算没有正确缓存
- 闭包问题导致的内存泄漏

### 优化后的改进
- 每个 Hook 都有精确的依赖数组
- 使用 useMemo 和 useCallback 优化性能
- 使用 useRef 避免闭包问题

## 🔄 迁移指南

### 对于现有用户
- **API 兼容**: 主要的 `Shortcut` 组件 API 保持不变
- **渐进式升级**: 可以逐步使用新的 Hooks
- **向后兼容**: 旧的使用方式仍然有效

### 对于开发者
- **更好的开发体验**: 清晰的代码结构
- **更容易调试**: 每个 Hook 都可以独立调试
- **更好的 TypeScript 支持**: 精确的类型定义

## 🎓 学习资源

- [React.dev - Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [React.dev - Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React.dev - Separating Events from Effects](https://react.dev/learn/separating-events-from-effects)

## 📝 最佳实践总结

1. **使用自定义 Hooks 抽象逻辑** - 提高代码复用性
2. **分离关注点** - 每个 Hook 都有单一职责
3. **正确使用 useEffect** - 按功能分离不同的副作用
4. **优化性能** - 合理使用 useMemo 和 useCallback
5. **保持组件简单** - 让组件专注于渲染逻辑

## 🔍 文件结构

```
shortcuts/
├── hooks/                          # 新增：自定义 Hooks
│   ├── use-shortcut-validation.ts  # 验证逻辑
│   ├── use-child-component-handler.ts # 子组件处理
│   ├── use-shortcut-registration.ts   # 注册逻辑
│   ├── use-tooltip-content.ts         # Tooltip 内容
│   └── index.ts                       # 统一导出
├── examples/                       # 新增：使用示例
│   └── optimized-usage-example.tsx
├── shortcut.tsx                    # 优化后的主组件 (256→81 行)
├── README-OPTIMIZED.md            # 本文档
└── ...                            # 其他原有文件
```

---

*这个优化版本完全遵循 React.dev 官方最佳实践，提供更好的代码质量和开发体验。*

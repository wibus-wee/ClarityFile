# 统一快捷键管理系统

ClarityFile 的统一快捷键管理系统，提供页面级和全局级的快捷键管理功能。

## 🚀 快速开始

### 基础用法

```tsx
import { ShortcutProvider, Shortcut } from '@renderer/components/shortcuts'
import { Button } from '@clarity/shadcn/ui/button'

function ProjectListPage() {
  const handleCreateProject = () => {
    console.log('创建新项目')
  }

  return (
    <ShortcutProvider scope="project-list">
      <div className="space-y-4">
        {/* 基础快捷键 */}
        <Shortcut shortcut={["cmd", "n"]}>
          <Button onClick={handleCreateProject}>新建项目</Button>
        </Shortcut>

        {/* 带描述的快捷键 */}
        <Shortcut 
          shortcut={["cmd", "i"]} 
          description="导入文件到当前项目"
        >
          <Button onClick={handleImportFiles}>导入文件</Button>
        </Shortcut>
      </div>
    </ShortcutProvider>
  )
}
```

### 条件性快捷键

```tsx
function FileManagementPage() {
  const [selectedFiles, setSelectedFiles] = useState([])

  return (
    <ShortcutProvider scope="file-management">
      {/* 只有选中文件时才启用删除快捷键 */}
      <Shortcut 
        shortcut={["cmd", "shift", "d"]}
        enabled={selectedFiles.length > 0}
        description="删除选中的文件"
        condition={() => selectedFiles.length > 0}
      >
        <Button 
          onClick={handleDeleteSelected}
          variant="destructive"
          disabled={selectedFiles.length === 0}
        >
          删除选中
        </Button>
      </Shortcut>
    </ShortcutProvider>
  )
}
```

### 全局快捷键

```tsx
function App() {
  return (
    <ShortcutProvider scope="global">
      {/* 全局设置快捷键 */}
      <Shortcut 
        shortcut={["cmd", "comma"]} 
        scope="global"
        description="打开应用设置"
      >
        <Button onClick={openSettings}>设置</Button>
      </Shortcut>

      {/* 页面内容 */}
      <Routes>
        <Route path="/projects" component={ProjectListPage} />
        <Route path="/files" component={FileManagementPage} />
      </Routes>
    </ShortcutProvider>
  )
}
```

## 🎯 核心特性

### 1. macOS 风格快捷键显示

系统会自动检测平台并显示对应的快捷键格式：

- **macOS**: `⌘N`, `⌘⇧D`, `⌘⌥I`
- **Windows/Linux**: `Ctrl+N`, `Ctrl+Shift+D`, `Ctrl+Alt+I`

### 2. 自动 Tooltip 提示

被 `Shortcut` 包装的按钮会自动显示快捷键提示：

```tsx
<Shortcut shortcut={["cmd", "n"]} description="创建新项目">
  <Button onClick={createProject}>新建项目</Button>
</Shortcut>
// Tooltip 显示: "创建新项目 (⌘N)"
```

### 3. 快捷键冲突检测

系统会自动检测并警告快捷键冲突：

```tsx
// 开发环境下会在控制台显示冲突警告
<ShortcutProvider debug={true}>
  <Shortcut shortcut={["cmd", "n"]}>
    <Button onClick={action1}>操作1</Button>
  </Shortcut>
  
  <Shortcut shortcut={["cmd", "n"]}>  {/* 冲突! */}
    <Button onClick={action2}>操作2</Button>
  </Shortcut>
</ShortcutProvider>
```

### 4. 优先级管理

通过 `priority` 属性解决冲突：

```tsx
<Shortcut shortcut={["cmd", "n"]} priority={100}>
  <Button onClick={highPriorityAction}>高优先级操作</Button>
</Shortcut>

<Shortcut shortcut={["cmd", "n"]} priority={50}>
  <Button onClick={lowPriorityAction}>低优先级操作</Button>
</Shortcut>
```

## 📋 API 参考

### Shortcut 组件

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `shortcut` | `ShortcutKey[]` | - | 快捷键组合 |
| `children` | `ReactElement` | - | 被包装的子组件 |
| `enabled` | `boolean` | `true` | 是否启用快捷键 |
| `description` | `string` | - | 快捷键描述 |
| `scope` | `'page' \| 'global'` | `'page'` | 作用域 |
| `priority` | `number` | `50` | 优先级 (0-100) |
| `showTooltip` | `boolean` | `true` | 是否显示 tooltip |
| `condition` | `() => boolean` | - | 启用条件 |
| `tooltipContent` | `string` | - | 自定义 tooltip 内容 |

### ShortcutProvider 组件

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `children` | `ReactNode` | - | 子组件 |
| `scope` | `string` | - | 作用域名称 |
| `debug` | `boolean` | `false` | 调试模式 |

### 支持的快捷键

#### 修饰键
- `cmd` / `meta` - Command 键 (macOS) / Windows 键
- `ctrl` - Control 键
- `shift` - Shift 键
- `alt` / `option` - Alt 键 (Windows) / Option 键 (macOS)

#### 常规键
- 字母键: `a-z`
- 数字键: `0-9`
- 功能键: `f1-f12`
- 特殊键: `enter`, `escape`, `space`, `tab`, `backspace`, `delete`
- 箭头键: `arrowup`, `arrowdown`, `arrowleft`, `arrowright`
- 导航键: `home`, `end`, `pageup`, `pagedown`
- 符号键: `comma`, `period`, `slash`, `semicolon`, `quote`, `minus`, `equal`

## 🛠️ 高级用法

### 调试模式

启用调试模式查看快捷键注册状态：

```tsx
<ShortcutProvider debug={true}>
  <YourComponent />
  <ShortcutDebugPanel /> {/* 显示调试面板 */}
</ShortcutProvider>
```

### 手动管理快捷键

```tsx
import { useShortcuts } from '@renderer/components/shortcuts'

function CustomComponent() {
  const shortcuts = useShortcuts()

  useEffect(() => {
    // 手动注册快捷键
    shortcuts.register({
      id: 'custom-action',
      keys: ['cmd', 'k'],
      scope: 'page',
      priority: 75,
      enabled: true,
      description: '自定义操作',
      action: () => console.log('自定义操作执行')
    })

    return () => {
      shortcuts.unregister('custom-action')
    }
  }, [shortcuts])

  return <div>自定义组件</div>
}
```

### 快捷键显示组件

```tsx
import { ShortcutDisplay } from '@renderer/components/shortcuts'

function HelpPanel() {
  return (
    <div>
      <p>创建项目: <ShortcutDisplay shortcut={["cmd", "n"]} /></p>
      <p>导入文件: <ShortcutDisplay shortcut={["cmd", "i"]} /></p>
    </div>
  )
}
```

## 🔧 与现有系统集成

### Command Box 集成

新的快捷键系统可以与现有的 Command Box 无缝集成：

```tsx
// 在 Command Box Provider 中使用新系统
function CommandBoxProvider({ children }) {
  const { toggle } = useCommandBox()
  
  return (
    <ShortcutProvider scope="global">
      <Shortcut shortcut={["cmd", "k"]} scope="global">
        <div style={{ display: 'none' }} onClick={toggle} />
      </Shortcut>
      {children}
    </ShortcutProvider>
  )
}
```

### 迁移现有代码

```tsx
// 旧代码
<Button onClick={createProject}>新建项目</Button>

// 新代码 - 零破坏性改动
<Shortcut shortcut={["cmd", "n"]}>
  <Button onClick={createProject}>新建项目</Button>
</Shortcut>
```

## 🎨 最佳实践

1. **使用语义化的快捷键**: `⌘N` 用于新建，`⌘S` 用于保存
2. **避免与系统快捷键冲突**: 系统会自动检测并警告
3. **合理设置优先级**: 重要操作使用更高的优先级
4. **提供清晰的描述**: 帮助用户理解快捷键功能
5. **使用条件性启用**: 根据应用状态动态启用/禁用快捷键

## 🐛 调试技巧

1. 启用调试模式查看注册状态
2. 使用浏览器控制台的 `window.__shortcutRegistry` 对象
3. 检查控制台的冲突警告
4. 使用 `ShortcutDebugPanel` 组件可视化调试

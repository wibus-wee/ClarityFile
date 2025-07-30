# HelloWorld 插件完整示例

这个 HelloWorld 插件展示了如何使用 command-palette 详情视图组件库创建功能丰富的插件界面。

## 如何测试

1. **打开 Command Palette**
   - 按 `Cmd+K` (macOS) 或 `Ctrl+K` (Windows/Linux)

2. **搜索插件命令**
   - 输入 "完整示例插件" 或 "demo"
   - 选择 "完整示例插件" 命令

3. **探索功能**
   - 左侧边栏有四个分类：概览、搜索、收藏、设置
   - 每个分类展示不同的功能和组件

## 功能演示

### 概览页面
- 显示插件基本信息
- 展示当前查询参数（如果有）
- 使用 `DetailStatus`、`DetailItem` 组件

### 搜索页面
- 实时搜索功能
- 加载状态演示
- 错误状态演示（输入 "error" 测试）
- 空状态演示
- 文件列表展示
- 收藏功能

### 收藏页面
- 显示收藏的文件
- 空状态处理
- 取消收藏功能

### 设置页面
- 设置项展示
- 信息状态提示

## 组件使用示例

### 布局组件
```tsx
<DetailLayout>
  <DetailSidebar>
    {/* 侧边栏内容 */}
  </DetailSidebar>
  <DetailMain>
    {/* 主要内容 */}
  </DetailMain>
</DetailLayout>
```

### 列表项
```tsx
<DetailItem
  icon={FileIcon}
  title="文件名"
  subtitle="修改时间"
  badge="类型"
  onClick={handleClick}
>
  <DetailButton>操作</DetailButton>
</DetailItem>
```

### 状态组件
```tsx
<DetailStatus status="success" message="操作成功" />
<DetailLoading message="加载中..." />
<DetailEmpty title="暂无内容" />
```

### 输入和按钮
```tsx
<DetailInput
  icon={SearchIcon}
  placeholder="搜索..."
  value={query}
  onChange={setQuery}
  onEnter={handleSearch}
/>

<DetailButton
  icon={PlayIcon}
  onClick={handleAction}
  variant="default"
>
  执行
</DetailButton>
```

## 技术特点

1. **状态管理**: 使用 React hooks 管理组件状态
2. **交互设计**: 完整的用户交互流程
3. **错误处理**: 包含加载、错误、空状态处理
4. **视觉一致性**: 所有组件都遵循 command-palette 设计语言
5. **响应式**: 适配不同的内容长度和状态

## 开发建议

1. **组件组合**: 灵活组合基础组件创建复杂界面
2. **状态管理**: 合理使用 React hooks 管理状态
3. **用户体验**: 提供加载、错误、空状态的完整体验
4. **交互反馈**: 使用 DetailStatus 提供操作反馈
5. **布局设计**: 使用 DetailLayout 创建清晰的信息层次

这个示例展示了详情视图组件库的完整功能，可以作为开发其他插件的参考模板。

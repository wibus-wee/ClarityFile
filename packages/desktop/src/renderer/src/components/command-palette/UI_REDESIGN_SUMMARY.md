# Command Palette UI 重新设计总结

## 设计目标

基于 Raycast、Linear 和 GitHub 的设计模式，重新设计 Command Palette 的 UI 界面，实现：

- 清晰的视觉层次
- macOS 风格的简洁设计
- 精细而不粗糙的视觉效果
- 保持所有功能逻辑不变

## 主要改进

### 1. 主容器 (CommandPaletteOverlay)

**改进前：**

```tsx
className = 'mx-4 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-2xl'
```

**改进后：**

```tsx
className =
  'mx-4 overflow-hidden rounded-xl border border-border/50 bg-popover/95 text-popover-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl'
```

**改进点：**

- 更精细的圆角：`rounded-lg` → `rounded-xl`
- 更微妙的边框：`border` → `border border-border/50`
- 半透明背景：`bg-popover` → `bg-popover/95`
- 精细的阴影系统：自定义多层阴影替代 `shadow-2xl`
- 增强的毛玻璃效果：`backdrop-blur-xl`
- 更好的背景模糊：`bg-black/50 backdrop-blur-sm` → `bg-black/40 backdrop-blur-md`

### 2. 输入框 (CommandPaletteInput)

**改进前：**

```tsx
className = 'flex items-center border-b px-3'
className =
  'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
```

**改进后：**

```tsx
className = 'flex items-center border-b border-border/30 px-4 py-1'
className =
  'flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50 font-medium'
```

**改进点：**

- 更精细的分隔线：`border-b` → `border-b border-border/30`
- 增加内边距：`px-3` → `px-4`
- 增加输入框高度：`h-11` → `h-12`
- 更微妙的占位符：`placeholder:text-muted-foreground` → `placeholder:text-muted-foreground/70`
- 增强字体权重：添加 `font-medium`
- 改进图标交互：增加 hover 状态和过渡效果

### 3. 命令项 (CommandItem)

**改进前：**

```tsx
className =
  'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer'
```

**改进后：**

```tsx
className =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent/60 aria-selected:text-accent-foreground cursor-pointer transition-all duration-150 hover:bg-accent/40 group'
```

**改进点：**

- 更大的间距：`gap-2` → `gap-3`
- 更精细的圆角：`rounded-sm` → `rounded-lg`
- 增加内边距：`px-2 py-1.5` → `px-3 py-2.5`
- 更微妙的选中状态：`aria-selected:bg-accent` → `aria-selected:bg-accent/60`
- 添加 hover 状态：`hover:bg-accent/40`
- 平滑过渡：`transition-all duration-150`
- 组状态管理：`group` 类
- 改进标签样式：使用 `bg-muted/40 px-2 py-0.5 rounded-md` 的胶囊设计

### 4. 状态栏 (CommandPaletteStatusBar)

**改进前：**

```tsx
className =
  'flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground'
className = 'px-1.5 py-0.5 text-xs bg-background border rounded'
```

**改进后：**

```tsx
className =
  'flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20 text-xs text-muted-foreground'
className =
  'inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-[10px] font-medium bg-background/80 border border-border/60 rounded-md shadow-sm'
```

**改进点：**

- 增加内边距：`px-3 py-2` → `px-4 py-3`
- 更微妙的分隔线：`border-t border-border` → `border-t border-border/50`
- 更微妙的背景：`bg-muted/30` → `bg-muted/20`
- 精致的 kbd 样式：更好的对齐、阴影和边框
- 改进文字层次：使用不同的透明度

### 5. 分组标题样式

**统一的分组标题样式：**

```tsx
className =
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground/80'
```

**改进点：**

- 统一的内边距：`px-2 py-1.5`
- 更小的字体：`text-xs`
- 增强字体权重：`font-semibold`
- 更微妙的颜色：`text-muted-foreground/80`
- 大写字母：`uppercase`
- 增加字母间距：`tracking-wider`

### 6. 列表容器

**改进前：**

```tsx
className = 'max-h-[300px] overflow-y-auto'
```

**改进后：**

```tsx
className = 'max-h-[320px] overflow-y-auto px-2 py-2'
```

**改进点：**

- 增加最大高度：`300px` → `320px`
- 添加内边距：`px-2 py-2`

## 设计原则

1. **层次感**：使用不同的透明度和阴影创建清晰的视觉层次
2. **一致性**：所有组件使用统一的设计语言和间距系统
3. **精细度**：注重细节，如圆角大小、阴影深度、透明度等
4. **交互性**：改进 hover、focus、selected 状态的视觉反馈
5. **可读性**：优化文字对比度和字体权重
6. **现代感**：使用毛玻璃效果、微妙的阴影和渐变

## 技术实现

- 保持所有原有的功能逻辑和 props 接口
- 使用 shadcn/ui 的设计系统
- 利用 Tailwind CSS 的透明度和变体功能
- 使用 CSS 变量确保主题兼容性
- 添加平滑的过渡动画

## 兼容性

- 完全兼容现有的深色/浅色主题
- 保持所有键盘导航功能
- 维持原有的可访问性特性
- 不影响任何业务逻辑

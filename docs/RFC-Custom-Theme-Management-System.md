# RFC: Custom Theme Management System

- **Start Date**: 2025-01-12
- **RFC PR**: (leave this empty)
- **ClarityFile Issue**: (leave this empty)

## Summary

为 ClarityFile 项目实现一个完整的自定义主题管理系统，允许用户导入、管理和应用自定义 CSS 主题，扩展现有的 light/dark/system 主题系统。

## Basic example

```typescript
// 用户导入自定义主题
const customTheme = {
  name: "Ocean Blue",
  description: "A calming blue theme",
  cssContent: `
    :root {
      --background: oklch(0.98 0.02 220);
      --foreground: oklch(0.15 0.05 220);
      --primary: oklch(0.55 0.15 220);
    }
    .dark {
      --background: oklch(0.08 0.02 220);
      --foreground: oklch(0.95 0.02 220);
    }
  `
}

// 应用主题
await themeManager.applyCustomTheme(customTheme.id)
```

## Motivation

当前 ClarityFile 只支持内置的 light/dark/system 主题，用户无法自定义界面颜色。为了提升用户体验和个性化需求，需要实现：

1. **用户个性化**：允许用户根据喜好自定义界面颜色
2. **主题分享**：用户可以分享和导入他人创建的主题
3. **设计灵活性**：支持完全自定义的 CSS 主题，不限制创意
4. **无缝集成**：与现有主题系统完美兼容

## Detailed design

### 1. 架构设计

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Components │    │  Theme Manager   │    │   Database      │
│                 │    │                  │    │                 │
│ - Import Dialog │◄──►│ - CSS Injection  │◄──►│ - settings table│
│ - Theme List    │    │ - Theme Storage  │    │ - JSON storage  │
│ - Preview       │    │ - State Mgmt     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 2. 数据模型

#### 2.1 数据库存储

利用现有的 `settings` 表存储主题数据：

```typescript
// settings 表中的新增项
interface CustomThemeSettings {
  'appearance.customThemes': {
    [themeId: string]: CustomTheme
  }
  'appearance.activeCustomTheme': string | null
}

interface CustomTheme {
  id: string
  name: string
  description?: string
  author?: string
  cssContent: string
  createdAt: string
  updatedAt: string
}
```

#### 2.2 主题状态扩展

```typescript
// 扩展现有的 Theme 类型
type ExtendedTheme = 'light' | 'dark' | 'system' | `custom:${string}`

// 扩展 ThemeContextValue
interface ExtendedThemeContextValue extends ThemeContextValue {
  customThemes: CustomTheme[]
  activeCustomTheme: string | null
  applyCustomTheme: (themeId: string) => Promise<void>
  removeCustomTheme: (themeId: string) => Promise<void>
}
```

### 3. 核心实现

#### 3.1 CSS 注入管理器

```typescript
class CustomThemeManager {
  private static styleElement: HTMLStyleElement | null = null
  
  static applyThemeCSS(cssContent: string): void {
    this.removeThemeCSS()
    
    const style = document.createElement('style')
    style.id = 'custom-theme-styles'
    style.textContent = cssContent
    
    // 插入到 head 末尾确保优先级
    document.head.appendChild(style)
    this.styleElement = style
  }
  
  static removeThemeCSS(): void {
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }
  }
  
  static previewTheme(cssContent: string): void {
    this.applyThemeCSS(cssContent)
  }
}
```

#### 3.2 主题服务层

```typescript
class ThemeService {
  static async saveCustomTheme(theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomTheme> {
    const newTheme: CustomTheme = {
      ...theme,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // 保存到数据库
    await this.updateCustomThemes(themes => ({
      ...themes,
      [newTheme.id]: newTheme
    }))
    
    return newTheme
  }
  
  static async deleteCustomTheme(themeId: string): Promise<void> {
    await this.updateCustomThemes(themes => {
      const { [themeId]: deleted, ...rest } = themes
      return rest
    })
  }
  
  static async getCustomThemes(): Promise<CustomTheme[]> {
    const setting = await tipcClient.getSetting({ key: 'appearance.customThemes' })
    return Object.values(setting?.value || {})
  }
}
```

### 4. UI 组件设计

#### 4.1 主题导入对话框

```typescript
function ThemeImportDialog() {
  const [cssContent, setCssContent] = useState('')
  const [themeMetadata, setThemeMetadata] = useState({
    name: '',
    description: '',
    author: ''
  })
  
  const handlePreview = () => {
    CustomThemeManager.previewTheme(cssContent)
  }
  
  const handleSave = async () => {
    await ThemeService.saveCustomTheme({
      ...themeMetadata,
      cssContent
    })
  }
}
```

#### 4.2 主题管理页面

```typescript
function CustomThemeManager() {
  const { customThemes } = useTheme()
  
  return (
    <div className="space-y-4">
      {customThemes.map(theme => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          onPreview={() => CustomThemeManager.previewTheme(theme.cssContent)}
          onApply={() => applyCustomTheme(theme.id)}
          onDelete={() => removeCustomTheme(theme.id)}
        />
      ))}
    </div>
  )
}
```

### 5. 集成现有系统

#### 5.1 扩展 CustomThemeProvider

```typescript
// 在现有 CustomThemeProvider 中添加
const [customThemes, setCustomThemes] = useState<CustomTheme[]>([])
const [activeCustomTheme, setActiveCustomTheme] = useState<string | null>(null)

// CSS 应用时机
useEffect(() => {
  if (!isLoading && activeCustomTheme) {
    const theme = customThemes.find(t => t.id === activeCustomTheme)
    if (theme) {
      CustomThemeManager.applyThemeCSS(theme.cssContent)
    }
  } else if (!isLoading && !activeCustomTheme) {
    CustomThemeManager.removeThemeCSS()
  }
}, [isLoading, activeCustomTheme, customThemes])
```

#### 5.2 扩展外观设置

在 `appearance-settings.tsx` 中添加：
- 自定义主题选择器
- "管理自定义主题"按钮
- 主题导入入口

## Drawbacks

1. **存储空间**：CSS 内容可能较大，增加数据库存储压力
2. **样式冲突**：用户提供的 CSS 可能与现有样式产生冲突
3. **维护复杂性**：增加了主题系统的复杂度

## Alternatives

1. **主题变量编辑器**：只允许编辑预定义的 CSS 变量，限制灵活性但更安全
2. **主题市场**：提供在线主题商店，但增加了服务端复杂度
3. **配置文件方式**：使用独立的主题配置文件，但不如数据库集成方便

## Adoption strategy

### Phase 1: 核心功能 (Week 1-2)
- [ ] 实现 `CustomThemeManager` 类
- [ ] 扩展 `CustomThemeProvider`
- [ ] 数据库集成和 TIPC 接口
- [ ] 基础的主题导入功能

### Phase 2: 用户界面 (Week 3)
- [ ] 主题导入对话框
- [ ] 主题管理页面
- [ ] 集成到外观设置页面
- [ ] 主题预览功能

### Phase 3: 优化和完善 (Week 4)
- [ ] 主题导出功能
- [ ] 错误处理和用户反馈
- [ ] 文档和用户指南
- [ ] 测试和 bug 修复

## Unresolved questions

1. **CSS 注入时机**：确保在正确的时机注入 CSS，避免闪烁
2. **主题冲突处理**：如何处理用户 CSS 与系统样式的冲突
3. **主题验证**：是否需要对用户提供的 CSS 进行基础验证
4. **回退机制**：当自定义主题出现问题时的回退策略

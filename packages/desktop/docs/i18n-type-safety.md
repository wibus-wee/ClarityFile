# 🔒 i18n 类型安全指南

本文档介绍如何在 ClarityFile 项目中使用强类型的国际化翻译系统。

## 🎯 功能特性

### ✅ 已实现的功能

- **翻译键类型安全**：只能使用实际存在于翻译文件中的键
- **自动补全**：IDE 提供完整的翻译键自动补全
- **编译时检查**：TypeScript 会在编译时检查翻译键是否存在
- **命名空间支持**：支持带命名空间前缀的翻译键
- **参数化翻译**：支持带参数的翻译键类型检查
- **自动类型生成**：从翻译 JSON 文件自动生成 TypeScript 类型

### 🔧 技术架构

```
翻译文件 (JSON) → 类型生成脚本 → TypeScript 类型 → 强类型 Hook
```

## 📚 使用方法

### 1. 基础用法

```tsx
import { useTranslation } from '@renderer/i18n/hooks'

function MyComponent() {
  const { t } = useTranslation('settings')
  
  // ✅ 类型安全 - 会有自动补全
  const title = t('appearance.customTheme.title')
  
  // ✅ 支持参数
  const status = t('appearance.customTheme.currentStatus', { count: 5 })
  
  // ❌ TypeScript 错误 - 键不存在
  // const invalid = t('nonexistent.key')
  
  return <div>{title}</div>
}
```

### 2. 命名空间用法

```tsx
// 使用特定命名空间
const { t } = useTranslation('settings')
const text1 = t('appearance.title')

// 使用带命名空间前缀的键
const { t } = useTranslation()
const text2 = t('settings:appearance.title')
```

### 3. 参数化翻译

```tsx
// 翻译文件中：
// "currentStatus": "当前使用自定义主题 ({{count}} 个可用)"

const { t } = useTranslation('settings')
const message = t('appearance.customTheme.currentStatus', { 
  count: themeCount 
})
```

## 🛠️ 开发工作流

### 1. 添加新翻译

1. 在翻译文件中添加新的键值对：
```json
// packages/desktop/src/renderer/src/i18n/locales/zh-CN/settings.json
{
  "newFeature": {
    "title": "新功能",
    "description": "这是一个新功能"
  }
}
```

2. 运行类型生成脚本：
```bash
pnpm i18n:types
```

3. 在代码中使用新的翻译键：
```tsx
const title = t('newFeature.title') // 现在有类型安全和自动补全
```

### 2. 重构翻译键

1. 修改翻译文件中的键名
2. 运行 `pnpm i18n:types` 重新生成类型
3. TypeScript 会显示所有需要更新的地方
4. 逐一修复类型错误

## 📁 文件结构

```
packages/desktop/
├── scripts/
│   └── generate-i18n-types.ts          # 类型生成脚本
├── src/renderer/src/i18n/
│   ├── types.ts                        # 自动生成的类型定义
│   ├── hooks/
│   │   ├── useTypedTranslation.ts      # 强类型翻译 Hook
│   │   └── index.ts                    # Hook 导出
│   └── locales/
│       ├── zh-CN/                      # 中文翻译文件
│       └── en-US/                      # 英文翻译文件
└── package.json                        # 包含 i18n:types 脚本
```

## 🔧 配置说明

### package.json 脚本

```json
{
  "scripts": {
    "i18n:types": "tsx scripts/generate-i18n-types.ts"
  }
}
```

### 类型生成脚本

脚本会：
1. 扫描 `zh-CN` 目录下的所有 JSON 文件
2. 递归提取所有嵌套键路径
3. 生成 TypeScript 类型定义
4. 支持命名空间和联合类型

## 💡 最佳实践

### 1. 翻译键命名

```json
{
  "feature": {
    "title": "功能标题",
    "description": "功能描述",
    "actions": {
      "save": "保存",
      "cancel": "取消"
    },
    "errors": {
      "required": "此字段为必填项",
      "invalid": "输入无效"
    }
  }
}
```

### 2. 参数化翻译

```json
{
  "messages": {
    "itemCount": "共 {{count}} 个项目",
    "userGreeting": "你好，{{name}}！",
    "progress": "进度：{{current}}/{{total}}"
  }
}
```

### 3. 错误处理

```tsx
// 对于动态键，使用类型断言
const dynamicKey = `descriptions.${category}` as any
const description = t(dynamicKey)

// 或者创建专门的函数
function getDescription(category: string) {
  const key = `descriptions.${category}` as TranslationKeys
  return t(key)
}
```

## 🚀 高级功能

### 1. 自定义翻译函数

```tsx
import type { TranslationKeys, TranslationOptions } from '@renderer/i18n/types'

function createTypedTranslator(namespace: string) {
  const { t } = useTranslation(namespace)
  
  return function typedT(key: TranslationKeys, options?: TranslationOptions) {
    return t(key, options)
  }
}
```

### 2. 翻译键验证

```tsx
import type { TranslationKeys } from '@renderer/i18n/types'

function isValidTranslationKey(key: string): key is TranslationKeys {
  // 运行时验证逻辑
  return true // 简化示例
}
```

## 🔄 自动化工作流

### 1. 开发时自动生成

可以设置文件监听，当翻译文件变化时自动重新生成类型：

```bash
# 监听翻译文件变化
npx chokidar "src/renderer/src/i18n/locales/**/*.json" -c "pnpm i18n:types"
```

### 2. CI/CD 集成

在构建流程中添加类型检查：

```yaml
# .github/workflows/build.yml
- name: Generate i18n types
  run: pnpm i18n:types

- name: Type check
  run: pnpm typecheck
```

## 🎉 总结

通过这套强类型翻译系统，我们实现了：

- **开发体验提升**：自动补全和错误检查
- **代码质量保证**：编译时发现翻译键错误
- **重构安全性**：修改翻译键时自动发现所有引用
- **团队协作效率**：统一的翻译键管理和使用方式

这个系统确保了翻译的类型安全，大大减少了运行时错误，提高了开发效率和代码质量。

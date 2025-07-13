#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'

// 递归获取嵌套对象的所有键路径
function getNestedKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // 递归处理嵌套对象
        keys.push(...getNestedKeys(obj[key], fullKey))
      } else {
        // 叶子节点，添加到键列表
        keys.push(fullKey)
      }
    }
  }

  return keys
}

// 生成命名空间类型
function generateNamespaceTypes(localesDir: string): string {
  const namespacesDir = path.join(localesDir, 'zh-CN')
  const namespaceFiles = fs.readdirSync(namespacesDir).filter((file) => file.endsWith('.json'))

  let typeDefinitions = ''
  const allNamespaces: string[] = []
  const allKeys: { [namespace: string]: string[] } = {}

  // 处理每个命名空间文件
  for (const file of namespaceFiles) {
    const namespace = path.basename(file, '.json')
    const filePath = path.join(namespacesDir, file)
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    allNamespaces.push(namespace)
    allKeys[namespace] = getNestedKeys(content)

    // 生成单个命名空间的键类型
    const keys = allKeys[namespace].map((key) => `  | '${key}'`).join('\n')

    typeDefinitions += `
// ${namespace} 命名空间的翻译键
export type ${namespace.charAt(0).toUpperCase() + namespace.slice(1)}Keys =
${keys}

`
  }

  // 生成联合类型
  const namespaceUnion = allNamespaces.map((ns) => `'${ns}'`).join(' | ')

  // 生成带命名空间前缀的键类型
  let namespacedKeys = ''
  for (const namespace of allNamespaces) {
    const keys = allKeys[namespace].map((key) => `  | '${namespace}:${key}'`).join('\n')
    namespacedKeys += keys + '\n'
  }

  // 生成不带命名空间前缀的键类型（用于默认命名空间）
  let defaultKeys = ''
  for (const namespace of allNamespaces) {
    const keys = allKeys[namespace].map((key) => `  | '${key}'`).join('\n')
    defaultKeys += keys + '\n'
  }

  // 生成命名空间键映射
  const namespaceKeysMapping = allNamespaces
    .map((ns) => `  '${ns}': ${ns.charAt(0).toUpperCase() + ns.slice(1)}Keys`)
    .join('\n')

  typeDefinitions += `
// 所有可用的命名空间
export type AvailableNamespaces = ${namespaceUnion}

// 带命名空间前缀的翻译键
export type NamespacedTranslationKeys =
${namespacedKeys}

// 不带命名空间前缀的翻译键（用于默认命名空间）
export type DefaultTranslationKeys =
${defaultKeys}

// 所有翻译键的联合类型
export type TranslationKeys = NamespacedTranslationKeys | DefaultTranslationKeys

// 翻译函数的选项类型
export interface TranslationOptions {
  [key: string]: string | number | boolean | null | undefined
}

// 命名空间键映射类型
export type NamespaceKeys = {
${namespaceKeysMapping}
}

// 强类型的翻译函数签名（泛型版本）
export interface TypedTranslationFunction<T extends AvailableNamespaces | undefined = undefined> {
  (key: T extends AvailableNamespaces ? NamespaceKeys[T] : TranslationKeys, options?: TranslationOptions): string
  (key: T extends AvailableNamespaces ? NamespaceKeys[T] : TranslationKeys, defaultValue?: string, options?: TranslationOptions): string
}

// 通用翻译函数签名
export interface GeneralTranslationFunction {
  (key: TranslationKeys, options?: TranslationOptions): string
  (key: TranslationKeys, defaultValue?: string, options?: TranslationOptions): string
}

// 支持的语言类型
export type SupportedLanguage = 'zh-CN' | 'en-US'

// 语言配置接口
export interface LanguageConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
}

// 语言管理 Hook 返回类型
export interface UseLanguageReturn {
  currentLanguage: SupportedLanguage
  availableLanguages: LanguageConfig[]
  isChanging: boolean
  changeLanguage: (language: SupportedLanguage) => Promise<void>
  getLanguageName: (language: SupportedLanguage) => string
  getNativeLanguageName: (language: SupportedLanguage) => string
}

// 支持的语言列表
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳'
  },
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    flag: '🇺🇸'
  }
]
`

  return typeDefinitions
}

// 主函数
function main() {
  const localesDir = path.join(__dirname, '../src/renderer/src/i18n/locales')
  const outputPath = path.join(__dirname, '../src/renderer/src/i18n/types.ts')

  console.log('🔄 正在生成 i18n 类型定义...')

  try {
    const typeDefinitions = generateNamespaceTypes(localesDir)

    const fileHeader = `// 🤖 此文件由脚本自动生成，请勿手动修改
// 生成时间: ${new Date().toISOString()}
// 生成脚本: scripts/generate-i18n-types.ts

`

    const fullContent = fileHeader + typeDefinitions

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(outputPath, fullContent, 'utf-8')

    console.log('✅ i18n 类型定义生成成功!')
    console.log(`📁 输出路径: ${outputPath}`)
  } catch (error) {
    console.error('❌ 生成 i18n 类型定义失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

export { generateNamespaceTypes, getNestedKeys }

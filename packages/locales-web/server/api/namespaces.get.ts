import { readdir, stat } from 'fs/promises'
import { join, resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // 获取项目根目录下的 locales 文件夹路径
    // 从 packages/locales-web 向上两级到达项目根目录
    const projectRoot = resolve(process.cwd(), '../../')
    const localesPath = join(projectRoot, 'locales')

    console.log('Reading locales from:', localesPath)

    // 读取 locales 目录
    const entries = await readdir(localesPath)

    // 过滤出目录（命名空间）
    const namespaces = []

    for (const entry of entries) {
      const entryPath = join(localesPath, entry)
      const stats = await stat(entryPath)

      if (stats.isDirectory()) {
        // 读取该命名空间下的语言文件
        const files = await readdir(entryPath)
        const languages = files
          .filter((file) => file.endsWith('.json'))
          .map((file) => file.replace('.json', ''))

        // 计算翻译键的数量和进度
        let count = 0
        let progress = 0
        try {
          const zhFile = join(entryPath, 'zh-CN.json')
          const { readFile } = await import('fs/promises')
          const content = await readFile(zhFile, 'utf-8')
          const data = JSON.parse(content)
          count = countKeys(data)

          // 计算翻译进度（采用更简单的方式）
          progress = await calculateSimpleTranslationProgress(entryPath, languages, count)
        } catch (err) {
          console.warn(`Failed to count keys for ${entry}:`, err)
        }

        namespaces.push({
          name: entry,
          label: getNamespaceLabel(entry),
          count,
          progress,
          languages
        })
      }
    }

    return {
      success: true,
      data: {
        namespaces: namespaces.sort((a, b) => a.name.localeCompare(b.name))
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to read namespaces:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to read namespaces: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})

// 递归计算对象中的键数量（与用户脚本保持一致）
function countKeys(obj: any): number {
  if (typeof obj !== 'object' || obj === null) {
    return 0
  }
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key]
    if (typeof value === 'object' && value !== null) {
      return acc + countKeys(value)
    }
    return acc + 1
  }, 0)
}

// 这些函数已被新的算法替代，不再需要

// 翻译进度计算（与前端 Pinia store 算法完全一致）
async function calculateSimpleTranslationProgress(
  namespacePath: string,
  languages: string[],
  baseKeyCount: number
): Promise<number> {
  // 排除基准语言，只计算需要翻译的语言
  const nonBaseLanguages = languages.filter((lang) => lang !== 'zh-CN')

  if (nonBaseLanguages.length === 0 || baseKeyCount === 0) {
    return 100 // 如果没有需要翻译的语言，则认为100%完成
  }

  // 读取所有语言文件
  const translationData: Record<string, any> = {}

  try {
    const { readFile } = await import('fs/promises')

    // 读取基准语言文件
    const baseFile = join(namespacePath, 'zh-CN.json')
    const baseContent = await readFile(baseFile, 'utf-8')
    translationData['zh-CN'] = JSON.parse(baseContent)

    // 读取其他语言文件
    for (const lang of nonBaseLanguages) {
      try {
        const langFile = join(namespacePath, `${lang}.json`)
        const content = await readFile(langFile, 'utf-8')
        translationData[lang] = JSON.parse(content)
      } catch (err) {
        console.warn(`Failed to read ${lang} file:`, err)
        translationData[lang] = {}
      }
    }
  } catch (err) {
    console.warn('Failed to read translation files:', err)
    return 0
  }

  // 收集所有的翻译键（与前端逻辑一致）
  const allKeys = new Set<string>()
  Object.values(translationData).forEach((data) => {
    collectKeys(data, '', allKeys)
  })

  // 创建翻译条目（模拟前端的 translationEntries）
  const translationEntries = Array.from(allKeys).map((key) => {
    const values: Record<string, any> = {}

    // 为每种语言获取值
    for (const lang of ['zh-CN', ...nonBaseLanguages]) {
      values[lang] = getValueByPath(translationData[lang] || {}, key) || ''
    }

    return { key, values }
  })

  // 使用与前端完全相同的算法计算进度
  const total = translationEntries.length * nonBaseLanguages.length
  const completed = translationEntries.reduce((count, entry) => {
    return (
      count +
      nonBaseLanguages.filter((lang) => {
        const value = entry.values[lang]
        if (!value) return false

        // 处理字符串类型
        if (typeof value === 'string') {
          return value.trim() !== ''
        }

        // 处理数组类型
        if (Array.isArray(value)) {
          return value.length > 0 && value.some((item) => item && item.trim && item.trim() !== '')
        }

        // 处理对象类型
        if (typeof value === 'object') {
          return Object.keys(value).length > 0
        }

        return false
      }).length
    )
  }, 0)

  return total > 0 ? Math.round((completed / total) * 100) : 0
}

// 递归收集所有键路径（与前端逻辑一致）
function collectKeys(obj: any, prefix: string, keys: Set<string>) {
  Object.keys(obj).forEach((key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (Array.isArray(obj[key])) {
      // 数组作为一个整体键，不递归进入
      keys.add(fullKey)
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      collectKeys(obj[key], fullKey, keys)
    } else {
      keys.add(fullKey)
    }
  })
}

// 根据路径获取值（与前端逻辑一致）
function getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : ''
  }, obj)
}

// 获取命名空间的显示标签
function getNamespaceLabel(namespace: string): string {
  const labels: Record<string, string> = {
    common: '通用',
    navigation: '导航',
    files: '文件管理',
    settings: '设置',
    dashboard: '仪表板',
    competitions: '赛事中心',
    expenses: '经费报销',
    projects: '项目'
  }

  return labels[namespace] || namespace
}

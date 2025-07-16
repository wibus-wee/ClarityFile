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

// 检查值是否已翻译的辅助函数
function isValueTranslated(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) {
    return value.length > 0 && value.some((item) =>
      item && typeof item === 'string' && item.trim() !== ''
    )
  }
  if (typeof value === 'object') return Object.keys(value).length > 0
  return false
}

// 递归计算已翻译的键数量
function countTranslatedKeys(obj: any, baseObj: any, prefix: string = ''): number {
  if (typeof baseObj !== 'object' || baseObj === null) return 0

  let translatedCount = 0

  for (const key of Object.keys(baseObj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const baseValue = baseObj[key]
    const translatedValue = obj && obj[key]

    if (typeof baseValue === 'object' && baseValue !== null && !Array.isArray(baseValue)) {
      // 递归处理嵌套对象
      translatedCount += countTranslatedKeys(translatedValue, baseValue, fullKey)
    } else {
      // 检查叶子节点是否已翻译
      if (isValueTranslated(translatedValue)) {
        translatedCount++
      }
    }
  }

  return translatedCount
}

// 翻译进度计算（检查实际翻译内容）
async function calculateSimpleTranslationProgress(
  namespacePath: string,
  languages: string[],
  baseKeyCount: number
): Promise<number> {
  if (languages.length <= 1 || baseKeyCount === 0) return 100

  const nonBaseLanguages = languages.filter((lang) => lang !== 'zh-CN')
  if (nonBaseLanguages.length === 0) return 100

  // 读取基准语言文件作为参考
  let baseData: any = {}
  try {
    const { readFile } = await import('fs/promises')
    const baseFile = join(namespacePath, 'zh-CN.json')
    const baseContent = await readFile(baseFile, 'utf-8')
    baseData = JSON.parse(baseContent)
  } catch (err) {
    console.warn('Failed to read base language file:', err)
    return 0
  }

  let totalCompleteness = 0

  for (const lang of nonBaseLanguages) {
    try {
      const { readFile } = await import('fs/promises')
      const langFile = join(namespacePath, `${lang}.json`)
      const content = await readFile(langFile, 'utf-8')
      const langData = JSON.parse(content)

      // 计算实际已翻译的键数量
      const translatedKeyCount = countTranslatedKeys(langData, baseData)
      const completeness = Math.min(100, Math.round((translatedKeyCount / baseKeyCount) * 100))
      totalCompleteness += completeness
    } catch (err) {
      // 如果语言文件不存在，该语言的完成度为0
      console.warn(`Failed to read ${lang} file for progress calculation:`, err)
      totalCompleteness += 0
    }
  }

  return Math.round(totalCompleteness / nonBaseLanguages.length)
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

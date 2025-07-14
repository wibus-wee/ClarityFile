import { readdir, stat } from 'fs/promises'
import { join, resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // 获取项目根目录下的 locales 文件夹路径
    const projectRoot = resolve(process.cwd())
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

          // 计算翻译进度
          progress = await calculateTranslationProgress(entryPath, languages, data)
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
      namespaces: namespaces.sort((a, b) => a.name.localeCompare(b.name))
    }
  } catch (error) {
    console.error('Failed to read namespaces:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read namespaces'
    })
  }
})

// 递归计算对象中的键数量
function countKeys(obj: any): number {
  let count = 0

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count += countKeys(obj[key])
    } else {
      count++
    }
  }

  return count
}

// 计算翻译进度
async function calculateTranslationProgress(
  namespacePath: string,
  languages: string[],
  baseData: any
): Promise<number> {
  if (languages.length <= 1) return 100 // 只有基准语言时，进度为100%

  const totalKeys = countKeys(baseData)
  if (totalKeys === 0) return 100

  let totalTranslated = 0
  const nonBaseLanguages = languages.filter((lang) => lang !== 'zh-CN')

  for (const lang of nonBaseLanguages) {
    try {
      const { readFile } = await import('fs/promises')
      const langFile = join(namespacePath, `${lang}.json`)
      const content = await readFile(langFile, 'utf-8')
      const langData = JSON.parse(content)

      const translatedKeys = countTranslatedKeys(baseData, langData)
      totalTranslated += translatedKeys
    } catch (err) {
      // 如果语言文件不存在，该语言的翻译数为0
      console.warn(`Failed to read ${lang} file for progress calculation:`, err)
    }
  }

  const maxPossibleTranslations = totalKeys * nonBaseLanguages.length
  return maxPossibleTranslations > 0
    ? Math.round((totalTranslated / maxPossibleTranslations) * 100)
    : 100
}

// 递归计算已翻译的键数量
function countTranslatedKeys(baseObj: any, translatedObj: any, path = ''): number {
  let count = 0

  for (const key in baseObj) {
    const currentPath = path ? `${path}.${key}` : key

    if (typeof baseObj[key] === 'object' && baseObj[key] !== null && !Array.isArray(baseObj[key])) {
      // 嵌套对象
      if (translatedObj && typeof translatedObj[key] === 'object' && translatedObj[key] !== null) {
        count += countTranslatedKeys(baseObj[key], translatedObj[key], currentPath)
      }
    } else {
      // 叶子节点
      if (translatedObj && translatedObj[key] !== undefined && translatedObj[key] !== null) {
        if (Array.isArray(translatedObj[key])) {
          // 数组类型：检查是否有内容
          count += translatedObj[key].length > 0 ? 1 : 0
        } else if (typeof translatedObj[key] === 'string') {
          // 字符串类型：检查是否非空
          count += translatedObj[key].trim() !== '' ? 1 : 0
        } else {
          // 其他类型：只要存在就算翻译了
          count += 1
        }
      }
    }
  }

  return count
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

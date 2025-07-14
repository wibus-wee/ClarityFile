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

// 简单的翻译进度计算（与用户脚本逻辑一致）
async function calculateSimpleTranslationProgress(
  namespacePath: string,
  languages: string[],
  baseKeyCount: number
): Promise<number> {
  if (languages.length <= 1 || baseKeyCount === 0) return 100

  const nonBaseLanguages = languages.filter((lang) => lang !== 'zh-CN')
  if (nonBaseLanguages.length === 0) return 100

  let totalCompleteness = 0

  for (const lang of nonBaseLanguages) {
    try {
      const { readFile } = await import('fs/promises')
      const langFile = join(namespacePath, `${lang}.json`)
      const content = await readFile(langFile, 'utf-8')
      const langData = JSON.parse(content)

      const langKeyCount = countKeys(langData)
      const completeness = Math.min(100, Math.round((langKeyCount / baseKeyCount) * 100))
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

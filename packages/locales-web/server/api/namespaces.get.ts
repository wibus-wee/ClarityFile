import { readdir, stat } from 'fs/promises'
import { join, resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // 获取项目根目录下的 locales 文件夹路径
    const projectRoot = resolve(process.cwd(), '../..')
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
          .filter(file => file.endsWith('.json'))
          .map(file => file.replace('.json', ''))
        
        // 计算翻译键的数量（从 zh-CN.json 文件中）
        let count = 0
        try {
          const zhFile = join(entryPath, 'zh-CN.json')
          const { readFile } = await import('fs/promises')
          const content = await readFile(zhFile, 'utf-8')
          const data = JSON.parse(content)
          count = countKeys(data)
        } catch (err) {
          console.warn(`Failed to count keys for ${entry}:`, err)
        }
        
        namespaces.push({
          name: entry,
          label: getNamespaceLabel(entry),
          count,
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
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key])
    } else {
      count++
    }
  }
  
  return count
}

// 获取命名空间的显示标签
function getNamespaceLabel(namespace: string): string {
  const labels: Record<string, string> = {
    'common': '通用',
    'navigation': '导航',
    'files': '文件管理',
    'settings': '设置',
    'dashboard': '仪表板',
    'competitions': '赛事中心',
    'expenses': '经费报销',
    'projects': '项目'
  }
  
  return labels[namespace] || namespace
}

import { readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { existsSync } from 'node:fs'

export default defineEventHandler(async (event) => {
  try {
    // 获取项目根目录下的 locales 文件夹路径
    const projectRoot = resolve(process.cwd(), '../..')
    const localesPath = join(projectRoot, 'locales')

    console.log('Getting available languages from:', localesPath)

    if (!existsSync(localesPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Locales directory not found'
      })
    }

    // 读取所有命名空间
    const namespaces = await readdir(localesPath)
    const languageSet = new Set<string>()

    // 从每个命名空间收集语言文件
    for (const namespace of namespaces) {
      const namespacePath = join(localesPath, namespace)
      
      if (existsSync(namespacePath)) {
        const stat = await import('node:fs').then(fs => fs.promises.stat(namespacePath))
        if (stat.isDirectory()) {
          const files = await readdir(namespacePath)
          
          // 收集所有 .json 文件的语言代码
          files
            .filter(file => file.endsWith('.json'))
            .forEach(file => {
              const languageCode = file.replace('.json', '')
              languageSet.add(languageCode)
            })
        }
      }
    }

    // 转换为数组并排序，确保基准语言在前
    const languages = Array.from(languageSet).sort((a, b) => {
      if (a === 'zh-CN') return -1
      if (b === 'zh-CN') return 1
      return a.localeCompare(b)
    })

    // 构建语言对象数组
    const languageObjects = languages.map(code => ({
      code,
      name: code, // 使用代码作为显示名称
      isBase: code === 'zh-CN'
    }))

    return {
      success: true,
      languages: languageObjects,
      count: languages.length
    }

  } catch (error) {
    console.error('Error getting languages:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get languages: ${error.message}`
    })
  }
})

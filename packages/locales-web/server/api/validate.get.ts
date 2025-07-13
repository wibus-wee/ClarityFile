import { readdir, readFile } from 'fs/promises'
import { join, resolve } from 'path'

interface ValidationResult {
  namespace: string
  language: string
  missingKeys: string[]
  extraKeys: string[]
}

export default defineEventHandler(async (event) => {
  try {
    // 获取项目根目录下的 locales 文件夹路径
    const projectRoot = resolve(process.cwd(), '../..')
    const localesPath = join(projectRoot, 'locales')
    
    console.log('Validating translations in:', localesPath)
    
    // 读取所有命名空间
    const namespaces = await readdir(localesPath)
    const results: ValidationResult[] = []
    const baseLanguage = 'zh-CN' // 以中文为基准语言
    
    for (const namespace of namespaces) {
      const namespacePath = join(localesPath, namespace)
      
      try {
        // 读取该命名空间下的所有语言文件
        const files = await readdir(namespacePath)
        const languageFiles = files.filter(file => file.endsWith('.json'))
        
        // 读取基准语言文件
        const baseFile = `${baseLanguage}.json`
        if (!languageFiles.includes(baseFile)) {
          continue // 跳过没有基准语言文件的命名空间
        }
        
        const baseFilePath = join(namespacePath, baseFile)
        const baseContent = await readFile(baseFilePath, 'utf-8')
        const baseData = JSON.parse(baseContent)
        const baseKeys = new Set(getAllKeys(baseData))
        
        // 验证其他语言文件
        for (const file of languageFiles) {
          if (file === baseFile) continue
          
          const language = file.replace('.json', '')
          const filePath = join(namespacePath, file)
          
          try {
            const content = await readFile(filePath, 'utf-8')
            const data = JSON.parse(content)
            const keys = new Set(getAllKeys(data))
            
            // 找出缺失和多余的键
            const missingKeys = Array.from(baseKeys).filter(key => !keys.has(key))
            const extraKeys = Array.from(keys).filter(key => !baseKeys.has(key))
            
            if (missingKeys.length > 0 || extraKeys.length > 0) {
              results.push({
                namespace,
                language,
                missingKeys,
                extraKeys
              })
            }
          } catch (err) {
            console.warn(`Failed to validate ${namespace}/${file}:`, err)
          }
        }
      } catch (err) {
        console.warn(`Failed to process namespace ${namespace}:`, err)
      }
    }
    
    // 计算总体统计
    const totalIssues = results.reduce((sum, result) => 
      sum + result.missingKeys.length + result.extraKeys.length, 0
    )
    
    return {
      isValid: totalIssues === 0,
      totalIssues,
      results,
      summary: {
        namespacesChecked: namespaces.length,
        issuesFound: results.length,
        totalMissingKeys: results.reduce((sum, r) => sum + r.missingKeys.length, 0),
        totalExtraKeys: results.reduce((sum, r) => sum + r.extraKeys.length, 0)
      }
    }
  } catch (error) {
    console.error('Failed to validate translations:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to validate translations'
    })
  }
})

// 递归获取对象中的所有键路径
function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  
  return keys
}

import { readdir, writeFile, mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { existsSync } from 'node:fs'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { languageCode } = body

    if (!languageCode || typeof languageCode !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Language code is required'
      })
    }

    // 验证语言代码格式 (BCP 47)
    if (!languageCode.includes('-')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Please provide a valid BCP 47 language code (e.g., fr-FR)'
      })
    }

    // 获取项目根目录下的 locales 文件夹路径
    const projectRoot = resolve(process.cwd(), '../..')
    const localesPath = join(projectRoot, 'locales')

    console.log('Adding language:', languageCode)
    console.log('Locales path:', localesPath)

    // 读取所有命名空间
    const namespaces = await readdir(localesPath)
    const namespaceDirs = []

    for (const namespace of namespaces) {
      const namespacePath = join(localesPath, namespace)
      if (existsSync(namespacePath)) {
        const stat = await import('node:fs').then(fs => fs.promises.stat(namespacePath))
        if (stat.isDirectory()) {
          namespaceDirs.push(namespace)
        }
      }
    }

    let filesCreated = 0

    // 在每个命名空间下创建空的 .json 文件
    for (const namespace of namespaceDirs) {
      const filePath = join(localesPath, namespace, `${languageCode}.json`)
      
      if (!existsSync(filePath)) {
        await writeFile(filePath, '{}\\n', 'utf-8')
        console.log(`Created: ${filePath}`)
        filesCreated++
      } else {
        console.log(`Already exists: ${filePath}`)
      }
    }

    return {
      success: true,
      data: {
        filesCreated,
        namespaces: namespaceDirs,
        languageCode
      },
      message: `Successfully created ${filesCreated} files for language ${languageCode}`,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error adding language:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to add language: ${error instanceof Error ? error.message : String(error)}`
    })
  }
})

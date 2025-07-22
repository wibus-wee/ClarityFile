import { readFile } from 'fs/promises'
import { join, resolve } from 'path'

export default defineEventHandler(async (event) => {
  const namespace = getRouterParam(event, 'namespace')
  const language = getRouterParam(event, 'language')

  if (!namespace || !language) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Namespace and language are required'
    })
  }

  try {
    // 获取项目根目录下的 locales 文件夹路径
    const projectRoot = resolve(process.cwd(), '../..')
    const filePath = join(projectRoot, 'locales', namespace, `${language}.json`)

    console.log('Reading translation file:', filePath)

    // 读取文件内容
    const content = await readFile(filePath, 'utf-8')
    const data = JSON.parse(content)

    return {
      success: true,
      data: {
        namespace,
        language,
        content: data
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error(`Failed to read ${namespace}/${language}:`, error)

    if ((error as any).code === 'ENOENT') {
      throw createError({
        statusCode: 404,
        statusMessage: `Translation file ${namespace}/${language}.json not found`
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read translation file'
    })
  }
})

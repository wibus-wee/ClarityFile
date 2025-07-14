import { writeFile, mkdir } from 'fs/promises'
import { join, resolve, dirname } from 'path'

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
    const body = await readBody(event)
    
    if (!body || !body.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Translation data is required'
      })
    }
    
    // 获取项目根目录下的 locales 文件夹路径
    const projectRoot = resolve(process.cwd(), '../..')
    const filePath = join(projectRoot, 'locales', namespace, `${language}.json`)
    
    console.log('Writing translation file:', filePath)
    
    // 确保目录存在
    await mkdir(dirname(filePath), { recursive: true })
    
    // 格式化 JSON 并写入文件
    const formattedJson = JSON.stringify(body.data, null, 2)
    await writeFile(filePath, formattedJson, 'utf-8')
    
    return {
      success: true,
      data: {
        namespace,
        language,
        filePath: filePath.replace(projectRoot, '').replace(/\\/g, '/')
      },
      message: 'Translation file saved successfully',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error(`Failed to write ${namespace}/${language}:`, error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save translation file'
    })
  }
})

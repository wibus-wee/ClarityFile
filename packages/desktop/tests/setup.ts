import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'

// 测试数据库路径
export const TEST_DB_PATH = path.join(os.tmpdir(), 'clarityfile-test.db')

// 测试文件根目录
export const TEST_FILES_ROOT = path.join(os.tmpdir(), 'clarityfile-test-files')

/**
 * 全局测试设置
 */
beforeAll(async () => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test'
  process.env.CLARITY_FILE_ROOT = TEST_FILES_ROOT
  process.env.DATABASE_PATH = TEST_DB_PATH

  // 创建测试文件目录
  if (!fs.existsSync(TEST_FILES_ROOT)) {
    fs.mkdirSync(TEST_FILES_ROOT, { recursive: true })
  }
})

/**
 * 全局测试清理
 */
afterAll(async () => {
  // 清理测试数据库
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH)
  }

  // 清理测试文件目录
  if (fs.existsSync(TEST_FILES_ROOT)) {
    fs.rmSync(TEST_FILES_ROOT, { recursive: true, force: true })
  }
})

/**
 * 每个测试前的设置
 */
beforeEach(async () => {
  // 确保测试文件目录存在
  if (!fs.existsSync(TEST_FILES_ROOT)) {
    fs.mkdirSync(TEST_FILES_ROOT, { recursive: true })
  }
})

/**
 * 每个测试后的清理
 */
afterEach(async () => {
  // 清理测试文件目录中的文件（保留目录结构）
  const cleanDirectory = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) return

    const files = fs.readdirSync(dirPath)
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        cleanDirectory(filePath)
        // 如果目录为空，删除它
        if (fs.readdirSync(filePath).length === 0) {
          fs.rmdirSync(filePath)
        }
      } else {
        fs.unlinkSync(filePath)
      }
    }
  }

  cleanDirectory(TEST_FILES_ROOT)
})

/**
 * 创建测试文件的辅助函数
 */
export function createTestFile(relativePath: string, content: string = 'test content'): string {
  const fullPath = path.join(TEST_FILES_ROOT, relativePath)
  const dir = path.dirname(fullPath)

  // 确保目录存在
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // 创建文件
  fs.writeFileSync(fullPath, content)

  return fullPath
}

/**
 * 创建测试目录的辅助函数
 */
export function createTestDirectory(relativePath: string): string {
  const fullPath = path.join(TEST_FILES_ROOT, relativePath)

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }

  return fullPath
}

/**
 * 检查文件是否存在的辅助函数
 */
export function testFileExists(relativePath: string): boolean {
  const fullPath = path.join(TEST_FILES_ROOT, relativePath)
  return fs.existsSync(fullPath)
}

/**
 * 获取测试文件内容的辅助函数
 */
export function getTestFileContent(relativePath: string): string {
  const fullPath = path.join(TEST_FILES_ROOT, relativePath)
  return fs.readFileSync(fullPath, 'utf-8')
}

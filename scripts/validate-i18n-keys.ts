#!/usr/bin/env tsx
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCALES_DIR = path.resolve(__dirname, '../packages/desktop/src/renderer/src/i18n/locales')
const BASE_LANGUAGE = 'zh-CN'

let errorCount = 0

/**
 * 获取所有命名空间
 */
function getNamespaces(localesDir: string): string[] {
  return fs
    .readdirSync(localesDir)
    .filter((dir) => fs.statSync(path.join(localesDir, dir)).isDirectory())
}

/**
 * 检查单个文件中的键是否冲突 (e.g., 'user' 和 'user.name')
 */
function validateKeyStructure(json: any, filePath: string) {
  const keys = Object.keys(json)
  const keyPrefixes = new Set<string>()

  for (const key of keys) {
    if (key.includes('.')) {
      const parts = key.split('.')
      for (let i = 1; i < parts.length; i++) {
        const prefix = parts.slice(0, i).join('.')
        if (keys.includes(prefix)) {
          console.error(
            `${chalk.red('  [错误]')} 在 ${chalk.yellow(filePath)}: 键 '${chalk.cyan(
              key
            )}' 与其父键 '${chalk.cyan(prefix)}' 冲突。`
          )
          errorCount++
        }
        keyPrefixes.add(prefix)
      }
    }
  }
}

/**
 * 检查翻译文件是否包含基准语言中不存在的多余键
 */
function validateExtraKeys(
  baseJson: any,
  targetJson: any,
  baseFilePath: string,
  targetFilePath: string
) {
  const baseKeys = new Set(Object.keys(baseJson))
  const targetKeys = Object.keys(targetJson)

  for (const key of targetKeys) {
    if (!baseKeys.has(key)) {
      console.error(
        `${chalk.red('  [错误]')} 在 ${chalk.yellow(targetFilePath)}: 发现多余的键 '${chalk.cyan(
          key
        )}' (在 ${chalk.yellow(baseFilePath)} 中不存在)。`
      )
      errorCount++
    }
  }
}

/**
 * 主函数
 */
function main() {
  console.log(chalk.cyan('🔍 开始校验 i18n 翻译文件...'))
  console.log(chalk.gray(`基准语言: ${BASE_LANGUAGE}`))
  console.log(chalk.gray(`翻译文件目录: ${LOCALES_DIR}\n`))

  const namespaces = getNamespaces(LOCALES_DIR)

  for (const ns of namespaces) {
    const nsDir = path.join(LOCALES_DIR, ns)
    const files = fs.readdirSync(nsDir).filter((f) => f.endsWith('.json'))
    const baseFilePath = path.join(nsDir, `${BASE_LANGUAGE}.json`)

    if (!fs.existsSync(baseFilePath)) {
      console.warn(
        `${chalk.yellow('  [警告]')} 在命名空间 '${ns}' 中未找到基准语言文件: ${baseFilePath}`
      )
      continue
    }

    const baseJson = JSON.parse(fs.readFileSync(baseFilePath, 'utf-8'))
    validateKeyStructure(baseJson, path.relative(process.cwd(), baseFilePath))

    for (const file of files) {
      const lang = path.basename(file, '.json')
      if (lang === BASE_LANGUAGE) continue

      const targetFilePath = path.join(nsDir, file)
      const targetJson = JSON.parse(fs.readFileSync(targetFilePath, 'utf-8'))

      validateKeyStructure(targetJson, path.relative(process.cwd(), targetFilePath))
      validateExtraKeys(
        baseJson,
        targetJson,
        path.relative(process.cwd(), baseFilePath),
        path.relative(process.cwd(), targetFilePath)
      )
    }
  }

  if (errorCount > 0) {
    console.log(chalk.red(`\n❌ 校验失败，共发现 ${errorCount} 个错误。`))
    process.exit(1)
  } else {
    console.log(chalk.green('\n✅ 所有翻译文件均通过校验！'))
  }
}

main()

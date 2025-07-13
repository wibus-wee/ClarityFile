#!/usr/bin/env tsx
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import prompts from 'prompts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCALES_DIR = path.resolve(__dirname, '../locales')
const CONSTANTS_FILE = path.resolve(
  __dirname,
  '../packages/desktop/src/renderer/src/i18n/constants.ts'
)

/**
 * 获取所有命名空间目录
 */
function getNamespaces(localesDir: string): string[] {
  return fs
    .readdirSync(localesDir)
    .filter((dir) => fs.statSync(path.join(localesDir, dir)).isDirectory())
}

/**
 * 主函数
 */
async function main() {
  console.log(chalk.cyan('🚀 欢迎使用新语言添加工具！'))

  const { newLocale } = await prompts({
    type: 'text',
    name: 'newLocale',
    message: `请输入新的语言代码 (例如 'fr-FR', 'ja-JP'):`,
    validate: (value) => (value.includes('-') ? true : '请输入有效的 BCP 47 语言代码 (例如 fr-FR)')
  })

  if (!newLocale) {
    console.log(chalk.yellow('操作已取消。'))
    return
  }

  const namespaces = getNamespaces(LOCALES_DIR)

  // 1. 在每个命名空间下创建空的 .json 文件
  console.log(
    chalk.blue(`
1. 正在为语言 '${newLocale}' 创建 .json 文件...`)
  )
  let filesCreated = 0
  for (const ns of namespaces) {
    const filePath = path.join(LOCALES_DIR, ns, `${newLocale}.json`)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '{}\n', 'utf-8')
      console.log(chalk.green(`  ✓ 创建于: ${path.relative(process.cwd(), filePath)}`))
      filesCreated++
    } else {
      console.log(chalk.gray(`  - 已存在: ${path.relative(process.cwd(), filePath)}`))
    }
  }
  if (filesCreated > 0) {
    console.log(chalk.green(`成功创建了 ${filesCreated} 个新文件！`))
  } else {
    console.log(chalk.yellow('没有新的文件被创建。'))
  }

  // 2. 更新 constants.ts 文件
  console.log(
    chalk.blue(`
2. 正在更新 i18n/constants.ts...`)
  )
  try {
    let content = fs.readFileSync(CONSTANTS_FILE, 'utf-8')
    const regex = /(export const SUPPORTED_LANGUAGES = \[\s*)([^\]]*)(\s*\])/
    const match = content.match(regex)

    if (match) {
      const existingLangs = match[2].split(',').map((s) => s.trim().replace(/'/g, ''))
      if (existingLangs.includes(newLocale)) {
        console.log(chalk.yellow(`语言 '${newLocale}' 已存在于 SUPPORTED_LANGUAGES 中。`))
      } else {
        const newLangs = `${match[2]}, '${newLocale}'`
        content = content.replace(regex, `$1${newLangs}$3`)
        fs.writeFileSync(CONSTANTS_FILE, content, 'utf-8')
        console.log(chalk.green(`  ✓ 成功将 '${newLocale}' 添加到 SUPPORTED_LANGUAGES！`))
      }
    } else {
      console.error(chalk.red('  ✗ 错误: 无法在 constants.ts 中找到 SUPPORTED_LANGUAGES。'))
    }
  } catch (error) {
    console.error(chalk.red(`  ✗ 错误: 更新 constants.ts 失败: ${error.message}`))
  }

  console.log(chalk.cyan('\n✨ 操作完成！'))
  console.log(chalk.yellow('下一步: 请在新创建的 .json 文件中添加翻译。'))
}

main().catch((err) => {
  console.error(chalk.red('\n操作失败:'), err)
  process.exit(1)
})

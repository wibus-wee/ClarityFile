#!/usr/bin/env tsx
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { table } from 'table'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCALES_DIR = path.resolve(__dirname, '../packages/desktop/src/renderer/src/i18n/locales')
const BASE_LANGUAGE = 'zh-CN'

/**
 * 递归计算对象中的键数量
 */
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

/**
 * 获取所有命名空间
 */
function getNamespaces(localesDir: string): string[] {
  return fs
    .readdirSync(localesDir)
    .filter((dir) => fs.statSync(path.join(localesDir, dir)).isDirectory())
}

/**
 * 计算所有语言相对于基础语言的翻译完成度
 */
function calculateCompleteness() {
  console.log(chalk.cyan('📊 计算翻译完成度...'))
  console.log(chalk.gray(`基准语言: ${BASE_LANGUAGE}`))
  console.log(chalk.gray(`翻译文件目录: ${LOCALES_DIR}\n`))

  const namespaces = getNamespaces(LOCALES_DIR)
  const languages = new Set<string>()
  const keyCount: Record<string, Record<string, number>> = {} // { lang: { namespace: count } }

  // 1. 统计每个语言、每个命名空间的键数量
  namespaces.forEach((ns) => {
    const namespaceDir = path.join(LOCALES_DIR, ns)
    const files = fs.readdirSync(namespaceDir).filter((file) => file.endsWith('.json'))

    files.forEach((file) => {
      const lang = path.basename(file, '.json')
      languages.add(lang)

      const content = JSON.parse(fs.readFileSync(path.join(namespaceDir, file), 'utf-8'))
      if (!keyCount[lang]) keyCount[lang] = {}
      keyCount[lang][ns] = countKeys(content)
    })
  })

  // 2. 计算基准语言的总键数
  const baseLangTotalKeys = namespaces.reduce((acc, ns) => {
    return acc + (keyCount[BASE_LANGUAGE]?.[ns] || 0)
  }, 0)

  if (baseLangTotalKeys === 0) {
    console.error(chalk.red(`错误：基准语言 ${BASE_LANGUAGE} 没有找到任何翻译键。`))
    process.exit(1)
  }

  // 3. 准备表格数据
  const tableData: (string | number)[][] = [
    [
      chalk.bold('语言'),
      chalk.bold('完成度'),
      chalk.bold('已翻译/总计'),
      chalk.bold('缺失的命名空间')
    ]
  ]

  const sortedLanguages = Array.from(languages).sort()

  sortedLanguages.forEach((lang) => {
    if (lang === BASE_LANGUAGE) return

    const langTotalKeys = namespaces.reduce((acc, ns) => acc + (keyCount[lang]?.[ns] || 0), 0)
    const percentage = Math.round((langTotalKeys / baseLangTotalKeys) * 100)
    const missingNamespaces = namespaces.filter((ns) => !keyCount[lang]?.[ns]).join(', ')

    let percentageColor = chalk.green
    if (percentage < 90) percentageColor = chalk.yellow
    if (percentage < 70) percentageColor = chalk.red

    tableData.push([
      chalk.blue(lang),
      percentageColor(`${percentage}%`),
      `${langTotalKeys}/${baseLangTotalKeys}`,
      missingNamespaces || '无'
    ])
  })

  // 4. 打印表格
  console.log(table(tableData))
  console.log(chalk.green('✅ 完成度计算完毕！'))
}

calculateCompleteness()

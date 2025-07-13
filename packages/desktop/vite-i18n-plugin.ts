import type { Plugin } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { set } from 'es-toolkit/compat'

/**
 * Vite 插件，用于处理 i18n 区域设置文件。
 *
 * 功能：
 * 1.  在构建时，扫描 `locales` 目录下的所有命名空间和语言文件。
 * 2.  将每个语言的所有命名空间（如 common.json, settings.json）合并成一个单一的 JavaScript 对象。
 * 3.  将每个语言的合并后对象作为单独的 JS 模块输出到 `dist/locales/{lang}.js`。
 * 4.  这使得我们可以通过动态 import (例如 `import('/locales/en-US.js')`) 来实现语言包的按需加载。
 * 5.  在开发模式下，此插件还会设置 HMR，当 .json 文件发生变化时，会通知客户端重新加载资源。
 */
export function i18nPlugin(): Plugin {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const localesDir = path.resolve(__dirname, '../../locales')

  return {
    name: 'vite-plugin-i18n-locales',
    // 在构建后执行，以处理最终的包
    enforce: 'post',

    // 开发服务器特定逻辑
    configureServer(server) {
      server.watcher.add(path.join(localesDir, '**/*.json'))
      server.watcher.on('change', (file) => {
        if (!file.includes('locales')) return

        console.log(`[i18n-hmr] File changed: ${path.basename(file)}`)
        const content = fs.readFileSync(file, 'utf-8')
        server.ws.send('i18n-update', {
          file: path.relative(localesDir, file),
          content
        })
      })
    },

    // 构建时逻辑
    generateBundle(_, bundle) {
      const languageResources: Record<string, Record<string, any>> = {}

      // 1. 读取所有命名空间目录
      const namespaces = fs.readdirSync(localesDir).filter((dir) => {
        const stat = fs.statSync(path.join(localesDir, dir))
        return stat.isDirectory()
      })

      // 2. 遍历每个命名空间，读取其下的语言文件
      namespaces.forEach((namespace) => {
        const namespacePath = path.join(localesDir, namespace)
        const files = fs.readdirSync(namespacePath).filter((file) => file.endsWith('.json'))

        files.forEach((file) => {
          const lang = path.basename(file, '.json')
          const filePath = path.join(namespacePath, file)
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

          if (!languageResources[lang]) {
            languageResources[lang] = {}
          }

          // 使用 es-toolkit 的 set 来处理嵌套键
          const obj = {}
          const keys = Object.keys(content as object)
          for (const accessorKey of keys) {
            set(obj, accessorKey, (content as any)[accessorKey])
          }

          languageResources[lang][namespace] = obj
        })
      })

      // 3. 为每种语言生成一个独立的 JS 模块文件
      Object.entries(languageResources).forEach(([lang, resources]) => {
        const fileName = `locales/${lang}.js`
        const content = `export default ${JSON.stringify(resources)};`

        this.emitFile({
          type: 'asset',
          fileName,
          source: content
        })
      })

      // 4. (可选) 从最终的 bundle 中移除原始的 .json 模块，因为它们已被合并
      Object.keys(bundle).forEach((key) => {
        if (key.includes('locales/') && key.endsWith('.json')) {
          delete bundle[key]
        }
      })
    }
  }
}

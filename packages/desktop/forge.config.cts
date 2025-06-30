import fs from 'node:fs'
import path from 'node:path'
import { cp, readdir } from 'node:fs/promises'
import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { rimraf } from 'rimraf'

// 需要保留的 node_modules（包括 workspace 依赖）
const keepModules = new Set<string>([
  // 添加其他需要保留的模块
])

// 清理不需要的依赖，保留 workspace 依赖
async function cleanSources(
  buildPath: string,
  _electronVersion: string,
  _platform: string,
  _arch: string,
  callback: () => void
): Promise<void> {
  // 需要保留的应用文件
  const appItems = new Set(['dist', 'node_modules', 'package.json', 'resources'])

  try {
    // 清理根目录下不需要的文件
    const rootItems = await readdir(buildPath)
    await Promise.all(
      rootItems
        .filter((item) => !appItems.has(item))
        .map((item) => rimraf(path.join(buildPath, item)))
    )

    // 检查 node_modules 是否存在
    const nodeModulesPath = path.join(buildPath, 'node_modules')
    if (fs.existsSync(nodeModulesPath)) {
      // 清理不需要的 node_modules
      const nodeModuleItems = await readdir(nodeModulesPath)
      await Promise.all(
        nodeModuleItems
          .filter((item) => !keepModules.has(item))
          .map((item) => rimraf(path.join(nodeModulesPath, item)))
      )

      // 从根 node_modules 复制需要的 workspace 依赖
      await Promise.all(
        Array.from(keepModules.values()).map(async (item) => {
          const targetPath = path.join(nodeModulesPath, item)
          if (!fs.existsSync(targetPath)) {
            const sourcePath = path.join(process.cwd(), '../../node_modules', item)
            if (fs.existsSync(sourcePath)) {
              await cp(sourcePath, targetPath, { recursive: true })
            }
          }
        })
      )
    }

    callback()
  } catch (error) {
    console.error('Error in cleanSources:', error)
    callback()
  }
}

// 创建 ignore 模式，排除不需要的 node_modules
const ignorePattern = new RegExp(`^/node_modules/(?!${[...keepModules].join('|')})`)

const config: ForgeConfig = {
  packagerConfig: {
    name: 'Clarity Staging',
    icon: './resources/icon',
    appBundleId: 'ren.wibus',
    asar: true,
    prune: true,
    afterCopy: [cleanSources],
    ignore: [
      /^\/src/,
      /(.eslintrc.json)|(.gitignore)|(electron.vite.config.ts)|(forge.config.cjs)|(tsconfig.*)/,
      ignorePattern
    ]
  },
  rebuildConfig: {},
  makers: [
    new MakerZIP({}, ['darwin']),
    new MakerSquirrel(
      {
        authors: 'Wibus Studio'
      },
      ['win32']
    )
  ]
}

export default config

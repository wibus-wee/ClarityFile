import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'

const config: ForgeConfig = {
  packagerConfig: {
    name: 'Clarity Staging',
    icon: './resources/icon',
    appBundleId: 'ren.wibus',
    ignore: [
      /^\/src/,
      /(.eslintrc.json)|(.gitignore)|(electron.vite.config.ts)|(forge.config.cjs)|(tsconfig.*)/
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

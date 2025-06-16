import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'

const ReactCompilerConfig = {
  target: '19' // '17' | '18' | '19'
}

const sharedConfig = {}

export default defineConfig({
  main: {
    ...sharedConfig,
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    ...sharedConfig,
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    ...sharedConfig,
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@main': resolve('src/main')
      }
    },
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        routesDirectory: resolve('src/renderer/src/routes'),
        generatedRouteTree: resolve('src/renderer/src/routeTree.gen.ts')
      }),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]]
        }
      }),
      tailwindcss()
    ]
  }
})

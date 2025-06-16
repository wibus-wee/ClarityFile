import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
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
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]]
        }
      }),
      tailwindcss()
    ]
  }
})

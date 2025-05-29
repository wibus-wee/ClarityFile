import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // 测试环境
    environment: 'node',
    
    // 全局设置
    globals: true,
    
    // 测试文件匹配模式
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      'out',
      'build',
      '.next',
      '.nuxt',
      '.vercel',
      '.changeset'
    ],
    
    // 覆盖率配置
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        'out/**',
        'build/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/node_modules/**',
        'src/renderer/**', // 排除前端代码
        'src/preload/**',  // 排除预加载脚本
        'src/db/schema.ts', // 排除数据库 schema
        'src/main/index.ts' // 排除主入口文件
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // 测试超时
    testTimeout: 10000,
    
    // 钩子超时
    hookTimeout: 10000,
    
    // 并发设置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },
    
    // 监听模式配置
    watch: true,
    
    // 报告器
    reporter: ['verbose', 'html'],
    
    // 输出目录
    outputFile: {
      html: './coverage/test-report.html'
    }
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@main': path.resolve(__dirname, './src/main'),
      '@renderer': path.resolve(__dirname, './src/renderer'),
      '@db': path.resolve(__dirname, './src/db')
    }
  },
  
  // 定义全局变量
  define: {
    __TEST__: true
  }
})

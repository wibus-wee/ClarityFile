import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'
import { presetWind4 } from '@unocss/preset-wind4'

export default defineConfig({
  shortcuts: [
    // antfu风格按钮
    [
      'btn',
      'px-3 py-1.5 rounded-md inline-flex items-center justify-center font-light text-sm transition-all duration-200 cursor-pointer select-none'
    ],
    ['btn-primary', 'btn bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800'],
    [
      'btn-secondary',
      'btn bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
    ],
    [
      'btn-ghost',
      'btn text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 active:bg-gray-100 dark:active:bg-gray-800'
    ],

    // antfu风格图标按钮
    [
      'icon-btn',
      'inline-flex items-center justify-center w-7 h-7 rounded-md cursor-pointer select-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200'
    ],
    [
      'icon-btn-active',
      'icon-btn text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
    ],

    // antfu风格输入框
    [
      'input-antfu',
      'px-2 py-1 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-none focus:outline-none'
    ],
    [
      'input-bordered',
      'input-antfu border border-gray-200 dark:border-gray-700 rounded-md focus:border-emerald-500 dark:focus:border-emerald-400'
    ],

    // antfu风格面板
    ['panel', 'bg-white dark:bg-black border border-gray-100 dark:border-gray-800'],
    ['panel-elevated', 'panel shadow-sm'],

    // 布局
    ['flex-center', 'flex items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],

    // antfu风格文本
    ['text-muted', 'text-gray-500 dark:text-gray-400 opacity-75'],
    ['text-primary', 'text-emerald-600 dark:text-emerald-400'],
    ['text-secondary', 'text-gray-600 dark:text-gray-300'],

    // antfu风格分割线
    ['divider', 'border-t border-gray-100 dark:border-gray-800'],
    ['divider-vertical', 'border-l border-gray-100 dark:border-gray-800'],

    // 状态指示器
    ['status-dot', 'w-2 h-2 rounded-full'],
    ['status-saved', 'status-dot bg-emerald-400'],
    ['status-changed', 'status-dot bg-amber-400'],
    ['status-error', 'status-dot bg-red-400'],

    // 快捷键提示
    [
      'kbd',
      'px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700'
    ],

    // hover效果
    ['hover-bg', 'hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200'],
    ['hover-text', 'hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200']
  ],

  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then((i) => i.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then((i) => i.default),
        tabler: () => import('@iconify-json/tabler/icons.json').then((i) => i.default)
      }
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'JetBrains Mono:400,500,600'
      }
    })
  ],

  transformers: [transformerDirectives(), transformerVariantGroup()],

  theme: {
    colors: {
      primary: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b'
      }
    }
  },

  safelist: [
    'i-carbon-menu',
    'i-carbon-close',
    'i-carbon-search',
    'i-carbon-edit',
    'i-carbon-save',
    'i-carbon-folder',
    'i-carbon-document',
    'i-carbon-translate',
    'i-carbon-moon',
    'i-carbon-sun',
    'i-carbon-settings',
    'i-carbon-add',
    'i-carbon-language',
    'i-carbon-copy',
    'i-carbon-trash-can',
    'i-carbon-download',
    'i-carbon-upload',
    'i-carbon-export',
    'i-carbon-import',
    'i-carbon-checkmark',
    'i-carbon-warning',
    'i-carbon-error',
    'i-carbon-information',
    'i-carbon-keyboard',
    'i-carbon-undo',
    'i-carbon-redo',
    'i-mdi-chevron-right',
    'i-mdi-chevron-down',
    'i-tabler-language'
  ]
})

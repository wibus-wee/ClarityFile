import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'
import { presetWind3 } from '@unocss/preset-wind3'

export default defineConfig({
  shortcuts: [
    // 按钮样式
    [
      'btn',
      'px-4 py-2 rounded-lg inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none'
    ],
    ['btn-primary', 'btn bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800'],
    [
      'btn-secondary',
      'btn bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
    ],
    [
      'btn-ghost',
      'btn hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700'
    ],

    // 图标按钮
    [
      'icon-btn',
      'inline-flex items-center justify-center w-8 h-8 rounded-md cursor-pointer select-none opacity-75 transition-all duration-200 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800'
    ],
    [
      'icon-btn-modern',
      'w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-all duration-200 hover:scale-105 active:scale-95'
    ],

    // 输入框样式
    [
      'input-base',
      'px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all duration-200'
    ],
    [
      'input-dark',
      'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400'
    ],

    // 卡片样式
    [
      'card',
      'bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700'
    ],
    ['card-hover', 'card hover:shadow-md transition-shadow duration-200'],

    // 布局
    ['flex-center', 'flex items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],

    // 文本样式
    ['text-muted', 'text-gray-600 dark:text-gray-400'],
    ['text-primary', 'text-emerald-600 dark:text-emerald-400'],

    // 分割线
    ['divider', 'border-t border-gray-200 dark:border-gray-700'],
    ['divider-vertical', 'border-l border-gray-200 dark:border-gray-700']
  ],

  presets: [
    presetWind3(),
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
      // antfu 风格的颜色系统 - 完整版
      antfu: {
        bg: 'var(--color-bg)',
        'bg-soft': 'var(--color-bg-soft)',
        'bg-mute': 'var(--color-bg-mute)',
        'bg-hover': 'var(--color-bg-hover)',
        text: 'var(--color-text)',
        'text-soft': 'var(--color-text-soft)',
        'text-mute': 'var(--color-text-mute)',
        border: 'var(--color-border)',
        'border-soft': 'var(--color-border-soft)',
        'border-hover': 'var(--color-border-hover)'
      },
      primary: {
        DEFAULT: 'var(--color-primary)',
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        soft: 'var(--color-primary-soft)',
        mute: 'var(--color-primary-mute)',
        hover: 'var(--color-primary-hover)',
        active: 'var(--color-primary-active)'
      },
      success: {
        DEFAULT: 'var(--color-success)'
      },
      warning: {
        DEFAULT: 'var(--color-warning)'
      },
      error: {
        DEFAULT: 'var(--color-error)'
      },
      info: {
        DEFAULT: 'var(--color-info)'
      }
    },
    boxShadow: {
      'antfu-sm': 'var(--shadow-sm)',
      antfu: 'var(--shadow)',
      'antfu-md': 'var(--shadow-md)'
    },
    borderRadius: {
      'antfu-sm': 'var(--radius-sm)',
      antfu: 'var(--radius)',
      'antfu-md': 'var(--radius-md)',
      'antfu-lg': 'var(--radius-lg)'
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
    'i-mdi-chevron-right',
    'i-mdi-chevron-down',
    'i-tabler-language'
  ]
})

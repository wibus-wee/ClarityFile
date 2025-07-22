// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-13',
  devtools: { enabled: true },
  modules: ['@unocss/nuxt', '@vueuse/nuxt', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  ssr: false, // SPA模式，适合桌面应用
  app: {
    head: {
      title: 'ClarityFile Locales Editor',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ClarityFile国际化编辑器' }
      ]
    }
  }
})

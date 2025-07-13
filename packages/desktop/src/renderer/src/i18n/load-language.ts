import i18n from 'i18next'

/**
 * LocaleCache 用于将动态加载的语言包缓存在 localStorage 中，
 * 避免用户在切换语言时重复下载资源，提升性能。
 */
class LocaleCache {
  static shared = new LocaleCache()

  private getKey(lang: string): string {
    return `clarity-i18n-cache-v1-${lang}`
  }

  get(lang: string): Record<string, any> | null {
    const key = this.getKey(lang)
    const cache = localStorage.getItem(key)
    if (!cache) return null
    try {
      return JSON.parse(cache)
    } catch (e) {
      console.error(`[i18n] Failed to parse cache for language: ${lang}`, e)
      return null
    }
  }

  set(lang: string, resources: Record<string, any>): void {
    const key = this.getKey(lang)
    try {
      const mergedResources = { ...this.get(lang), ...resources }
      localStorage.setItem(key, JSON.stringify(mergedResources))
    } catch (e) {
      console.error(`[i18n] Failed to set cache for language: ${lang}`, e)
    }
  }
}

const loadingLangLock = new Set<string>()
const loadedLangs = new Set<string>()

/**
 * 动态加载并应用指定的语言包。
 *
 * @param lang 要加载的语言代码 (e.g., 'en-US')
 * @returns {Promise<boolean>} 如果加载成功或已加载，则返回 true
 */
export const loadLanguage = async (lang: string): Promise<boolean> => {
  if (loadedLangs.has(lang)) {
    return true
  }
  if (loadingLangLock.has(lang)) {
    // 如果正在加载，可以等待加载完成
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!loadingLangLock.has(lang)) {
          clearInterval(interval)
          resolve(loadedLangs.has(lang))
        }
      }, 100)
    })
  }

  loadingLangLock.add(lang)

  try {
    const cachedResources = LocaleCache.shared.get(lang)
    if (cachedResources) {
      for (const namespace in cachedResources) {
        i18n.addResourceBundle(lang, namespace, cachedResources[namespace], true, true)
      }
      console.log(`[i18n] Loaded language '${lang}' from cache.`)
      loadedLangs.add(lang)
      return true
    }

    const resources = await import(/* @vite-ignore */ `/locales/${lang}.js`).then(
      (m) => m.default || m
    )

    if (Object.keys(resources).length === 0) {
      throw new Error('Loaded empty resources.')
    }

    for (const namespace in resources) {
      i18n.addResourceBundle(lang, namespace, resources[namespace], true, true)
    }
    LocaleCache.shared.set(lang, resources)
    loadedLangs.add(lang)
    console.log(`[i18n] Successfully loaded and cached language: '${lang}'`)
    return true
  } catch (error) {
    console.error(`[i18n] Failed to load language '${lang}':`, error)
    return false
  } finally {
    loadingLangLock.delete(lang)
  }
}

// 在开发模式下，监听 HMR 事件
if (import.meta.env.DEV) {
  if ('hot' in import.meta) {
    import.meta.hot!.on('i18n-update', async ({ file, content }) => {
      try {
        const resources = JSON.parse(content)
        const [namespace, langWithExt] = file.split('/')
        const lang = langWithExt.replace('.json', '')

        if (!lang || !namespace) return

        i18n.addResourceBundle(lang, namespace, resources, true, true)
        await i18n.reloadResources([lang], { ns: namespace })
        console.log(`[i18n-hmr] Hot reloaded: ${lang}/${namespace}`)
      } catch (e) {
        console.error('[i18n-hmr] Failed to process update:', e)
      }
    })
  }
}

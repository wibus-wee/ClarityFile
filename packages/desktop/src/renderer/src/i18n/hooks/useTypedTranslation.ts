import { useTranslation as useI18nTranslation } from 'react-i18next'
import type {
  TranslationKeys,
  TranslationOptions,
  AvailableNamespaces,
  NamespaceKeys,
  TypedTranslationFunction,
  GeneralTranslationFunction
} from '../types'

// 强类型的翻译 Hook 返回类型（泛型版本）
interface TypedTranslationHook<T extends AvailableNamespaces | undefined = undefined> {
  t: T extends AvailableNamespaces ? TypedTranslationFunction<T> : GeneralTranslationFunction
  i18n: ReturnType<typeof useI18nTranslation>['i18n']
  ready: boolean
}

/**
 * 强类型的翻译 Hook（泛型版本）
 *
 * 提供完整的 TypeScript 类型安全，包括：
 * - 翻译键的自动补全
 * - 编译时的键存在性检查
 * - 参数类型验证
 * - 命名空间特定的类型支持
 *
 * @param namespace - 可选的命名空间
 * @returns 包含强类型翻译函数的对象
 *
 * @example
 * ```tsx
 * // 使用特定命名空间 - 只显示该命名空间的键
 * const { t } = useTypedTranslation('settings')
 * const title = t('appearance.customTheme.title') // 只有 settings 命名空间的键
 *
 * // 使用默认命名空间 - 显示所有键
 * const { t: tGeneral } = useTypedTranslation()
 * const text = tGeneral('common.save') // 所有命名空间的键
 *
 * // ✅ 支持参数
 * const status = t('appearance.customTheme.currentStatus', { count: 5 })
 *
 * // ❌ TypeScript 错误 - 键不存在
 * const invalid = t('nonexistent.key')
 * ```
 */
export function useTypedTranslation<T extends AvailableNamespaces | undefined = undefined>(
  namespace?: T
): TypedTranslationHook<T> {
  const { t: originalT, i18n, ready } = useI18nTranslation(namespace)

  // 包装原始的翻译函数以提供类型安全
  const t = ((
    key: T extends AvailableNamespaces ? NamespaceKeys[T] : TranslationKeys,
    optionsOrDefaultValue?: TranslationOptions | string,
    options?: TranslationOptions
  ): string => {
    if (typeof optionsOrDefaultValue === 'string') {
      // 第二个参数是默认值
      return originalT(key, optionsOrDefaultValue, options)
    } else {
      // 第二个参数是选项
      return originalT(key, optionsOrDefaultValue)
    }
  }) as T extends AvailableNamespaces ? TypedTranslationFunction<T> : GeneralTranslationFunction

  return { t, i18n, ready }
}

/**
 * 便捷的强类型翻译 Hook（使用默认命名空间）
 *
 * @example
 * ```tsx
 * const { t } = useTranslation()
 * const text = t('common.save') // 类型安全
 * ```
 */
export function useTranslation<T extends AvailableNamespaces | undefined = undefined>(
  namespace?: T
): TypedTranslationHook<T> {
  return useTypedTranslation(namespace)
}

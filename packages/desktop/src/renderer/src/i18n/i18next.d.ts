import 'i18next'

import type { defaultResources } from './default-resources'
import type { DEFAULT_NS, NAMESPACES } from './constants'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NS
    ns: typeof NAMESPACES

    /**
     * 类型推断将从我们的基础语言（中文）资源结构中派生。
     * 这意味着我们所有的翻译键都将获得完整的、嵌套的、类型安全的自动补全，
     * 而无需生成一个包含数千行代码的巨大类型文件。
     */
    resources: (typeof defaultResources)['zh-CN']
  }
}

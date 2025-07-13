/**
 * @file i18next 实例配置文件
 * @description 此文件仅用于配置和导出 i18next 的单例。
 * 所有的初始化和语言变更逻辑都由 Zustand store (`i18n/store.ts`) 驱动，
 * 以确保状态管理的一致性和响应性。
 *
 * 这种分离关注点的做法，使得 i18n 实例本身保持纯净，而状态管理则由专门的 store 负责，
 * 这是一种健壮且可维护的架构模式。
 */
import i18n from 'i18next'

// 导出未初始化的 i18n 实例。
// 初始化过程将由应用启动时调用的 Zustand store action 来触发。
export default i18n

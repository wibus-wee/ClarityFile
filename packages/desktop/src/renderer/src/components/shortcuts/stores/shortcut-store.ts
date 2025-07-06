import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'

// 启用 immer 的 MapSet 支持
enableMapSet()
import type {
  ShortcutRegistration,
  ShortcutConflict,
  ShortcutScope,
  ShortcutKey,
  ShortcutFormatOptions,
  ParsedShortcut,
  KeyboardEventMatch,
  ShortcutGroup
} from '../types/shortcut.types'
import { detectConflicts } from '../utils/conflict-detector'
import { formatShortcut } from '../utils/key-formatter'
import { parseShortcut, matchesShortcut } from '../utils/key-parser'

/**
 * 快捷键 Store 状态接口
 */
export interface ShortcutStoreState {
  // 核心状态
  registrations: Map<string, ShortcutRegistration>
  conflicts: ShortcutConflict[]
  activeScope: string | null

  // 运行时状态
  isListening: boolean
  lastTriggeredShortcut: string | null

  // 用户偏好设置 (可持久化)
  userPreferences: {
    enableTooltips: boolean
    enableConflictWarnings: boolean
    debugMode: boolean
  }

  // Overlay 状态
  overlay: {
    isVisible: boolean
    isLongPressing: boolean
    longPressTimer: number | null
  }
}

/**
 * 快捷键 Store 操作接口
 */
export interface ShortcutStoreActions {
  // 注册管理
  register: (registration: ShortcutRegistration) => void
  unregister: (id: string) => void
  updateRegistration: (id: string, updates: Partial<ShortcutRegistration>) => void
  batchRegister: (registrations: ShortcutRegistration[]) => void
  batchUnregister: (ids: string[]) => void

  // 作用域管理
  setActiveScope: (scope: string | null) => void

  // 查询方法
  getRegistrationsByScope: (scope: ShortcutScope) => ShortcutRegistration[]
  getVisibleShortcuts: () => ShortcutRegistration[]
  checkConflicts: () => ShortcutConflict[]

  // 格式化和解析
  formatShortcut: (keys: ShortcutKey[], options?: ShortcutFormatOptions) => string
  parseShortcut: (keys: ShortcutKey[]) => ParsedShortcut
  matchKeyboardEvent: (event: KeyboardEvent) => KeyboardEventMatch

  // 事件处理
  handleKeyboardEvent: (event: KeyboardEvent) => boolean

  // 用户偏好
  updateUserPreferences: (preferences: Partial<ShortcutStoreState['userPreferences']>) => void

  // 调试和重置
  reset: () => void
  getDebugInfo: () => {
    totalRegistrations: number
    conflictCount: number
    activeScope: string | null
    registrationsByScope: Record<string, number>
  }

  // Overlay 管理
  showOverlay: () => void
  hideOverlay: () => void
  startLongPress: () => void
  cancelLongPress: () => void
  getGroupedShortcuts: () => ShortcutGroup[]
}

/**
 * 完整的 Store 类型
 */
export type ShortcutStore = ShortcutStoreState & ShortcutStoreActions

/**
 * 初始状态
 */
const initialState: ShortcutStoreState = {
  registrations: new Map(),
  conflicts: [],
  activeScope: null,
  isListening: false,
  lastTriggeredShortcut: null,
  userPreferences: {
    enableTooltips: true,
    enableConflictWarnings: true,
    debugMode: false
  },
  overlay: {
    isVisible: false,
    isLongPressing: false,
    longPressTimer: null
  }
}

/**
 * 创建快捷键 Store
 */
export const useShortcutStore = create<ShortcutStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // 注册管理
      register: (registration) => {
        set((state) => {
          state.registrations.set(registration.id, registration)
          state.conflicts = detectConflicts(Array.from(state.registrations.values()))
        })
      },

      unregister: (id) => {
        set((state) => {
          state.registrations.delete(id)
          state.conflicts = detectConflicts(Array.from(state.registrations.values()))
        })
      },

      updateRegistration: (id, updates) => {
        set((state) => {
          const existing = state.registrations.get(id)
          if (existing) {
            state.registrations.set(id, { ...existing, ...updates })
            state.conflicts = detectConflicts(Array.from(state.registrations.values()))
          }
        })
      },

      batchRegister: (registrations) => {
        set((state) => {
          registrations.forEach((registration) => {
            state.registrations.set(registration.id, registration)
          })
          state.conflicts = detectConflicts(Array.from(state.registrations.values()))
        })
      },

      batchUnregister: (ids) => {
        set((state) => {
          ids.forEach((id) => {
            state.registrations.delete(id)
          })
          state.conflicts = detectConflicts(Array.from(state.registrations.values()))
        })
      },

      // 作用域管理
      setActiveScope: (scope) => {
        set((state) => {
          state.activeScope = scope
        })
      },

      // 查询方法
      getRegistrationsByScope: (scope) => {
        const { registrations } = get()
        return Array.from(registrations.values()).filter((reg) => reg.scope === scope)
      },

      getVisibleShortcuts: () => {
        const { registrations, activeScope } = get()
        return Array.from(registrations.values()).filter((reg) => {
          if (!reg.enabled) return false
          if (!activeScope) return reg.scope === 'global'
          return reg.scope === 'global' || reg.scope === 'page'
        })
      },

      checkConflicts: () => {
        const { registrations } = get()
        return detectConflicts(Array.from(registrations.values()))
      },

      // 格式化和解析
      formatShortcut: (keys, options) => formatShortcut(keys, options),
      parseShortcut: (keys) => parseShortcut(keys),

      matchKeyboardEvent: (event) => {
        const { registrations, activeScope } = get()
        const allRegistrations = Array.from(registrations.values())

        // 优先匹配当前作用域的快捷键
        const scopedRegistrations = activeScope
          ? allRegistrations.filter((reg) => reg.scope === 'page' || reg.scope === 'global')
          : allRegistrations.filter((reg) => reg.scope === 'global')

        // 按优先级排序
        const sortedRegistrations = scopedRegistrations.sort((a, b) => b.priority - a.priority)

        for (const registration of sortedRegistrations) {
          if (registration.enabled && matchesShortcut(event, registration.keys)) {
            // 检查条件
            if (registration.condition && !registration.condition()) {
              continue
            }

            return {
              matches: true,
              registration,
              event
            }
          }
        }

        return {
          matches: false,
          event
        }
      },

      // 事件处理
      handleKeyboardEvent: (event) => {
        const match = get().matchKeyboardEvent(event)

        if (match.matches && match.registration) {
          event.preventDefault()
          event.stopPropagation()

          try {
            match.registration.action()
            set((state) => {
              state.lastTriggeredShortcut = match.registration!.id
            })
            return true
          } catch (error) {
            console.error('执行快捷键操作时出错:', error)
            return false
          }
        }

        return false
      },

      // 用户偏好
      updateUserPreferences: (preferences) => {
        set((state) => {
          Object.assign(state.userPreferences, preferences)
        })
      },

      // 调试和重置
      reset: () => {
        set(initialState)
      },

      getDebugInfo: () => {
        const { registrations, conflicts, activeScope } = get()
        const registrationsByScope: Record<string, number> = {}

        Array.from(registrations.values()).forEach((reg) => {
          registrationsByScope[reg.scope] = (registrationsByScope[reg.scope] || 0) + 1
        })

        return {
          totalRegistrations: registrations.size,
          conflictCount: conflicts.length,
          activeScope,
          registrationsByScope
        }
      },

      // Overlay 管理
      showOverlay: () => {
        set((state) => {
          state.overlay.isVisible = true
        })
      },

      hideOverlay: () => {
        set((state) => {
          state.overlay.isVisible = false
          state.overlay.isLongPressing = false
          if (state.overlay.longPressTimer) {
            clearTimeout(state.overlay.longPressTimer)
            state.overlay.longPressTimer = null
          }
        })
      },

      startLongPress: () => {
        const { overlay } = get()

        // 如果已经在长按中，不重复启动
        if (overlay.isLongPressing) {
          return
        }

        set((state) => {
          state.overlay.isLongPressing = true

          // 设置长按定时器 (600ms)
          state.overlay.longPressTimer = window.setTimeout(() => {
            set((state) => {
              state.overlay.isVisible = true
            })
          }, 600)
        })
      },

      cancelLongPress: () => {
        set((state) => {
          state.overlay.isLongPressing = false
          if (state.overlay.longPressTimer) {
            clearTimeout(state.overlay.longPressTimer)
            state.overlay.longPressTimer = null
          }
        })
      },

      getGroupedShortcuts: () => {
        const { registrations, activeScope } = get()
        const allRegistrations = Array.from(registrations.values())

        // 过滤当前作用域的快捷键
        const visibleRegistrations = allRegistrations.filter((reg) => {
          if (!reg.enabled) return false
          if (reg.condition && !reg.condition()) return false

          // 显示全局快捷键和当前作用域的快捷键
          return reg.scope === 'global' || (activeScope && reg.scope === 'page')
        })

        // 按功能分组
        const groups: Record<string, ShortcutRegistration[]> = {}

        visibleRegistrations.forEach((reg) => {
          // 根据描述或优先级分组
          let groupName = '其他'

          if (reg.description) {
            if (reg.description.includes('创建') || reg.description.includes('新建')) {
              groupName = '创建操作'
            } else if (reg.description.includes('导入') || reg.description.includes('上传')) {
              groupName = '文件操作'
            } else if (reg.description.includes('搜索') || reg.description.includes('查找')) {
              groupName = '搜索导航'
            } else if (reg.description.includes('设置') || reg.description.includes('配置')) {
              groupName = '设置'
            } else if (reg.scope === 'global') {
              groupName = '全局操作'
            } else {
              groupName = '页面操作'
            }
          }

          if (!groups[groupName]) {
            groups[groupName] = []
          }
          groups[groupName].push(reg)
        })

        // 转换为 ShortcutGroup 数组并排序
        const result: ShortcutGroup[] = Object.entries(groups).map(([name, shortcuts]) => ({
          name,
          shortcuts: shortcuts.sort((a, b) => b.priority - a.priority),
          priority: Math.max(...shortcuts.map((s) => s.priority))
        }))

        // 按组优先级排序
        return result.sort((a, b) => (b.priority || 0) - (a.priority || 0))
      }
    })),
    {
      name: 'shortcut-preferences',
      partialize: (state) => ({
        userPreferences: state.userPreferences
      })
    }
  )
)

/**
 * 导出类型化的 hooks
 */
export const useShortcuts = () => useShortcutStore()
export const useShortcutPreferences = () => useShortcutStore((state) => state.userPreferences)
export const useShortcutConflicts = () => useShortcutStore((state) => state.conflicts)
export const useShortcutDebugInfo = () => useShortcutStore((state) => state.getDebugInfo())

import { create } from 'zustand'
import { User } from '@renderer/types/user'
import { tipcClient } from '@renderer/lib/tipc-client'

interface AppStore {
  // 状态
  user: User | null
  isLoading: boolean
  error: string | null

  // 异步操作
  loadUser: () => Promise<void>
  updateUser: (partialUser: Partial<User>) => Promise<void>
  initializeUser: () => Promise<void>
  clearUser: () => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  // 初始状态
  user: null,
  isLoading: false,
  error: null,

  // 异步Actions
  loadUser: async () => {
    set({ isLoading: true, error: null })
    try {
      const user = await tipcClient.getCurrentUser()
      set({ user, isLoading: false })
    } catch (error) {
      console.error('加载用户信息失败:', error)
      set({
        error: error instanceof Error ? error.message : '加载用户信息失败',
        isLoading: false
      })
    }
  },

  updateUser: async (partialUser: Partial<User>) => {
    const currentUser = get().user
    if (!currentUser?.id) {
      set({ error: '用户信息不存在' })
      return
    }

    set({ isLoading: true, error: null })
    try {
      // 过滤掉undefined值，只传递有效的更新字段
      const updateData: any = { id: currentUser.id }
      if (partialUser.name !== undefined) updateData.name = partialUser.name
      if (partialUser.email !== undefined) updateData.email = partialUser.email
      if (partialUser.avatar !== undefined) updateData.avatar = partialUser.avatar
      if (partialUser.role !== undefined) updateData.role = partialUser.role
      if (partialUser.preferences !== undefined) updateData.preferences = partialUser.preferences

      const updatedUser = await tipcClient.updateUser(updateData)
      set({ user: updatedUser, isLoading: false })
    } catch (error) {
      console.error('更新用户信息失败:', error)
      set({
        error: error instanceof Error ? error.message : '更新用户信息失败',
        isLoading: false
      })
    }
  },

  initializeUser: async () => {
    set({ isLoading: true, error: null })
    try {
      // 首先检查是否已有用户
      const existingUser = await tipcClient.getCurrentUser()
      if (existingUser) {
        set({ user: existingUser, isLoading: false })
        return
      }

      // 如果没有用户，初始化默认用户
      const defaultUser = await tipcClient.initializeDefaultUser()
      set({ user: defaultUser, isLoading: false })
    } catch (error) {
      console.error('初始化用户失败:', error)
      set({
        error: error instanceof Error ? error.message : '初始化用户失败',
        isLoading: false
      })
    }
  },

  clearUser: () => {
    set({ user: null, error: null })
  }
}))

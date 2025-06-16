import { create } from 'zustand'
import { User, UserState, UserActions } from '@renderer/types/user'

type AppStore = UserState & UserActions

export const useAppStore = create<AppStore>((set) => ({
  // 初始状态
  user: null,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user: User) => set({ user, error: null }),

  updateUser: (partialUser: Partial<User>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partialUser } : null,
      error: null
    })),

  clearUser: () => set({ user: null, error: null }),

  setError: (error: string | null) => set({ error }),

  setLoading: (isLoading: boolean) => set({ isLoading })
}))

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string // 改为string类型，与后端保持一致
  preferences?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface UserActions {
  setUser: (user: User) => void
  updateUser: (partialUser: Partial<User>) => void
  clearUser: () => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void
}

export interface User {
  name: string
  email: string
  avatar: string
  role?: 'enterprise' | 'pro' | 'basic' | 'founder'
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

import { z } from 'zod'

// ===== 用户管理相关 Schema =====

// 用户角色枚举
export const userRoleSchema = z.enum(['enterprise', 'pro', 'basic', 'founder'], {
  message: '用户角色必须是 enterprise、pro、basic 或 founder'
})

// 创建用户 Schema
export const createUserSchema = z.object({
  name: z.string().nonempty().min(1, '用户名不能为空').max(100, '用户名不能超过100个字符'),
  email: z.email().max(255, '邮箱地址不能超过255个字符'),
  avatar: z.url().optional(),
  role: userRoleSchema.default('basic'),
  preferences: z.record(z.string(), z.any()).optional().describe('用户偏好设置，JSON格式')
})

// 更新用户 Schema
export const updateUserSchema = z.object({
  id: z.uuid(),
  name: z.string().nonempty().min(1, '用户名不能为空').max(100, '用户名不能超过100个字符'),
  email: z.email().max(255, '邮箱地址不能超过255个字符'),
  avatar: z.url().optional(),
  role: userRoleSchema.default('basic'),
  preferences: z.record(z.string(), z.any()).optional().describe('用户偏好设置，JSON格式')
})

// 更新用户偏好设置 Schema
export const updateUserPreferencesSchema = z.object({
  userId: z.uuid(),
  preferences: z.record(z.string(), z.any()).describe('用户偏好设置，JSON格式')
})

// 获取用户 Schema
export const getUserSchema = z.object({
  id: z.uuid().optional()
})

// ===== 输入类型定义 =====

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>
export type GetUserInput = z.infer<typeof getUserSchema>

// ===== 输出类型定义 =====

export interface UserOutput {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  preferences?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface UserListOutput {
  users: UserOutput[]
  total: number
}

// ===== 错误类型定义 =====

export class UserNotFoundError extends Error {
  constructor(userId?: string) {
    super(userId ? `用户 ${userId} 不存在` : '用户不存在')
    this.name = 'UserNotFoundError'
  }
}

export class UserEmailExistsError extends Error {
  constructor(email: string) {
    super(`邮箱 ${email} 已被使用`)
    this.name = 'UserEmailExistsError'
  }
}

export class UserValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserValidationError'
  }
}

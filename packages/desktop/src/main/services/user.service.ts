import { db } from '../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserPreferencesInput,
  GetUserInput,
  UserOutput,
  UserListOutput
} from '../types/user-schemas'
import {
  createUserSchema,
  updateUserSchema,
  updateUserPreferencesSchema,
  getUserSchema,
  UserNotFoundError,
  UserEmailExistsError
} from '../types/user-schemas'

export class UserService {
  /**
   * 获取当前用户信息
   * 注：当前版本假设只有一个用户，返回第一个用户
   */
  static async getCurrentUser(): Promise<UserOutput | null> {
    try {
      const result = await db.select().from(users).limit(1)

      if (result.length === 0) {
        return null
      }

      const user = result[0]
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        role: user.role,
        preferences: user.preferences as Record<string, any>,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }
    } catch (error) {
      console.error('获取当前用户失败:', error)
      throw new Error('获取用户信息失败')
    }
  }

  /**
   * 根据ID获取用户信息
   */
  static async getUserById(input: GetUserInput): Promise<UserOutput | null> {
    try {
      // 验证输入数据
      const validatedInput = getUserSchema.parse(input)

      if (!validatedInput.id) {
        return await this.getCurrentUser()
      }

      const result = await db.select().from(users).where(eq(users.id, validatedInput.id)).limit(1)

      if (result.length === 0) {
        return null
      }

      const user = result[0]
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        role: user.role,
        preferences: user.preferences as Record<string, any>,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }
    } catch (error) {
      console.error('获取用户失败:', error)
      throw new Error('获取用户信息失败')
    }
  }

  /**
   * 创建用户
   */
  static async createUser(input: CreateUserInput): Promise<UserOutput> {
    try {
      // 验证输入数据
      const validatedInput = createUserSchema.parse(input)

      // 检查邮箱是否已存在
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, validatedInput.email))
        .limit(1)
      if (existingUser.length > 0) {
        throw new UserEmailExistsError(validatedInput.email)
      }

      // 创建用户
      const result = await db
        .insert(users)
        .values({
          name: validatedInput.name,
          email: validatedInput.email,
          avatar: validatedInput.avatar || null,
          role: validatedInput.role || 'basic',
          preferences: validatedInput.preferences
            ? JSON.stringify(validatedInput.preferences)
            : null
        })
        .returning()

      const user = result[0]
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        role: user.role,
        preferences: user.preferences as Record<string, any>,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }
    } catch (error) {
      if (error instanceof UserEmailExistsError) {
        throw error
      }
      console.error('创建用户失败:', error)
      throw new Error('创建用户失败')
    }
  }

  /**
   * 更新用户信息
   */
  static async updateUser(input: UpdateUserInput): Promise<UserOutput> {
    try {
      // 验证输入数据
      const validatedInput = updateUserSchema.parse(input)

      // 检查用户是否存在
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, validatedInput.id))
        .limit(1)
      if (existingUser.length === 0) {
        throw new UserNotFoundError(validatedInput.id)
      }

      // 如果更新邮箱，检查邮箱是否已被其他用户使用
      if (validatedInput.email) {
        const emailUser = await db
          .select()
          .from(users)
          .where(eq(users.email, validatedInput.email))
          .limit(1)

        if (emailUser.length > 0 && emailUser[0].id !== validatedInput.id) {
          throw new UserEmailExistsError(validatedInput.email)
        }
      }

      // 构建更新数据
      const updateData: any = {
        updatedAt: new Date()
      }

      if (validatedInput.name !== undefined) updateData.name = validatedInput.name
      if (validatedInput.email !== undefined) updateData.email = validatedInput.email
      if (validatedInput.avatar !== undefined) updateData.avatar = validatedInput.avatar
      if (validatedInput.role !== undefined) updateData.role = validatedInput.role
      if (validatedInput.preferences !== undefined) {
        updateData.preferences = validatedInput.preferences
          ? JSON.stringify(validatedInput.preferences)
          : null
      }

      // 更新用户
      const result = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, validatedInput.id))
        .returning()

      const user = result[0]
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        role: user.role,
        preferences: user.preferences as Record<string, any>,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }
    } catch (error) {
      if (error instanceof UserNotFoundError || error instanceof UserEmailExistsError) {
        throw error
      }
      console.error('更新用户失败:', error)
      throw new Error('更新用户信息失败')
    }
  }

  /**
   * 更新用户偏好设置
   */
  static async updateUserPreferences(input: UpdateUserPreferencesInput): Promise<UserOutput> {
    try {
      // 验证输入数据
      const validatedInput = updateUserPreferencesSchema.parse(input)

      // 检查用户是否存在
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, validatedInput.userId))
        .limit(1)
      if (existingUser.length === 0) {
        throw new UserNotFoundError(validatedInput.userId)
      }

      // 更新偏好设置
      const result = await db
        .update(users)
        .set({
          preferences: JSON.stringify(validatedInput.preferences),
          updatedAt: new Date()
        })
        .where(eq(users.id, validatedInput.userId))
        .returning()

      const user = result[0]
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        role: user.role,
        preferences: user.preferences as Record<string, any>,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error
      }
      console.error('更新用户偏好设置失败:', error)
      throw new Error('更新用户偏好设置失败')
    }
  }

  /**
   * 获取所有用户列表（为未来多用户支持预留）
   */
  static async getAllUsers(): Promise<UserListOutput> {
    try {
      const result = await db.select().from(users)

      const userList: UserOutput[] = result.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || undefined,
        role: user.role,
        preferences: user.preferences as Record<string, any>,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }))

      return {
        users: userList,
        total: userList.length
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw new Error('获取用户列表失败')
    }
  }

  /**
   * 删除用户（为未来功能预留）
   */
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, userId)).returning()
      return result.length > 0
    } catch (error) {
      console.error('删除用户失败:', error)
      throw new Error('删除用户失败')
    }
  }

  /**
   * 初始化默认用户（用于首次启动时）
   */
  static async initializeDefaultUser(): Promise<UserOutput> {
    try {
      // 检查是否已有用户
      const existingUsers = await this.getAllUsers()
      if (existingUsers.total > 0) {
        return existingUsers.users[0]
      }

      // 创建默认用户（使用原来硬编码的数据）
      const defaultUser: CreateUserInput = {
        name: 'Wibus Wu',
        email: 'i@wibus.ren',
        avatar: 'https://github.com/wibus-wee.png',
        role: 'founder'
      }

      return await this.createUser(defaultUser)
    } catch (error) {
      console.error('初始化默认用户失败:', error)
      throw new Error('初始化默认用户失败')
    }
  }
}

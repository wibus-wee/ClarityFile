import { UserService } from '../services/user.service'
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserPreferencesInput,
  GetUserInput
} from '../types/user-schemas'
import { UserNotFoundError, UserEmailExistsError } from '../types/user-schemas'
import { ZodError } from 'zod'
import { ITipc } from '../types'

export function userRouter(t: ITipc) {
  return {
    // 获取当前用户信息
    getCurrentUser: t.procedure.action(async () => {
      try {
        return await UserService.getCurrentUser()
      } catch (error) {
        console.error('获取当前用户失败:', error)
        throw new Error(error instanceof Error ? error.message : '获取用户信息失败')
      }
    }),

    // 根据ID获取用户信息
    getUserById: t.procedure.input<GetUserInput>().action(async ({ input }) => {
      try {
        return await UserService.getUserById(input)
      } catch (error) {
        console.error('获取用户失败:', error)
        throw new Error(error instanceof Error ? error.message : '获取用户信息失败')
      }
    }),

    // 创建用户
    createUser: t.procedure.input<CreateUserInput>().action(async ({ input }) => {
      try {
        return await UserService.createUser(input)
      } catch (error) {
        if (error instanceof UserEmailExistsError) {
          throw error
        }
        if (error instanceof ZodError) {
          throw new Error(`数据验证失败: ${error.issues.map((e) => e.message).join(', ')}`)
        }
        console.error('创建用户失败:', error)
        throw new Error(error instanceof Error ? error.message : '创建用户失败')
      }
    }),

    // 更新用户信息
    updateUser: t.procedure.input<UpdateUserInput>().action(async ({ input }) => {
      try {
        return await UserService.updateUser(input)
      } catch (error) {
        if (error instanceof UserNotFoundError || error instanceof UserEmailExistsError) {
          throw error
        }
        if (error instanceof ZodError) {
          throw new Error(`数据验证失败: ${error.issues.map((e) => e.message).join(', ')}`)
        }
        console.error('更新用户失败:', error)
        throw new Error(error instanceof Error ? error.message : '更新用户信息失败')
      }
    }),

    // 更新用户偏好设置
    updateUserPreferences: t.procedure
      .input<UpdateUserPreferencesInput>()
      .action(async ({ input }) => {
        try {
          return await UserService.updateUserPreferences(input)
        } catch (error) {
          if (error instanceof UserNotFoundError) {
            throw error
          }
          console.error('更新用户偏好设置失败:', error)
          throw new Error(error instanceof Error ? error.message : '更新用户偏好设置失败')
        }
      }),

    // 获取所有用户列表（为未来多用户支持预留）
    getAllUsers: t.procedure.action(async () => {
      try {
        return await UserService.getAllUsers()
      } catch (error) {
        console.error('获取用户列表失败:', error)
        throw new Error(error instanceof Error ? error.message : '获取用户列表失败')
      }
    }),

    // 删除用户（为未来功能预留）
    deleteUser: t.procedure.input<{ userId: string }>().action(async ({ input }) => {
      try {
        const success = await UserService.deleteUser(input.userId)
        return { success }
      } catch (error) {
        console.error('删除用户失败:', error)
        throw new Error(error instanceof Error ? error.message : '删除用户失败')
      }
    }),

    // 初始化默认用户（用于首次启动时）
    initializeDefaultUser: t.procedure.action(async () => {
      try {
        return await UserService.initializeDefaultUser()
      } catch (error) {
        console.error('初始化默认用户失败:', error)
        throw new Error(error instanceof Error ? error.message : '初始化默认用户失败')
      }
    }),

    // 检查用户是否存在
    checkUserExists: t.procedure.action(async () => {
      try {
        const user = await UserService.getCurrentUser()
        return { exists: user !== null, user }
      } catch (error) {
        console.error('检查用户是否存在失败:', error)
        return { exists: false, user: null }
      }
    })
  }
}

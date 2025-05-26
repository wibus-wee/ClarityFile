import { tipc } from '@egoist/tipc/main'
import { db } from './db'
import { projects, logicalDocuments, managedFiles, tags, settings } from '../db/schema'
import { eq, desc, like, and } from 'drizzle-orm'

const t = tipc.create()

// 设置相关 API

// 项目相关的 API
export const router = {
  // 获取所有项目
  getProjects: t.procedure.action(async () => {
    const result = await db.select().from(projects).orderBy(desc(projects.updatedAt))
    return result
  }),

  // 根据 ID 获取项目
  getProject: t.procedure.input<{ id: string }>().action(async ({ input }) => {
    const result = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1)
    return result[0] || null
  }),

  // 创建项目
  createProject: t.procedure
    .input<{
      name: string
      description?: string
      status?: string
    }>()
    .action(async ({ input }) => {
      const result = await db
        .insert(projects)
        .values({
          name: input.name,
          description: input.description,
          status: input.status || 'active'
        })
        .returning()
      return result[0]
    }),

  // 更新项目
  updateProject: t.procedure
    .input<{
      id: string
      name?: string
      description?: string
      status?: string
    }>()
    .action(async ({ input }) => {
      const { id, ...updateData } = input
      const result = await db
        .update(projects)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(projects.id, id))
        .returning()
      return result[0]
    }),

  // 删除项目
  deleteProject: t.procedure.input<{ id: string }>().action(async ({ input }) => {
    await db.delete(projects).where(eq(projects.id, input.id))
    return { success: true }
  }),

  // 搜索项目
  searchProjects: t.procedure.input<{ query: string }>().action(async ({ input }) => {
    const result = await db
      .select()
      .from(projects)
      .where(and(like(projects.name, `%${input.query}%`), eq(projects.status, 'active')))
      .orderBy(desc(projects.updatedAt))
    return result
  }),

  // 获取项目的逻辑文档
  getProjectDocuments: t.procedure.input<{ projectId: string }>().action(async ({ input }) => {
    const result = await db
      .select()
      .from(logicalDocuments)
      .where(eq(logicalDocuments.projectId, input.projectId))
      .orderBy(desc(logicalDocuments.updatedAt))
    return result
  }),

  // 创建逻辑文档
  createLogicalDocument: t.procedure
    .input<{
      projectId: string
      name: string
      type: string
      description?: string
      defaultStoragePathSegment?: string
    }>()
    .action(async ({ input }) => {
      const result = await db.insert(logicalDocuments).values(input).returning()
      return result[0]
    }),

  // 获取所有标签
  getTags: t.procedure.action(async () => {
    const result = await db.select().from(tags).orderBy(tags.name)
    return result
  }),

  // 创建标签
  createTag: t.procedure
    .input<{
      name: string
      color?: string
    }>()
    .action(async ({ input }) => {
      const result = await db.insert(tags).values(input).returning()
      return result[0]
    }),

  // 获取管理的文件
  getManagedFiles: t.procedure
    .input<{ limit?: number; offset?: number }>()
    .action(async ({ input }) => {
      const limit = input.limit || 50
      const offset = input.offset || 0

      const result = await db
        .select()
        .from(managedFiles)
        .orderBy(desc(managedFiles.createdAt))
        .limit(limit)
        .offset(offset)
      return result
    }),

  // 创建管理的文件记录
  createManagedFile: t.procedure
    .input<{
      name: string
      physicalPath: string
      fileHash?: string
    }>()
    .action(async ({ input }) => {
      const result = await db.insert(managedFiles).values(input).returning()
      return result[0]
    }),

  // 系统信息
  getSystemInfo: t.procedure.action(async () => {
    const projectCount = await db
      .select()
      .from(projects)
      .then((r) => r.length)
    const documentCount = await db
      .select()
      .from(logicalDocuments)
      .then((r) => r.length)
    const fileCount = await db
      .select()
      .from(managedFiles)
      .then((r) => r.length)

    return {
      projectCount,
      documentCount,
      fileCount,
      timestamp: new Date().toISOString()
    }
  }),

  // 设置相关 API

  // 获取所有设置
  getSettings: t.procedure.action(async () => {
    const result = await db.select().from(settings).orderBy(settings.category, settings.key)
    return result
  }),

  // 根据分类获取设置
  getSettingsByCategory: t.procedure.input<{ category: string }>().action(async ({ input }) => {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.category, input.category))
      .orderBy(settings.key)
    return result
  }),

  // 根据键获取单个设置
  getSetting: t.procedure.input<{ key: string }>().action(async ({ input }) => {
    const result = await db.select().from(settings).where(eq(settings.key, input.key)).limit(1)
    return result[0] || null
  }),

  // 创建或更新设置
  setSetting: t.procedure
    .input<{
      key: string
      value: any
      category: string
      description?: string
      isUserModifiable?: boolean
    }>()
    .action(async ({ input }) => {
      // 先检查设置是否已存在
      const existing = await db.select().from(settings).where(eq(settings.key, input.key)).limit(1)

      if (existing.length > 0) {
        // 更新现有设置
        const result = await db
          .update(settings)
          .set({
            value: JSON.stringify(input.value),
            category: input.category,
            isUserModifiable: input.isUserModifiable ?? true,
            updatedAt: new Date()
          })
          .where(eq(settings.key, input.key))
          .returning()
        return result[0]
      } else {
        // 创建新设置
        const result = await db
          .insert(settings)
          .values({
            key: input.key,
            value: JSON.stringify(input.value),
            category: input.category,
            isUserModifiable: input.isUserModifiable ?? true
          })
          .returning()
        return result[0]
      }
    }),

  // 批量设置多个配置
  setSettings: t.procedure
    .input<
      Array<{
        key: string
        value: any
        category: string
        description?: string
        isUserModifiable?: boolean
      }>
    >()
    .action(async ({ input }) => {
      const results: any[] = []

      for (const setting of input) {
        const existing = await db
          .select()
          .from(settings)
          .where(eq(settings.key, setting.key))
          .limit(1)

        if (existing.length > 0) {
          // 更新现有设置
          const result = await db
            .update(settings)
            .set({
              value: JSON.stringify(setting.value),
              category: setting.category,
              isUserModifiable: setting.isUserModifiable ?? true,
              updatedAt: new Date()
            })
            .where(eq(settings.key, setting.key))
            .returning()
          results.push(result[0])
        } else {
          // 创建新设置
          const result = await db
            .insert(settings)
            .values({
              key: setting.key,
              value: JSON.stringify(setting.value),
              category: setting.category,
              isUserModifiable: setting.isUserModifiable ?? true
            })
            .returning()
          results.push(result[0])
        }
      }

      return results
    }),

  // 删除设置
  deleteSetting: t.procedure.input<{ key: string }>().action(async ({ input }) => {
    // 检查设置是否允许用户修改
    const setting = await db.select().from(settings).where(eq(settings.key, input.key)).limit(1)

    if (setting.length === 0) {
      throw new Error('设置不存在')
    }

    if (!setting[0].isUserModifiable) {
      throw new Error('此设置不允许删除')
    }

    await db.delete(settings).where(eq(settings.key, input.key))
    return { success: true }
  }),

  // 重置设置到默认值
  resetSettings: t.procedure.input<{ category?: string }>().action(async ({ input }) => {
    if (input.category) {
      // 重置特定分类的设置
      await db
        .delete(settings)
        .where(and(eq(settings.category, input.category), eq(settings.isUserModifiable, true)))
    } else {
      // 重置所有用户可修改的设置
      await db.delete(settings).where(eq(settings.isUserModifiable, true))
    }
    return { success: true }
  }),

  // 获取设置分类列表
  getSettingsCategories: t.procedure.action(async () => {
    const result = await db
      .selectDistinct({ category: settings.category })
      .from(settings)
      .orderBy(settings.category)
    return result.map((r) => r.category)
  })
}

export type Router = typeof router

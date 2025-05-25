import { tipc } from '@egoist/tipc/main'
import { db } from './db'
import { projects, logicalDocuments, managedFiles, tags } from '../db/schema'
import { eq, desc, like, and } from 'drizzle-orm'

const t = tipc.create()

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
  })
}

export type Router = typeof router

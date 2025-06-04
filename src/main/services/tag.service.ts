import { db } from '../db'
import { tags, projectTags } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import type { CreateTagInput } from '../types/inputs'

export class TagService {
  // 获取所有标签
  static async getTags() {
    const result = await db.select().from(tags).orderBy(tags.name)
    return result
  }

  // 创建标签
  static async createTag(input: CreateTagInput) {
    const result = await db.insert(tags).values(input).returning()
    return result[0]
  }

  /**
   * 获取项目的所有标签
   */
  static async getProjectTags(projectId: string) {
    const projectTagsData = await db
      .select({
        tagId: tags.id,
        tagName: tags.name,
        tagColor: tags.color,
        tagCreatedAt: tags.createdAt,
        associatedAt: projectTags.createdAt
      })
      .from(projectTags)
      .innerJoin(tags, eq(projectTags.tagId, tags.id))
      .where(eq(projectTags.projectId, projectId))
      .orderBy(desc(projectTags.createdAt))

    return projectTagsData
  }

  /**
   * 为项目添加标签
   */
  static async addTagToProject(input: { projectId: string; tagId: string }) {
    const result = await db
      .insert(projectTags)
      .values({
        projectId: input.projectId,
        tagId: input.tagId
      })
      .returning()

    console.log(`标签已添加到项目`)
    return result[0]
  }

  /**
   * 从项目中移除标签
   */
  static async removeTagFromProject(input: { projectId: string; tagId: string }) {
    const result = await db
      .delete(projectTags)
      .where(eq(projectTags.projectId, input.projectId) && eq(projectTags.tagId, input.tagId))
      .returning()

    console.log(`标签已从项目中移除`)
    return { success: true }
  }

  /**
   * 更新标签
   */
  static async updateTag(input: { id: string; name?: string; color?: string }) {
    const result = await db
      .update(tags)
      .set({
        name: input.name,
        color: input.color,
        updatedAt: new Date()
      })
      .where(eq(tags.id, input.id))
      .returning()

    console.log(`标签 "${input.id}" 更新成功`)
    return result[0]
  }

  /**
   * 删除标签
   */
  static async deleteTag(id: string) {
    // 先删除项目关联
    await db.delete(projectTags).where(eq(projectTags.tagId, id))

    // 再删除标签本身
    const result = await db.delete(tags).where(eq(tags.id, id)).returning()

    console.log(`标签 "${id}" 删除成功`)
    return { success: true }
  }

  /**
   * 获取标签统计信息
   */
  static async getTagStatistics() {
    const allTags = await this.getTags()

    // 统计每个标签被使用的次数
    const tagUsage = await Promise.all(
      allTags.map(async (tag) => {
        const usage = await db
          .select({ count: projectTags.projectId })
          .from(projectTags)
          .where(eq(projectTags.tagId, tag.id))

        return {
          tagId: tag.id,
          tagName: tag.name,
          usageCount: usage.length
        }
      })
    )

    return {
      totalTags: allTags.length,
      tagUsage
    }
  }
}

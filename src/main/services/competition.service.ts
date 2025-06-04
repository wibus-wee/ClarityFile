import { db } from '../db'
import {
  competitionSeries,
  competitionMilestones,
  projectCompetitionMilestones,
  managedFiles
} from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

/**
 * 赛事管理服务
 * 负责赛事系列、里程碑和项目参赛情况的CRUD操作和业务逻辑
 */
export class CompetitionService {
  /**
   * 获取项目参与的赛事里程碑
   */
  static async getProjectCompetitions(projectId: string) {
    const competitions = await db
      .select({
        // 项目参赛信息
        statusInMilestone: projectCompetitionMilestones.statusInMilestone,
        participatedAt: projectCompetitionMilestones.createdAt,
        // 里程碑信息
        milestoneId: competitionMilestones.id,
        levelName: competitionMilestones.levelName,
        dueDateMilestone: competitionMilestones.dueDate,
        milestoneNotes: competitionMilestones.description,
        milestoneCreatedAt: competitionMilestones.createdAt,
        milestoneUpdatedAt: competitionMilestones.updatedAt,
        // 赛事系列信息
        seriesId: competitionSeries.id,
        seriesName: competitionSeries.name,
        seriesNotes: competitionSeries.description,
        seriesCreatedAt: competitionSeries.createdAt,
        seriesUpdatedAt: competitionSeries.updatedAt,
        // 通知文件信息（可能为空）
        notificationFileName: managedFiles.name,
        notificationOriginalFileName: managedFiles.originalFileName,
        notificationPhysicalPath: managedFiles.physicalPath,
        notificationMimeType: managedFiles.mimeType,
        notificationFileSizeBytes: managedFiles.fileSizeBytes,
        notificationUploadedAt: managedFiles.uploadedAt
      })
      .from(projectCompetitionMilestones)
      .innerJoin(
        competitionMilestones,
        eq(projectCompetitionMilestones.competitionMilestoneId, competitionMilestones.id)
      )
      .innerJoin(
        competitionSeries,
        eq(competitionMilestones.competitionSeriesId, competitionSeries.id)
      )
      .leftJoin(managedFiles, eq(competitionMilestones.notificationManagedFileId, managedFiles.id))
      .where(eq(projectCompetitionMilestones.projectId, projectId))
      .orderBy(desc(projectCompetitionMilestones.createdAt))

    return competitions
  }

  /**
   * 获取所有赛事系列
   */
  static async getAllCompetitionSeries() {
    const series = await db
      .select()
      .from(competitionSeries)
      .orderBy(desc(competitionSeries.createdAt))

    return series
  }

  /**
   * 获取赛事系列的所有里程碑
   */
  static async getCompetitionMilestones(seriesId: string) {
    const milestones = await db
      .select({
        id: competitionMilestones.id,
        levelName: competitionMilestones.levelName,
        dueDate: competitionMilestones.dueDate,
        description: competitionMilestones.description,
        customFields: competitionMilestones.customFields,
        createdAt: competitionMilestones.createdAt,
        updatedAt: competitionMilestones.updatedAt,
        // 通知文件信息
        notificationFileName: managedFiles.name,
        notificationOriginalFileName: managedFiles.originalFileName,
        notificationPhysicalPath: managedFiles.physicalPath,
        notificationMimeType: managedFiles.mimeType,
        notificationFileSizeBytes: managedFiles.fileSizeBytes,
        notificationUploadedAt: managedFiles.uploadedAt
      })
      .from(competitionMilestones)
      .leftJoin(managedFiles, eq(competitionMilestones.notificationManagedFileId, managedFiles.id))
      .where(eq(competitionMilestones.competitionSeriesId, seriesId))
      .orderBy(competitionMilestones.dueDate)

    return milestones
  }

  /**
   * 创建赛事系列
   */
  static async createCompetitionSeries(input: {
    name: string
    description?: string
    customFields?: unknown
  }) {
    const result = await db
      .insert(competitionSeries)
      .values({
        name: input.name,
        description: input.description,
        customFields: input.customFields
      })
      .returning()

    console.log(`赛事系列 "${input.name}" 创建成功`)
    return result[0]
  }

  /**
   * 创建赛事里程碑
   */
  static async createCompetitionMilestone(input: {
    competitionSeriesId: string
    levelName: string
    dueDate?: Date
    description?: string
    notificationManagedFileId?: string
    customFields?: unknown
  }) {
    const result = await db
      .insert(competitionMilestones)
      .values({
        competitionSeriesId: input.competitionSeriesId,
        levelName: input.levelName,
        dueDate: input.dueDate,
        description: input.description,
        notificationManagedFileId: input.notificationManagedFileId,
        customFields: input.customFields
      })
      .returning()

    console.log(`赛事里程碑 "${input.levelName}" 创建成功`)
    return result[0]
  }

  /**
   * 项目参与赛事里程碑
   */
  static async addProjectToCompetition(input: {
    projectId: string
    competitionMilestoneId: string
    statusInMilestone?: string
  }) {
    const result = await db
      .insert(projectCompetitionMilestones)
      .values({
        projectId: input.projectId,
        competitionMilestoneId: input.competitionMilestoneId,
        statusInMilestone: input.statusInMilestone
      })
      .returning()

    console.log(`项目已参与赛事里程碑`)
    return result[0]
  }

  /**
   * 更新项目在赛事中的状态
   */
  static async updateProjectCompetitionStatus(input: {
    projectId: string
    competitionMilestoneId: string
    statusInMilestone: string
  }) {
    const result = await db
      .update(projectCompetitionMilestones)
      .set({
        statusInMilestone: input.statusInMilestone,
        updatedAt: new Date()
      })
      .where(
        eq(projectCompetitionMilestones.projectId, input.projectId) &&
          eq(projectCompetitionMilestones.competitionMilestoneId, input.competitionMilestoneId)
      )
      .returning()

    console.log(`项目赛事状态已更新`)
    return result[0]
  }

  /**
   * 删除赛事系列
   */
  static async deleteCompetitionSeries(id: string) {
    // 先删除相关的里程碑和项目参与记录
    const milestones = await db
      .select({ id: competitionMilestones.id })
      .from(competitionMilestones)
      .where(eq(competitionMilestones.competitionSeriesId, id))

    for (const milestone of milestones) {
      await db
        .delete(projectCompetitionMilestones)
        .where(eq(projectCompetitionMilestones.competitionMilestoneId, milestone.id))
    }

    await db.delete(competitionMilestones).where(eq(competitionMilestones.competitionSeriesId, id))

    // 删除赛事系列
    const result = await db
      .delete(competitionSeries)
      .where(eq(competitionSeries.id, id))
      .returning()

    console.log(`赛事系列 "${id}" 删除成功`)
    return { success: true }
  }

  /**
   * 获取赛事统计信息
   */
  static async getCompetitionStatistics() {
    const series = await this.getAllCompetitionSeries()

    let totalMilestones = 0
    for (const s of series) {
      const milestones = await this.getCompetitionMilestones(s.id)
      totalMilestones += milestones.length
    }

    return {
      seriesCount: series.length,
      milestoneCount: totalMilestones
    }
  }
}

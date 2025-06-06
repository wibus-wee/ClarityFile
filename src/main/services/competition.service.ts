import { db } from '../db'
import {
  competitionSeries,
  competitionMilestones,
  projectCompetitionMilestones,
  managedFiles
} from '../../db/schema'
import { eq, desc, gte, lte, and, count, sql } from 'drizzle-orm'

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
        dueDateMilestone: competitionMilestones.dueDateMilestone,
        milestoneNotes: competitionMilestones.notes,
        milestoneCreatedAt: competitionMilestones.createdAt,
        milestoneUpdatedAt: competitionMilestones.updatedAt,
        // 赛事系列信息
        seriesId: competitionSeries.id,
        seriesName: competitionSeries.name,
        seriesNotes: competitionSeries.notes,
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
        dueDate: competitionMilestones.dueDateMilestone,
        description: competitionMilestones.notes,
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
      .orderBy(competitionMilestones.dueDateMilestone)

    return milestones
  }

  /**
   * 创建赛事系列
   */
  static async createCompetitionSeries(input: { name: string; notes?: string }) {
    const result = await db
      .insert(competitionSeries)
      .values({
        name: input.name,
        notes: input.notes
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
    dueDateMilestone?: Date
    notes?: string
    notificationManagedFileId?: string
  }) {
    const result = await db
      .insert(competitionMilestones)
      .values({
        competitionSeriesId: input.competitionSeriesId,
        levelName: input.levelName,
        dueDateMilestone: input.dueDateMilestone,
        notes: input.notes,
        notificationManagedFileId: input.notificationManagedFileId
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
        statusInMilestone: input.statusInMilestone
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
   * 移除项目与赛事的关联
   */
  static async removeProjectFromCompetition(input: {
    projectId: string
    competitionMilestoneId: string
  }) {
    await db
      .delete(projectCompetitionMilestones)
      .where(
        eq(projectCompetitionMilestones.projectId, input.projectId) &&
          eq(projectCompetitionMilestones.competitionMilestoneId, input.competitionMilestoneId)
      )

    console.log(`项目已从赛事中移除`)
    return { success: true }
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
    await db.delete(competitionSeries).where(eq(competitionSeries.id, id)).returning()

    console.log(`赛事系列 "${id}" 删除成功`)
    return { success: true }
  }

  /**
   * 更新赛事系列
   */
  static async updateCompetitionSeries(id: string, input: { name?: string; notes?: string }) {
    const result = await db
      .update(competitionSeries)
      .set({
        name: input.name,
        notes: input.notes,
        updatedAt: new Date()
      })
      .where(eq(competitionSeries.id, id))
      .returning()

    console.log(`赛事系列 "${id}" 更新成功`)
    return result[0]
  }

  /**
   * 更新赛事里程碑
   */
  static async updateCompetitionMilestone(
    id: string,
    input: {
      levelName?: string
      dueDateMilestone?: Date
      notes?: string
      notificationManagedFileId?: string
    }
  ) {
    const result = await db
      .update(competitionMilestones)
      .set({
        levelName: input.levelName,
        dueDateMilestone: input.dueDateMilestone,
        notes: input.notes,
        notificationManagedFileId: input.notificationManagedFileId,
        updatedAt: new Date()
      })
      .where(eq(competitionMilestones.id, id))
      .returning()

    console.log(`赛事里程碑 "${id}" 更新成功`)
    return result[0]
  }

  /**
   * 删除赛事里程碑
   */
  static async deleteCompetitionMilestone(id: string) {
    // 先删除相关的项目参与记录
    await db
      .delete(projectCompetitionMilestones)
      .where(eq(projectCompetitionMilestones.competitionMilestoneId, id))

    // 删除里程碑
    await db.delete(competitionMilestones).where(eq(competitionMilestones.id, id))

    console.log(`赛事里程碑 "${id}" 删除成功`)
    return { success: true }
  }

  /**
   * 获取赛事中心概览数据
   */
  static async getCompetitionOverview() {
    // 获取所有赛事系列及其统计信息
    const seriesWithStats = await db
      .select({
        id: competitionSeries.id,
        name: competitionSeries.name,
        notes: competitionSeries.notes,
        createdAt: competitionSeries.createdAt,
        updatedAt: competitionSeries.updatedAt,
        milestoneCount: count(competitionMilestones.id)
      })
      .from(competitionSeries)
      .leftJoin(
        competitionMilestones,
        eq(competitionSeries.id, competitionMilestones.competitionSeriesId)
      )
      .groupBy(competitionSeries.id)
      .orderBy(desc(competitionSeries.createdAt))

    // 获取总体统计
    const totalStats = await db
      .select({
        totalSeries: count(competitionSeries.id),
        totalMilestones: count(competitionMilestones.id),
        totalParticipations: count(projectCompetitionMilestones.projectId)
      })
      .from(competitionSeries)
      .leftJoin(
        competitionMilestones,
        eq(competitionSeries.id, competitionMilestones.competitionSeriesId)
      )
      .leftJoin(
        projectCompetitionMilestones,
        eq(competitionMilestones.id, projectCompetitionMilestones.competitionMilestoneId)
      )

    return {
      seriesWithStats,
      totalStats: totalStats[0]
    }
  }

  /**
   * 获取即将到来的里程碑
   */
  static async getUpcomingMilestones(limit: number = 10) {
    const now = new Date()

    const upcomingMilestones = await db
      .select({
        id: competitionMilestones.id,
        levelName: competitionMilestones.levelName,
        dueDate: competitionMilestones.dueDateMilestone,
        notes: competitionMilestones.notes,
        seriesId: competitionSeries.id,
        seriesName: competitionSeries.name,
        participatingProjectsCount: count(projectCompetitionMilestones.projectId)
      })
      .from(competitionMilestones)
      .innerJoin(
        competitionSeries,
        eq(competitionMilestones.competitionSeriesId, competitionSeries.id)
      )
      .leftJoin(
        projectCompetitionMilestones,
        eq(competitionMilestones.id, projectCompetitionMilestones.competitionMilestoneId)
      )
      .where(gte(competitionMilestones.dueDateMilestone, now))
      .groupBy(competitionMilestones.id, competitionSeries.id)
      .orderBy(competitionMilestones.dueDateMilestone)
      .limit(limit)

    return upcomingMilestones
  }

  /**
   * 按日期范围获取里程碑（用于日历视图）
   */
  static async getMilestonesByDateRange(startDate: Date, endDate: Date) {
    const milestones = await db
      .select({
        id: competitionMilestones.id,
        levelName: competitionMilestones.levelName,
        dueDate: competitionMilestones.dueDateMilestone,
        notes: competitionMilestones.notes,
        seriesId: competitionSeries.id,
        seriesName: competitionSeries.name,
        participatingProjectsCount: count(projectCompetitionMilestones.projectId)
      })
      .from(competitionMilestones)
      .innerJoin(
        competitionSeries,
        eq(competitionMilestones.competitionSeriesId, competitionSeries.id)
      )
      .leftJoin(
        projectCompetitionMilestones,
        eq(competitionMilestones.id, projectCompetitionMilestones.competitionMilestoneId)
      )
      .where(
        and(
          gte(competitionMilestones.dueDateMilestone, startDate),
          lte(competitionMilestones.dueDateMilestone, endDate)
        )
      )
      .groupBy(competitionMilestones.id, competitionSeries.id)
      .orderBy(competitionMilestones.dueDateMilestone)

    return milestones
  }

  /**
   * 获取赛事时间轴数据
   */
  static async getCompetitionTimeline() {
    const timelineItems = await db
      .select({
        id: competitionMilestones.id,
        type: sql<string>`'milestone'`,
        title: competitionMilestones.levelName,
        date: competitionMilestones.dueDateMilestone,
        description: competitionMilestones.notes,
        seriesId: competitionSeries.id,
        seriesName: competitionSeries.name,
        participatingProjectsCount: count(projectCompetitionMilestones.projectId)
      })
      .from(competitionMilestones)
      .innerJoin(
        competitionSeries,
        eq(competitionMilestones.competitionSeriesId, competitionSeries.id)
      )
      .leftJoin(
        projectCompetitionMilestones,
        eq(competitionMilestones.id, projectCompetitionMilestones.competitionMilestoneId)
      )
      .groupBy(competitionMilestones.id, competitionSeries.id)
      .orderBy(desc(competitionMilestones.dueDateMilestone))

    return timelineItems
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

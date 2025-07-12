import { db } from '../db'
import {
  competitionSeries,
  competitionMilestones,
  projectCompetitionMilestones,
  managedFiles,
  projects,
  documentVersions,
  logicalDocuments
} from '../../db/schema'
import { eq, desc, gte, lte, and, count, sql } from 'drizzle-orm'
import {
  validateCreateCompetitionSeries,
  validateUpdateCompetitionSeries,
  validateCreateCompetitionMilestone,
  validateUpdateCompetitionMilestone,
  validateAddProjectToCompetition,
  CompetitionMilestoneOutput
} from '../types/competition-schemas'

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
   * 获取比赛里程碑关联的文档版本
   */
  static async getCompetitionMilestoneDocuments(competitionMilestoneId: string) {
    const documents = await db
      .select({
        // 文档版本信息
        versionId: documentVersions.id,
        versionTag: documentVersions.versionTag,
        isGenericVersion: documentVersions.isGenericVersion,
        versionNotes: documentVersions.notes,
        versionCreatedAt: documentVersions.createdAt,
        versionUpdatedAt: documentVersions.updatedAt,
        // 逻辑文档信息
        logicalDocumentId: logicalDocuments.id,
        documentName: logicalDocuments.name,
        documentType: logicalDocuments.type,
        documentDescription: logicalDocuments.description,
        documentStatus: logicalDocuments.status,
        // 文件信息
        managedFileId: managedFiles.id,
        fileName: managedFiles.name,
        originalFileName: managedFiles.originalFileName,
        physicalPath: managedFiles.physicalPath,
        mimeType: managedFiles.mimeType,
        fileSizeBytes: managedFiles.fileSizeBytes,
        fileHash: managedFiles.fileHash,
        uploadedAt: managedFiles.uploadedAt
      })
      .from(documentVersions)
      .innerJoin(logicalDocuments, eq(documentVersions.logicalDocumentId, logicalDocuments.id))
      .innerJoin(managedFiles, eq(documentVersions.managedFileId, managedFiles.id))
      .where(eq(documentVersions.competitionMilestoneId, competitionMilestoneId))
      .orderBy(desc(documentVersions.createdAt))

    return documents
  }

  /**
   * 获取项目参与的赛事里程碑（包含关联文档信息）
   */
  static async getProjectCompetitionsWithDocuments(projectId: string) {
    // 首先获取基本的比赛信息
    const competitions = await this.getProjectCompetitions(projectId)

    // 为每个比赛获取关联的文档
    const competitionsWithDocuments = await Promise.all(
      competitions.map(async (competition) => {
        const documents = await this.getCompetitionMilestoneDocuments(competition.milestoneId)
        return {
          ...competition,
          documents
        }
      })
    )

    return competitionsWithDocuments
  }

  /**
   * 获取所有赛事系列（包含统计信息）
   */
  static async getAllCompetitionSeries() {
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

    return seriesWithStats
  }

  /**
   * 获取赛事系列的所有里程碑
   */
  static async getCompetitionMilestones(seriesId: string): Promise<CompetitionMilestoneOutput[]> {
    const milestones = await db
      .select({
        id: competitionMilestones.id,
        competitionSeriesId: competitionMilestones.competitionSeriesId,
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
    // 使用 zod 验证输入
    const validatedInput = validateCreateCompetitionSeries(input)

    const result = await db
      .insert(competitionSeries)
      .values({
        name: validatedInput.name,
        notes: validatedInput.notes
      })
      .returning()

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
    // 使用 zod 验证输入
    const validatedInput = validateCreateCompetitionMilestone(input)

    const result = await db
      .insert(competitionMilestones)
      .values({
        competitionSeriesId: validatedInput.competitionSeriesId,
        levelName: validatedInput.levelName,
        dueDateMilestone: validatedInput.dueDateMilestone,
        notes: validatedInput.notes,
        notificationManagedFileId: validatedInput.notificationManagedFileId
      })
      .returning()

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
    // 使用 zod 验证输入
    const validatedInput = validateAddProjectToCompetition(input)

    const result = await db
      .insert(projectCompetitionMilestones)
      .values({
        projectId: validatedInput.projectId,
        competitionMilestoneId: validatedInput.competitionMilestoneId,
        statusInMilestone: validatedInput.statusInMilestone
      })
      .returning()

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
        and(
          eq(projectCompetitionMilestones.projectId, input.projectId),
          eq(projectCompetitionMilestones.competitionMilestoneId, input.competitionMilestoneId)
        )
      )
      .returning()

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
        and(
          eq(projectCompetitionMilestones.projectId, input.projectId),
          eq(projectCompetitionMilestones.competitionMilestoneId, input.competitionMilestoneId)
        )
      )

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

    return { success: true }
  }

  /**
   * 更新赛事系列
   */
  static async updateCompetitionSeries(id: string, input: { name?: string; notes?: string }) {
    // 使用 zod 验证输入
    const validatedInput = validateUpdateCompetitionSeries({ id, ...input })

    const result = await db
      .update(competitionSeries)
      .set({
        name: validatedInput.name,
        notes: validatedInput.notes,
        updatedAt: new Date()
      })
      .where(eq(competitionSeries.id, id))
      .returning()

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
    // 使用 zod 验证输入
    const validatedInput = validateUpdateCompetitionMilestone({ id, ...input })

    const result = await db
      .update(competitionMilestones)
      .set({
        levelName: validatedInput.levelName,
        dueDateMilestone: validatedInput.dueDateMilestone,
        notes: validatedInput.notes,
        notificationManagedFileId: validatedInput.notificationManagedFileId,
        updatedAt: new Date()
      })
      .where(eq(competitionMilestones.id, id))
      .returning()

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

  /**
   * 获取参与特定里程碑的项目列表
   */
  static async getMilestoneParticipatingProjects(milestoneId: string) {
    const participatingProjects = await db
      .select({
        projectId: projects.id,
        projectName: projects.name,
        projectDescription: projects.description,
        statusInMilestone: projectCompetitionMilestones.statusInMilestone,
        participatedAt: projectCompetitionMilestones.createdAt,
        projectCreatedAt: projects.createdAt,
        projectUpdatedAt: projects.updatedAt
      })
      .from(projectCompetitionMilestones)
      .innerJoin(projects, eq(projectCompetitionMilestones.projectId, projects.id))
      .where(eq(projectCompetitionMilestones.competitionMilestoneId, milestoneId))
      .orderBy(desc(projectCompetitionMilestones.createdAt))

    return participatingProjects
  }
}

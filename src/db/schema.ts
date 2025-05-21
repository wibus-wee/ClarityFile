import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  uniqueIndex,
  index,
  real
} from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import { randomUUID } from 'crypto' // For default UUID generation if desired at DB level (via $defaultFn)

// MARK: Core Tables

export const managedFiles = sqliteTable('managed_files', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  physicalPath: text('physical_path').notNull().unique(),
  // originalName: text('original_name'),
  // fileSizeBytes: integer('file_size_bytes'),
  fileHash: text('file_hash').unique(), // Can be null if not always calculated
  // mimeType: text('mime_type'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s', 'now') * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s', 'now') * 1000)`)
})

export const projects = sqliteTable(
  'projects',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').notNull().default('active'), // e.g., "active", "archived", "on_hold"
    currentCoverAssetId: text('current_cover_asset_id'), // FK to project_assets
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`)
  },
  (table) => [
    index('projects_current_cover_asset_idx').on(table.currentCoverAssetId)
    // FK for currentCoverAssetId will be defined in project_assets relations or directly here if preferred.
    // Let's define it in relations for clarity or within the project_assets table directly for Drizzle's FK syntax.
    // Drizzle prefers FKs defined in the table that HOLDS the foreign key column.
    // So, projects.currentCoverAssetId references project_assets.id
  ]
)

export const logicalDocuments = sqliteTable(
  'logical_documents',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type').notNull(), // e.g., "PPT系列", "商业计划书系列", "PPT模块库"
    description: text('description'),
    defaultStoragePathSegment: text('default_storage_path_segment'),
    status: text('status').notNull().default('active'), // e.g., "active", "archived", "deprecated"
    currentOfficialVersionId: text('current_official_version_id'), // FK to document_versions
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`)
  },
  (table) => [
    uniqueIndex('ld_project_name_unique_idx').on(table.projectId, table.name),
    index('ld_project_id_idx').on(table.projectId),
    index('ld_current_official_version_idx').on(table.currentOfficialVersionId)
  ]
)

export const documentVersions = sqliteTable(
  'document_versions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    logicalDocumentId: text('logical_document_id')
      .notNull()
      .references(() => logicalDocuments.id, { onDelete: 'cascade' }),
    managedFileId: text('managed_file_id')
      .notNull()
      .unique()
      .references(() => managedFiles.id, { onDelete: 'restrict' }), // Restrict deletion of file if version exists
    versionTag: text('version_tag').notNull(),
    isGenericVersion: integer('is_generic_version', { mode: 'boolean' }).notNull().default(false),
    competitionMilestoneId: text('competition_milestone_id').references(
      () => competitionMilestones.id,
      { onDelete: 'set null' }
    ),
    competitionProjectName: text('competition_project_name'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`)
  },
  (table) => [
    index('dv_logical_document_id_idx').on(table.logicalDocumentId),
    index('dv_managed_file_id_idx').on(table.managedFileId), // Unique constraint already handles indexing for this specific column
    index('dv_competition_milestone_id_idx').on(table.competitionMilestoneId)
  ]
)

export const competitionSeries = sqliteTable('competition_series', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull().unique(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s', 'now') * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s', 'now') * 1000)`)
})

export const competitionMilestones = sqliteTable(
  'competition_milestones',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    competitionSeriesId: text('competition_series_id')
      .notNull()
      .references(() => competitionSeries.id, { onDelete: 'cascade' }),
    levelName: text('level_name').notNull(),
    dueDateMilestone: integer('due_date_milestone', { mode: 'timestamp_ms' }),
    notificationManagedFileId: text('notification_managed_file_id').references(
      () => managedFiles.id,
      { onDelete: 'set null' }
    ), // If notification deleted, don't break milestone
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`)
  },
  (table) => [
    index('cm_competition_series_id_idx').on(table.competitionSeriesId),
    index('cm_notification_managed_file_id_idx').on(table.notificationManagedFileId)
  ]
)

export const sharedResources = sqliteTable(
  'shared_resources',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: text('name').notNull(),
    type: text('type').notNull(),
    managedFileId: text('managed_file_id')
      .notNull()
      .unique()
      .references(() => managedFiles.id, { onDelete: 'restrict' }),
    description: text('description'),
    customFields: text('custom_fields', { mode: 'json' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`)
  },
  (table) => [index('sr_managed_file_id_idx').on(table.managedFileId)]
)

export const projectAssets = sqliteTable(
  'project_assets',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    assetType: text('asset_type').notNull(),
    managedFileId: text('managed_file_id')
      .notNull()
      .unique()
      .references(() => managedFiles.id, { onDelete: 'restrict' }),
    contextDescription: text('context_description'),
    versionInfo: text('version_info'),
    customFields: text('custom_fields', { mode: 'json' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`)
  },
  (table) => [
    index('pa_project_id_idx').on(table.projectId),
    index('pa_managed_file_id_idx').on(table.managedFileId)
  ]
)

export const expenseTrackings = sqliteTable(
  'expense_trackings',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    itemName: text('item_name').notNull(),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    applicant: text('applicant').notNull(),
    amount: real('amount').notNull(),
    applicationDate: integer('application_date', { mode: 'timestamp_ms' }).notNull(),
    status: text('status').notNull(),
    invoiceManagedFileId: text('invoice_managed_file_id').references(() => managedFiles.id, {
      onDelete: 'set null'
    }),
    reimbursementDate: integer('reimbursement_date', { mode: 'timestamp_ms' }),
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`)
  },
  (table) => [
    index('et_project_id_idx').on(table.projectId),
    index('et_invoice_managed_file_id_idx').on(table.invoiceManagedFileId)
  ]
)

export const tags = sqliteTable('tags', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull().unique(),
  color: text('color'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s', 'now') * 1000)`)
})

// MARK: Junction Tables (Many-to-Many)

export const documentVersionTags = sqliteTable(
  'document_version_tags',
  {
    documentVersionId: text('document_version_id')
      .notNull()
      .references(() => documentVersions.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').notNull() //.references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.documentVersionId, table.tagId] }),
    index('dvt_document_version_id_idx').on(table.documentVersionId),
    index('dvt_tag_id_idx').on(table.tagId)
  ]
)

export const sharedResourceTags = sqliteTable(
  'shared_resource_tags',
  {
    sharedResourceId: text('shared_resource_id')
      .notNull()
      .references(() => sharedResources.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').notNull() //.references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.sharedResourceId, table.tagId] }),
    index('srt_shared_resource_id_idx').on(table.sharedResourceId),
    index('srt_tag_id_idx').on(table.tagId)
  ]
)

export const projectTags = sqliteTable(
  'project_tags',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').notNull() //.references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.tagId] }),
    index('pt_project_id_idx').on(table.projectId),
    index('pt_tag_id_idx').on(table.tagId)
  ]
)

export const projectAssetTags = sqliteTable(
  'project_asset_tags',
  {
    projectAssetId: text('project_asset_id')
      .notNull()
      .references(() => projectAssets.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').notNull() //.references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.projectAssetId, table.tagId] }),
    index('pat_project_asset_id_idx').on(table.projectAssetId),
    index('pat_tag_id_idx').on(table.tagId)
  ]
)

export const projectSharedResources = sqliteTable(
  'project_shared_resources',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    sharedResourceId: text('shared_resource_id')
      .notNull()
      .references(() => sharedResources.id, { onDelete: 'cascade' }),
    usageDescription: text('usage_description'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`)
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.sharedResourceId] }),
    index('psr_project_id_idx').on(table.projectId),
    index('psr_shared_resource_id_idx').on(table.sharedResourceId)
  ]
)

export const projectCompetitionMilestones = sqliteTable(
  'project_competition_milestones',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    competitionMilestoneId: text('competition_milestone_id')
      .notNull()
      .references(() => competitionMilestones.id, { onDelete: 'cascade' }),
    statusInMilestone: text('status_in_milestone'), // e.g., "已报名", "已晋级"
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(strftime('%s', 'now') * 1000)`)
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.competitionMilestoneId] }),
    index('pcm_project_id_idx').on(table.projectId),
    index('pcm_competition_milestone_id_idx').on(table.competitionMilestoneId)
  ]
)

// MARK: Drizzle Relations (for query building)

export const managedFilesRelations = relations(managedFiles, ({ many }) => ({
  documentVersions: many(documentVersions),
  sharedResources: many(sharedResources),
  projectAssets: many(projectAssets),
  expenseTrackingsInvoices: many(expenseTrackings), // For invoiceManagedFileId
  competitionMilestoneNotifications: many(competitionMilestones), // For notificationManagedFileId
  projectCovers: many(projects) // For project cover images if managed_files stores them directly (but we used project_assets)
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  currentCoverAsset: one(projectAssets, {
    fields: [projects.currentCoverAssetId],
    references: [projectAssets.id]
  }),
  logicalDocuments: many(logicalDocuments),
  projectAssets: many(projectAssets),
  expenseTrackings: many(expenseTrackings),
  projectTags: many(projectTags),
  projectSharedResources: many(projectSharedResources),
  projectCompetitionMilestones: many(projectCompetitionMilestones)
}))

export const logicalDocumentsRelations = relations(logicalDocuments, ({ one, many }) => ({
  project: one(projects, {
    fields: [logicalDocuments.projectId],
    references: [projects.id]
  }),
  documentVersions: many(documentVersions),
  currentOfficialVersion: one(documentVersions, {
    fields: [logicalDocuments.currentOfficialVersionId],
    references: [documentVersions.id],
    relationName: 'currentOfficialVersion' // Explicit relation name
  })
}))

export const documentVersionsRelations = relations(documentVersions, ({ one, many }) => ({
  logicalDocument: one(logicalDocuments, {
    fields: [documentVersions.logicalDocumentId],
    references: [logicalDocuments.id]
  }),
  managedFile: one(managedFiles, {
    fields: [documentVersions.managedFileId],
    references: [managedFiles.id]
  }),
  competitionMilestone: one(competitionMilestones, {
    fields: [documentVersions.competitionMilestoneId],
    references: [competitionMilestones.id]
  }),
  documentVersionTags: many(documentVersionTags)
}))

export const competitionSeriesRelations = relations(competitionSeries, ({ many }) => ({
  milestones: many(competitionMilestones)
}))

export const competitionMilestonesRelations = relations(competitionMilestones, ({ one, many }) => ({
  series: one(competitionSeries, {
    fields: [competitionMilestones.competitionSeriesId],
    references: [competitionSeries.id]
  }),
  notificationFile: one(managedFiles, {
    fields: [competitionMilestones.notificationManagedFileId],
    references: [managedFiles.id]
  }),
  documentVersions: many(documentVersions),
  projectCompetitionMilestones: many(projectCompetitionMilestones)
}))

export const sharedResourcesRelations = relations(sharedResources, ({ one, many }) => ({
  managedFile: one(managedFiles, {
    fields: [sharedResources.managedFileId],
    references: [managedFiles.id]
  }),
  sharedResourceTags: many(sharedResourceTags),
  projectSharedResources: many(projectSharedResources)
}))

export const projectAssetsRelations = relations(projectAssets, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectAssets.projectId],
    references: [projects.id]
  }),
  managedFile: one(managedFiles, {
    fields: [projectAssets.managedFileId],
    references: [managedFiles.id]
  }),
  projectAssetTags: many(projectAssetTags)
  // If an asset can be a cover for multiple projects (not our current design, but for future)
  // coveredProjects: many(projects, { relationName: 'coveredProjects' }),
}))

export const expenseTrackingsRelations = relations(expenseTrackings, ({ one }) => ({
  project: one(projects, {
    fields: [expenseTrackings.projectId],
    references: [projects.id]
  }),
  invoiceFile: one(managedFiles, {
    fields: [expenseTrackings.invoiceManagedFileId],
    references: [managedFiles.id]
  })
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  documentVersionTags: many(documentVersionTags),
  sharedResourceTags: many(sharedResourceTags),
  projectTags: many(projectTags),
  projectAssetTags: many(projectAssetTags)
}))

// MARK: Relations for Junction Tables

export const documentVersionTagsRelations = relations(documentVersionTags, ({ one }) => ({
  documentVersion: one(documentVersions, {
    fields: [documentVersionTags.documentVersionId],
    references: [documentVersions.id]
  }),
  tag: one(tags, {
    fields: [documentVersionTags.tagId],
    references: [tags.id]
  })
}))

export const sharedResourceTagsRelations = relations(sharedResourceTags, ({ one }) => ({
  sharedResource: one(sharedResources, {
    fields: [sharedResourceTags.sharedResourceId],
    references: [sharedResources.id]
  }),
  tag: one(tags, {
    fields: [sharedResourceTags.tagId],
    references: [tags.id]
  })
}))

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectTags.projectId],
    references: [projects.id]
  }),
  tag: one(tags, {
    fields: [projectTags.tagId],
    references: [tags.id]
  })
}))

export const projectAssetTagsRelations = relations(projectAssetTags, ({ one }) => ({
  projectAsset: one(projectAssets, {
    fields: [projectAssetTags.projectAssetId],
    references: [projectAssets.id]
  }),
  tag: one(tags, {
    fields: [projectAssetTags.tagId],
    references: [tags.id]
  })
}))

export const projectSharedResourcesRelations = relations(projectSharedResources, ({ one }) => ({
  project: one(projects, {
    fields: [projectSharedResources.projectId],
    references: [projects.id]
  }),
  sharedResource: one(sharedResources, {
    fields: [projectSharedResources.sharedResourceId],
    references: [sharedResources.id]
  })
}))

export const projectCompetitionMilestonesRelations = relations(
  projectCompetitionMilestones,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectCompetitionMilestones.projectId],
      references: [projects.id]
    }),
    competitionMilestone: one(competitionMilestones, {
      fields: [projectCompetitionMilestones.competitionMilestoneId],
      references: [competitionMilestones.id]
    })
  })
)

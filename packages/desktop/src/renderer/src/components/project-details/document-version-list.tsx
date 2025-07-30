import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import { FileText, Plus, Download, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import type {
  LogicalDocumentWithVersionsOutput,
  DocumentVersionOutput
} from '../../../../main/types/document-schemas'

interface DocumentVersionListProps {
  document: LogicalDocumentWithVersionsOutput
  isExpanded: boolean
  onAddVersion: (document: LogicalDocumentWithVersionsOutput) => void
  onEditVersion: (
    document: LogicalDocumentWithVersionsOutput,
    version: DocumentVersionOutput
  ) => void
  onDeleteVersion: (version: DocumentVersionOutput) => void
  onViewVersionDetails: (version: DocumentVersionOutput) => void
  onDownloadVersion: (version: DocumentVersionOutput) => void
}

export function DocumentVersionList({
  document,
  isExpanded,
  onAddVersion,
  onEditVersion,
  onDeleteVersion,
  onViewVersionDetails,
  onDownloadVersion
}: DocumentVersionListProps) {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.04, 0.62, 0.23, 0.98]
          }}
          className="border-t border-border bg-muted/20 overflow-hidden"
        >
          {document.versions.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: 0.1,
                ease: [0.04, 0.62, 0.23, 0.98]
              }}
              className="p-4 space-y-3"
            >
              <h4 className="text-sm font-medium text-muted-foreground">
                文档版本 ({document.versions.length})
              </h4>
              <div className="space-y-2">
                <AnimatePresence>
                  {document.versions.map((version: DocumentVersionOutput, versionIndex: number) => {
                    const isOfficialVersion = document.currentOfficialVersionId === version.id

                    return (
                      <motion.div
                        key={version.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                          delay: versionIndex * 0.05,
                          duration: 0.25,
                          ease: [0.04, 0.62, 0.23, 0.98]
                        }}
                        className="flex items-center justify-between p-3 bg-background rounded border"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{version.versionTag}</span>
                              {version.isGenericVersion && (
                                <Badge variant="secondary" className="text-xs">
                                  通用版本
                                </Badge>
                              )}
                              {isOfficialVersion && (
                                <Badge variant="default" className="text-xs">
                                  官方版本
                                </Badge>
                              )}
                              {version.competitionMilestone && (
                                <Badge variant="outline" className="text-xs">
                                  {version.competitionMilestone.series.name} -{' '}
                                  {version.competitionMilestone.levelName}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{version.originalFileName}</span>
                              <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                              {version.fileSizeBytes && (
                                <span>{(version.fileSizeBytes / 1024).toFixed(1)} KB</span>
                              )}
                            </div>
                            {version.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{version.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownloadVersion(version)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewVersionDetails(version)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditVersion(document, version)}>
                                <Edit className="w-4 h-4 mr-2" />
                                编辑版本
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDeleteVersion(version)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除版本
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: 0.1,
                ease: [0.04, 0.62, 0.23, 0.98]
              }}
              className="p-4 text-center text-muted-foreground"
            >
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无文档版本</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => onAddVersion(document)}
              >
                <Plus className="w-4 h-4 mr-2" />
                添加第一个版本
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Edit,
  Upload,
  MoreHorizontal,
  FileText,
  Calendar,
  Tag,
  FolderOpen,
  Settings
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { DocumentVersionList } from './document-version-list'
import { DocumentDialogs } from './document-dialogs'
import { DocumentSkeleton } from './document-skeleton'
import { useLogicalDocumentWithVersions } from '@renderer/hooks/use-tipc'

interface LogicalDocumentWithVersions {
  id: string
  name: string
  type: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
  projectId: string
  defaultStoragePathSegment?: string
  versions?: Array<{
    id: string
    versionTag: string
    fileName: string
    fileSize: number
    createdAt: string
    isGenericVersion: boolean
    competitionProjectName?: string
    notes?: string
    isCurrentOfficial?: boolean
  }>
}

export function DocumentDetail() {
  const { documentId } = useParams({ from: '/documents/$documentId' })
  const navigate = useNavigate()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  // 获取文档详细信息（包含版本列表）
  const {
    data: documentWithVersions,
    isLoading,
    mutate
  } = useLogicalDocumentWithVersions(documentId)

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 border-b">
          <DocumentSkeleton viewMode="list" />
        </div>
        <div className="flex-1 p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <DocumentSkeleton key={i} viewMode="list" />
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  if (!documentWithVersions) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.div
          className="text-center"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium mb-2">文档不存在</h3>
          <p className="text-muted-foreground mb-6">请检查文档ID是否正确，或者文档可能已被删除。</p>
          <Button onClick={() => navigate({ to: '/documents' })}>返回文档库</Button>
        </motion.div>
      </motion.div>
    )
  }

  const document = documentWithVersions as LogicalDocumentWithVersions
  const versions = (documentWithVersions as LogicalDocumentWithVersions)?.versions || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '活跃'
      case 'archived':
        return '已归档'
      case 'draft':
        return '草稿'
      default:
        return status
    }
  }

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleUpload = () => {
    setShowUploadDialog(true)
  }

  const handleDocumentUpdated = () => {
    mutate()
    setShowEditDialog(false)
  }

  const handleVersionUploaded = () => {
    mutate()
    setShowUploadDialog(false)
  }

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* 页面头部 */}
      <motion.div
        className="flex flex-col gap-4 p-6 border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/documents' })}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <motion.div
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <h1 className="text-2xl font-semibold">{document.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {document.description || '暂无描述'}
                </p>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Button onClick={handleUpload} className="gap-2">
              <Upload className="w-4 h-4" />
              上传版本
            </Button>
            <Button variant="outline" onClick={handleEdit} className="gap-2">
              <Edit className="w-4 h-4" />
              编辑
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑文档
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  上传版本
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  文档设置
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>

        {/* 文档信息 */}
        <motion.div
          className="flex items-center gap-6 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">类型:</span>
            <Badge variant="outline">{document.type}</Badge>
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.45 }}
          >
            <span className="text-muted-foreground">状态:</span>
            <Badge className={getStatusColor(document.status)}>
              {getStatusText(document.status)}
            </Badge>
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">创建时间:</span>
            <span>{new Date(document.createdAt).toLocaleDateString()}</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.55 }}
          >
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">更新时间:</span>
            <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
          </motion.div>
        </motion.div>

        {/* 存储路径 */}
        {document.defaultStoragePathSegment && (
          <motion.div
            className="flex items-center gap-2 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">存储路径:</span>
            <code className="px-2 py-1 bg-muted rounded text-xs">
              {document.defaultStoragePathSegment}
            </code>
          </motion.div>
        )}
      </motion.div>

      {/* 版本列表 */}
      <motion.div
        className="flex-1 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-2">版本历史</h2>
          <p className="text-sm text-muted-foreground">
            管理此文档的所有版本，包括通用版本和比赛专用版本。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <DocumentVersionList versions={versions} onAddVersion={handleUpload} onUpdate={mutate} />
        </motion.div>
      </motion.div>

      {/* 对话框 */}
      <DocumentDialogs
        showEditDialog={showEditDialog}
        showUploadDialog={showUploadDialog}
        onEditDialogChange={setShowEditDialog}
        onUploadDialogChange={setShowUploadDialog}
        onDocumentUpdated={handleDocumentUpdated}
        onVersionUploaded={handleVersionUploaded}
        document={document}
      />
    </motion.div>
  )
}

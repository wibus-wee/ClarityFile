import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { DocumentForm } from './document-form'
import { DocumentVersionUploadForm } from './document-version-upload-form'

interface DocumentDialogsProps {
  showCreateDialog?: boolean
  showEditDialog?: boolean
  showUploadDialog?: boolean
  onCreateDialogChange?: (open: boolean) => void
  onEditDialogChange?: (open: boolean) => void
  onUploadDialogChange?: (open: boolean) => void
  onDocumentCreated?: (data: any) => Promise<void>
  onDocumentUpdated?: () => void
  onVersionUploaded?: () => void
  projects?: Array<{ id: string; name: string }>
  documentTypes?: Array<{ value: string; label: string }>
  document?: any
}

export function DocumentDialogs({
  showCreateDialog,
  showEditDialog,
  showUploadDialog,
  onCreateDialogChange,
  onEditDialogChange,
  onUploadDialogChange,
  onDocumentCreated,
  onDocumentUpdated,
  onVersionUploaded,
  projects,
  documentTypes,
  document
}: DocumentDialogsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateSubmit = async (data: any) => {
    if (!onDocumentCreated) return
    setIsSubmitting(true)
    try {
      await onDocumentCreated(data)
    } catch (error) {
      console.error('创建文档失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (data: any) => {
    if (!onDocumentUpdated) return
    setIsSubmitting(true)
    try {
      // 这里调用更新文档的API
      console.log('更新文档:', data)
      onDocumentUpdated()
    } catch (error) {
      console.error('更新文档失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadSubmit = async (data: any) => {
    if (!onVersionUploaded) return
    setIsSubmitting(true)
    try {
      // 这里调用上传版本的API
      console.log('上传版本:', data)
      onVersionUploaded()
    } catch (error) {
      console.error('上传版本失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* 创建文档对话框 */}
      {showCreateDialog && (
        <Dialog open={showCreateDialog} onOpenChange={onCreateDialogChange}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>新建文档</DialogTitle>
              <DialogDescription>
                创建一个新的逻辑文档，用于管理同一类型文档的不同版本。
              </DialogDescription>
            </DialogHeader>
            <DocumentForm
              projects={projects || []}
              documentTypes={documentTypes || []}
              onSubmit={handleCreateSubmit}
              onCancel={() => onCreateDialogChange?.(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* 编辑文档对话框 */}
      {showEditDialog && document && (
        <Dialog open={showEditDialog} onOpenChange={onEditDialogChange}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>编辑文档</DialogTitle>
              <DialogDescription>修改文档的基本信息，如名称、类型、描述等。</DialogDescription>
            </DialogHeader>
            <DocumentForm
              projects={projects || []}
              documentTypes={documentTypes || []}
              initialData={document}
              onSubmit={handleEditSubmit}
              onCancel={() => onEditDialogChange?.(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* 上传版本对话框 */}
      {showUploadDialog && document && (
        <Dialog open={showUploadDialog} onOpenChange={onUploadDialogChange}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>上传文档版本</DialogTitle>
              <DialogDescription>为 "{document.name}" 上传一个新的文件版本。</DialogDescription>
            </DialogHeader>
            <DocumentVersionUploadForm
              document={document}
              onSubmit={handleUploadSubmit}
              onCancel={() => onUploadDialogChange?.(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

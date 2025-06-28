import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, FileStack, Search, ArrowLeft } from 'lucide-react'

import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { ImportContextProvider } from '../../core/import-context'
import type { ImportContextData } from '../../core/types'
import type { LogicalDocumentOutput } from '@main/types/document-schemas'
import { SimpleDocumentDrawer, SimpleDocumentVersionFormDrawer } from './simplified-drawers'
import { tipcClient } from '@renderer/lib/tipc-client'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

import { DrawerNestedRoot, DrawerTrigger, Button, DrawerContent, Input } from '@clarity/shadcn'

/**
 * 文档 Drawer 包装器组件
 * 处理文档导入的UI交互，支持创建新文档或为现有文档添加版本
 */
export interface DocumentDrawerWrapperProps {
  contextData: ImportContextData
  disabled: boolean
}

export function DocumentDrawerWrapper({ contextData, disabled }: DocumentDrawerWrapperProps) {
  const [isMainDrawerOpen, setIsMainDrawerOpen] = useState(false)
  const [showDocumentSelection, setShowDocumentSelection] = useState(false)
  const [availableDocuments, setAvailableDocuments] = useState<LogicalDocumentOutput[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const {
    openDocumentForm,
    openDocumentVersionForm,
    closeDocumentForm,
    closeDocumentVersionForm,
    documentForm,
    documentVersionForm
  } = useGlobalDrawersStore()

  // 派生状态：当没有任何子表单打开时，显示选项或文档选择
  const showOptions = !documentForm.isOpen && !documentVersionForm.isOpen && !showDocumentSelection

  // 派生状态：主Drawer应该在本地状态为true或任何子表单打开时保持打开
  const isDrawerOpen =
    isMainDrawerOpen || documentForm.isOpen || documentVersionForm.isOpen || showDocumentSelection

  const handleOpen = () => {
    setIsMainDrawerOpen(true)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setIsMainDrawerOpen(false)
      setShowDocumentSelection(false)
      setAvailableDocuments([])
      setSearchQuery('')
      // 如果有子表单打开，也要关闭它们
      if (documentForm.isOpen) {
        closeDocumentForm()
      }
      if (documentVersionForm.isOpen) {
        closeDocumentVersionForm()
      }
    }
  }

  const handleCreateNew = () => {
    openDocumentForm({
      mode: 'create',
      projectId: contextData.projectId,
      prefilledData: contextData.prefilledData?.document,
      preselectedFile: contextData.files[0]
    })
  }

  const handleAddVersion = async () => {
    try {
      const documents = await tipcClient.getProjectDocuments({ projectId: contextData.projectId })

      if (documents.length === 0) {
        toast.error('项目中没有现有文档，请选择创建新文档')
        return
      }

      // 显示文档选择界面
      setAvailableDocuments(documents)
      setShowDocumentSelection(true)
    } catch (error) {
      console.error('获取文档列表失败:', error)
      toast.error('获取文档列表失败')
    }
  }

  const handleDocumentSelect = async (document: LogicalDocumentOutput) => {
    try {
      const documentWithVersions = await tipcClient.getLogicalDocumentWithVersions({
        id: document.id
      })

      setShowDocumentSelection(false)
      openDocumentVersionForm({
        mode: 'create',
        document: documentWithVersions,
        preselectedFile: contextData.files[0]
      })
    } catch (error) {
      console.error('获取文档版本信息失败:', error)
      toast.error('获取文档版本信息失败')
    }
  }

  const handleBackToOptions = () => {
    setShowDocumentSelection(false)
    setSearchQuery('')
  }

  // 过滤文档列表
  const filteredDocuments = availableDocuments.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <DrawerNestedRoot open={isDrawerOpen} onOpenChange={handleClose}>
      <DrawerTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full h-auto p-4 justify-start"
            disabled={disabled}
            onClick={handleOpen}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">项目文档新增</p>
                <p className="text-sm text-muted-foreground">
                  添加文档到项目或为现有文档创建新版本
                </p>
              </div>
            </div>
          </Button>
        </motion.div>
      </DrawerTrigger>
      <ImportContextProvider data={contextData}>
        <DrawerContent className="max-h-[80vh]">
          <AnimatePresence mode="wait">
            {showOptions && (
              <motion.div
                key="options"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DocumentImportOptions
                  onCreateNew={handleCreateNew}
                  onAddVersion={handleAddVersion}
                />
              </motion.div>
            )}

            {showDocumentSelection && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <DocumentSelectionStep
                  documents={filteredDocuments}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onDocumentSelect={handleDocumentSelect}
                  onBack={handleBackToOptions}
                  fileName={contextData.files[0]?.name}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 使用简化的 Drawer 组件 */}
          <SimpleDocumentDrawer />
          <SimpleDocumentVersionFormDrawer />
        </DrawerContent>
      </ImportContextProvider>
    </DrawerNestedRoot>
  )
}

/**
 * 文档导入选项组件
 * 显示创建新文档或添加版本的选择界面
 */
interface DocumentImportOptionsProps {
  onCreateNew: () => void
  onAddVersion: () => void
}

function DocumentImportOptions({ onCreateNew, onAddVersion }: DocumentImportOptionsProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="pb-2">
        <h3 className="font-medium">选择文档导入方式</h3>
        <p className="text-sm text-muted-foreground">您可以创建新文档或为现有文档添加版本</p>
      </div>

      <div className="space-y-2">
        <Button variant="outline" className="w-full h-auto p-3 justify-start" onClick={onCreateNew}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">创建新文档</p>
              <p className="text-xs text-muted-foreground">
                为项目创建全新的逻辑文档并添加第一个版本
              </p>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full h-auto p-3 justify-start"
          onClick={onAddVersion}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <FileStack className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">添加文档版本</p>
              <p className="text-xs text-muted-foreground">为项目中现有的逻辑文档添加新版本</p>
            </div>
          </div>
        </Button>
      </div>
    </div>
  )
}

/**
 * 文档选择步骤组件
 * 显示项目中的文档列表供用户选择
 */
interface DocumentSelectionStepProps {
  documents: LogicalDocumentOutput[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onDocumentSelect: (document: LogicalDocumentOutput) => void
  onBack: () => void
  fileName?: string
}

function DocumentSelectionStep({
  documents,
  searchQuery,
  onSearchChange,
  onDocumentSelect,
  onBack,
  fileName
}: DocumentSelectionStepProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pb-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-1.5">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h3 className="font-medium">选择要添加版本的文档</h3>
          {fileName && (
            <p className="text-sm text-muted-foreground">为文件 "{fileName}" 选择目标逻辑文档</p>
          )}
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索文档..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-9"
        />
      </div>

      {/* 文档列表 */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
            <h3 className="font-medium mb-1">{searchQuery ? '没有找到匹配的文档' : '暂无文档'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? '尝试调整搜索条件' : '项目中还没有逻辑文档'}
            </p>
            <Button variant="outline" size="sm" onClick={onBack}>
              返回选择导入方式
            </Button>
          </div>
        ) : (
          documents.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group cursor-pointer rounded-md border border-transparent hover:border-border/50 hover:bg-accent/30 transition-all duration-150"
              onClick={() => onDocumentSelect(document)}
            >
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{document.name}</h4>
                      <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                        {document.type}
                      </span>
                    </div>
                    {document.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {document.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{document.versionCount || 0} 个版本</span>
                      <span>
                        {formatDistanceToNow(new Date(document.updatedAt), {
                          addSuffix: true,
                          locale: zhCN
                        })}
                      </span>
                    </div>
                  </div>
                  <FileText className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

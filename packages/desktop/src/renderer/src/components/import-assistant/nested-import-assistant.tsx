import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Drawer,
  DrawerNestedRoot,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@clarity/shadcn/ui/drawer'
import { Button } from '@clarity/shadcn/ui/button'
import { Badge } from '@clarity/shadcn/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@clarity/shadcn/ui/select'
import { FileText, Receipt, File, X, Plus, FileStack } from 'lucide-react'
import { useImportAssistantStore } from '@renderer/stores/import-assistant'
import { useProjects } from '@renderer/hooks/use-tipc'
import { ExpenseImportHandler } from './expense-import-handler'
import { DocumentImportHandler } from './document-import-handler'
import { ImportContextProvider, type ImportContextData } from './import-context'
import {
  SimpleExpenseFormDrawer,
  SimpleDocumentDrawer,
  SimpleDocumentVersionFormDrawer
} from './simplified-drawers'
import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { tipcClient } from '@renderer/lib/tipc-client'
import { toast } from 'sonner'

export function NestedImportAssistant() {
  const { isOpen, droppedFiles, closeImportAssistant } = useImportAssistantStore()

  const { data: projects } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  // 当 drawer 关闭时重置所有状态
  const handleDrawerClose = (open: boolean) => {
    if (!open) {
      closeImportAssistant()
      setSelectedProjectId('')
    }
  }

  // 创建导入上下文数据
  const createImportContextData = (importType: 'expense' | 'document'): ImportContextData => {
    const file = droppedFiles[0]

    // 如果没有文件，返回空的预填充数据
    if (!file) {
      return {
        files: droppedFiles,
        projectId: selectedProjectId,
        importType,
        prefilledData: {}
      }
    }

    return {
      files: droppedFiles,
      projectId: selectedProjectId,
      importType,
      prefilledData: {
        expense:
          importType === 'expense'
            ? {
                itemName: ExpenseImportHandler.inferExpenseItemFromFile(file),
                amount: ExpenseImportHandler.inferAmountFromFile(file) || undefined,
                notes: `导入文件：${file.name}`
              }
            : undefined,
        document:
          importType === 'document'
            ? {
                name: DocumentImportHandler.inferDocumentNameFromFile(file),
                type: DocumentImportHandler.inferDocumentTypeFromFile(file),
                description: `从文件 ${file.name} 导入`
              }
            : undefined,
        documentVersion:
          importType === 'document'
            ? {
                versionTag: 'v1',
                notes: `导入文件：${file.name}`,
                isGenericVersion: true
              }
            : undefined
      }
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (extension: string) => {
    const ext = extension.toLowerCase()
    if (['pdf'].includes(ext)) return Receipt
    if (['doc', 'docx', 'txt', 'md'].includes(ext)) return FileText
    return File
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleDrawerClose}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <div className="flex items-center gap-3 mt-2">
            <div>
              <DrawerTitle className="">智能文件导入助手</DrawerTitle>
              <DrawerDescription className="">选择导入类型来处理您的文件</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-6 space-y-6"
        >
          {/* 文件列表 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              待导入文件 ({droppedFiles.length})
            </h3>
            <div className="space-y-2">
              {droppedFiles.map((file, index) => {
                const IconComponent = getFileIcon(file.extension)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card"
                  >
                    <IconComponent className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.extension.toUpperCase()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {file.type || '未知类型'}
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* 项目选择 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              选择目标项目 <span className="text-red-500">*</span>
            </h3>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择项目..." />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 导入类型选择 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">选择导入类型</h3>
            <div className="grid grid-cols-1 gap-3">
              {/* 发票报销 */}
              <DrawerNestedRoot>
                <DrawerTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 justify-start"
                      disabled={!selectedProjectId}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">发票报销</p>
                          <p className="text-sm text-muted-foreground">
                            导入 PDF 发票文件并创建报销记录
                          </p>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                </DrawerTrigger>
                <ExpenseNestedDrawer contextData={createImportContextData('expense')} />
              </DrawerNestedRoot>

              {/* 项目文档新增 */}
              <DrawerNestedRoot>
                <DrawerTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 justify-start"
                      disabled={!selectedProjectId}
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
                <DocumentNestedDrawer contextData={createImportContextData('document')} />
              </DrawerNestedRoot>
            </div>
          </div>

          {/* 底部操作 */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => handleDrawerClose(false)}>
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
          </div>
        </motion.div>
      </DrawerContent>
    </Drawer>
  )
}

// 发票报销嵌套 Drawer
function ExpenseNestedDrawer({ contextData }: { contextData: ImportContextData }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { openExpenseForm } = useGlobalDrawersStore()

  const handleTrigger = () => {
    setIsFormOpen(true)
    openExpenseForm({
      mode: 'create',
      onClose: () => setIsFormOpen(false) // 添加关闭回调
    })
  }

  return (
    <ImportContextProvider data={contextData}>
      <DrawerContent className="max-h-[80vh]" onOpenAutoFocus={handleTrigger}>
        {isFormOpen && <SimpleExpenseFormDrawer />}
      </DrawerContent>
    </ImportContextProvider>
  )
}

// 文档嵌套 Drawer
function DocumentNestedDrawer({ contextData }: { contextData: ImportContextData }) {
  const [showOptions, setShowOptions] = useState(true)
  const { openDocumentForm, openDocumentVersionForm } = useGlobalDrawersStore()

  // 重置选项显示状态
  const resetOptionsState = () => {
    setShowOptions(true)
  }

  const handleCreateNew = () => {
    setShowOptions(false)
    openDocumentForm({
      mode: 'create',
      onClose: resetOptionsState // 添加关闭回调
    })
  }

  const handleAddVersion = async () => {
    try {
      const documents = await tipcClient.getProjectDocuments({ projectId: contextData.projectId })

      if (documents.length === 0) {
        toast.error('项目中没有现有文档，请选择创建新文档')
        return
      }

      const selectedDoc = documents[0]
      const documentWithVersions = await tipcClient.getLogicalDocumentWithVersions({
        id: selectedDoc.id
      })

      setShowOptions(false)
      openDocumentVersionForm({
        mode: 'create',
        document: documentWithVersions,
        onClose: resetOptionsState // 添加关闭回调
      })
    } catch (error) {
      console.error('获取文档列表失败:', error)
      toast.error('获取文档列表失败')
    }
  }

  return (
    <ImportContextProvider data={contextData}>
      <DrawerContent className="max-h-[80vh]">
        {showOptions && (
          <div className="p-4 space-y-4">
            <DrawerHeader>
              <DrawerTitle>选择文档导入方式</DrawerTitle>
              <DrawerDescription>您可以创建新文档或为现有文档添加版本</DrawerDescription>
            </DrawerHeader>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="w-full h-auto p-4 justify-start"
                onClick={handleCreateNew}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">创建新文档</p>
                    <p className="text-sm text-muted-foreground">
                      为项目创建全新的逻辑文档并添加第一个版本
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto p-4 justify-start"
                onClick={handleAddVersion}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <FileStack className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">添加文档版本</p>
                    <p className="text-sm text-muted-foreground">
                      为项目中现有的逻辑文档添加新版本
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* 使用简化的 Drawer 组件 */}
        <SimpleDocumentDrawer />
        <SimpleDocumentVersionFormDrawer />
      </DrawerContent>
    </ImportContextProvider>
  )
}

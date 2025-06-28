import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
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
import { FileText, Receipt, File, X } from 'lucide-react'
import { useImportAssistantStore } from '@renderer/stores/import-assistant'
import { useProjects } from '@renderer/hooks/use-tipc'
import { ExpenseDrawerWrapper } from './drawers/expense-drawer-wrapper'
import { DocumentDrawerWrapper } from './drawers/document-drawer-wrapper'
import { useImportContextData, useFileValidation } from '../hooks/use-import-context-data'

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

  // 使用自定义Hook创建导入上下文数据
  const contextData = useImportContextData(droppedFiles, selectedProjectId || '')
  const { canImportExpense, canImportDocument } = useFileValidation(droppedFiles)

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
              <ExpenseDrawerWrapper
                contextData={contextData}
                disabled={!selectedProjectId || !canImportExpense}
              />

              {/* 项目文档新增 */}
              <DocumentDrawerWrapper
                contextData={contextData}
                disabled={!selectedProjectId || !canImportDocument}
              />
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

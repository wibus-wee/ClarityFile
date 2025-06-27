import { useEffect, useCallback, useRef } from 'react'
import { useImportAssistantStore } from '@renderer/stores/import-assistant'
import { extractFileInfoFromFile, validateFileSize } from './utils'
import type { DroppedFileInfo } from './types'
import { toast } from 'sonner'

/**
 * 全局文件拖拽监听组件
 * 监听整个应用的文件拖拽事件，并触发导入助手
 */
export function GlobalFileDropListener() {
  const { openImportAssistant } = useImportAssistantStore()
  const dragCounterRef = useRef(0)
  const isDraggingRef = useRef(false)

  // 处理文件拖拽进入
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current++

    // 检查是否包含文件
    if (e.dataTransfer?.types.includes('Files')) {
      isDraggingRef.current = true
      document.body.classList.add('file-dragging')
    }
  }, [])

  // 处理文件拖拽离开
  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current--

    if (dragCounterRef.current === 0) {
      isDraggingRef.current = false
      document.body.classList.remove('file-dragging')
    }
  }, [])

  // 处理文件拖拽悬停
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // 设置拖拽效果
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  // 处理文件放置
  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // 重置拖拽状态
      dragCounterRef.current = 0
      isDraggingRef.current = false
      document.body.classList.remove('file-dragging')

      const files = e.dataTransfer?.files
      if (!files || files.length === 0) {
        return
      }

      try {
        const droppedFiles: DroppedFileInfo[] = []
        const errors: string[] = []

        // 处理每个文件
        for (let i = 0; i < files.length; i++) {
          const file = files[i]

          // 提取文件基本信息
          const fileInfo = extractFileInfoFromFile(file)

          // 创建完整的文件信息对象
          const droppedFile: DroppedFileInfo = {
            path: fileInfo.path || file.name,
            name: fileInfo.name || file.name,
            size: file.size,
            type: file.type || '',
            extension: fileInfo.extension || ''
          }

          // 验证文件大小
          const sizeValidation = validateFileSize(droppedFile)
          if (!sizeValidation.isValid) {
            errors.push(`${file.name}: ${sizeValidation.reason}`)
            continue
          }

          droppedFiles.push(droppedFile)
        }

        // 显示错误信息
        if (errors.length > 0) {
          toast.error(`部分文件无法处理：\n${errors.join('\n')}`)
        }

        // 如果有有效文件，打开导入助手
        if (droppedFiles.length > 0) {
          openImportAssistant(droppedFiles)
        } else if (errors.length > 0) {
          // 如果所有文件都有问题，显示错误
          toast.error('没有可处理的文件')
        }
      } catch (error) {
        console.error('处理拖拽文件失败:', error)
        toast.error('处理文件时发生错误')
      }
    },
    [openImportAssistant]
  )

  // 阻止默认的拖拽行为
  const preventDefaults = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  useEffect(() => {
    // 添加全局事件监听器
    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    // 阻止默认的拖拽行为（防止浏览器打开文件）
    document.addEventListener('dragover', preventDefaults)
    document.addEventListener('drop', preventDefaults)

    return () => {
      // 清理事件监听器
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
      document.removeEventListener('dragover', preventDefaults)
      document.removeEventListener('drop', preventDefaults)

      // 清理样式
      document.body.classList.remove('file-dragging')
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop, preventDefaults])

  // 这个组件不渲染任何内容，只是添加事件监听器
  return null
}

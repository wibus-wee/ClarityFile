import { useCallback } from 'react'
import { toast } from 'sonner'
import {
  useOpenFileByIdWithSystem,
  useIntelligentFileImport,
  useQuickLookPreviewById,
  useIsQuickLookAvailable
} from './use-tipc'
import { useFilePicker } from './use-file-picker'
import { useFileManagementStore } from '@renderer/stores/file-management'

export function useFileActions() {
  const { openRenameDialog, openDeleteDialog, openInfoDrawer, setProcessing, isProcessing } =
    useFileManagementStore()

  // 获取所有需要的mutation hooks
  const { trigger: openFileWithSystem } = useOpenFileByIdWithSystem()
  const { pickFile } = useFilePicker()
  const { trigger: intelligentFileImport } = useIntelligentFileImport()
  const { trigger: quickLookPreview } = useQuickLookPreviewById()
  const { data: quickLookAvailable } = useIsQuickLookAvailable()

  const handlePreview = useCallback(
    async (file: any) => {
      try {
        setProcessing(true, 'preview')

        // 检查是否在 macOS 上且 QuickLook 可用
        if (quickLookAvailable?.available) {
          try {
            await quickLookPreview({ fileId: file.id })
            return
          } catch (quickLookError) {
            console.warn('QuickLook 预览失败，回退到系统默认应用:', quickLookError)
            // 如果 QuickLook 失败，回退到系统默认应用
          }
        }

        // 回退到系统默认应用
        await openFileWithSystem({ fileId: file.id })
      } catch (error) {
        console.error('预览文件失败:', error)
        toast.error(`预览文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
      } finally {
        setProcessing(false)
      }
    },
    [openFileWithSystem, quickLookPreview, quickLookAvailable, setProcessing]
  )

  const handleRename = useCallback(
    (file: any) => {
      // 打开重命名Dialog
      openRenameDialog(file)
    },
    [openRenameDialog]
  )

  const handleDelete = useCallback(
    (file: any) => {
      // 打开删除确认Dialog
      openDeleteDialog(file)
    },
    [openDeleteDialog]
  )

  const handleInfo = useCallback(
    (file: any) => {
      // 打开文件属性Drawer
      openInfoDrawer(file)
    },
    [openInfoDrawer]
  )

  const handleUpload = useCallback(async () => {
    try {
      setProcessing(true, 'upload')

      // 使用前端原生文件选择器
      const fileResult = await pickFile(
        '.pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.bmp,.webp,.mp4,.avi,.mov,.wmv,.flv,.mp3,.wav,.flac,.aac'
      )

      if (fileResult.canceled || !fileResult.path) {
        return
      }

      // 使用智能文件导入服务
      const fileName = fileResult.path.split('/').pop() || ''
      const result = await intelligentFileImport({
        originalFileName: fileName,
        sourcePath: fileResult.path,
        importType: 'shared', // 默认导入到共享资源
        projectId: undefined // 全局文件，不关联特定项目
      })

      if (result.success) {
        toast.success(`文件上传成功: ${fileName}`)
      } else {
        toast.error(`文件上传失败: ${result.errors?.join(', ') || '未知错误'}`)
      }
    } catch (error) {
      console.error('上传文件失败:', error)
      toast.error(`上传文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setProcessing(false)
    }
  }, [pickFile, intelligentFileImport, setProcessing])

  const handleFileAction = useCallback(
    (action: string, file: any) => {
      switch (action) {
        case 'preview':
          handlePreview(file)
          break
        case 'rename':
          handleRename(file)
          break
        case 'delete':
          handleDelete(file)
          break
        case 'info':
          handleInfo(file)
          break
        default:
          console.log(`未知操作: ${action}`, file)
      }
    },
    [handlePreview, handleRename, handleDelete, handleInfo]
  )

  return {
    handleFileAction,
    handlePreview,
    handleRename,
    handleDelete,
    handleInfo,
    handleUpload,
    isProcessing
  }
}

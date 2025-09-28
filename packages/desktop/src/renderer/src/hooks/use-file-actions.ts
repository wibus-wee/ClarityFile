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
import {
  useSaveFileAs,
  useCopyFileToDirectory,
  useSelectDirectory,
  useBatchCopyFilesToDirectory
} from './use-tipc'

export function useFileActions() {
  const { openRenameDialog, openDeleteDialog, openInfoDrawer, setProcessing, isProcessing } =
    useFileManagementStore()

  // 获取所有需要的mutation hooks
  const { trigger: openFileWithSystem } = useOpenFileByIdWithSystem()
  const { pickFile } = useFilePicker()
  const { trigger: intelligentFileImport } = useIntelligentFileImport()
  const { trigger: quickLookPreview } = useQuickLookPreviewById()
  const { data: quickLookAvailable } = useIsQuickLookAvailable()
  const { trigger: saveFileAs } = useSaveFileAs()
  const { trigger: copyFileToDirectory } = useCopyFileToDirectory()
  const { trigger: selectDirectory } = useSelectDirectory()
  const { trigger: batchCopyFilesToDirectory } = useBatchCopyFilesToDirectory()

  const resolveFileId = useCallback((file: any): string | null => {
    if (!file) return null

    return (
      file.id ||
      file.managedFileId ||
      file.fileId ||
      file?.managedFile?.id ||
      file?.file?.id ||
      null
    )
  }, [])

  const handlePreview = useCallback(
    async (file: any) => {
      try {
        setProcessing(true, 'preview')

        const fileId = resolveFileId(file)
        if (!fileId) {
          toast.error('无法确定文件标识，无法预览')
          return
        }

        // 检查是否在 macOS 上且 QuickLook 可用
        if (quickLookAvailable?.available) {
          try {
            await quickLookPreview({ fileId })
            return
          } catch (quickLookError) {
            console.warn('QuickLook 预览失败，回退到系统默认应用:', quickLookError)
            // 如果 QuickLook 失败，回退到系统默认应用
          }
        }

        // 回退到系统默认应用
        await openFileWithSystem({ fileId })
      } catch (error) {
        console.error('预览文件失败:', error)
        toast.error(`预览文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
      } finally {
        setProcessing(false)
      }
    },
    [openFileWithSystem, quickLookPreview, quickLookAvailable, resolveFileId, setProcessing]
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

  const handleDownload = useCallback(
    async (file: any) => {
      try {
        setProcessing(true, 'download')
        const fileId = resolveFileId(file)
        if (!fileId) {
          toast.error('无法确定文件标识，无法下载')
          return
        }

        const result = await saveFileAs({ fileId })

        if (!result?.success) {
          toast.info('已取消下载')
          return
        }

        const displayName = file?.originalFileName || file?.name || '文件'
        toast.success(`文件已保存到 ${result.targetPath || '指定位置'}: ${displayName}`)
      } catch (error) {
        console.error('下载文件失败:', error)
        toast.error(`下载文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
      } finally {
        setProcessing(false)
      }
    },
    [resolveFileId, saveFileAs, setProcessing]
  )

  const handleCopy = useCallback(
    async (file: any) => {
      try {
        setProcessing(true, 'copy')

        const fileId = resolveFileId(file)
        if (!fileId) {
          toast.error('无法确定文件标识，无法复制')
          return
        }

        const directoryResult = await selectDirectory({
          title: '选择复制文件的目标文件夹'
        })

        if (directoryResult.canceled || !directoryResult.path) {
          toast.info('已取消复制')
          return
        }

        const result = await copyFileToDirectory({
          fileId,
          targetDirectory: directoryResult.path
        })

        if (result.success) {
          const displayName = file?.originalFileName || file?.name || '文件'
          toast.success(`文件已复制到 ${result.targetPath || directoryResult.path}: ${displayName}`)
        }
      } catch (error) {
        console.error('复制文件失败:', error)
        toast.error(`复制文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
      } finally {
        setProcessing(false)
      }
    },
    [copyFileToDirectory, resolveFileId, selectDirectory, setProcessing]
  )

  const handleShare = useCallback(async (file: any) => {
    try {
      const shareText = file?.physicalPath || file?.originalFileName || file?.name
      if (!shareText) {
        throw new Error('无法获取文件路径')
      }

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
        toast.success('文件路径已复制到剪贴板')
      } else {
        throw new Error('当前环境不支持剪贴板操作')
      }
    } catch (error) {
      console.error('分享文件失败:', error)
      toast.error(`分享文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }, [])

  const handleBatchDownload = useCallback(
    async (files: any[]) => {
      if (!files.length) return

      try {
        setProcessing(true, 'batch-download')

        const directoryResult = await selectDirectory({
          title: `选择保存 ${files.length} 个文件的位置`
        })

        if (directoryResult.canceled || !directoryResult.path) {
          toast.info('已取消批量下载')
          return
        }

        const fileIds = files
          .map((file) => resolveFileId(file))
          .filter((id): id is string => Boolean(id))

        if (!fileIds.length) {
          toast.error('选中的文件缺少有效的标识，无法批量下载')
          return
        }

        const result = await batchCopyFilesToDirectory({
          fileIds,
          targetDirectory: directoryResult.path
        })

        if (result.success) {
          toast.success(`已将 ${files.length} 个文件保存到 ${directoryResult.path}`)
        } else {
          const failed = result.results.filter((item) => !item.success)
          if (failed.length > 0) {
            toast.error(`有 ${failed.length} 个文件下载失败，请稍后重试`)
          }
        }
      } catch (error) {
        console.error('批量下载文件失败:', error)
        toast.error(`批量下载文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
      } finally {
        setProcessing(false)
      }
    },
    [batchCopyFilesToDirectory, resolveFileId, selectDirectory, setProcessing]
  )

  const handleBatchCopy = useCallback(
    async (files: any[]) => {
      if (!files.length) return

      try {
        setProcessing(true, 'batch-copy')

        const directoryResult = await selectDirectory({
          title: `选择复制 ${files.length} 个文件的位置`
        })

        if (directoryResult.canceled || !directoryResult.path) {
          toast.info('已取消批量复制')
          return
        }

        const fileIds = files
          .map((file) => resolveFileId(file))
          .filter((id): id is string => Boolean(id))

        if (!fileIds.length) {
          toast.error('选中的文件缺少有效的标识，无法批量复制')
          return
        }

        const result = await batchCopyFilesToDirectory({
          fileIds,
          targetDirectory: directoryResult.path
        })

        if (result.success) {
          toast.success(`已将 ${files.length} 个文件复制到 ${directoryResult.path}`)
        } else {
          const failed = result.results.filter((item) => !item.success)
          if (failed.length > 0) {
            toast.error(`有 ${failed.length} 个文件复制失败，请稍后重试`)
          }
        }
      } catch (error) {
        console.error('批量复制文件失败:', error)
        toast.error(`批量复制文件失败: ${error instanceof Error ? error.message : '未知错误'}`)
      } finally {
        setProcessing(false)
      }
    },
    [batchCopyFilesToDirectory, resolveFileId, selectDirectory, setProcessing]
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
        importType: 'inbox', // 默认导入到收件箱
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
        case 'download':
          handleDownload(file)
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
        case 'copy':
          handleCopy(file)
          break
        case 'share':
          handleShare(file)
          break
        default:
          console.log(`未知操作: ${action}`, file)
      }
    },
    [handlePreview, handleDownload, handleRename, handleDelete, handleInfo, handleCopy, handleShare]
  )

  return {
    handleFileAction,
    handlePreview,
    handleRename,
    handleDelete,
    handleInfo,
    handleUpload,
    handleDownload,
    handleCopy,
    handleShare,
    handleBatchDownload,
    handleBatchCopy,
    isProcessing
  }
}

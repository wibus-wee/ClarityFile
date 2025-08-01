import { useState, useMemo } from 'react'
import { Search, FileText, Image, Video, Music, Archive } from 'lucide-react'
import {
  DetailLayout,
  DetailMain,
  DetailSection,
  DetailItem,
  DetailLoading,
  DetailEmpty,
  DetailStatus
} from '../../components/common'
import { PluginContext } from '../types'
import { tipcClient } from '@renderer/lib/tipc-client'
import { useGlobalFiles } from '@renderer/hooks/use-tipc'
import { formatFileSize, formatFriendlyDate } from '@renderer/lib/utils'
import { useCommandPaletteQuery } from '../../stores/command-palette-store'

interface FileSearchViewProps {
  context: PluginContext
  mode?: 'search' | 'recent' | 'favorites'
}

export function FileSearchView({ context, mode = 'search' }: FileSearchViewProps) {
  const [sortOrder] = useState<'asc' | 'desc'>('desc')

  // 直接从 store 获取查询，绕过 context 的限制
  // 这样可以确保在命令详情视图中仍能获取到用户的搜索查询
  const storeQuery = useCommandPaletteQuery()
  const currentQuery = storeQuery || context.commandPalette.getQuery()

  // 构建搜索参数
  const searchParams = useMemo(() => {
    const params: any = {
      limit: 50,
      offset: 0,
      sortOrder
    }

    // 根据模式设置不同的搜索参数
    if (currentQuery.trim()) {
      params.search = currentQuery.trim()
    }

    return params
  }, [currentQuery, sortOrder])

  // 使用SWR获取文件数据
  const { data: fileData, error, isLoading } = useGlobalFiles(searchParams)

  // 处理文件点击
  const handleFileClick = async (file: any) => {
    try {
      // 使用QuickLook预览文件
      await tipcClient.previewFileById({ fileId: file.id })
    } catch (error) {
      console.error('Failed to preview file:', error)
      // 如果预览失败，尝试用系统默认应用打开文件
      try {
        await tipcClient.openFileWithSystem({ filePath: file.physicalPath })
      } catch (openError) {
        console.error('Failed to open file with system:', openError)
      }
    }
  }

  // 获取文件图标
  const getFileIcon = (file: any) => {
    if (!file.mimeType) return FileText

    if (file.mimeType.startsWith('image/')) return Image
    if (file.mimeType.startsWith('video/')) return Video
    if (file.mimeType.startsWith('audio/')) return Music
    if (file.mimeType.startsWith('application/')) return Archive

    return FileText
  }

  // 格式化文件信息 - 优化显示，保持简洁
  const formatFileInfo = (file: any) => {
    const parts: string[] = []

    if (file.fileSizeBytes) {
      parts.push(formatFileSize(file.fileSizeBytes))
    }

    if (file.createdAt) {
      parts.push(formatFriendlyDate(file.createdAt))
    }

    return parts.join(' • ')
  }

  // 获取友好的文件类型显示名称
  const getFileTypeBadge = (file: any) => {
    if (!file.mimeType) return '文件'

    if (file.mimeType.startsWith('image/')) return '图片'
    if (file.mimeType.startsWith('video/')) return '视频'
    if (file.mimeType.startsWith('audio/')) return '音频'
    if (file.mimeType.startsWith('text/')) return '文本'
    if (file.mimeType.includes('pdf')) return 'PDF'
    if (file.mimeType.includes('word') || file.mimeType.includes('document')) return '文档'
    if (file.mimeType.includes('sheet') || file.mimeType.includes('excel')) return '表格'
    if (file.mimeType.includes('presentation') || file.mimeType.includes('powerpoint'))
      return '演示'
    if (file.mimeType.startsWith('application/')) return '应用'

    return '文件'
  }

  // 获取页面标题
  const getPageTitle = () => {
    switch (mode) {
      case 'recent':
        return '最近文件'
      case 'favorites':
        return '收藏文件'
      default:
        return '文件搜索'
    }
  }

  return (
    <DetailLayout>
      <DetailMain>
        <DetailSection title={getPageTitle()}>
          {isLoading ? (
            <DetailLoading message="正在搜索文件..." />
          ) : error ? (
            <DetailStatus status="error" message="搜索失败，请重试" />
          ) : !fileData?.files?.length ? (
            <DetailEmpty
              icon={Search}
              title="没有找到文件"
              description={
                mode === 'search' && currentQuery
                  ? `没有找到包含 "${currentQuery}" 的文件`
                  : '尝试调整搜索条件或文件类型过滤器'
              }
            />
          ) : (
            <div className="w-full space-y-1">
              {fileData.files.map((file: any) => {
                const Icon = getFileIcon(file)
                return (
                  <DetailItem
                    key={file.id}
                    icon={Icon}
                    title={file.name}
                    subtitle={formatFileInfo(file)}
                    description={
                      file.originalFileName && file.originalFileName !== file.name
                        ? `原始文件名: ${file.originalFileName}`
                        : undefined
                    }
                    badge={getFileTypeBadge(file)}
                    onClick={() => handleFileClick(file)}
                    className="w-full"
                  />
                )
              })}

              {fileData.hasMore && (
                <DetailStatus
                  status="info"
                  message={`显示了 ${fileData.files.length} 个文件，还有更多结果`}
                />
              )}
            </div>
          )}
        </DetailSection>
      </DetailMain>
    </DetailLayout>
  )
}

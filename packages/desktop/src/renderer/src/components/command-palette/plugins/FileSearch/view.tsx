import { useMemo, useState } from 'react'
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
import type { PluginContext } from '../types'
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
  const { i18n } = context
  const t = i18n.t

  const storeQuery = useCommandPaletteQuery()
  const currentQuery = storeQuery || context.commandPalette.getQuery()

  const searchParams = useMemo(() => {
    const params: Record<string, unknown> = {
      limit: 50,
      offset: 0,
      sortOrder
    }

    if (currentQuery.trim()) {
      params.search = currentQuery.trim()
    }

    return params
  }, [currentQuery, sortOrder])

  const { data: fileData, error, isLoading } = useGlobalFiles(searchParams)

  const handleFileClick = async (file: any) => {
    try {
      await tipcClient.previewFileById({ fileId: file.id })
    } catch (previewError) {
      context.utils.notify(
        t('view.actions.previewFallback', { defaultValue: 'Failed to preview the file.' }),
        'error'
      )

      try {
        await tipcClient.openFileWithSystem({ filePath: file.physicalPath })
        context.utils.notify(
          t('view.actions.openFallback', {
            defaultValue: 'Opening with the default system application.'
          }),
          'info'
        )
      } catch (openError) {
        console.error('Failed to open file with system:', openError)
      }
    }
  }

  const getFileIcon = (file: any) => {
    if (!file.mimeType) return FileText
    if (file.mimeType.startsWith('image/')) return Image
    if (file.mimeType.startsWith('video/')) return Video
    if (file.mimeType.startsWith('audio/')) return Music
    if (file.mimeType.startsWith('application/')) return Archive
    return FileText
  }

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

  const getFileTypeBadge = (file: any) => {
    if (!file.mimeType) return t('view.badges.default', { defaultValue: 'File' })

    if (file.mimeType.startsWith('image/')) {
      return t('view.badges.image', { defaultValue: 'Image' })
    }
    if (file.mimeType.startsWith('video/')) {
      return t('view.badges.video', { defaultValue: 'Video' })
    }
    if (file.mimeType.startsWith('audio/')) {
      return t('view.badges.audio', { defaultValue: 'Audio' })
    }
    if (file.mimeType.startsWith('text/')) {
      return t('view.badges.text', { defaultValue: 'Text' })
    }
    if (file.mimeType.includes('pdf')) {
      return t('view.badges.pdf', { defaultValue: 'PDF' })
    }
    if (file.mimeType.includes('word') || file.mimeType.includes('document')) {
      return t('view.badges.document', { defaultValue: 'Document' })
    }
    if (file.mimeType.includes('sheet') || file.mimeType.includes('excel')) {
      return t('view.badges.sheet', { defaultValue: 'Spreadsheet' })
    }
    if (file.mimeType.includes('presentation') || file.mimeType.includes('powerpoint')) {
      return t('view.badges.presentation', { defaultValue: 'Presentation' })
    }
    if (file.mimeType.startsWith('application/')) {
      return t('view.badges.application', { defaultValue: 'Application' })
    }

    return t('view.badges.default', { defaultValue: 'File' })
  }

  const getPageTitle = () => {
    switch (mode) {
      case 'recent':
        return t('view.title.recent', { defaultValue: 'Recent files' })
      case 'favorites':
        return t('view.title.favorites', { defaultValue: 'Favorite files' })
      default:
        return t('view.title.search', { defaultValue: 'File search' })
    }
  }

  const renderEmptyState = () => (
    <DetailEmpty
      icon={Search}
      title={t('view.empty.title', { defaultValue: 'No files found' })}
      description={
        mode === 'search' && currentQuery
          ? t('view.empty.withQuery', {
              defaultValue: 'No files found containing "{{query}}".',
              query: currentQuery
            })
          : t('view.empty.withoutQuery', {
              defaultValue: 'Try adjusting your filters or keywords.'
            })
      }
    />
  )

  return (
    <DetailLayout>
      <DetailMain>
        <DetailSection title={getPageTitle()}>
          {isLoading ? (
            <DetailLoading
              message={t('view.loading', { defaultValue: 'Searching files…' })}
            />
          ) : error ? (
            <DetailStatus
              status="error"
              message={t('view.error', { defaultValue: 'Search failed, please try again.' })}
            />
          ) : !fileData?.files?.length ? (
            renderEmptyState()
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
                        ? t('view.originalName', {
                            defaultValue: 'Original name: {{name}}',
                            name: file.originalFileName
                          })
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
                  message={t('view.infoMore', {
                    defaultValue: 'Showing {{count}} files. There are more results available.',
                    count: fileData.files.length
                  })}
                />
              )}
            </div>
          )}
        </DetailSection>
      </DetailMain>
    </DetailLayout>
  )
}

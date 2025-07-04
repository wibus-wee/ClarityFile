import { Command } from 'cmdk'
import { motion } from 'framer-motion'
import { FolderOpen, FileText, CreditCard, Trophy, Image, File } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { CommandItem } from '../types/command-box.types'

interface SearchResultItemProps {
  item: CommandItem & { metadata?: any }
  isSelected: boolean
  onSelect: () => void
  highlightText: (text: string, matches?: Array<{ indices: [number, number][] }>) => string
  className?: string
}

// 类型图标映射
const typeIconMap = {
  project: FolderOpen,
  document: FileText,
  file: File,
  expense: CreditCard,
  competition: Trophy,
  asset: Image
}

// 类型颜色映射
const typeColorMap = {
  project: 'text-blue-500',
  document: 'text-green-500',
  file: 'text-gray-500',
  expense: 'text-orange-500',
  competition: 'text-purple-500',
  asset: 'text-pink-500'
}

/**
 * 搜索结果项目组件
 * 专门用于显示搜索结果，支持高亮匹配文本
 */
export function SearchResultItem({
  item,
  isSelected,
  onSelect,
  highlightText,
  className
}: SearchResultItemProps) {
  const metadata = item.metadata
  const resultType = metadata?.type || 'file'
  const IconComponent = typeIconMap[resultType as keyof typeof typeIconMap] || File
  const iconColor = typeColorMap[resultType as keyof typeof typeColorMap] || 'text-gray-500'

  // 获取高亮的标题和描述
  const highlightedTitle = highlightText(
    item.title,
    metadata?.matches?.filter((m) => m.key === 'title')
  )
  const highlightedDescription = item.description
    ? highlightText(
        item.description,
        metadata?.matches?.filter((m) => m.key === 'description')
      )
    : ''

  // 获取类型标签
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project':
        return '项目'
      case 'document':
        return '文档'
      case 'file':
        return '文件'
      case 'expense':
        return '报销'
      case 'competition':
        return '赛事'
      case 'asset':
        return '资产'
      default:
        return '其他'
    }
  }

  // 获取额外信息
  const getExtraInfo = () => {
    if (!metadata?.metadata) return null

    const meta = metadata.metadata
    const info: string[] = []

    switch (resultType) {
      case 'project':
        if (meta.status) info.push(meta.status)
        if (meta.folderPath) info.push(meta.folderPath)
        break

      case 'file':
        if (meta.fileType) info.push(meta.fileType.toUpperCase())
        if (meta.fileSize) {
          const size = formatFileSize(meta.fileSize)
          info.push(size)
        }
        break

      case 'expense':
        if (meta.amount) info.push(`¥${meta.amount}`)
        if (meta.status) info.push(meta.status)
        break

      default:
        break
    }

    return info.length > 0 ? info.join(' • ') : null
  }

  const extraInfo = getExtraInfo()

  return (
    <Command.Item
      value={item.id}
      onSelect={onSelect}
      data-selected={isSelected}
      data-slot="command-item"
      className={cn(
        'relative flex items-center gap-3 px-3 py-3 mx-1 rounded-lg cursor-pointer',
        'text-sm transition-all duration-150',
        'hover:bg-accent/50',
        'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
        isSelected && 'bg-accent text-accent-foreground',
        className
      )}
    >
      {/* 选中指示器 */}
      {isSelected && (
        <motion.div
          layoutId="search-result-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full"
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30
          }}
        />
      )}

      {/* 图标 */}
      <div className="flex-shrink-0">
        <IconComponent className={cn('w-5 h-5', iconColor)} />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          {/* 标题 */}
          <h4
            className="font-medium truncate"
            dangerouslySetInnerHTML={{ __html: highlightedTitle }}
          />

          {/* 类型标签 */}
          <span
            className={cn(
              'ml-2 px-2 py-0.5 text-xs rounded-full bg-muted',
              'flex-shrink-0',
              iconColor
            )}
          >
            {getTypeLabel(resultType)}
          </span>
        </div>

        {/* 描述 */}
        {highlightedDescription && (
          <p
            className="text-xs text-muted-foreground mt-1 truncate"
            dangerouslySetInnerHTML={{ __html: highlightedDescription }}
          />
        )}

        {/* 额外信息 */}
        {extraInfo && <p className="text-xs text-muted-foreground/70 mt-1 truncate">{extraInfo}</p>}
      </div>

      {/* 匹配分数（开发模式显示） */}
      {process.env.NODE_ENV === 'development' && metadata?.score && (
        <div className="flex-shrink-0 text-xs text-muted-foreground/50">
          {Math.round((1 - metadata.score) * 100)}%
        </div>
      )}
    </Command.Item>
  )
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

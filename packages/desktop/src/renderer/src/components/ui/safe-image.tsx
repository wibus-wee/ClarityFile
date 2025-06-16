import { useState, useEffect, useRef, useCallback } from 'react'
import { useGenerateFileDataUrl } from '@renderer/hooks/use-tipc'
import { cn } from '@renderer/lib/utils'
import { Image as ImageIcon, AlertCircle } from 'lucide-react'

interface SafeImageProps {
  filePath: string
  alt: string
  className?: string
  fallbackClassName?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * 安全的图片组件
 * 通过主进程安全地访问本地文件，避免 Electron 安全限制
 */
export function SafeImage({
  filePath,
  alt,
  className,
  fallbackClassName,
  onLoad,
  onError
}: SafeImageProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const generateFileDataUrl = useGenerateFileDataUrl()

  // 使用 ref 存储回调函数，避免依赖变化
  const onLoadRef = useRef(onLoad)
  const onErrorRef = useRef(onError)

  // 更新 ref 中的回调函数
  useEffect(() => {
    onLoadRef.current = onLoad
  }, [onLoad])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  // 缓存已加载的图片，避免重复请求
  const loadedImagesRef = useRef<Map<string, string>>(new Map())

  const loadImage = useCallback(
    async (targetFilePath: string) => {
      // 检查缓存
      const cachedDataUrl = loadedImagesRef.current.get(targetFilePath)
      if (cachedDataUrl) {
        setDataUrl(cachedDataUrl)
        setIsLoading(false)
        setHasError(false)
        onLoadRef.current?.()
        return
      }

      try {
        setIsLoading(true)
        setHasError(false)

        const result = await generateFileDataUrl.trigger({ filePath: targetFilePath })

        if (result) {
          // 缓存成功加载的图片
          loadedImagesRef.current.set(targetFilePath, result)
          setDataUrl(result)
          onLoadRef.current?.()
        } else {
          setHasError(true)
          onErrorRef.current?.()
        }
      } catch (error) {
        console.error('加载图片失败:', error)
        setHasError(true)
        onErrorRef.current?.()
      } finally {
        setIsLoading(false)
      }
    },
    [generateFileDataUrl]
  )

  useEffect(() => {
    if (!filePath) {
      setHasError(true)
      setIsLoading(false)
      return
    }

    loadImage(filePath)
  }, [filePath, loadImage])

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/20 rounded',
          fallbackClassName || className
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="w-6 h-6 animate-pulse" />
          <span className="text-xs">加载中...</span>
        </div>
      </div>
    )
  }

  if (hasError || !dataUrl) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/20 rounded',
          fallbackClassName || className
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircle className="w-6 h-6" />
          <span className="text-xs">加载失败</span>
        </div>
      </div>
    )
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={() => {
        setHasError(true)
        onError?.()
      }}
    />
  )
}

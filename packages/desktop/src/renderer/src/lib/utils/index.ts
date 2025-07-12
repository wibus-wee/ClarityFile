import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '未知大小'
  if (bytes === 0) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)

  return `${size.toFixed(1)} ${sizes[i]}`
}

/**
 * 生成唯一 ID
 * @returns 唯一标识符字符串
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成主题 ID
 * @param name 主题名称
 * @returns 主题 ID
 */
export function generateThemeId(name: string): string {
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `theme-${sanitizedName}-${Date.now()}`
}

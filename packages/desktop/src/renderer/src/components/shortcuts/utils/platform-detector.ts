import type { Platform } from '../types/shortcut.types'

/**
 * 平台检测工具
 */

let cachedPlatform: Platform | null = null

/**
 * 检测当前运行平台
 */
export function detectPlatform(): Platform {
  if (cachedPlatform) {
    return cachedPlatform
  }

  // 在 Electron 环境中，可以通过 process.platform 检测
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    const platform = (window as any).electronAPI.platform || process.platform
    if (platform === 'darwin') {
      cachedPlatform = 'macos'
    } else if (platform === 'win32') {
      cachedPlatform = 'windows'
    } else {
      cachedPlatform = 'linux'
    }
    return cachedPlatform
  }

  // 浏览器环境中的检测
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('mac')) {
    cachedPlatform = 'macos'
  } else if (userAgent.includes('win')) {
    cachedPlatform = 'windows'
  } else {
    cachedPlatform = 'linux'
  }

  return cachedPlatform
}

/**
 * 检查是否为 macOS
 */
export function isMacOS(): boolean {
  return detectPlatform() === 'macos'
}

/**
 * 检查是否为 Windows
 */
export function isWindows(): boolean {
  return detectPlatform() === 'windows'
}

/**
 * 检查是否为 Linux
 */
export function isLinux(): boolean {
  return detectPlatform() === 'linux'
}

/**
 * 获取平台特定的修饰键
 */
export function getPlatformModifierKey(): 'metaKey' | 'ctrlKey' {
  return isMacOS() ? 'metaKey' : 'ctrlKey'
}

/**
 * 重置缓存的平台信息（主要用于测试）
 */
export function resetPlatformCache(): void {
  cachedPlatform = null
}

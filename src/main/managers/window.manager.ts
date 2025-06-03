import { BrowserWindow, screen } from 'electron'
import { SettingsService } from '../services/settings.service'
import type { WindowBounds, WindowState, WindowConfig } from '../types/inputs'

// 窗口配置常量
const WINDOW_CONFIG = {
  // 默认窗口尺寸
  DEFAULT_BOUNDS: {
    width: 900,
    height: 670,
    x: 0,
    y: 0
  },
  // 最小窗口尺寸
  MIN_SIZE: {
    width: 400,
    height: 300
  },
  // 设置键名
  SETTINGS_KEYS: {
    WINDOW_BOUNDS: 'window.bounds',
    WINDOW_STATE: 'window.state'
  },
  // 设置分类
  SETTINGS_CATEGORY: 'window',
  // 防抖延迟时间（毫秒）
  DEBOUNCE_DELAY: 500
} as const

export class WindowManager {
  private window: BrowserWindow | null = null
  private saveTimeout: NodeJS.Timeout | null = null

  /**
   * 获取保存的窗口配置
   */
  private async getSavedWindowConfig(): Promise<WindowConfig | null> {
    try {
      const boundsResult = await SettingsService.getSetting({
        key: WINDOW_CONFIG.SETTINGS_KEYS.WINDOW_BOUNDS
      })

      const stateResult = await SettingsService.getSetting({
        key: WINDOW_CONFIG.SETTINGS_KEYS.WINDOW_STATE
      })

      if (!boundsResult || !stateResult) {
        return null
      }

      const bounds = JSON.parse(boundsResult.value as string) as WindowBounds
      const state = JSON.parse(stateResult.value as string) as WindowState

      return {
        bounds,
        state,
        displayId:
          bounds.x !== undefined ? this.getDisplayIdFromPosition(bounds.x, bounds.y) : undefined
      }
    } catch (error) {
      console.error('Failed to load saved window config:', error)
      return null
    }
  }

  /**
   * 保存窗口配置
   */
  private async saveWindowConfig(bounds: WindowBounds, state: WindowState): Promise<void> {
    try {
      await Promise.all([
        SettingsService.setSetting({
          key: WINDOW_CONFIG.SETTINGS_KEYS.WINDOW_BOUNDS,
          value: bounds,
          category: WINDOW_CONFIG.SETTINGS_CATEGORY,
          description: '窗口位置和尺寸配置'
        }),
        SettingsService.setSetting({
          key: WINDOW_CONFIG.SETTINGS_KEYS.WINDOW_STATE,
          value: state,
          category: WINDOW_CONFIG.SETTINGS_CATEGORY,
          description: '窗口状态配置'
        })
      ])
    } catch (error) {
      console.error('Failed to save window config:', error)
    }
  }

  /**
   * 根据位置获取显示器ID
   */
  private getDisplayIdFromPosition(x: number, y: number): number | undefined {
    const displays = screen.getAllDisplays()
    for (const display of displays) {
      const { x: dx, y: dy, width, height } = display.bounds
      if (x >= dx && x < dx + width && y >= dy && y < dy + height) {
        return display.id
      }
    }
    return undefined
  }

  /**
   * 验证窗口边界是否有效
   */
  private validateWindowBounds(bounds: WindowBounds): WindowBounds {
    const displays = screen.getAllDisplays()
    const primaryDisplay = screen.getPrimaryDisplay()

    // 确保尺寸在合理范围内
    const validatedBounds = {
      ...bounds,
      width: Math.max(
        WINDOW_CONFIG.MIN_SIZE.width,
        Math.min(bounds.width, primaryDisplay.workAreaSize.width)
      ),
      height: Math.max(
        WINDOW_CONFIG.MIN_SIZE.height,
        Math.min(bounds.height, primaryDisplay.workAreaSize.height)
      )
    }

    // 检查位置是否在任何显示器范围内
    let isPositionValid = false
    for (const display of displays) {
      const { x: dx, y: dy, width, height } = display.workArea
      if (
        validatedBounds.x >= dx &&
        validatedBounds.x + validatedBounds.width <= dx + width &&
        validatedBounds.y >= dy &&
        validatedBounds.y + validatedBounds.height <= dy + height
      ) {
        isPositionValid = true
        break
      }
    }

    // 如果位置无效，居中到主显示器
    if (!isPositionValid) {
      const { x, y, width, height } = primaryDisplay.workArea
      validatedBounds.x = x + Math.floor((width - validatedBounds.width) / 2)
      validatedBounds.y = y + Math.floor((height - validatedBounds.height) / 2)
    }

    return validatedBounds
  }

  /**
   * 获取窗口创建选项
   */
  async getWindowOptions(): Promise<Partial<Electron.BrowserWindowConstructorOptions>> {
    const savedConfig = await this.getSavedWindowConfig()

    if (!savedConfig) {
      // 使用默认配置，居中到主显示器
      const primaryDisplay = screen.getPrimaryDisplay()
      const { x, y, width, height } = primaryDisplay.workArea
      const centerX = x + Math.floor((width - WINDOW_CONFIG.DEFAULT_BOUNDS.width) / 2)
      const centerY = y + Math.floor((height - WINDOW_CONFIG.DEFAULT_BOUNDS.height) / 2)

      return {
        width: WINDOW_CONFIG.DEFAULT_BOUNDS.width,
        height: WINDOW_CONFIG.DEFAULT_BOUNDS.height,
        x: centerX,
        y: centerY,
        minWidth: WINDOW_CONFIG.MIN_SIZE.width,
        minHeight: WINDOW_CONFIG.MIN_SIZE.height
      }
    }

    // 验证并使用保存的配置
    const validatedBounds = this.validateWindowBounds(savedConfig.bounds)

    return {
      width: validatedBounds.width,
      height: validatedBounds.height,
      x: validatedBounds.x,
      y: validatedBounds.y,
      minWidth: WINDOW_CONFIG.MIN_SIZE.width,
      minHeight: WINDOW_CONFIG.MIN_SIZE.height
    }
  }

  /**
   * 设置窗口事件监听器
   */
  setupWindowListeners(window: BrowserWindow): void {
    this.window = window

    // 防抖保存函数
    const debouncedSave = () => {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout)
      }

      this.saveTimeout = setTimeout(() => {
        this.saveCurrentWindowConfig()
      }, WINDOW_CONFIG.DEBOUNCE_DELAY)
    }

    // 监听窗口尺寸变化
    window.on('resize', debouncedSave)

    // 监听窗口位置变化
    window.on('move', debouncedSave)

    // 监听窗口状态变化
    window.on('maximize', debouncedSave)
    window.on('unmaximize', debouncedSave)
    window.on('minimize', debouncedSave)
    window.on('restore', debouncedSave)
    window.on('enter-full-screen', debouncedSave)
    window.on('leave-full-screen', debouncedSave)

    // 窗口关闭前保存配置
    window.on('close', () => {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout)
      }
      this.saveCurrentWindowConfig()
    })
  }

  /**
   * 保存当前窗口配置
   */
  private async saveCurrentWindowConfig(): Promise<void> {
    if (!this.window || this.window.isDestroyed()) {
      return
    }

    try {
      const bounds = this.window.getBounds()
      const state: WindowState = {
        isMaximized: this.window.isMaximized(),
        isMinimized: this.window.isMinimized(),
        isFullScreen: this.window.isFullScreen()
      }

      await this.saveWindowConfig(bounds, state)
    } catch (error) {
      console.error('Failed to save current window config:', error)
    }
  }

  /**
   * 恢复窗口状态
   */
  async restoreWindowState(): Promise<void> {
    if (!this.window || this.window.isDestroyed()) {
      return
    }

    try {
      const savedConfig = await this.getSavedWindowConfig()
      if (!savedConfig) {
        return
      }

      // 恢复窗口状态
      if (savedConfig.state.isMaximized) {
        this.window.maximize()
      } else if (savedConfig.state.isFullScreen) {
        this.window.setFullScreen(true)
      }
    } catch (error) {
      console.error('Failed to restore window state:', error)
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
    this.window = null
  }
}

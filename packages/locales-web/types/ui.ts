/**
 * UI 相关的类型定义
 * 只保留项目中实际使用的核心配置类型
 */

export interface ThemeConfig {
  /** 主题模式 */
  mode: 'light' | 'dark' | 'auto'
  /** 主色调 */
  primaryColor?: string
  /** 字体大小 */
  fontSize?: 'small' | 'medium' | 'large'
  /** 圆角大小 */
  borderRadius?: 'none' | 'small' | 'medium' | 'large'
  /** 动画效果 */
  animation?: boolean
}

export interface LayoutConfig {
  /** 侧边栏宽度 */
  sidebarWidth?: number
  /** 是否折叠侧边栏 */
  sidebarCollapsed?: boolean
  /** 头部高度 */
  headerHeight?: number
  /** 是否固定头部 */
  headerFixed?: boolean
  /** 内容区域内边距 */
  contentPadding?: number
}

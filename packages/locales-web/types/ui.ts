/**
 * UI 组件相关的类型定义
 */

export interface ButtonProps {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 图标 */
  icon?: string
  /** 图标位置 */
  iconPosition?: 'left' | 'right'
  /** 是否为块级元素 */
  block?: boolean
}

export interface InputProps {
  /** 输入框类型 */
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'textarea'
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 最大长度 */
  maxLength?: number
  /** 最小长度 */
  minLength?: number
  /** 行数（textarea） */
  rows?: number
  /** 是否自动调整高度 */
  autoResize?: boolean
  /** 前缀图标 */
  prefixIcon?: string
  /** 后缀图标 */
  suffixIcon?: string
  /** 错误状态 */
  error?: boolean
  /** 错误信息 */
  errorMessage?: string
}

export interface SelectProps {
  /** 选项列表 */
  options: SelectOption[]
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否可搜索 */
  searchable?: boolean
  /** 是否多选 */
  multiple?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 加载状态 */
  loading?: boolean
  /** 无数据文本 */
  noDataText?: string
}

export interface SelectOption {
  /** 选项值 */
  value: string | number
  /** 选项标签 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
  /** 图标 */
  icon?: string
  /** 描述 */
  description?: string
}

export interface ModalProps {
  /** 是否显示 */
  visible?: boolean
  /** 标题 */
  title?: string
  /** 宽度 */
  width?: string | number
  /** 是否可关闭 */
  closable?: boolean
  /** 是否点击遮罩关闭 */
  maskClosable?: boolean
  /** 是否显示确认按钮 */
  showConfirm?: boolean
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
}

export interface TableColumn {
  /** 列键 */
  key: string
  /** 列标题 */
  title: string
  /** 列宽度 */
  width?: string | number
  /** 最小宽度 */
  minWidth?: string | number
  /** 是否可排序 */
  sortable?: boolean
  /** 是否可筛选 */
  filterable?: boolean
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否固定 */
  fixed?: 'left' | 'right'
  /** 自定义渲染 */
  render?: (value: any, record: any, index: number) => any
}

export interface TableProps {
  /** 表格数据 */
  data: any[]
  /** 表格列配置 */
  columns: TableColumn[]
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示斑马纹 */
  striped?: boolean
  /** 是否可选择行 */
  selectable?: boolean
  /** 选中的行 */
  selectedRows?: any[]
  /** 加载状态 */
  loading?: boolean
  /** 空数据文本 */
  emptyText?: string
  /** 分页配置 */
  pagination?: PaginationProps
}

export interface PaginationProps {
  /** 当前页 */
  current: number
  /** 每页大小 */
  pageSize: number
  /** 总数 */
  total: number
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean
  /** 是否显示每页大小选择器 */
  showSizeChanger?: boolean
  /** 每页大小选项 */
  pageSizeOptions?: number[]
}

export interface ToastOptions {
  /** 消息类型 */
  type?: 'success' | 'error' | 'warning' | 'info'
  /** 消息标题 */
  title?: string
  /** 消息内容 */
  message: string
  /** 持续时间（毫秒） */
  duration?: number
  /** 是否可关闭 */
  closable?: boolean
  /** 位置 */
  position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left'
}

export interface LoadingOptions {
  /** 加载文本 */
  text?: string
  /** 是否显示遮罩 */
  mask?: boolean
  /** 目标元素 */
  target?: HTMLElement | string
}

export interface ConfirmOptions {
  /** 标题 */
  title?: string
  /** 内容 */
  content: string
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 类型 */
  type?: 'info' | 'success' | 'warning' | 'error'
  /** 图标 */
  icon?: string
}

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

export interface KeyboardShortcut {
  /** 快捷键组合 */
  key: string
  /** 描述 */
  description: string
  /** 回调函数 */
  handler: () => void
  /** 是否全局 */
  global?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

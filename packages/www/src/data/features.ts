import { Brain, Layers, Shield, Zap, Puzzle, Globe, Keyboard, Palette } from 'lucide-react'

// Feature Data Interface
export interface FeatureData {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  details: string[]
  techSpecs: string[]
  gradient: string
  accentGradient: string
  iconBg: string
  iconColor: string
  badgeColor: string
  category: string
}

// Features Data
export const featuresData: FeatureData[] = [
  {
    id: 'smart-management',
    icon: Brain,
    title: '智能文档管理',
    description: '基于元数据驱动的自动化文件命名和结构化存放系统',
    category: '智能化',
    details: [
      '智能文件命名：基于标签自动生成规范化文件名',
      '自动分类归档：根据文档类型和项目关联自动存放到对应目录',
      '逻辑文档管理：一个抽象文档概念管理多个具体文件版本'
    ],
    techSpecs: ['元数据驱动架构', '智能命名规则', '结构化存放', '版本关联管理'],
    gradient:
      'from-blue-50/80 via-white/50 to-blue-50/30 dark:from-blue-950/40 dark:via-slate-900/30 dark:to-blue-950/20',
    accentGradient: 'from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400',
    iconBg: 'bg-blue-100/80 border border-blue-200/50 dark:bg-blue-900/30 dark:border-blue-800/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badgeColor: 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  },
  {
    id: 'version-control',
    icon: Layers,
    title: '文档版本管理系统',
    description: '逻辑文档与物理版本分离，完整追踪文档生命周期',
    category: '版本管理',
    details: [
      '版本标签管理：为每个文档版本添加有意义的标签和描述',
      '比赛关联：文档版本可关联到具体比赛和赛段',
      '官方版本指定：为逻辑文档指定当前官方版本',
      '版本历史追踪：完整记录文档的创建和修改历史'
    ],
    techSpecs: ['逻辑文档抽象', '版本标签系统', '比赛关联', '官方版本管理'],
    gradient:
      'from-green-50/80 via-white/50 to-green-50/30 dark:from-green-950/40 dark:via-slate-900/30 dark:to-green-950/20',
    accentGradient: 'from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400',
    iconBg:
      'bg-green-100/80 border border-green-200/50 dark:bg-green-900/30 dark:border-green-800/30',
    iconColor: 'text-green-600 dark:text-green-400',
    badgeColor: 'bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  },
  // {
  //   id: 'team-collaboration',
  //   icon: Users,
  //   title: '团队协作中心',
  //   description: '统一的多项目团队协作和成员管理平台',
  //   category: '协作管理',
  //   details: [
  //     '成员权限管理：细粒度的文档访问和编辑权限控制',
  //     '协作工作流：支持文档审批、评论和协同编辑',
  //     '任务分配：基于项目的任务分配和进度跟踪',
  //     '通知系统：实时推送项目动态和重要更新'
  //   ],
  //   techSpecs: ['支持 100+ 团队成员', '实时协作同步', '角色权限矩阵', '活动日志审计'],
  //   gradient:
  //     'from-purple-50/80 via-white/50 to-purple-50/30 dark:from-purple-950/40 dark:via-slate-900/30 dark:to-purple-950/20',
  //   accentGradient: 'from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400',
  //   iconBg:
  //     'bg-purple-100/80 border border-purple-200/50 dark:bg-purple-900/30 dark:border-purple-800/30',
  //   iconColor: 'text-purple-600 dark:text-purple-400',
  //   badgeColor: 'bg-purple-100/80 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  // },
  {
    id: 'local-storage',
    icon: Shield,
    title: '本地优先存储',
    description: '完全本地化的数据存储，确保数据主权和隐私安全',
    category: '数据安全',
    details: [
      '本地数据库：SQLite 本地存储，无需云端依赖',
      '数据自主可控：用户对自己的数据有完全控制权',
      '云同步兼容：兼容现有云同步备份方案',
      '离线优先：无需网络连接即可完整使用'
    ],
    techSpecs: ['SQLite 本地存储', '零网络依赖', '云同步兼容', '跨平台支持'],
    gradient:
      'from-orange-50/80 via-white/50 to-orange-50/30 dark:from-orange-950/40 dark:via-slate-900/30 dark:to-orange-950/20',
    accentGradient: 'from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400',
    iconBg:
      'bg-orange-100/80 border border-orange-200/50 dark:bg-orange-900/30 dark:border-orange-800/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    badgeColor: 'bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  },
  {
    id: 'search-engine',
    icon: Zap,
    title: '全文搜索引擎',
    description: '基于 Fuse.js 的智能搜索，支持模糊匹配和复杂查询',
    category: '搜索技术',
    details: [
      '全文内容搜索：支持文档名称、描述、标签等全方位搜索',
      '智能模糊匹配：容错搜索，即使拼写错误也能找到结果',
      '高级过滤器：按时间、类型、项目、比赛等多维度筛选',
      '实时搜索：输入即搜索，毫秒级响应体验'
    ],
    techSpecs: ['Fuse.js 搜索引擎', '支持模糊匹配', '中英文混合搜索', '实时搜索建议'],
    gradient:
      'from-yellow-50/80 via-white/50 to-yellow-50/30 dark:from-yellow-950/40 dark:via-slate-900/30 dark:to-yellow-950/20',
    accentGradient: 'from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400',
    iconBg:
      'bg-yellow-100/80 border border-yellow-200/50 dark:bg-yellow-900/30 dark:border-yellow-800/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    badgeColor: 'bg-yellow-100/80 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  },
  {
    id: 'plugin-system',
    icon: Puzzle,
    title: '基于 Zustand 的插件系统',
    description: '可插拔模块化架构，支持功能动态扩展和自定义开发',
    category: '系统架构',
    details: [
      '插件注册机制：动态注册和卸载插件，支持热插拔',
      '命令面板集成：插件可扩展命令面板功能',
      '状态隔离管理：每个插件独立的状态管理和错误边界',
      '开发者友好：提供完整的插件开发 API 和文档'
    ],
    techSpecs: ['Zustand 状态管理', '插件生命周期管理', '错误边界保护', 'TypeScript 类型安全'],
    gradient:
      'from-indigo-50/80 via-white/50 to-indigo-50/30 dark:from-indigo-950/40 dark:via-slate-900/30 dark:to-indigo-950/20',
    accentGradient: 'from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400',
    iconBg:
      'bg-indigo-100/80 border border-indigo-200/50 dark:bg-indigo-900/30 dark:border-indigo-800/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    badgeColor: 'bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
  },
  {
    id: 'i18n-system',
    icon: Globe,
    title: '现代化国际化系统',
    description: '类型安全的 i18n 架构，支持动态语言包加载和切换',
    category: '国际化',
    details: [
      '类型安全翻译：TypeScript 模块增强，完全嵌套的类型推断',
      '动态语言包：Vite 插件实现代码分割和按需加载',
      '本地化工具链：翻译完成度统计、新语言添加、键值验证',
      '独立编辑器：Nuxt 3 本地化编辑器，支持实时翻译管理'
    ],
    techSpecs: ['i18next', 'Vite 插件代码分割', 'Nuxt 3 编辑器'],
    gradient:
      'from-teal-50/80 via-white/50 to-teal-50/30 dark:from-teal-950/40 dark:via-slate-900/30 dark:to-teal-950/20',
    accentGradient: 'from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400',
    iconBg: 'bg-teal-100/80 border border-teal-200/50 dark:bg-teal-900/30 dark:border-teal-800/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
    badgeColor: 'bg-teal-100/80 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
  },
  {
    id: 'shortcut-system',
    icon: Keyboard,
    title: '统一快捷键管理系统',
    description: '页面级和全局级快捷键管理，支持作用域隔离和优先级控制',
    category: '用户体验',
    details: [
      '快捷键作用域：支持页面级和全局级快捷键隔离',
      '优先级管理：智能处理快捷键冲突和优先级',
      '快捷键提示：长按⌘键显示当前页面可用快捷键',
      'macOS风格：符合苹果设计规范的快捷键显示'
    ],
    techSpecs: ['作用域隔离', '优先级控制', '快捷键提示overlay', 'macOS风格设计'],
    gradient:
      'from-slate-50/80 via-white/50 to-slate-50/30 dark:from-slate-950/40 dark:via-slate-900/30 dark:to-slate-950/20',
    accentGradient: 'from-slate-500 to-gray-500 dark:from-slate-400 dark:to-gray-400',
    iconBg:
      'bg-slate-100/80 border border-slate-200/50 dark:bg-slate-900/30 dark:border-slate-800/30',
    iconColor: 'text-slate-600 dark:text-slate-400',
    badgeColor: 'bg-slate-100/80 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
  },
  {
    id: 'theme-system',
    icon: Palette,
    title: '自定义主题管理系统',
    description: '支持CSS主题导入导出，运行时动态应用自定义主题，构建独特样式',
    category: '个性化',
    details: [
      'CSS主题注入：运行时动态应用自定义CSS主题',
      '主题导入导出：支持用户分享和管理自定义主题',
      '实时预览：主题编辑时实时预览效果',
      '系统集成：与现有light/dark/system主题完美兼容'
    ],
    techSpecs: ['运行时CSS注入', '主题导入导出', '实时预览', '系统主题兼容'],
    gradient:
      'from-pink-50/80 via-white/50 to-pink-50/30 dark:from-pink-950/40 dark:via-slate-900/30 dark:to-pink-950/20',
    accentGradient: 'from-pink-500 to-rose-500 dark:from-pink-400 dark:to-rose-400',
    iconBg: 'bg-pink-100/80 border border-pink-200/50 dark:bg-pink-900/30 dark:border-pink-800/30',
    iconColor: 'text-pink-600 dark:text-pink-400',
    badgeColor: 'bg-pink-100/80 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
  }
]

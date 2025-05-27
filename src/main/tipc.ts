import { tipc } from '@egoist/tipc/main'
import { projectRouter } from './routers/project.router'
import { documentRouter } from './routers/document.router'
import { fileRouter } from './routers/file.router'
import { settingsRouter } from './routers/settings.router'
import { systemRouter } from './routers/system.router'
import { logicalDocumentRouter } from './routers/logical-document.router'
import { documentVersionRouter } from './routers/document-version.router'
import { managedFileRouter } from './routers/managed-file.router'
import { intelligentNamingRouter } from './routers/intelligent-naming.router'
import { intelligentPathGeneratorRouter } from './routers/intelligent-path-generator.router'
import { intelligentFileImportRouter } from './routers/intelligent-file-import.router'

const t = tipc.create()

export const router = {
  // 项目相关路由
  ...projectRouter(t),

  // 文档相关路由
  ...documentRouter(t),

  // 文件相关路由
  ...fileRouter(t),

  // 设置相关路由
  ...settingsRouter(t),

  // 系统相关路由
  ...systemRouter(t),

  // 逻辑文档相关路由
  ...logicalDocumentRouter(t),

  // 文档版本相关路由
  ...documentVersionRouter(t),

  // 受管文件相关路由
  ...managedFileRouter(t),

  // 智能命名相关路由
  ...intelligentNamingRouter(t),

  // 智能路径生成相关路由
  ...intelligentPathGeneratorRouter(t),

  // 智能文件导入相关路由
  ...intelligentFileImportRouter(t)
}

export type Router = typeof router

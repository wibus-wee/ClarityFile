import { tipc } from '@egoist/tipc/main'
import { projectRouter } from './routers/project.router'
import { documentRouter } from './routers/document.router'
import { fileRouter } from './routers/file.router'
import { settingsRouter } from './routers/settings.router'
import { systemRouter } from './routers/system.router'

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
  ...systemRouter(t)
}

export type Router = typeof router

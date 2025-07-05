import { Fragment, PropsWithChildren } from 'react'
import styles from './index.module.css'
import { AppSidebar } from '@renderer/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@clarity/shadcn/ui/breadcrumb'
import { Separator } from '@clarity/shadcn/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@clarity/shadcn/ui/sidebar'
import { useScrollTop } from '@renderer/hooks/use-scroll-top'

import { NavActions } from '../nav-actions'
import { Link } from '@tanstack/react-router'
import { cn } from '@renderer/lib/utils'
import { useBreadcrumb } from '@renderer/hooks/use-breadcrumb'
import {
  GlobalFileDropListener,
  GlobalFileDropOverlay,
  NestedImportAssistant,
  DragDropProvider
} from '@renderer/components/import-assistant'
import '@renderer/components/import-assistant/styles/global-file-drop.css'

export function ClarityLayout({ children }: PropsWithChildren) {
  const breadcrumbs = useBreadcrumb()
  const isAtTop = useScrollTop()

  return (
    <DragDropProvider>
      <div>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header
              className={cn(
                'flex h-16 shrink-0 items-center gap-2 sticky top-0 z-10',
                styles.header
              )}
            >
              {!isAtTop && (
                <span className={cn(styles.blur, 'absolute')}>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              )}

              <div className={cn('flex flex-1 items-center gap-2 px-3 absolute', styles.content)}>
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((item) => (
                      <Fragment key={item.path}>
                        <BreadcrumbItem>
                          {item.isLast ? (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link to={item.path}>{item.label}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!item.isLast && <BreadcrumbSeparator />}
                      </Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="ml-auto px-3">
                <NavActions />
              </div>
            </header>
            <div className="p-4 px-9">{children}</div>
          </SidebarInset>
        </SidebarProvider>

        {/* 全局文件拖拽监听器 */}
        <GlobalFileDropListener />

        {/* 全局文件拖拽覆盖层 */}
        <GlobalFileDropOverlay />

        {/* 智能文件导入助手（使用 True Nested Drawer） */}
        <NestedImportAssistant />
      </div>
    </DragDropProvider>
  )
}

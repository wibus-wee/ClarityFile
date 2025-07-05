import { AlertTriangle, LifeBuoy, Send } from 'lucide-react'

import { NavMain } from '@renderer/components/nav-main'
import { NavSecondary } from '@renderer/components/nav-secondary'
import { NavUser } from '@renderer/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem
} from '@clarity/shadcn/ui/sidebar'
import { Avatar } from '@heroui/react'
import { CONSTANTS } from '@renderer/constants'
import { useAppStore } from '@renderer/stores/app'
import { transformedRoutes } from '@renderer/routers'

const data = {
  navMain: transformedRoutes,
  navSecondary: [
    {
      title: '帮助支持',
      url: '#',
      icon: LifeBuoy
    },
    {
      title: '意见反馈',
      url: '#',
      icon: Send
    },
    {
      title: '错误测试',
      url: '#/error-test',
      icon: AlertTriangle
    }
  ],
  projects: [
    // {
    //   name: "Design Engineering",
    //   url: "#",
    //   icon: Frame,
    // },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAppStore((state) => state.user)

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="p-2 flex items-center gap-3">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Avatar
                  name={CONSTANTS.info.name[0]}
                  size="sm"
                  isBordered
                  radius="sm"
                  className="transition-transform text-sm"
                  color="secondary"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{CONSTANTS.info.name}</span>
                <span className="truncate text-xs">
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Guest'}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  )
}

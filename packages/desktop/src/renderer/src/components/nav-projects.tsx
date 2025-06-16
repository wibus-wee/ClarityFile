import { Folder, MoreHorizontal, Share, Trash2, type LucideIcon } from 'lucide-react'

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem
} from '@heroui/react'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@clarity/shadcn/ui/sidebar'

export function NavProjects({
  projects
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <Dropdown placement={isMobile ? 'bottom-end' : 'right-start'}>
              <DropdownTrigger>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownTrigger>
              <DropdownMenu aria-label="Project actions" className="w-48">
                <DropdownSection>
                  <DropdownItem
                    key="view"
                    startContent={<Folder className="w-4 h-4 text-default-500" />}
                  >
                    View Project
                  </DropdownItem>
                  <DropdownItem
                    key="share"
                    startContent={<Share className="w-4 h-4 text-default-500" />}
                  >
                    Share Project
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<Trash2 className="w-4 h-4" />}
                  >
                    Delete Project
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton>
            <MoreHorizontal />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@clarity/shadcn/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@clarity/shadcn/ui/sidebar'

import { AnimatePresence } from 'framer-motion'
import { Link, useLocation } from '@tanstack/react-router'

export function NavMain({
  items
}: {
  items: {
    group: string
    items: {
      title: string
      url: string
      icon: LucideIcon
      isActive?: boolean
      items?: {
        title: string
        url: string
      }[]
    }[]
  }[]
}) {
  const location = useLocation()

  const isParentActive = (item: any) => {
    if (location.pathname === item.url) {
      return true
    }

    if (item.items?.length) {
      return item.items.some((subItem: any) => {
        if (subItem.url.startsWith('?')) {
          return `${location.pathname}${location.search}` === `${item.url}${subItem.url}`
        }
        return location.pathname === subItem.url
      })
    }

    return false
  }

  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.group}>
          <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => {
              const parentActive = isParentActive(item)

              return (
                <Collapsible key={item.title} asChild open={parentActive}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={location.pathname === item.url}
                      asChild
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <>
                        <AnimatePresence>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                              <ChevronRight />
                              <span className="sr-only">Toggle</span>
                            </SidebarMenuAction>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub
                              initial={{ opacity: 0, height: 0, y: -20 }}
                              animate={{ opacity: 1, height: 'auto', y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -20 }}
                              transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20
                              }}
                            >
                              {item.items?.map((subItem) => (
                                <SidebarMenuSubItem
                                  key={subItem.title}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 30,
                                    delay: 0.05
                                  }}
                                >
                                  <SidebarMenuSubButton
                                    isActive={
                                      subItem.url.startsWith('?')
                                        ? `${location.pathname}${location.search}` ===
                                          `${item.url}${subItem.url}`
                                        : location.pathname === subItem.url
                                    }
                                    asChild
                                  >
                                    <Link
                                      to={item.url}
                                      search={
                                        subItem.url.startsWith('?')
                                          ? Object.fromEntries(
                                              new URLSearchParams(subItem.url.substring(1))
                                            )
                                          : undefined
                                      }
                                    >
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </AnimatePresence>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}

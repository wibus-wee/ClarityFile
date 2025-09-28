'use client'

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Sparkles,
  Sun
} from 'lucide-react'

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
  User
} from '@heroui/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSidebar } from '@clarity/shadcn/ui/sidebar'
import { useTheme } from '@renderer/hooks/use-theme'
import { useAppStore } from '@renderer/stores/app'
import { User as UserType } from '@renderer/types/user'
import { useLogout } from '@renderer/hooks/use-tipc'

export function NavUser({ user }: { user: UserType }) {
  const { isMobile } = useSidebar()
  const { currentTheme, toggleTheme } = useTheme()
  const clearUser = useAppStore((state) => state.clearUser)
  const { trigger: logout } = useLogout()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return

    try {
      setIsLoggingOut(true)
      await logout()
      clearUser()
      toast.success('已退出登录')
    } catch (error) {
      console.error('退出登录失败:', error)
      toast.error(`退出登录失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Dropdown placement={isMobile ? 'bottom' : 'right'}>
      <DropdownTrigger>
        <Button variant="light" className="w-full justify-start gap-2 px-2 py-6">
          <User
            name={user.name}
            description={user.email}
            avatarProps={{
              src: user.avatar,
              name: user.name,
              size: 'sm',
              isBordered: true,
              className: 'transition-transform',
              color: 'default'
            }}
            className="transition-transform"
          />
          <ChevronsUpDown className="ml-auto h-4 w-4" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu actions" className="w-[280px]">
        <DropdownSection showDivider>
          <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
            <User
              name={user.name}
              description={user.email}
              avatarProps={{
                src: user.avatar,
                size: 'sm',
                isBordered: true
              }}
            />
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider>
          <DropdownItem key="upgrade" startContent={<Sparkles className="h-4 w-4" />}>
            Upgrade to Pro
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider>
          <DropdownItem key="account" startContent={<BadgeCheck className="h-4 w-4" />}>
            Account
          </DropdownItem>
          <DropdownItem key="billing" startContent={<CreditCard className="h-4 w-4" />}>
            Billing
          </DropdownItem>
          <DropdownItem key="notifications" startContent={<Bell className="h-4 w-4" />}>
            Notifications
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider>
          <DropdownItem
            key="logout"
            className="text-danger"
            color="danger"
            startContent={<LogOut className="h-4 w-4" />}
            onPress={handleLogout}
            isDisabled={isLoggingOut}
          >
            Log out
          </DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem
            key="theme"
            onPress={toggleTheme}
            startContent={
              currentTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            }
          >
            {currentTheme === 'dark' ? 'Toggle Light' : 'Toggle Dark'}
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}

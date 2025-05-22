"use client"

import {
  MoreHorizontal,
} from "lucide-react"

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
} from "@heroui/react"

// 分组的操作项数据
const actionGroups = [
  // [
  //   {
  //     label: "Customize Page",
  //     icon: Settings2,
  //     onClick: () => {},
  //   },
  //   {
  //     label: "Turn into wiki",
  //     icon: FileText,
  //     onClick: () => {},
  //   },
  // ],
]

export function NavActions() {
  return (
    <div className="flex items-center gap-1.5">
      {/* 更多操作下拉菜单 */}
      <Dropdown>
        <DropdownTrigger>
          <Button
            isIconOnly
            variant="light"
            radius="sm"
            size="sm"
            className="min-w-unit-8 h-unit-8"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Actions"
          className="min-w-[220px]"
        >
          {actionGroups.map((group, groupIndex) => (
            <DropdownSection 
              key={groupIndex}
              showDivider={groupIndex !== actionGroups.length - 1}
            >
              {group.map((item) => (
                <DropdownItem
                  key={item.label}
                  startContent={<item.icon className="h-4 w-4 text-default-500" />}
                  onPress={item.onClick}
                >
                  {item.label}
                </DropdownItem>
              ))}
            </DropdownSection>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

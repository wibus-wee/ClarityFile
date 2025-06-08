import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@renderer/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { COMMON_ASSET_TYPES } from '../../../../main/types/asset-schemas'

interface AssetTypeComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

// 动画配置 - 符合macOS风格
const ANIMATION_CONFIG = {
  spring: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 1
  },
  fadeIn: {
    opacity: 1,
    scale: 1,
    y: 0
  },
  fadeOut: {
    opacity: 0,
    scale: 0.95,
    y: -10
  }
} as const

export function AssetTypeCombobox({
  value,
  onValueChange,
  placeholder = '选择或输入资产类型...',
  disabled = false
}: AssetTypeComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // 过滤选项 - 支持按label、description、value搜索
  const filteredOptions = COMMON_ASSET_TYPES.filter(
    (option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.value.toLowerCase().includes(searchValue.toLowerCase())
  )

  // 检查当前值是否在预定义选项中
  const selectedOption = COMMON_ASSET_TYPES.find((option) => option.value === value)

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value) {
      onValueChange('')
    } else {
      onValueChange(selectedValue)
    }
    setOpen(false)
    setSearchValue('')
  }

  const handleCustomValue = () => {
    if (searchValue.trim()) {
      onValueChange(searchValue.trim())
      setOpen(false)
      setSearchValue('')
    }
  }

  const displayValue = selectedOption?.label || value || placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal transition-all duration-200',
            'hover:bg-muted/50 hover:border-primary/20',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <span className="truncate">{displayValue}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={ANIMATION_CONFIG.spring}>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </motion.div>
        </Button>
      </PopoverTrigger>
      <AnimatePresence>
        {open && (
          <PopoverContent className="w-full p-0" align="start" asChild>
            <motion.div
              initial={ANIMATION_CONFIG.fadeOut}
              animate={ANIMATION_CONFIG.fadeIn}
              exit={ANIMATION_CONFIG.fadeOut}
              transition={ANIMATION_CONFIG.spring}
            >
              <Command>
                <CommandInput
                  placeholder="搜索资产类型..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                  className="border-none focus:ring-0"
                />
                <CommandList>
                  <CommandEmpty className="py-6 text-center text-sm">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <p className="text-muted-foreground">未找到匹配的资产类型</p>
                      {searchValue.trim() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCustomValue}
                          className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          使用 &quot;{searchValue.trim()}&quot;
                        </Button>
                      )}
                    </motion.div>
                  </CommandEmpty>
                  <CommandGroup>
                    <AnimatePresence>
                      {filteredOptions.map((option, index) => (
                        <motion.div
                          key={option.value}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{
                            ...ANIMATION_CONFIG.spring,
                            delay: index * 0.02
                          }}
                        >
                          <CommandItem
                            value={option.value}
                            onSelect={handleSelect}
                            className={cn(
                              'flex flex-col items-start gap-1 py-3 cursor-pointer',
                              'hover:bg-muted/50 transition-colors duration-150',
                              'data-[selected=true]:bg-primary/10'
                            )}
                          >
                            <div className="flex w-full items-center justify-between">
                              <span className="font-medium">{option.label}</span>
                              <Check
                                className={cn(
                                  'h-4 w-4 transition-opacity duration-150',
                                  value === option.value ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          </CommandItem>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CommandGroup>
                </CommandList>
              </Command>
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  )
}

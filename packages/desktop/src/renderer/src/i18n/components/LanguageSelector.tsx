import { useState } from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { Button } from '@clarity/shadcn/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@clarity/shadcn/ui/dropdown-menu'
import { useLanguage, useTranslation } from '../hooks'
import type { SupportedLanguage } from '../types'

interface LanguageSelectorProps {
  variant?: 'default' | 'compact'
  showFlag?: boolean
  showNativeName?: boolean
  className?: string
}

/**
 * 语言选择器组件
 * 提供语言切换的 UI 界面
 */
export function LanguageSelector({
  variant = 'default',
  showFlag = true,
  showNativeName = true,
  className = ''
}: LanguageSelectorProps) {
  const { currentLanguage, availableLanguages, changeLanguage, isChanging } = useLanguage()

  const [isOpen, setIsOpen] = useState(false)

  const currentLangConfig = availableLanguages.find((lang) => lang.code === currentLanguage)

  const handleLanguageChange = async (language: SupportedLanguage) => {
    try {
      await changeLanguage(language)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${className}`}
            disabled={isChanging}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {availableLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {showFlag && language.flag && <span className="text-sm">{language.flag}</span>}
                <span className="text-sm">
                  {showNativeName ? language.nativeName : language.name}
                </span>
              </div>
              {currentLanguage === language.code && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`justify-between ${className}`} disabled={isChanging}>
          <div className="flex items-center gap-2">
            {showFlag && currentLangConfig?.flag && <span>{currentLangConfig.flag}</span>}
            <span>{showNativeName ? currentLangConfig?.nativeName : currentLangConfig?.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {showFlag && language.flag && <span>{language.flag}</span>}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{language.nativeName}</span>
                {showNativeName && language.name !== language.nativeName && (
                  <span className="text-xs text-muted-foreground">{language.name}</span>
                )}
              </div>
            </div>
            {currentLanguage === language.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

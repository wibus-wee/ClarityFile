/**
 * FontDetectionDisplay - 智能字体检测显示组件
 *
 * 显示从CSS中自动检测到的字体信息
 */

import { useMemo } from 'react'
import { Type, Globe, Monitor, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { Badge } from '@clarity/shadcn/ui/badge'
import { FontParser } from '@renderer/lib/font-parser'

interface FontDetectionDisplayProps {
  cssContent: string
}

export function FontDetectionDisplay({ cssContent }: FontDetectionDisplayProps) {
  const fontParseResult = useMemo(() => {
    return FontParser.parseFontsFromCSS(cssContent)
  }, [cssContent])

  const { fonts, googleFontsUrl, systemFonts, customFonts } = fontParseResult

  // 如果没有检测到任何字体，不显示组件
  if (fonts.length === 0 && systemFonts.length === 0 && customFonts.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-muted-foreground" />
        <h5 className="text-sm font-medium">检测到的字体</h5>
      </div>

      {/* Google Fonts */}
      {fonts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-green-600" />
            <span className="text-xs font-medium text-green-700">
              Google Fonts ({fonts.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {fonts.map((font) => (
              <Badge
                key={font.family}
                variant="secondary"
                className="text-xs bg-green-50 text-green-700 border-green-200"
              >
                {FontParser.getFontDisplayName(font.family)}
              </Badge>
            ))}
          </div>
          {googleFontsUrl && (
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1 mb-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>将自动加载以下字体链接：</span>
              </div>
              <code className="block bg-muted/50 p-2 rounded text-xs break-all">
                {googleFontsUrl}
              </code>
            </div>
          )}
        </div>
      )}

      {/* 系统字体 */}
      {systemFonts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Monitor className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">
              系统字体 ({systemFonts.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {systemFonts.slice(0, 8).map((font) => (
              <Badge
                key={font}
                variant="secondary"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                {font}
              </Badge>
            ))}
            {systemFonts.length > 8 && (
              <Badge variant="outline" className="text-xs">
                +{systemFonts.length - 8} 更多
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="w-3 h-3 text-blue-600" />
            <span>系统字体无需额外加载，直接使用用户设备上的字体。</span>
          </div>
        </div>
      )}

      {/* 自定义字体 */}
      {customFonts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">
              未识别字体 ({customFonts.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {customFonts.slice(0, 6).map((font) => (
              <Badge
                key={font}
                variant="secondary"
                className="text-xs bg-amber-50 text-amber-700 border-amber-200"
              >
                {font}
              </Badge>
            ))}
            {customFonts.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{customFonts.length - 6} 更多
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>这些字体可能需要手动加载或确保用户设备上已安装。</span>
          </div>
        </div>
      )}

      {/* 总结信息 */}
      <div className="pt-2 border-t border-muted/50">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Type className="w-3 h-3 text-muted-foreground" />
          <span>系统会自动为 Google Fonts 生成优化的加载链接，无需手动配置。</span>
        </div>
      </div>
    </div>
  )
}

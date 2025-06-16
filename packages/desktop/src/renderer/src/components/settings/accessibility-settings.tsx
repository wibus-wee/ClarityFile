'use client'

export function AccessibilitySettings() {
  return (
    <div className="space-y-8">
      {/* 无障碍功能 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">无障碍功能</h3>
          <p className="text-sm text-muted-foreground">配置应用程序的无障碍功能</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
            <p className="text-muted-foreground">无障碍设置功能正在开发中...</p>
            <p className="text-sm text-muted-foreground mt-2">
              即将支持屏幕阅读器、高对比度模式、键盘导航等功能
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

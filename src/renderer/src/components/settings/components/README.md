# 设置组件库

这个目录包含了一套通用的设置组件，用于简化设置页面的开发和样式调整。

## 组件概览

### SettingsForm

主要的表单容器组件，处理表单状态、数据加载和保存。

```tsx
<SettingsForm
  category="advanced"
  schema={advancedSettingsSchema}
  defaultValues={defaultValues}
  mapFormDataToSettings={mapFormDataToSettings}
  submitButtonText="保存设置"
>
  {(form) => (
    // 表单内容
  )}
</SettingsForm>
```

### SettingsSection

用于组织设置项的分组容器。

```tsx
<SettingsSection
  title="开发者选项"
  description="配置应用程序的高级功能和开发者选项"
  showSeparator={true}
>
  {/* 设置项 */}
</SettingsSection>
```

### SettingsSwitchField

开关类型的设置项。

```tsx
<SettingsSwitchField
  control={form.control}
  name="debugMode"
  label="调试模式"
  description="启用详细的调试信息"
  showSeparator={true}
/>
```

### SettingsInputField

输入框类型的设置项。

```tsx
<SettingsInputField
  control={form.control}
  name="maxLogFiles"
  label="最大日志文件数"
  description="保留的最大日志文件数量"
  type="number"
  min="1"
  max="100"
/>
```

### SettingsSelectField

下拉选择框类型的设置项。

```tsx
<SettingsSelectField
  control={form.control}
  name="fontFamily"
  label="字体系列"
  description="选择界面使用的字体"
  placeholder="选择字体"
  options={fontOptions}
/>
```

### SettingsSliderField

滑块类型的设置项。

```tsx
<SettingsSliderField
  control={form.control}
  name="fontSize"
  label="字体大小"
  description="调整界面字体大小"
  min={12}
  max={20}
  step={1}
  formatValue={(value) => `${value}px`}
/>
```

### SettingsRadioField

单选按钮组类型的设置项。

```tsx
<SettingsRadioField
  control={form.control}
  name="theme"
  label="主题模式"
  options={themeOptions}
  orientation="horizontal"
/>
```

### SettingsResetSection

重置设置的危险操作区域。

```tsx
<SettingsResetSection
  title="重置设置"
  description="将所有设置恢复为默认值"
  buttonText="重置所有设置"
  confirmTitle="确认重置设置"
  confirmDescription="此操作将删除所有自定义设置并恢复为默认值。此操作无法撤销。"
  successMessage="所有设置已重置为默认值"
/>
```

## 使用示例

查看以下文件以了解完整的使用示例：

- `advanced-settings.tsx` - 高级设置页面
- `appearance-settings.tsx` - 外观设置页面
- `notification-settings.tsx` - 通知设置页面
- `general-settings.tsx` - 常规设置页面

### 完整示例

```tsx
export function MySettings() {
  return (
    <SettingsForm
      category="my-category"
      schema={mySchema}
      defaultValues={defaultValues}
      mapFormDataToSettings={mapFormDataToSettings}
    >
      {(form) => (
        <>
          <SettingsSection title="基本设置">
            <SettingsSwitchField
              control={form.control}
              name="enabled"
              label="启用功能"
              description="启用或禁用此功能"
            />

            <SettingsInputField
              control={form.control}
              name="name"
              label="名称"
              placeholder="输入名称"
            />
          </SettingsSection>

          <SettingsSection title="高级设置" showSeparator={false}>
            <SettingsSelectField
              control={form.control}
              name="type"
              label="类型"
              options={typeOptions}
            />
          </SettingsSection>
        </>
      )}
    </SettingsForm>
  )
}
```

## 优势

1. **一致性**: 所有设置页面使用相同的组件，确保界面一致性
2. **可维护性**: 样式修改只需要在组件中进行，自动应用到所有使用的地方
3. **类型安全**: 完全的 TypeScript 支持
4. **灵活性**: 支持自定义样式和行为
5. **可复用性**: 组件可以在不同的设置页面中重复使用

## 自定义样式

所有组件都支持 `className` 属性来自定义样式：

```tsx
<SettingsSwitchField
  control={form.control}
  name="debugMode"
  label="调试模式"
  className="custom-switch-field"
/>
```

## 扩展组件

如果需要新的设置组件类型，可以参考现有组件的实现模式：

1. 使用 `react-hook-form` 的 `Control` 和 `FieldPath` 类型
2. 使用 shadcn/ui 的 Form 组件
3. 支持 `className` 自定义样式
4. 导出到 `index.ts` 文件中

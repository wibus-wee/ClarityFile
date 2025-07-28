# Command Palette 详情视图组件库

这套组件专门用于插件在 CommandView 中渲染详情内容，提供开箱即用的 UI 组件，确保所有插件的视觉风格与 command-palette 保持一致。

## 组件概览

### DetailItem - 详情项组件
用于显示单个项目，支持图标、标题、副标题、描述和标签。

```tsx
import { DetailItem } from '../common'
import { FileIcon } from 'lucide-react'

<DetailItem
  icon={FileIcon}
  title="文档.txt"
  subtitle="最后修改: 2小时前"
  description="这是一个重要的文档文件"
  badge="文档"
  onClick={() => openFile()}
/>
```

### DetailSection - 分组组件
用于组织和分组详情内容。

```tsx
import { DetailSection, DetailItem } from '../common'

<DetailSection title="最近文件">
  <DetailItem title="文件1.txt" />
  <DetailItem title="文件2.txt" />
</DetailSection>
```

### DetailInput - 输入框组件
用于搜索和输入操作。

```tsx
import { DetailInput } from '../common'
import { SearchIcon } from 'lucide-react'

<DetailInput
  icon={SearchIcon}
  placeholder="搜索文件..."
  value={query}
  onChange={setQuery}
  onEnter={handleSearch}
/>
```

### DetailButton - 按钮组件
用于操作按钮。

```tsx
import { DetailButton } from '../common'
import { PlayIcon } from 'lucide-react'

<DetailButton
  icon={PlayIcon}
  onClick={handlePlay}
  variant="default"
>
  播放
</DetailButton>
```

### DetailStatus - 状态组件
用于显示操作状态。

```tsx
import { DetailStatus } from '../common'

<DetailStatus status="success" message="操作成功" />
<DetailStatus status="error" message="操作失败" />
<DetailStatus status="pending" message="正在处理..." />
```

### DetailLoading - 加载组件
用于显示加载状态。

```tsx
import { DetailLoading } from '../common'

<DetailLoading message="正在搜索..." />
```

### DetailEmpty - 空状态组件
用于显示空状态。

```tsx
import { DetailEmpty, DetailButton } from '../common'
import { SearchIcon } from 'lucide-react'

<DetailEmpty
  icon={SearchIcon}
  title="没有找到结果"
  description="尝试使用不同的关键词搜索"
  action={<DetailButton onClick={retry}>重新搜索</DetailButton>}
/>
```

### DetailLayout - 布局组件
提供左右分栏布局。

```tsx
import { 
  DetailLayout, 
  DetailSidebar, 
  DetailMain,
  DetailSection,
  DetailItem 
} from '../common'

<DetailLayout>
  <DetailSidebar>
    <DetailSection title="分类">
      <DetailItem title="文档" onClick={() => setFilter('docs')} />
      <DetailItem title="图片" onClick={() => setFilter('images')} />
    </DetailSection>
  </DetailSidebar>
  
  <DetailMain>
    <DetailSection title="文件列表">
      <DetailItem title="文件1.txt" />
      <DetailItem title="文件2.txt" />
    </DetailSection>
  </DetailMain>
</DetailLayout>
```

## 完整示例

这是一个文件搜索插件的完整示例：

```tsx
import React, { useState } from 'react'
import {
  DetailLayout,
  DetailSidebar,
  DetailMain,
  DetailSection,
  DetailItem,
  DetailInput,
  DetailButton,
  DetailLoading,
  DetailEmpty,
  DetailStatus
} from '../common'
import { FileIcon, FolderIcon, SearchIcon } from 'lucide-react'

export function FileSearchPlugin() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleSearch = async () => {
    setLoading(true)
    // 搜索逻辑
    setLoading(false)
  }

  return (
    <DetailLayout>
      <DetailSidebar>
        <DetailSection title="搜索">
          <DetailInput
            icon={SearchIcon}
            placeholder="搜索文件..."
            value={query}
            onChange={setQuery}
            onEnter={handleSearch}
          />
          <DetailButton onClick={handleSearch} variant="default">
            搜索
          </DetailButton>
        </DetailSection>

        <DetailSection title="分类">
          <DetailItem
            icon={FolderIcon}
            title="所有文件"
            onClick={() => setSelectedCategory('all')}
          />
          <DetailItem
            icon={FileIcon}
            title="文档"
            onClick={() => setSelectedCategory('docs')}
          />
        </DetailSection>
      </DetailSidebar>

      <DetailMain>
        <DetailSection title="搜索结果">
          {loading ? (
            <DetailLoading message="正在搜索..." />
          ) : files.length === 0 ? (
            <DetailEmpty
              title="没有找到文件"
              description="尝试使用不同的关键词"
              action={<DetailButton onClick={handleSearch}>重新搜索</DetailButton>}
            />
          ) : (
            files.map(file => (
              <DetailItem
                key={file.id}
                icon={FileIcon}
                title={file.name}
                subtitle={`修改时间: ${file.modifiedTime}`}
                badge={file.type}
                onClick={() => openFile(file)}
              />
            ))
          )}
        </DetailSection>
      </DetailMain>
    </DetailLayout>
  )
}
```

## 设计原则

1. **一致性**: 所有组件都基于 command-palette 的设计语言
2. **简单性**: 提供开箱即用的组件，无需复杂配置
3. **灵活性**: 支持自定义样式和行为
4. **可组合性**: 组件可以灵活组合使用

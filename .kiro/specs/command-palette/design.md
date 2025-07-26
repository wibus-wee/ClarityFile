# Design Document

## Overview

The Command Palette is a unified interface that provides quick access to application functionality, navigation, and file search through a keyboard-driven interface. It follows the design patterns of modern command interfaces like Raycast, Vercel, and Linear, while being specifically tailored for ClarityFile's document management workflow.

The system is built around a plugin architecture that allows for extensible functionality while maintaining a consistent user experience. The core implementation uses `pacocoursey/cmdk` for the command interface foundation.

## Architecture

### Core Components

```
CommandPalette/
├── CommandPaletteProvider     # Context provider for global state
├── CommandPaletteOverlay      # Main overlay container
├── CommandPaletteInput        # Search input with cmdk integration
├── CommandPaletteResults      # Results display container
├── CommandPalettePlugin       # Plugin detail view container
├── core/                      # Core functionality
│   ├── RouteRegistry          # Route-based commands
│   └── CommandRegistry        # Plugin-published commands
└── plugins/                   # Plugin implementations
    ├── FileSearchPlugin
    ├── ThemesStudioPlugin
    └── PluginRegistry
```

### Architecture Overview

The system has two main sources of commands:

1. **Core Commands**: Route navigation and built-in functionality
2. **Plugin Commands**: Extensible functionality published by plugins

```typescript
interface Command {
  id: string
  title: string
  subtitle?: string
  icon?: React.ComponentType
  keywords: string[]
  category?: string
  action: () => void | Promise<void>
  source: 'core' | 'plugin'
  pluginId?: string
}

interface CommandPalettePlugin {
  id: string
  name: string
  description: string
  keywords: string[]
  icon?: React.ComponentType
  canHandleQuery?: (query: string) => boolean
  execute?: (context: PluginContext) => void | Promise<void>
  render?: (context: PluginContext) => React.ReactNode
  searchable?: boolean
  publishCommands?: () => Command[]
}
```

### State Management

The command palette uses Zustand for UI state management combined with SWR for data management:

```typescript
interface PluginConfig {
  id: string
  enabled: boolean
  searchable: boolean
  order: number
}

interface CommandPaletteStore {
  // UI 状态
  isOpen: boolean
  query: string
  activePlugin: string | null

  // 本地状态（不需要持久化）
  pluginStates: Record<string, any>

  actions: {
    open: () => void
    close: () => void
    setQuery: (query: string) => void
    setActivePlugin: (pluginId: string | null) => void

    // 插件状态管理
    setPluginState: (pluginId: string, state: any) => void
    getPluginState: (pluginId: string) => any
  }
}

// 数据管理通过 SWR hooks 处理
interface CommandPaletteDataHooks {
  // 插件配置管理
  usePluginConfigs: () => SWRResponse<Array<{ key: string; value: any }>>
  useUpdatePluginConfig: () => SWRMutationResponse<any, { pluginId: string; config: PluginConfig }>
  useBatchUpdatePluginConfigs: () => SWRMutationResponse<any, Record<string, PluginConfig>>

  // 收藏和历史记录管理
  useFavorites: () => SWRResponse<string[]>
  useRecentCommands: () => SWRResponse<RecentCommand[]>
  useAddToFavorites: () => SWRMutationResponse<any, string>
  useRemoveFromFavorites: () => SWRMutationResponse<any, string>
  useTrackCommand: () => SWRMutationResponse<any, Command>
}
```

### TIPC + SWR Integration

The command palette follows ClarityFile's standard TIPC + SWR architecture for data management:

#### Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   SWR Hooks     │    │   TIPC Client   │
│                 │    │                 │    │                 │
│  Components     │◄──►│  usePluginConfigs│◄──►│  tipcClient     │
│  Zustand Store  │    │  useUpdateConfig │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   Settings      │    │   Main Process  │
│                 │    │   Service       │    │                 │
│  settings table │◄──►│  CRUD Operations│◄──►│  TIPC Router    │
│  JSON storage   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Key Benefits

1. **Type Safety**: Full TypeScript support from database to UI
2. **Caching**: Automatic data caching and deduplication via SWR
3. **Real-time Updates**: Automatic revalidation when data changes
4. **Error Handling**: Global error handling and retry mechanisms
5. **Performance**: Optimistic updates and background synchronization
6. **Consistency**: Follows project's established patterns

#### Data Storage Strategy

Plugin configurations are stored in the existing `settings` table:

- **Category**: `'command-palette'`
- **Key Format**: `'plugin-{pluginId}'`
- **Value**: JSON-serialized `PluginConfig` object
- **User Modifiable**: `true`

Example database records:

```sql
INSERT INTO settings (key, value, category, isUserModifiable) VALUES
('plugin-file-search', '{"id":"file-search","enabled":true,"searchable":true,"order":1}', 'command-palette', true),
('plugin-themes-studio', '{"id":"themes-studio","enabled":true,"searchable":false,"order":2}', 'command-palette', true);
```

## Components and Interfaces

### CommandPaletteProvider

Provides global context and keyboard shortcut handling:

- Listens for Cmd+K/Ctrl+K to open palette
- Manages global state and plugin registry
- Handles persistence of favorites and recent commands

### CommandPaletteOverlay

Main container component that:

- Renders as a modal overlay using React Portal
- Handles click-outside-to-close behavior
- Manages focus trap within the palette
- Provides consistent styling and animations

### CommandPaletteInput

Search input component that:

- Uses cmdk's Command.Input for consistent behavior
- Handles real-time search query updates
- Provides placeholder text based on current context
- Supports keyboard navigation

### CommandPaletteResults

Results display component that:

- Renders different result sections (favorites, suggestions, search results)
- Handles "Use with..." functionality for unmatched queries
- Supports keyboard navigation between results
- Displays plugin-specific result formatting

### Plugin Activation Flow

When a plugin needs to be activated (either through direct command or "Use with..." selection):

1. **Command Execution**: User selects a plugin command or "Use with..." option
2. **State Update**: `setActivePlugin(pluginId)` is called to activate the plugin
3. **View Transition**: CommandPaletteResults switches to plugin detail view
4. **Plugin Rendering**: The active plugin's `render()` method is called with context
5. **Context Provision**: Plugin receives query, router, services, and control functions

```typescript
// In CommandPaletteResults component
const activePlugin = useCommandPaletteStore(state => state.activePlugin)
const plugins = usePluginRegistry()

if (activePlugin) {
  const plugin = plugins.get(activePlugin)
  if (plugin?.render) {
    return (
      <div className="plugin-container">
        <PluginHeader
          plugin={plugin}
          onBack={() => setActivePlugin(null)}
        />
        {plugin.render(pluginContext)}
      </div>
    )
  }
}
```

### Core Command Sources

#### RouteRegistry

Handles application navigation as core functionality:

```typescript
class RouteRegistry {
  private routes: RouteCommand[] = []

  constructor(private router: Router) {}

  updateRoutes(translatedRoutes: AppRouteItem[]) {
    this.routes = this.convertRoutesToCommands(translatedRoutes)
  }

  search(query: string): RouteCommand[] {
    return fuzzySearch(this.routes, query, {
      keys: ['title', 'path', 'keywords', 'pinyin']
    })
  }

  private convertRoutesToCommands(routes: AppRouteItem[]): RouteCommand[] {
    return routes.map((route) => ({
      id: `route:${route.path}`,
      title: route.label,
      icon: route.icon,
      keywords: this.generateKeywords(route),
      category: 'Navigation',
      action: () => this.router.navigate({ to: route.path }),
      source: 'core' as const,
      path: route.path,
      pinyin: this.generatePinyin(route.label)
    }))
  }

  private generateKeywords(route: AppRouteItem): string[] {
    return [
      route.label,
      route.path,
      ...this.generatePinyin(route.label),
      // Add English translations if available
      ...this.getEnglishTranslations(route.label)
    ]
  }

  private generatePinyin(text: string): string[] {
    return [
      pinyin(text, { toneType: 'none' }).join(''),
      pinyin(text, { toneType: 'none' }).join(' ')
    ]
  }
}

// Custom hook to manage route registry
function useRouteRegistry(router: Router) {
  const routeRegistryRef = useRef<RouteRegistry>()
  const { flatRoutes } = useTranslatedRoutes()

  if (!routeRegistryRef.current) {
    routeRegistryRef.current = new RouteRegistry(router)
  }

  useEffect(() => {
    routeRegistryRef.current?.updateRoutes(flatRoutes)
  }, [flatRoutes])

  return routeRegistryRef.current
}
```

Features:

- Proper separation of concerns with React lifecycle
- Automatic route discovery from TanStack Router
- Fuzzy matching against route paths, titles, and pinyin
- Support for Chinese, English, and pinyin input
- Integration with existing translation system

#### CommandRegistry

Simplified command registry with direct plugin config integration:

```typescript
class CommandRegistry {
  private commands = new Map<string, Command>()
  private plugins = new Map<string, CommandPalettePlugin>()

  constructor(private pluginConfigs: Record<string, PluginConfig>) {}

  registerPlugin(plugin: CommandPalettePlugin) {
    this.plugins.set(plugin.id, plugin)
    this.refreshCommands(plugin)
  }

  private refreshCommands(plugin: CommandPalettePlugin) {
    // 清除该插件的现有命令
    for (const [commandId, command] of this.commands.entries()) {
      if (command.pluginId === plugin.id) {
        this.commands.delete(commandId)
      }
    }

    // 如果插件启用且有命令，则注册命令
    const config = this.pluginConfigs[plugin.id]
    if (config?.enabled !== false && plugin.publishCommands) {
      const commands = plugin.publishCommands()
      commands.forEach((cmd) => {
        this.commands.set(cmd.id, {
          ...cmd,
          source: 'plugin',
          pluginId: plugin.id
        })
      })
    }
  }

  search(query: string): Command[] {
    return fuzzySearch(Array.from(this.commands.values()), query, {
      keys: ['title', 'keywords']
    })
  }

  getSearchablePlugins(): CommandPalettePlugin[] {
    return Array.from(this.plugins.values())
      .filter((plugin) => {
        const config = this.pluginConfigs[plugin.id]
        return config?.enabled !== false && config?.searchable !== false && plugin.searchable
      })
      .sort((a, b) => {
        const configA = this.pluginConfigs[a.id]
        const configB = this.pluginConfigs[b.id]
        return (configA?.order || 0) - (configB?.order || 0)
      })
  }

  // 更新插件配置后刷新所有命令
  updateConfigs(newConfigs: Record<string, PluginConfig>) {
    this.pluginConfigs = newConfigs
    // 重新刷新所有插件的命令
    for (const plugin of this.plugins.values()) {
      this.refreshCommands(plugin)
    }
  }
}
```

#### PluginConfigManager

Manages plugin configuration persistence using TIPC + SWR architecture:

```typescript
// 统一的 Command Palette Hook
export function useCommandPalette() {
  const { data: settingsData, isLoading } = useSWR(['settings', 'command-palette'], () =>
    tipcClient.getSettingsByCategory({ category: 'command-palette' })
  )

  const { trigger: updateConfig } = useSWRMutation(
    ['plugin-config'],
    async (_key, { arg }: { arg: { pluginId: string; config: PluginConfig } }) => {
      const result = await tipcClient.setSetting({
        key: `plugin-${arg.pluginId}`,
        value: arg.config,
        category: 'command-palette',
        description: `Configuration for ${arg.pluginId} plugin`,
        isUserModifiable: true
      })

      // 重新验证插件配置数据
      mutate(['settings', 'command-palette'])
      return result
    }
  )

  const { trigger: batchUpdateConfigs } = useSWRMutation(
    ['plugin-configs-batch'],
    async (_key, { arg }: { arg: Record<string, PluginConfig> }) => {
      const settingsToSave = Object.entries(arg).map(([pluginId, config]) => ({
        key: `plugin-${pluginId}`,
        value: config,
        category: 'command-palette',
        description: `Configuration for ${pluginId} plugin`,
        isUserModifiable: true
      }))

      const result = await tipcClient.setSettings({ settings: settingsToSave })
      mutate(['settings', 'command-palette'])
      return result
    }
  )

  const pluginConfigs = useMemo(
    () => pluginConfigUtils.parsePluginConfigs(settingsData || []),
    [settingsData]
  )

  return {
    pluginConfigs,
    updatePluginConfig: updateConfig,
    batchUpdateConfigs,
    isLoading
  }
}

// 插件配置工具函数
export const pluginConfigUtils = {
  getDefaultConfig: (plugin: CommandPalettePlugin): PluginConfig => ({
    id: plugin.id,
    enabled: true,
    searchable: plugin.searchable ?? false,
    order: 0
  }),

  initializePluginConfig: (
    plugin: CommandPalettePlugin,
    existingConfigs: Record<string, PluginConfig>
  ): PluginConfig => {
    return existingConfigs[plugin.id] || pluginConfigUtils.getDefaultConfig(plugin)
  },

  parsePluginConfigs: (
    settings: Array<{ key: string; value: any }>
  ): Record<string, PluginConfig> => {
    const configs: Record<string, PluginConfig> = {}

    settings.forEach((setting) => {
      if (setting.key.startsWith('plugin-')) {
        const pluginId = setting.key.replace('plugin-', '')
        try {
          configs[pluginId] =
            typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
        } catch (error) {
          console.error(`Failed to parse plugin config for ${pluginId}:`, error)
        }
      }
    })

    return configs
  }
}
```

### Component Integration

Simplified component integration with the unified hook:

#### CommandPaletteProvider

```typescript
function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const { pluginConfigs, updatePluginConfig, isLoading } = useCommandPalette()
  const routeRegistry = useRouteRegistry(router)

  const commandRegistry = useMemo(() =>
    new CommandRegistry(pluginConfigs),
    [pluginConfigs]
  )

  const contextValue = {
    commandRegistry,
    routeRegistry,
    pluginConfigs,
    updatePluginConfig,
    isLoading
  }

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
    </CommandPaletteContext.Provider>
  )
}
```

#### Simplified Store

```typescript
interface CommandPaletteStore {
  // 仅保留 UI 状态
  isOpen: boolean
  query: string
  activePlugin: string | null
  pluginStates: Record<string, any>

  actions: {
    open: () => void
    close: () => void
    setQuery: (query: string) => void
    setActivePlugin: (pluginId: string | null) => void
    setPluginState: (pluginId: string, state: any) => void
    getPluginState: (pluginId: string) => any
  }
}

const useCommandPaletteStore = create<CommandPaletteStore>((set, get) => ({
  isOpen: false,
  query: '',
  activePlugin: null,
  pluginStates: {},

  actions: {
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false, activePlugin: null, query: '' }),
    setQuery: (query) => set({ query }),
    setActivePlugin: (activePlugin) => set({ activePlugin }),
    setPluginState: (pluginId, state) =>
      set((prev) => ({
        pluginStates: { ...prev.pluginStates, [pluginId]: state }
      })),
    getPluginState: (pluginId) => get().pluginStates[pluginId]
  }
}))
```

#### Component Usage Example

```typescript
function CommandPaletteResults() {
  const { commandRegistry } = useCommandPaletteContext()
  const { query } = useCommandPaletteStore()

  const commands = useMemo(() =>
    commandRegistry.search(query),
    [commandRegistry, query]
  )

  return (
    <div>
      {commands.map(command => (
        <CommandItem key={command.id} command={command} />
      ))}
    </div>
  )
}
```

### Plugin Implementations

#### FileSearchPlugin

Handles file search functionality:

```typescript
const FileSearchPlugin: CommandPalettePlugin = {
  id: 'file-search',
  name: 'Search Files',
  description: 'Search for files and documents',
  keywords: ['file', 'search', 'document', '文件', '搜索'],
  searchable: true,

  canHandleQuery: (query) => {
    // Available when no built-in commands match
    return query.length > 0
  },

  publishCommands: () => [
    {
      id: 'file-search-command',
      title: 'Search Files',
      keywords: ['file', 'search', 'document', '文件', '搜索', 'find'],
      category: 'Files',
      action: () => {
        // Activate plugin in render mode
        commandPaletteStore.getState().actions.setActivePlugin('file-search')
      }
    }
  ],

  render: (context) => {
    return <FileSearchResults query={context.query} />
  }
}
```

Features:

- Fuzzy search against file titles and metadata
- Integration with existing file service
- Support for file type filtering
- Quick preview capabilities
- Publishes a command for direct access

#### ThemesStudioPlugin

Handles theme management:

```typescript
const ThemesStudioPlugin: CommandPalettePlugin = {
  id: 'themes-studio',
  name: 'Themes Studio',
  description: 'Manage and switch application themes',
  keywords: ['theme', 'appearance', 'dark', 'light', '主题', '外观'],

  publishCommands: () => [
    {
      id: 'themes-studio-command',
      title: 'Themes Studio',
      keywords: ['theme', 'appearance', 'dark', 'light', '主题', '外观', 'color', 'style'],
      category: 'Appearance',
      action: () => {
        // Activate plugin in render mode
        commandPaletteStore.getState().actions.setActivePlugin('themes-studio')
      }
    }
  ],

  render: (context) => {
    return <ThemesStudioInterface />
  }
}
```

Features:

- Theme preview and switching
- Custom theme management
- Integration with application theme system
- Publishes a command for direct access

## Data Models

### Command

```typescript
interface Command {
  id: string
  title: string
  icon?: React.ComponentType
  keywords: string[] // Used for fuzzy search matching (aliases, translations, etc.)
  category?: string
  action: () => void | Promise<void>
  source: 'core' | 'plugin'
  pluginId?: string
}

interface RouteCommand extends Command {
  path: string
  pinyin: string[]
  source: 'core'
}
```

The `keywords` array contains searchable terms that help users find commands through fuzzy matching. For example:

- Route commands include: title, path, pinyin, English translations
- Plugin commands include: aliases, alternative names, related terms

### RecentCommand

```typescript
interface RecentCommand {
  commandId: string
  timestamp: number
  frequency: number
}
```

### PluginContext

```typescript
interface PluginContext {
  query: string
  router: Router
  close: () => void
  setQuery: (query: string) => void
  services: {
    fileService: FileService
    themeService: ThemeService
    // Other services as needed
  }
}
```

### PluginConfig

```typescript
interface PluginConfig {
  id: string
  enabled: boolean
  searchable: boolean
  order: number
}

interface PluginSettings {
  configs: Record<string, PluginConfig>
  defaultSearchablePlugins: string[]
}
```

## Error Handling

### Plugin Error Boundaries

Each plugin is wrapped in an error boundary to prevent failures from affecting the entire command palette:

```typescript
class PluginErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Plugin error:', error, errorInfo)
    // Log to error reporting service
    // Show fallback UI
  }
}
```

### Graceful Degradation

- If a plugin fails to load, it's excluded from the registry
- Search continues to work with available plugins
- Core navigation functionality remains available
- User is notified of plugin failures through toast notifications

## Testing Strategy

### Unit Tests

- Plugin interface compliance tests
- Search algorithm accuracy tests
- State management logic tests
- Keyboard navigation tests

### Integration Tests

- End-to-end command palette workflows
- Plugin interaction tests
- Router integration tests
- File service integration tests

### Performance Tests

- Search performance with large datasets
- Plugin loading performance
- Memory usage monitoring
- Keyboard responsiveness tests

### Accessibility Tests

- Screen reader compatibility
- Keyboard navigation compliance
- Focus management tests
- Color contrast validation

## Implementation Notes

### Keyboard Shortcuts

- `Cmd+K` / `Ctrl+K`: Open command palette
- `Escape`: Close palette or go back from plugin view
- `Arrow Up/Down`: Navigate results
- `Enter`: Execute selected command
- `Tab`: Navigate between sections

### Search Algorithm

Uses Fuse.js for fuzzy searching with the following configuration:

```typescript
const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'keywords', weight: 0.3 },
    { name: 'path', weight: 0.2 }
  ],
  threshold: 0.4,
  includeScore: true
}
```

### Pinyin Support

Integration with pinyin conversion library for Chinese character matching:

```typescript
import { pinyin } from 'pinyin-pro'

function generateSearchableText(text: string): string[] {
  return [
    text,
    pinyin(text, { toneType: 'none', type: 'array' }).join(''),
    pinyin(text, { toneType: 'none', type: 'array' }).join(' ')
  ]
}
```

### Performance Optimizations

- Debounced search queries (300ms)
- Virtual scrolling for large result sets
- Lazy loading of plugin interfaces
- Memoized search results
- Efficient re-rendering with React.memo

### Styling Integration

Uses Tailwind CSS classes consistent with the existing design system:

- Dark/light theme support
- Consistent spacing and typography
- Smooth animations and transitions
- Responsive design principles

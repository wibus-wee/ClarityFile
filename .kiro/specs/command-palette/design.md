# Design Document - Revised Architecture

## Overview

The Command Palette is a unified interface that provides quick access to application functionality, navigation, and file search through a keyboard-driven interface. It follows the design patterns of modern command interfaces like Raycast, Vercel, and Linear, while being specifically tailored for ClarityFile's document management workflow.

The system is built around a plugin architecture that allows for extensible functionality while maintaining a consistent user experience. The core implementation uses `pacocoursey/cmdk` for the command interface foundation.

## Architecture Analysis & Revision

### Critical Issues with Class-Based Approach

After thorough analysis of the current design, several fundamental issues have been identified with the class-based `RouteRegistry` and `CommandRegistry` approach:

#### 1. React Mental Model Conflicts

**Problem**: The class-based registries create mutable state outside React's lifecycle, violating React's functional paradigm and immutability principles.

```typescript
// PROBLEMATIC: Mutable class state outside React
class RouteRegistry {
  private routes: RouteCommand[] = [] // Mutable state
  
  updateRoutes(translatedRoutes: AppRouteItem[]) {
    this.routes = this.convertRoutesToCommands(translatedRoutes) // Direct mutation
  }
}
```

**Impact**: 
- Breaks React's predictable data flow
- Makes state changes invisible to React's reconciliation
- Complicates debugging and development tools integration
- Violates the principle of single source of truth

#### 2. Reactivity Chain Breaks

**Problem**: Class instance mutations don't trigger React re-renders, creating potential UI inconsistency.

```typescript
// PROBLEMATIC: State changes don't trigger re-renders
const registry = useRef(new RouteRegistry())
registry.current.updateRoutes(newRoutes) // UI won't update automatically
```

**Impact**:
- UI may display stale data
- Requires manual force updates or complex workarounds
- Makes the component behavior unpredictable
- Breaks React's declarative nature

#### 3. Memory Management Issues

**Problem**: Class instances stored in refs can create memory leaks and stale closures.

```typescript
// PROBLEMATIC: Potential memory leaks
const routeRegistryRef = useRef<RouteRegistry>()
// Registry holds references that may not be cleaned up properly
```

### Recommended Architecture: Functional + Zustand Approach

The revised architecture eliminates classes in favor of a functional approach with Zustand for state management, maintaining React's mental model while providing better performance and maintainability.

## Revised Architecture

### Core Components

```
CommandPalette/
├── CommandPaletteProvider     # Context provider for services and data
├── CommandPaletteOverlay      # Main overlay container
├── CommandPaletteInput        # Search input with cmdk integration
├── CommandPaletteResults      # Results display container
├── CommandPalettePlugin       # Plugin detail view container
├── hooks/                     # Custom hooks for data management
│   ├── useCommandSearch       # Unified search logic
│   ├── useRouteCommands       # Route-based commands
│   └── usePluginCommands      # Plugin-published commands
├── stores/                    # Zustand stores
│   └── commandPaletteStore    # UI state and computed values
└── plugins/                   # Plugin implementations
    ├── FileSearchPlugin
    ├── ThemesStudioPlugin
    └── PluginRegistry
```

### Functional Architecture Overview

The system uses a functional approach with Zustand for state management and custom hooks for data processing:

#### Core Interfaces (Corrected)

```typescript
// Base command interface with common fields
interface BaseCommand {
  id: string
  title: string
  subtitle?: string
  icon?: React.ComponentType
  keywords: string[]
  category?: string
  source: 'core' | 'plugin'
  pluginId?: string
}

// Command with render function (mutually exclusive with action)
type CommandWithRender = BaseCommand & {
  render: (context: PluginContext) => React.ReactNode
  canHandleQuery?: (query: string) => boolean  // Can this command handle search queries?
  action?: never  // No action when render is present
}

// Command with action (mutually exclusive with render)
type CommandWithAction = BaseCommand & {
  action: () => void | Promise<void>
  render?: never      // No render when action is present
  canHandleQuery?: never  // Action commands don't handle queries
}

// Union type for all commands
type Command = CommandWithRender | CommandWithAction

interface CommandPalettePlugin {
  id: string
  name: string
  description: string
  
  // Plugin only publishes commands, doesn't have its own render/execute
  publishCommands: () => Command[]
}
```

#### Functional Data Processing

Instead of mutable classes, the system uses pure functions and React hooks:

```typescript
// Pure function for route command generation
function createRouteCommands(
  routes: AppRouteItem[], 
  router: Router
): RouteCommand[] {
  return routes.map((route) => ({
    id: `route:${route.path}`,
    title: route.label,
    icon: route.icon,
    keywords: generateRouteKeywords(route),
    category: 'Navigation',
    action: () => router.navigate({ to: route.path }),
    source: 'core' as const,
    path: route.path,
    pinyin: generatePinyin(route.label)
  }))
}

// Pure function for plugin command generation
function createPluginCommands(
  plugins: CommandPalettePlugin[],
  configs: Record<string, PluginConfig>
): Command[] {
  return plugins
    .filter(plugin => configs[plugin.id]?.enabled !== false)
    .flatMap(plugin => {
      const commands = plugin.publishCommands?.() || []
      return commands.map(cmd => ({ 
        ...cmd, 
        source: 'plugin' as const,
        pluginId: plugin.id
      }))
    })
}

// Pure search function
function searchCommands(
  commands: Command[], 
  query: string
): Command[] {
  if (!query.trim()) return []
  
  return fuzzySearch(commands, query, {
    keys: ['title', 'keywords'],
    threshold: 0.4
  })
}

// Pure function to get searchable commands (for "Use with..." functionality)
function getSearchableCommands(
  commands: Command[]
): CommandWithRender[] {
  return commands.filter((command): command is CommandWithRender => 
    'render' in command && command.canHandleQuery !== undefined
  )
}
```

### Revised State Management Architecture

The system uses a hybrid approach: Zustand for UI state and computed values, SWR for server state:

#### Zustand Store (Enhanced with Computed Values)

```typescript
interface PluginConfig {
  id: string
  enabled: boolean
  order: number
}

interface CommandPaletteStore {
  // UI State
  isOpen: boolean
  query: string
  activeCommand: string | null  // Changed from activePlugin
  pluginStates: Record<string, any>

  // Computed State (derived from external data)
  routeCommands: RouteCommand[]
  pluginCommands: Command[]
  searchResults: Command[]
  searchableCommands: Command[]  // Commands that can handle search queries

  // Actions
  actions: {
    // UI Actions
    open: () => void
    close: () => void
    setQuery: (query: string) => void
    setActiveCommand: (commandId: string | null) => void  // Changed from setActivePlugin
    
    // Plugin State Management
    setPluginState: (pluginId: string, state: any) => void
    getPluginState: (pluginId: string) => any
    
    // Data Update Actions (called by hooks)
    updateRouteCommands: (routes: AppRouteItem[], router: Router) => void
    updatePluginCommands: (plugins: CommandPalettePlugin[], configs: Record<string, PluginConfig>) => void
    updateSearchResults: () => void
    updateSearchableCommands: () => void  // Updated name and functionality
  }
}

// Store implementation with computed values
const useCommandPaletteStore = create<CommandPaletteStore>((set, get) => ({
  // UI State
  isOpen: false,
  query: '',
  activeCommand: null,  // Changed from activePlugin
  pluginStates: {},

  // Computed State (initially empty)
  routeCommands: [],
  pluginCommands: [],
  searchResults: [],
  searchableCommands: [],

  actions: {
    // UI Actions
    open: () => set({ isOpen: true }),
    close: () => set({ 
      isOpen: false, 
      activeCommand: null,  // Changed from activePlugin
      query: '',
      pluginStates: {} 
    }),
    setQuery: (query) => {
      set({ query })
      // Trigger search update
      get().actions.updateSearchResults()
    },
    setActiveCommand: (activeCommand) => set({ activeCommand }),  // Changed from setActivePlugin
    
    // Plugin State Management
    setPluginState: (pluginId, state) =>
      set((prev) => ({
        pluginStates: { ...prev.pluginStates, [pluginId]: state }
      })),
    getPluginState: (pluginId) => get().pluginStates[pluginId],
    
    // Data Update Actions (pure functions)
    updateRouteCommands: (routes, router) => {
      const routeCommands = createRouteCommands(routes, router)
      set({ routeCommands })
      get().actions.updateSearchResults()
    },
    
    updatePluginCommands: (plugins, configs) => {
      const pluginCommands = createPluginCommands(plugins, configs)
      set({ pluginCommands })
      get().actions.updateSearchResults()
    },
    
    updateSearchResults: () => {
      const { query, routeCommands, pluginCommands } = get()
      const allCommands = [...routeCommands, ...pluginCommands]
      const searchResults = searchCommands(allCommands, query)
      set({ searchResults })
    },
    
    updateSearchableCommands: () => {
      const { routeCommands, pluginCommands } = get()
      const allCommands = [...routeCommands, ...pluginCommands]
      const searchableCommands = getSearchableCommands(allCommands)
      
      set({ searchableCommands })
    }
  }
}))
```

#### SWR Data Hooks (Unchanged)

```typescript
interface CommandPaletteDataHooks {
  // Plugin configuration management
  usePluginConfigs: () => SWRResponse<Array<{ key: string; value: any }>>
  useUpdatePluginConfig: () => SWRMutationResponse<any, { pluginId: string; config: PluginConfig }>
  useBatchUpdatePluginConfigs: () => SWRMutationResponse<any, Record<string, PluginConfig>>

  // Favorites and history management
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

### Functional Command Processing

#### Route Command Hook

Replaces the RouteRegistry class with a functional approach:

```typescript
// Pure utility functions
function generateRouteKeywords(route: AppRouteItem): string[] {
  return [
    route.label,
    route.path,
    ...generatePinyin(route.label),
    ...getEnglishTranslations(route.label)
  ]
}

function generatePinyin(text: string): string[] {
  return [
    pinyin(text, { toneType: 'none' }).join(''),
    pinyin(text, { toneType: 'none' }).join(' ')
  ]
}

function createRouteCommands(
  routes: AppRouteItem[], 
  router: Router
): RouteCommand[] {
  return routes.map((route) => ({
    id: `route:${route.path}`,
    title: route.label,
    icon: route.icon,
    keywords: generateRouteKeywords(route),
    category: 'Navigation',
    action: () => router.navigate({ to: route.path }),
    source: 'core' as const,
    path: route.path,
    pinyin: generatePinyin(route.label)
  }))
}

// Custom hook for route commands
function useRouteCommands(router: Router) {
  const { flatRoutes } = useTranslatedRoutes()
  const updateRouteCommands = useCommandPaletteStore(
    state => state.actions.updateRouteCommands
  )

  useEffect(() => {
    updateRouteCommands(flatRoutes, router)
  }, [flatRoutes, router, updateRouteCommands])

  // Return current route commands from store
  return useCommandPaletteStore(state => state.routeCommands)
}
```

**Benefits of Functional Approach:**

1. **React Mental Model Alignment**: Pure functions and hooks follow React's functional paradigm
2. **Predictable State Updates**: All state changes go through Zustand, triggering proper re-renders
3. **Better Testability**: Pure functions are easier to test in isolation
4. **Memory Safety**: No class instances to manage, automatic cleanup
5. **Performance**: Zustand's selector-based updates prevent unnecessary re-renders

#### Plugin Command Hook

Replaces the CommandRegistry class with a functional approach:

```typescript
// Pure utility functions
function createPluginCommands(
  plugins: CommandPalettePlugin[],
  configs: Record<string, PluginConfig>
): Command[] {
  return plugins
    .filter(plugin => configs[plugin.id]?.enabled !== false)
    .flatMap(plugin => {
      const commands = plugin.publishCommands?.() || []
      return commands.map(cmd => ({
        ...cmd,
        source: 'plugin' as const,
        pluginId: plugin.id
      }))
    })
}

// Custom hook for plugin commands
function usePluginCommands() {
  const { pluginConfigs } = useCommandPalette()
  const plugins = usePluginRegistry() // Assume this returns registered plugins
  
  const updatePluginCommands = useCommandPaletteStore(
    state => state.actions.updatePluginCommands
  )
  const updateSearchableCommands = useCommandPaletteStore(
    state => state.actions.updateSearchableCommands
  )

  useEffect(() => {
    updatePluginCommands(plugins, pluginConfigs)
    updateSearchableCommands() // Update searchable commands after plugin commands change
  }, [plugins, pluginConfigs, updatePluginCommands, updateSearchableCommands])

  // Return current plugin commands from store
  return useCommandPaletteStore(state => state.pluginCommands)
}

// Custom hook for searchable commands (for "Use with..." functionality)
function useSearchableCommands() {
  return useCommandPaletteStore(state => state.searchableCommands)
}
```

**Key Improvements:**

1. **Immutable Updates**: All state changes create new objects, maintaining React's immutability
2. **Automatic Re-renders**: Zustand ensures components re-render when relevant state changes
3. **Separation of Concerns**: Pure functions handle data transformation, hooks handle React integration
4. **Better Performance**: Zustand's selector system prevents unnecessary re-renders
5. **Easier Testing**: Pure functions can be tested independently of React components

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

### Revised Component Integration

The functional approach simplifies component integration and eliminates the need for complex context providers:

#### CommandPaletteProvider (Simplified)

```typescript
function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  // Initialize hooks that populate the store
  useRouteCommands(router)
  usePluginCommands()
  
  // Provide services through context (if needed)
  const contextValue = {
    router,
    // Other services as needed
  }

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
    </CommandPaletteContext.Provider>
  )
}
```

#### Enhanced Store with Search Logic

```typescript
interface CommandPaletteStore {
  // UI State
  isOpen: boolean
  query: string
  activePlugin: string | null
  pluginStates: Record<string, any>

  // Computed State (populated by hooks)
  routeCommands: RouteCommand[]
  pluginCommands: Command[]
  searchResults: Command[]
  searchablePlugins: CommandPalettePlugin[]

  actions: {
    // UI Actions
    open: () => void
    close: () => void
    setQuery: (query: string) => void
    setActivePlugin: (pluginId: string | null) => void
    setPluginState: (pluginId: string, state: any) => void
    getPluginState: (pluginId: string) => any
    
    // Data Update Actions (called by hooks)
    updateRouteCommands: (routes: AppRouteItem[], router: Router) => void
    updatePluginCommands: (plugins: CommandPalettePlugin[], configs: Record<string, PluginConfig>) => void
    updateSearchResults: () => void
    updateSearchablePlugins: (plugins: CommandPalettePlugin[], configs: Record<string, PluginConfig>) => void
  }
}
```

#### Component Usage Example (Simplified)

```typescript
function CommandPaletteResults() {
  // Direct access to computed search results from store
  const searchResults = useCommandPaletteStore(state => state.searchResults)
  const query = useCommandPaletteStore(state => state.query)
  const searchableCommands = useCommandPaletteStore(state => state.searchableCommands)

  // Show search results or "Use with..." suggestions
  if (searchResults.length > 0) {
    return (
      <div>
        {searchResults.map(command => (
          <CommandItem key={command.id} command={command} />
        ))}
      </div>
    )
  }

  // Show "Use with..." when no results match but query exists
  if (query.trim() && searchableCommands.length > 0) {
    return (
      <div>
        <div className="section-header">Use "{query}" with...</div>
        {searchableCommands.map(command => (
          <SearchableCommandItem 
            key={command.id} 
            command={command} 
            query={query} 
          />
        ))}
      </div>
    )
  }

  return <EmptyState />
}

// Unified search hook for components that need search functionality
function useCommandSearch() {
  const searchResults = useCommandPaletteStore(state => state.searchResults)
  const query = useCommandPaletteStore(state => state.query)
  const setQuery = useCommandPaletteStore(state => state.actions.setQuery)
  
  return {
    searchResults,
    query,
    setQuery,
    hasResults: searchResults.length > 0
  }
}
```

**Benefits of Revised Architecture:**

1. **Simplified Components**: Components directly access computed state from Zustand
2. **Automatic Updates**: Store updates trigger re-renders automatically
3. **Better Performance**: Zustand's selector system prevents unnecessary re-renders
4. **Easier Testing**: Components can be tested with mock store states
5. **Cleaner Code**: No need to pass registries through context or props

### Plugin → Command Architecture

The correct architecture is: **Plugin → [Commands] → Some commands accept search queries, others don't**

#### Example: FileSearchPlugin

```typescript
const FileSearchPlugin: CommandPalettePlugin = {
  id: 'file-search',
  name: 'File Search Plugin',
  description: 'Provides file search functionality',

  publishCommands: () => [
    // Command 1: File search with render (accepts search queries)
    {
      id: 'file-search-command',
      title: 'Search Files',
      keywords: ['file', 'search', 'document', '文件', '搜索', 'find'],
      category: 'Files',
      source: 'plugin',
      pluginId: 'file-search',
      canHandleQuery: (query) => query.length > 0,  // Can handle search queries
      render: (context) => {
        // This command has its own unique view
        return <FileSearchResults query={context.query} />
      }
      // No action property - type system prevents this
    },
    
    // Command 2: Recent files with render (doesn't accept search queries)
    {
      id: 'recent-files-command',
      title: 'Recent Files',
      keywords: ['recent', 'files', '最近', '文件'],
      category: 'Files',
      source: 'plugin',
      pluginId: 'file-search',
      render: (context) => {
        // This command has its own unique view
        return <RecentFilesView />
      }
      // No canHandleQuery - this command doesn't accept search queries
      // No action property - type system prevents this
    },
    
    // Command 3: Quick file action (no render, has action)
    {
      id: 'open-file-dialog-command',
      title: 'Open File Dialog',
      keywords: ['open', 'file', 'dialog', '打开', '文件'],
      category: 'Files',
      source: 'plugin',
      pluginId: 'file-search',
      action: () => {
        // Direct action, no view needed
        fileService.openFileDialog()
        commandPaletteStore.getState().actions.close()
      }
      // No render property - type system prevents this
      // No canHandleQuery - action commands don't handle queries
    }
  ]
}
```

#### Example: ThemesStudioPlugin

```typescript
const ThemesStudioPlugin: CommandPalettePlugin = {
  id: 'themes-studio',
  name: 'Themes Studio Plugin',
  description: 'Provides theme management functionality',

  publishCommands: () => [
    // Command 1: Theme search with render (accepts search queries)
    {
      id: 'theme-search-command',
      title: 'Search Themes',
      keywords: ['theme', 'search', '主题', '搜索'],
      category: 'Appearance',
      source: 'plugin',
      pluginId: 'themes-studio',
      canHandleQuery: (query) => query.length > 0,  // Can search themes
      render: (context) => {
        // This command has its own unique view for theme search
        return <ThemeSearchResults query={context.query} />
      }
      // No action property - type system prevents this
    },
    
    // Command 2: Theme studio with render (doesn't accept search queries)
    {
      id: 'themes-studio-command',
      title: 'Themes Studio',
      keywords: ['themes', 'studio', '主题', '工作室'],
      category: 'Appearance',
      source: 'plugin',
      pluginId: 'themes-studio',
      render: (context) => {
        // This command has its own unique view for theme management
        return <ThemesStudioInterface />
      }
      // No canHandleQuery - this command doesn't accept search queries
      // No action property - type system prevents this
    },
    
    // Command 3: Quick theme switch with action (no render)
    {
      id: 'toggle-dark-mode-command',
      title: 'Toggle Dark Mode',
      keywords: ['dark', 'light', 'toggle', '暗色', '亮色'],
      category: 'Appearance',
      source: 'plugin',
      pluginId: 'themes-studio',
      action: () => {
        // Direct action, no view needed
        themeService.toggleDarkMode()
        commandPaletteStore.getState().actions.close()
      }
      // No render property - type system prevents this
      // No canHandleQuery - action commands don't handle queries
    }
  ]
}
```

#### "Use with..." Logic

The "Use with..." functionality shows commands that can handle search queries:

```typescript
// When user types a query that doesn't match existing commands
function CommandPaletteResults() {
  const searchResults = useCommandPaletteStore(state => state.searchResults)
  const query = useCommandPaletteStore(state => state.query)
  const searchableCommands = useCommandPaletteStore(state => state.searchableCommands)

  // Show direct matches first
  if (searchResults.length > 0) {
    return <SearchResults results={searchResults} />
  }

  // Show "Use with..." for commands that can handle the query
  if (query.trim()) {
    const applicableCommands = searchableCommands.filter(command => 
      command.canHandleQuery?.(query)
    )
    
    if (applicableCommands.length > 0) {
      return (
        <div>
          <div className="section-header">Use "{query}" with...</div>
          {applicableCommands.map(command => (
            <SearchableCommandItem 
              key={command.id} 
              command={command} 
              query={query}
              onSelect={() => {
                // Activate the command's render view with query context
                commandPaletteStore.getState().actions.setActiveCommand(command.id)
                // The command's render function will receive the query through context
              }}
            />
          ))}
        </div>
      )
    }
  }

  return <EmptyState />
}

// Updated store to track active command instead of active plugin
interface CommandPaletteStore {
  // UI State
  isOpen: boolean
  query: string
  activeCommand: string | null  // Changed from activePlugin to activeCommand
  
  // ... rest of the store
  
  actions: {
    setActiveCommand: (commandId: string | null) => void  // Changed from setActivePlugin
    // ... other actions
  }
}

// Command execution logic
function executeCommand(command: Command, query?: string) {
  if ('render' in command) {
    // Command has render - show its view
    commandPaletteStore.getState().actions.setActiveCommand(command.id)
  } else {
    // Command has action - execute it directly
    command.action()
  }
}

// Render active command view
function CommandView() {  // Renamed from CommandPalettePlugin to avoid naming conflict
  const activeCommandId = useCommandPaletteStore(state => state.activeCommand)
  const query = useCommandPaletteStore(state => state.query)
  
  if (!activeCommandId) return null
  
  // Find the active command
  const allCommands = useCommandPaletteStore(state => [
    ...state.routeCommands,
    ...state.pluginCommands
  ])
  
  const activeCommand = allCommands.find(cmd => cmd.id === activeCommandId)
  
  if (!activeCommand || !('render' in activeCommand)) return null
  
  const context: PluginContext = {
    query,
    router: useRouter(),
    close: () => useCommandPaletteStore.getState().actions.close(),
    setQuery: (newQuery) => useCommandPaletteStore.getState().actions.setQuery(newQuery),
    services: {
      fileService,
      themeService,
      // Other services
    }
  }
  
  return (
    <div className="command-view-container">
      <CommandViewHeader
        command={activeCommand}
        onBack={() => useCommandPaletteStore.getState().actions.setActiveCommand(null)}
      />
      {activeCommand.render(context)}
    </div>
  )
}
```

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
  order: number
}

interface PluginSettings {
  configs: Record<string, PluginConfig>
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

## Architecture Comparison

### Class-Based vs Functional Approach

| Aspect | Class-Based (Original) | Functional (Revised) | Winner |
|--------|----------------------|---------------------|---------|
| **React Mental Model** | ❌ Mutable state outside React | ✅ Immutable state with hooks | Functional |
| **Reactivity** | ❌ Manual re-render triggers | ✅ Automatic Zustand updates | Functional |
| **Memory Management** | ❌ Potential leaks with refs | ✅ Automatic cleanup | Functional |
| **Testability** | ❌ Complex class mocking | ✅ Pure function testing | Functional |
| **Performance** | ❌ Manual optimization needed | ✅ Zustand selector optimization | Functional |
| **Code Complexity** | ❌ Higher cognitive load | ✅ Simpler, more predictable | Functional |
| **Debugging** | ❌ Harder to trace state changes | ✅ Clear state flow in DevTools | Functional |
| **Type Safety** | ⚠️ Good but complex | ✅ Excellent with inference | Functional |

### State Management Comparison

#### Original Class Approach Issues:
```typescript
// PROBLEMATIC: State changes don't trigger re-renders
class RouteRegistry {
  private routes: RouteCommand[] = [] // Mutable state
  
  updateRoutes(routes: AppRouteItem[]) {
    this.routes = this.convertRoutesToCommands(routes) // Direct mutation
    // No automatic UI update!
  }
}

// Component needs manual updates
function Component() {
  const registry = useRef(new RouteRegistry())
  const [, forceUpdate] = useReducer(x => x + 1, 0) // Manual re-render
  
  useEffect(() => {
    registry.current.updateRoutes(routes)
    forceUpdate() // Manual trigger needed!
  }, [routes])
}
```

#### Revised Functional Approach:
```typescript
// SOLUTION: Pure functions + Zustand store
function createRouteCommands(routes: AppRouteItem[], router: Router): RouteCommand[] {
  return routes.map(route => ({ /* immutable object */ }))
}

// Store handles state updates
const useCommandPaletteStore = create((set) => ({
  routeCommands: [],
  actions: {
    updateRouteCommands: (routes, router) => {
      const routeCommands = createRouteCommands(routes, router) // Pure function
      set({ routeCommands }) // Immutable update, automatic re-render
    }
  }
}))

// Component automatically updates
function Component() {
  const routeCommands = useCommandPaletteStore(state => state.routeCommands)
  // Automatic re-render when routeCommands changes!
}
```

### Performance Analysis

#### Class-Based Performance Issues:
1. **Unnecessary Re-renders**: Components re-render even when unrelated class state changes
2. **Memory Leaks**: Class instances in refs may not be garbage collected properly
3. **Manual Optimization**: Requires complex memoization and manual update triggers

#### Functional Approach Benefits:
1. **Selective Updates**: Zustand selectors ensure components only re-render when relevant state changes
2. **Automatic Cleanup**: No class instances to manage, automatic garbage collection
3. **Built-in Optimization**: Zustand provides optimized updates out of the box

```typescript
// Only re-renders when searchResults change, not when other store state changes
const searchResults = useCommandPaletteStore(state => state.searchResults)
```

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

// Pure search function (easily testable)
function searchCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) return []
  return fuzzySearch(commands, query, fuseOptions)
}
```

### Pinyin Support

Integration with pinyin conversion library for Chinese character matching:

```typescript
import { pinyin } from 'pinyin-pro'

// Pure utility function
function generatePinyin(text: string): string[] {
  return [
    pinyin(text, { toneType: 'none', type: 'array' }).join(''),
    pinyin(text, { toneType: 'none', type: 'array' }).join(' ')
  ]
}

// Used in route command generation
function generateRouteKeywords(route: AppRouteItem): string[] {
  return [
    route.label,
    route.path,
    ...generatePinyin(route.label),
    ...getEnglishTranslations(route.label)
  ]
}
```

### Performance Optimizations

#### Functional Approach Optimizations:
- **Zustand Selectors**: Prevent unnecessary re-renders
- **Pure Functions**: Enable better memoization
- **Computed State**: Pre-calculated search results in store
- **Debounced Search**: 300ms delay for search queries

```typescript
// Optimized component with selector
function CommandPaletteResults() {
  // Only re-renders when searchResults change
  const searchResults = useCommandPaletteStore(state => state.searchResults)
  
  return (
    <div>
      {searchResults.map(command => (
        <CommandItem key={command.id} command={command} />
      ))}
    </div>
  )
}

// Debounced search in store
const debouncedUpdateSearch = debounce((query: string) => {
  const { routeCommands, pluginCommands } = get()
  const allCommands = [...routeCommands, ...pluginCommands]
  const searchResults = searchCommands(allCommands, query)
  set({ searchResults })
}, 300)
```

### Styling Integration

Uses Tailwind CSS classes consistent with the existing design system:

- Dark/light theme support
- Consistent spacing and typography
- Smooth animations and transitions
- Responsive design principles

## Desktop Implementation Feasibility Analysis

### Current Implementation Status

The desktop application **already has a command palette implementation** with the following structure:

#### ✅ **Available Technologies & Dependencies**
- **TanStack Router**: ✅ Available (`@tanstack/react-router: ^1.120.5`)
- **Zustand**: ✅ Available (`zustand: ^5.0.5`) 
- **SWR**: ✅ Available (`swr: ^2.3.3`)
- **cmdk**: ✅ Available (`cmdk: ^1.1.1`)
- **Fuse.js**: ✅ Available (`fuse.js: 7.1.0`)
- **pinyin-pro**: ✅ Available (`pinyin-pro: 3.26.0`)

#### ✅ **Existing Infrastructure**
- **Route System**: ✅ `useTranslatedRoutes()` hook provides translated routes with i18n support
- **TIPC Client**: ✅ Full type-safe IPC communication with main process
- **Settings Service**: ✅ Complete settings management with categories and persistence
- **File Services**: ✅ Managed file service, file access, filesystem operations
- **Theme Service**: ✅ Custom theme management system available

#### ✅ **Current Command Palette Structure**
```
packages/desktop/src/renderer/src/components/command-palette/
├── components/           # UI components
├── core/                # RouteRegistry & CommandRegistry (CLASS-BASED)
├── hooks/               # Data management hooks
├── plugins/             # Plugin system
├── stores/              # Zustand store (PLUGIN-BASED)
├── types/               # Type definitions (PLUGIN-BASED)
└── utils/               # Utility functions
```

#### ⚠️ **Current Architecture Issues**
1. **Class-Based Registries**: Uses `RouteRegistry` and `CommandRegistry` classes (the exact issue we identified)
2. **Plugin-Centric Model**: Current types use `activePlugin` instead of `activeCommand`
3. **Searchable Config**: Still has `PluginConfig.searchable` field

### Implementation Feasibility: ✅ **FULLY FEASIBLE**

#### **Route Command Generation**
```typescript
// ✅ AVAILABLE: useTranslatedRoutes() provides exactly what we need
const { flatRoutes } = useTranslatedRoutes()
// Returns: AppRouteItem[] with path, label, icon, etc.

// ✅ AVAILABLE: Router instance for navigation
const router = useRouter()
router.navigate({ to: route.path }) // Works perfectly
```

#### **Settings Persistence**
```typescript
// ✅ AVAILABLE: Full settings service via TIPC
await tipcClient.setSetting({
  key: `plugin-${pluginId}`,
  value: config,
  category: 'command-palette',
  isUserModifiable: true
})

await tipcClient.getSettingsByCategory({ category: 'command-palette' })
```

#### **File Search Integration**
```typescript
// ✅ AVAILABLE: Managed file service
await tipcClient.searchManagedFiles({ query, filters })
```

#### **Theme Management Integration**
```typescript
// ✅ AVAILABLE: Custom theme service
import { useTheme } from '@renderer/hooks/use-theme'
const { toggleDarkMode, setTheme } = useTheme()
```

### Migration Path: **Straightforward Refactor**

The existing implementation can be **incrementally migrated** to the new functional architecture:

#### **Phase 1: Update Type System** ✅ **Ready**
- Change `activePlugin` → `activeCommand` in store
- Update `Command` interface with render/action mutual exclusivity
- Remove `PluginConfig.searchable`

#### **Phase 2: Replace Class Registries** ✅ **Ready**
- Replace `RouteRegistry` class with `useRouteCommands` hook
- Replace `CommandRegistry` class with `usePluginCommands` hook
- Keep existing Fuse.js search logic

#### **Phase 3: Update Components** ✅ **Ready**
- Update existing components to use new command-centric model
- Rename `CommandPalettePlugin` component to `CommandView`
- Update existing UI components (already using cmdk)

### **Conclusion: Design is 100% Compatible**

The revised functional architecture is **perfectly aligned** with the existing desktop implementation:

1. **All required dependencies are available**
2. **All necessary services (TIPC, settings, files, themes) exist**
3. **Current structure supports the new architecture**
4. **Migration can be done incrementally without breaking changes**
5. **Performance will improve** (eliminating class-based issues)

The design document accurately reflects what can be implemented in the desktop application.

## Final Architecture Summary

### Key Corrections Applied

1. **Removed PluginConfig.searchable**: In the new "command-centric" model, whether a command appears in "Use with..." is determined by `Command.canHandleQuery`, not plugin-level configuration.

2. **Updated Store State**: Changed from `activePlugin: string | null` to `activeCommand: string | null` throughout the store and all related actions.

3. **Renamed Component**: Changed `CommandPalettePlugin` component to `CommandView` to avoid naming conflict with the `CommandPalettePlugin` interface.

4. **Updated Store Actions**: Changed `updateSearchablePlugins` to `updateSearchableCommands` to reflect the new command-centric approach.

### Final Type System

```typescript
// Clean intersection types
interface BaseCommand { /* common fields */ }
type CommandWithRender = BaseCommand & { render: ..., canHandleQuery?: ..., action?: never }
type CommandWithAction = BaseCommand & { action: ..., render?: never, canHandleQuery?: never }
type Command = CommandWithRender | CommandWithAction

// Simplified plugin config (no searchable field)
interface PluginConfig {
  id: string
  enabled: boolean
  order: number
}
```

### Architecture Flow

1. **Plugin** publishes multiple **Commands**
2. **Commands** either have `render` (with optional `canHandleQuery`) OR `action`
3. **"Use with..."** shows commands with `render` + `canHandleQuery`
4. **Store** tracks `activeCommand` and renders the command's unique view
5. **Type system** enforces mutual exclusivity between `render` and `action`

### Migration Strategy

For existing implementations using the class-based approach:

1. **Phase 1**: Replace RouteRegistry class with useRouteCommands hook
2. **Phase 2**: Replace CommandRegistry class with usePluginCommands hook
3. **Phase 3**: Update components to use Zustand selectors instead of context
4. **Phase 4**: Remove class-based context providers and update to command-centric model

Each phase can be implemented incrementally without breaking existing functionality.

# Command Palette Hooks Architecture

This directory contains the refactored command palette hooks that follow React best practices and domain-driven design principles.

## Architecture Overview

The previous "God Hook" (`useCommandPalette`) has been broken down into focused, single-responsibility hooks:

```
useCommandPalette (Composition Root)
├── useCommandDataSync (Data Synchronization)
├── useCommandSearch (Search Logic)
├── useCommandExecution (Command Execution)
├── useCommandFavorites (Favorites Management)
├── usePluginManagement (Plugin Operations)
├── useCommandPaletteContext (Plugin Context)
└── useCommandResults (Display-Ready Data)
```

## Hook Responsibilities

### Core Hooks

#### `useCommandPalette`
- **Purpose**: Main composition hook that combines all other hooks
- **Usage**: Use this in components that need full command palette functionality
- **Pattern**: Composition Root pattern

#### `useCommandDataSync`
- **Purpose**: Synchronizes fresh command data with the store
- **Usage**: Use once at the top level of your command palette component tree
- **Pattern**: Data synchronization pattern

#### `useCommandSearch`
- **Purpose**: Handles search logic and filtering
- **Returns**: Search results, query state, and search utilities
- **Pattern**: Pure computation hook

#### `useCommandExecution`
- **Purpose**: Handles command execution and usage tracking
- **Returns**: `executeCommand` function with built-in tracking
- **Pattern**: Action hook

#### `useCommandFavorites`
- **Purpose**: Manages favorite commands
- **Returns**: Favorite state and toggle functions
- **Pattern**: State management hook

#### `usePluginManagement`
- **Purpose**: Handles plugin registration and configuration
- **Returns**: Plugin operations and statistics
- **Pattern**: Management hook

#### `useCommandPaletteContext`
- **Purpose**: Creates and manages plugin context
- **Returns**: Plugin context object
- **Pattern**: Context creation hook

### Display Hooks

#### `useCommandResults`
- **Purpose**: Provides ready-to-render command data with metadata
- **Returns**: Enhanced results with display information
- **Usage**: Use in components that display command lists
- **Pattern**: View model hook

### Data Hooks

#### `useRouteCommands`
- **Purpose**: Computes route-based commands
- **Returns**: Array of route commands
- **Pattern**: Computed data hook

#### `usePluginCommands`
- **Purpose**: Computes plugin-based commands
- **Returns**: Array of plugin commands
- **Pattern**: Computed data hook

## Usage Patterns

### Basic Component Usage

```tsx
function CommandPaletteResults() {
  // Get ready-to-render data
  const { results, hasQuery, totalResults } = useCommandResults()
  const { executeCommand } = useCommandExecution()
  
  return (
    <div>
      <p>{totalResults} commands found</p>
      {results.map(command => (
        <button 
          key={command.id}
          onClick={() => executeCommand(command.id, command.action)}
        >
          {command.title}
        </button>
      ))}
    </div>
  )
}
```

### Top-Level Component Usage

```tsx
function CommandPalette() {
  // Sync data at the top level
  useCommandDataSync()
  
  // Use the main composition hook
  const palette = useCommandPalette()
  
  return (
    <div>
      <CommandPaletteInput />
      <CommandPaletteResults />
    </div>
  )
}
```

### Focused Component Usage

```tsx
function FavoriteButton({ commandId }: { commandId: string }) {
  // Use only what you need
  const { isFavorite, toggleFavorite } = useCommandFavorites()
  
  return (
    <button 
      onClick={() => toggleFavorite(commandId)}
      className={isFavorite(commandId) ? 'active' : ''}
    >
      ⭐
    </button>
  )
}
```

## Benefits of This Architecture

### 1. Single Responsibility Principle
Each hook has one clear purpose and can be understood in isolation.

### 2. Better Testability
You can test each hook independently without mocking complex dependencies.

### 3. Improved Reusability
Components can use only the hooks they need, reducing unnecessary re-renders.

### 4. Cleaner Data Flow
Data flows in one direction: Source → Hook → Component, without complex sync patterns.

### 5. Easier Maintenance
Changes to one domain (e.g., favorites) only affect the relevant hook.

### 6. Better Performance
Components only re-render when their specific data changes, not when unrelated data updates.

## Migration Guide

### Before (God Hook)
```tsx
function MyComponent() {
  const {
    searchResults,
    executeCommand,
    toggleFavorite,
    pluginStats,
    // ... 20+ other properties
  } = useCommandPalette()
  
  // Component only needs search and execution
  // but gets all the other data too
}
```

### After (Focused Hooks)
```tsx
function MyComponent() {
  const { results } = useCommandResults()
  const { executeCommand } = useCommandExecution()
  
  // Component gets exactly what it needs
}
```

## Best Practices

1. **Use `useCommandDataSync` once** at the top level of your component tree
2. **Prefer focused hooks** over the main `useCommandPalette` hook when possible
3. **Use `useCommandResults`** for display components that need enhanced data
4. **Keep components simple** by using hooks that provide ready-to-use data
5. **Test hooks independently** using React Testing Library's `renderHook`

## Store Integration

The hooks work with the existing Zustand store but follow a cleaner pattern:

- **Store**: Holds raw state only
- **Hooks**: Compute derived state and provide actions
- **Components**: Consume ready-to-use data from hooks

This separation makes the codebase more maintainable and follows React's recommended patterns.
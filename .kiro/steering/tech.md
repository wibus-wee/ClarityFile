# Technology Stack & Build System

## Package Manager & Workspace
- **PNPM**: Primary package manager with workspace configuration
- **Monorepo**: Multi-package workspace structure using `pnpm-workspace.yaml`

## Core Technologies

### Desktop Application (`packages/desktop`)
- **Electron**: Cross-platform desktop app framework
- **React 19**: UI framework with React Compiler enabled
- **TypeScript**: Primary language with strict configuration
- **TanStack Router**: File-based routing with code splitting
- **Tailwind CSS v4**: Styling with Vite plugin
- **Drizzle ORM**: Database ORM with SQLite (better-sqlite3)
- **i18next**: Internationalization with react-i18next
- **Zustand**: State management
- **SWR**: Data fetching and caching
- **TIPC**: Type-safe IPC communication between main/renderer

### Web Applications
- **Nuxt 3**: (`packages/locales-web`) - Localization editor
- **Vite + React**: (`packages/www`) - Landing page
- **Vue 3**: Used in locales-web package

### UI Components (`packages/shadcn`)
- **Radix UI**: Headless component primitives
- **shadcn/ui**: Component library foundation
- **Shared across packages**: Workspace dependency

## Build Tools & Configuration
- **Electron Vite**: Build tool for Electron apps
- **ESLint**: Linting with TypeScript and React plugins
- **Prettier**: Code formatting (single quotes, no semicolons, 100 char width)
- **Vitest**: Testing framework with UI and coverage
- **Electron Builder**: App packaging and distribution

## Common Commands

### Root Level
```bash
# Install dependencies
pnpm install

# Desktop app commands
pnpm desktop [command]

# Website commands  
pnpm www [command]

# i18n management
pnpm i18n:stats          # Calculate translation completeness
pnpm i18n:add-locale     # Add new locale
pnpm i18n:validate       # Validate translation keys
```

### Desktop Package
```bash
# Development
pnpm dev                 # Start development server
pnpm start              # Start built app

# Building
pnpm build              # Build for production
pnpm electron:mac       # Build macOS app

# Database
pnpm drizzle-kit        # Database migrations

# Testing
pnpm test               # Run tests
pnpm test:ui            # Test with UI
pnpm test:coverage      # Run with coverage
```

## Development Notes
- SQLite database requires electron-rebuild for native modules
- React Compiler enabled with target '19'
- Strict TypeScript configuration with `noUncheckedIndexedAccess`
- Auto-generated route tree for TanStack Router
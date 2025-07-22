# Project Structure & Organization

## Monorepo Layout
```
ClarityFile/
├── packages/                    # All application packages
│   ├── desktop/                # Main Electron desktop application
│   ├── locales-web/            # Nuxt-based localization editor
│   ├── www/                    # React landing page
│   └── shadcn/                 # Shared UI component library
├── locales/                    # Centralized i18n translations
├── scripts/                    # Build and utility scripts
└── docs/                       # Project documentation
```

## Desktop Application Structure (`packages/desktop/`)
```
src/
├── main/                       # Electron main process
│   ├── routers/               # TIPC route handlers
│   ├── services/              # Business logic services
│   ├── managers/              # System managers (window, path, etc.)
│   ├── lib/                   # Utilities and helpers
│   └── types/                 # Type definitions
├── preload/                   # Electron preload scripts
├── renderer/                  # React frontend application
│   └── src/                   # Renderer source code
└── test/                      # Test files
```

## Internationalization Structure
```
locales/
├── common/                    # Shared translations
├── navigation/                # Navigation-specific
├── dashboard/                 # Dashboard translations
├── projects/                  # Project management
├── competitions/              # Competition-related
├── expenses/                  # Expense tracking
├── files/                     # File management
└── settings/                  # Settings interface
```

## Key Conventions

### File Naming
- **Components**: PascalCase (e.g., `ProjectManager.tsx`)
- **Services**: kebab-case with `.service.ts` suffix
- **Types**: kebab-case with `.types.ts` or in `types/` directory
- **Tests**: `.test.ts` or `.spec.ts` suffix

### Directory Organization
- **Services**: Business logic separated by domain
- **Managers**: System-level management (window, path sync, etc.)
- **Routers**: TIPC endpoints grouped by functionality
- **Types**: Centralized type definitions

### Database
- **Drizzle**: Schema in `src/db/schema.ts`
- **Migrations**: Auto-generated in `drizzle/` directory
- **Local SQLite**: `local.db` for development

### Generated Files
- **Router**: TanStack Router generates `routeTree.gen.ts`
- **Build artifacts**: `out/`, `build/`, `.tanstack/tmp/`
- **Coverage**: `coverage/` directory

## Import Conventions
- **Workspace packages**: Use workspace protocol (`@clarity/shadcn`)
- **Path aliases**: `@renderer` and `@main` for desktop app
- **Relative imports**: Prefer for local files within same package

## Configuration Files
- **Root**: Workspace-level configs (ESLint, Prettier, TypeScript)
- **Package-specific**: Individual package configurations
- **Electron**: `electron.vite.config.ts` for build configuration
- **Database**: `drizzle.config.ts` for ORM configuration
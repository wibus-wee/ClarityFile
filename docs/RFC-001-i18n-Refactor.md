# RFC-001: Modernizing the Internationalization (i18n) System

**Author**: Gemini Pro
**Date**: 2025-07-13
**Status**: Proposed

## 1. Summary

This RFC proposes a complete overhaul of the project's internationalization (i18n) system. The current implementation, while functional, suffers from significant scalability and maintainability issues, primarily due to a type generation strategy that produces excessively large and cumbersome type files.

The proposed solution is to refactor the entire i18n architecture to align with the best practices demonstrated by mature, large-scale projects like Folo. This involves adopting a modern, type-safe, and efficient ecosystem that includes:

-   **Type Safety via Declaration Merging**: Eliminating generated key lists in favor of TypeScript's module augmentation for perfect, nested type inference.
-   **Code Splitting & Dynamic Loading**: Bundling language resources into separate modules and loading them on-demand to improve initial application performance.
-   **Integrated State Management**: Leveraging the existing Zustand store to manage i18n state, ensuring a unified architecture.
-   **Performance Caching**: Implementing a `localStorage`-based cache to avoid re-downloading language packs.
-   **A Comprehensive Developer Toolchain**: Providing scripts for quality assurance, translation status tracking, and streamlined addition of new languages.

## 2. Motivation

The existing i18n system was built on a script that generates a single, massive type file (`types.ts`) containing a union type of all possible translation keys as flat strings (e.g., `'settings.general.title'`). This approach has led to several critical problems:

-   **Poor Scalability**: The type file has grown to over 1700 lines with only a moderate number of translations. As the application grows, this file will become a significant performance bottleneck for the TypeScript compiler.
-   **Lack of Elegance**: The system is complex and deviates from the standard, recommended practices of `i18next`. The presence of custom wrapper hooks (`useTypedTranslation`) to handle the flawed type system adds unnecessary complexity.
-   **Developer Experience (DX)**: The developer workflow is suboptimal. There are no tools to validate translation files, track completion status, or easily add new languages.
-   **Bugs**: The `i18n-formatters.ts` library incorrectly reads from `localStorage` directly, leading to non-reactive UI components that do not update when the language changes.

## 3. Proposed Solution & Detailed Design

The new architecture will be a holistic ecosystem, addressing both runtime performance and developer workflow.

### 3.1. Type Safety: `i18next.d.ts`

We will create a single declaration file (`i18n/i18next.d.ts`) to replace the auto-generation script and the bloated `types.ts`. This file will use TypeScript's module augmentation to inform `i18next` about the shape of our translation resources.

```typescript
// i18n/i18next.d.ts
import 'i18next';
import { defaultResources } from './default-resources';
import { DEFAULT_NS, NAMESPACES } from './constants';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NS;
    ns: typeof NAMESPACES;
    // Type inference will be derived from the structure of our base language resources.
    resources: typeof defaultResources['zh-CN'];
  }
}
```

This approach provides superior, fully-nested autocompletion and type-checking without any performance overhead.

### 3.2. Code Splitting: Vite Plugin

A custom Vite plugin (`packages/desktop/vite-i18n-plugin.ts`) will be created. During the build process, this plugin will:
1.  Scan the `locales/` directory.
2.  For each supported language (e.g., `zh-CN`), it will merge all its namespace files (`common.json`, `settings.json`, etc.) into a single object.
3.  Emit each merged language object as a separate, dynamically importable JavaScript module (e.g., `dist/renderer/locales/zh-CN.js`).

### 3.3. Runtime Logic: Dynamic Loading & Caching

A new `i18n/load-language.ts` module will handle the on-demand loading of language packs. The `loadLanguage(lang)` function will:
1.  Check if the language is already loaded.
2.  Check for a cached version in a new `LocaleCache` class.
3.  If not cached, use `import('/locales/{lang}.js')` to fetch the language pack.
4.  On success, add the resources to the `i18next` instance and store the pack in the `LocaleCache` (`localStorage`).

### 3.4. State Management: Zustand Integration

A new Zustand store (`i18n/store.ts`) will be created to manage i18n state, exposing state like `language` and actions like `changeLanguage(lang)`. This store will listen to `i18next` events (`languageChanged`) to keep its own state synchronized, providing a single, reactive source of truth for the UI.

### 3.5. Developer Toolchain

To ensure long-term maintainability and a high-quality developer experience, the following scripts will be created:
-   `scripts/calculate-i18n-completeness.ts`: Compares translation files against the base language (`zh-CN`) and reports the completion percentage for each language.
-   `scripts/add-i18n-locale.ts`: An interactive script to scaffold all necessary `.json` files when adding a new language.
-   `scripts/validate-i18n-keys.ts`: A validation tool to check for key conflicts (e.g., `user` vs. `user.name`) and for keys that exist in translations but not in the base language file.

## 4. Implementation Plan

The refactoring will be executed in four distinct phases:

-   **Phase 1: Foundational Setup**: Establish the new file structure by creating `i18n/constants.ts`, `i18n/default-resources.ts`, and the core `i18n/i18next.d.ts` type definition file.
-   **Phase 2: Core Runtime Logic**: Implement the Vite plugin, the dynamic `loadLanguage` function, the `LocaleCache`, and the Zustand store for state management.
-   **Phase 3: Developer Toolchain Construction**: Build the three developer scripts for stats, adding locales, and validation. Add corresponding commands to `package.json`.
-   **Phase 4: Full Integration & Cleanup**: Delete all legacy i18n files (`generate-i18n-types.ts`, `types.ts`, `useTypedTranslation.ts`). Update all UI components to use the new system. Fix the `i18n-formatters.ts` bug. Update the application entry point to initialize the new i18n store.

## 5. Drawbacks & Risks

-   **Scope of Change**: This is a significant refactoring that will touch many parts of the application, from build configuration to UI components. The risk will be mitigated by the phased approach and thorough testing.
-   **Initial Complexity**: The new system, with a Vite plugin and dynamic loading, has more moving parts than the current one. However, this complexity is justified by the immense gains in performance, scalability, and developer experience.

## 6. Alternatives Considered

A less invasive refactor was considered, which would only fix the type generation script to produce nested types instead of flat strings. This was rejected because it would not address the performance issues of a large type file, the lack of code-splitting, or the absence of a developer toolchain. The proposed full-system refactor provides a far superior long-term solution.

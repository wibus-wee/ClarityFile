# Desktop Command Palette – Developer Guide

This guide explains how the Clarity desktop command palette bootstraps, how plugins are loaded, and the runtime surface area that plugins can rely on. It is intended for engineers who need to extend or maintain the command palette platform.

## Architecture Overview

The command palette owns its own provider that wires keyboard shortcuts, keeps plugin configuration in sync, and kicks off plugin initialization as soon as the desktop renderer mounts the provider.【F:packages/desktop/src/renderer/src/components/command-palette/command-palette-provider.tsx†L17-L67】 Initialization delegates to the plugin manager, which discovers modules via the loader, caches their manifests, and activates auto-start plugins before surfacing them to the registry.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/initialize-plugins.ts†L1-L35】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-manager.ts†L59-L119】

Once activated, plugins are stored inside a Zustand-backed registry that exposes stable arrays and selectors so UI hooks only re-render when the underlying data changes.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-registry.ts†L1-L126】 Command rendering is routed through the command palette view, which looks up the active command, fetches the plugin runtime context, and invokes the render callback when available.【F:packages/desktop/src/renderer/src/components/command-palette/components/CommandView.tsx†L1-L45】

## Plugin Module Contract

Plugins ship as modules that export a `CommandPalettePluginModule`. The manifest carries identifying metadata, opt-in auto activation, and i18n namespaces. Modules can also provide localized translation dictionaries that will be merged into the runtime i18n instance before activation.【F:packages/desktop/src/renderer/src/components/command-palette/types/index.ts†L64-L114】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-manager.ts†L121-L210】

The module’s `activate` function receives the manifest plus runtime services (logger, i18n adapter, cleanup registration). It must return a `CommandPalettePlugin` whose `publishCommands` method yields an array of command descriptors. Commands can either execute actions or render rich detail views by consuming the provided plugin context.【F:packages/desktop/src/renderer/src/components/command-palette/types/index.ts†L16-L63】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/utils.ts†L1-L68】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/types.ts†L1-L44】 Optional `deactivate` hooks let modules tear down subscriptions and run registered cleanup callbacks.【F:packages/desktop/src/renderer/src/components/command-palette/types/index.ts†L106-L114】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-manager.ts†L196-L232】

## Runtime Services and Context

During activation the plugin manager seeds translations, constructs a scoped logger, and exposes the runtime object so plugins do not have to import global utilities.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-manager.ts†L138-L210】 When a command renders, the hook-derived plugin context supplies router access, palette actions (close, setQuery, goBack), convenience utilities (toast notifications, confirm, clipboard, external links), and the runtime itself.【F:packages/desktop/src/renderer/src/components/command-palette/hooks/use-command-palette-context.ts†L1-L35】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/utils.ts†L18-L68】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/types.ts†L1-L44】

If no runtime exists—such as before activation—the context falls back to a console-based logger and namespace-prefixed translation helper so commands can still render safely while plugins finish loading.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/utils.ts†L18-L63】

## Working With the Registry

Use the registry store whenever plugin state must be queried or mutated outside activation. `registerPlugin` and `unregisterPlugin` manage lifecycle, while `pluginsArray` and `pluginErrorsArray` provide memoized snapshots for UI consumption.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-registry.ts†L1-L169】 The registry also tracks loading states and initialization so views can present meaningful progress indicators.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-registry.ts†L13-L41】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-registry.ts†L97-L162】

When adding new store selectors, mirror the existing pattern of returning primitives or cached arrays to avoid triggering unnecessary rerenders in hook consumers.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-registry.ts†L171-L197】

## Adding a Built-in Plugin

1. Create a `.plugin.ts` or `.plugin.tsx` file under `packages/desktop/src/renderer/src/components/command-palette/plugins/<PluginName>/` that exports a `CommandPalettePluginModule`. The glob-based loader automatically discovers modules in this directory.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-loader.ts†L10-L66】
2. Define the manifest, including a stable `id`, human-friendly `name`, description, and optional `i18nNamespace`. Provide localized strings via the module’s `translations` map to keep the UI language-aware.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/HelloWorld/hello-world.plugin.tsx†L13-L120】
3. Implement `activate` to register commands. Use the injected translator and runtime logger so messages respect the current locale and emit diagnostic information consistently.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/HelloWorld/hello-world.plugin.tsx†L230-L283】 If the command renders a view, wrap it in a helper that accepts the `PluginContext` so it can read the current query, navigate, or show notifications.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/HelloWorld/hello-world.plugin.tsx†L216-L283】
4. (Optional) Provide a `deactivate` function to clean up timers, subscriptions, or other side effects. Remember to call `runtime.registerCleanup` during activation so the manager can execute tidy-up handlers automatically when the plugin unloads.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-manager.ts†L196-L232】

## Loading External Modules

The loader exposes `registerExternalModule` for user-installed or remote plugins. Supply a manifest and async loader; the manager will cache the module, validate the manifest identifier, and treat it like any built-in plugin thereafter.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-loader.ts†L68-L118】 External modules can coexist with built-ins because `getDiscoveredModules` merges both maps, while manifest lookups fall back to loader storage when the manager lacks local state.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-loader.ts†L120-L154】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-manager.ts†L85-L119】

## Troubleshooting

* Activation errors: the manager logs failures, marks the plugin as failed, and records the error inside the registry so diagnostics can surface in the UI.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-manager.ts†L154-L210】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-registry.ts†L97-L134】 Check the developer console for the logged stack trace.
* Missing translations: when a key is absent, the fallback translator returns the namespace-prefixed key. Add the missing entry to the module’s `translations` bundle or update the shared locale files.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/utils.ts†L18-L63】
* Stale command lists: ensure `publishCommands` returns a new array or stable references as needed. The registry caches arrays, so when you need to recompute commands based on runtime state, expose an explicit refresh mechanism rather than mutating command objects in place.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-registry.ts†L1-L126】

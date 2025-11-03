# Desktop Command Palette – User Guide

The command palette lets you search and run commands across the desktop app from a single, keyboard-first surface. This guide covers how to open the palette, interpret its layout, and interact with plugin-provided experiences.

## Opening the Palette

Press <kbd>Cmd</kbd> + <kbd>K</kbd> on macOS or <kbd>Ctrl</kbd> + <kbd>K</kbd> on Windows and Linux to open the palette from anywhere in the desktop app. The shortcut is registered globally when the command palette provider mounts, so it works regardless of navigation context.【F:packages/desktop/src/renderer/src/components/command-palette/command-palette-provider.tsx†L27-L66】

## Searching and Browsing

When the palette opens you land on the root command list. Start typing to filter by command titles, subtitles, or keywords provided by the core app or installed plugins. Commands appear in categories so you can quickly scan related actions.【F:packages/desktop/src/renderer/src/components/command-palette/types/index.ts†L16-L44】 Use the arrow keys to highlight an entry and press <kbd>Enter</kbd> to run it.

Some commands simply execute immediately (for example, navigating to a route or showing a notification). Others open a detailed view in the right-hand pane when they expose a render handler. The view stays focused on the currently highlighted command and is cleared when you return to the root list.【F:packages/desktop/src/renderer/src/components/command-palette/components/CommandView.tsx†L13-L45】

## Working With Plugin Commands

The palette boots a plugin system during startup that discovers built-in modules, activates those marked for auto-start, and registers their commands with the shared registry.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/initialize-plugins.ts†L1-L35】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-manager.ts†L59-L119】 Plugins can provide localized strings, icons, categories, and optional detail views so their commands blend in with the core experience.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/HelloWorld/hello-world.plugin.tsx†L13-L283】

When you run a plugin command that renders a view, it gains access to helpful utilities—such as toasts, confirm dialogs, clipboard helpers, and navigation—through the plugin context. That allows plugins to deliver rich experiences like file search, dashboards, or multi-step workflows without leaving the palette.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/utils.ts†L18-L68】【F:packages/desktop/src/renderer/src/components/command-palette/plugins/types.ts†L1-L44】 Use the on-screen controls provided by the plugin (for example, buttons or tabs) to interact with its content, and press <kbd>Esc</kbd> to close the palette when you are done.

## Troubleshooting

If a plugin fails to load you may see its commands disappear temporarily while the system retries activation. The registry tracks loading and error states so the UI can report issues; restarting the desktop app usually resolves transient problems.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-registry.ts†L13-L134】 For persistent errors, open the developer tools to review the logged message and share it with the development team.【F:packages/desktop/src/renderer/src/components/command-palette/plugins/plugin-manager.ts†L154-L210】

import { useShortcutStore } from './stores/shortcut-store'

/**
 * 快捷键提示 Hook
 * 提供便捷的 overlay 控制方法
 */
export function useShortcutOverlay() {
  const overlayState = useShortcutStore((state) => state.overlay)
  const showOverlay = useShortcutStore((state) => state.showOverlay)
  const hideOverlay = useShortcutStore((state) => state.hideOverlay)
  const startLongPress = useShortcutStore((state) => state.startLongPress)
  const cancelLongPress = useShortcutStore((state) => state.cancelLongPress)

  return {
    isVisible: overlayState.isVisible,
    isLongPressing: overlayState.isLongPressing,
    show: showOverlay,
    hide: hideOverlay,
    startLongPress,
    cancelLongPress
  }
}

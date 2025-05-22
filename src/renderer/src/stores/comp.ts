import { create } from "zustand";

interface CompState {
  settingsDialog: {
    isOpen: boolean
    currentNav: string
  }
}

interface CompActions {
  openSettingsDialog: () => void
  closeSettingsDialog: () => void
  toggleSettingsDialog: () => void
  setSettingsNav: (nav: string) => void
}

type CompStore = CompState & CompActions

export const useCompStore = create<CompStore>((set) => ({
  // 初始状态
  settingsDialog: {
    isOpen: false,
    currentNav: "Messages & media"
  },

  // Actions
  openSettingsDialog: () => 
    set((state) => ({
      settingsDialog: {
        ...state.settingsDialog,
        isOpen: true
      }
    })),

  closeSettingsDialog: () => 
    set((state) => ({
      settingsDialog: {
        ...state.settingsDialog,
        isOpen: false
      }
    })),

  toggleSettingsDialog: () => 
    set((state) => ({
      settingsDialog: {
        ...state.settingsDialog,
        isOpen: !state.settingsDialog.isOpen
      }
    })),

  setSettingsNav: (nav: string) => 
    set((state) => ({
      settingsDialog: {
        ...state.settingsDialog,
        currentNav: nav
      }
    }))
}))
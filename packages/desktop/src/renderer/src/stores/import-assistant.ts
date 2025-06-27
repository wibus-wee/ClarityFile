import { create } from 'zustand'
import type {
  ImportAssistantState,
  ImportAssistantActions,
  ImportAssistantType,
  DroppedFileInfo
} from '@renderer/components/import-assistant/types'

type ImportAssistantStore = ImportAssistantState & ImportAssistantActions

const initialState: ImportAssistantState = {
  isOpen: false,
  droppedFiles: [],
  selectedImportType: null,
  isProcessing: false,
  processingStep: null
}

export const useImportAssistantStore = create<ImportAssistantStore>((set) => ({
  ...initialState,

  openImportAssistant: (files: DroppedFileInfo[]) => {
    set({
      isOpen: true,
      droppedFiles: files,
      selectedImportType: null,
      isProcessing: false,
      processingStep: null
    })
  },

  closeImportAssistant: () => {
    set({
      isOpen: false,
      droppedFiles: [],
      selectedImportType: null,
      isProcessing: false,
      processingStep: null
    })
  },

  selectImportType: (type: ImportAssistantType) => {
    set({
      selectedImportType: type
    })
  },

  setProcessing: (isProcessing: boolean, step?: string) => {
    set({
      isProcessing,
      processingStep: isProcessing ? step || null : null
    })
  },

  reset: () => {
    set(initialState)
  }
}))

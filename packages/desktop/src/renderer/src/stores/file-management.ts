import { create } from 'zustand'

export interface FileManagementState {
  // 选择状态
  selectedFile: string | null // 单选状态 - 当前高亮的文件
  selectedFiles: Set<string> // 多选状态 - 批量选择的文件
  selectionMode: 'single' | 'multiple' // 选择模式
  lastClickedIndex: number | null // 用于范围选择
  selectMode: boolean // 保持向后兼容

  // UI状态
  isRenameDialogOpen: boolean
  isDeleteDialogOpen: boolean
  isBatchDeleteDialogOpen: boolean
  isInfoDrawerOpen: boolean

  // 当前操作的文件
  currentFile: any | null
  fileForRename: any | null
  filesForDelete: any[]
  fileForInfo: any | null

  // 操作状态
  isProcessing: boolean
  processingAction: string | null
}

export interface FileManagementActions {
  // 选择操作
  selectSingleFile: (fileId: string, fileIndex?: number) => void
  toggleFileSelection: (fileId: string) => void
  selectAllFiles: (files: any[]) => void
  selectFileRange: (startIndex: number, endIndex: number, files: any[]) => void
  clearSelection: () => void
  setSelectionMode: (mode: 'single' | 'multiple') => void
  setSelectMode: (enabled: boolean) => void // 保持向后兼容

  // Dialog控制
  openRenameDialog: (file: any) => void
  closeRenameDialog: () => void
  openDeleteDialog: (file: any) => void
  closeDeleteDialog: () => void
  openBatchDeleteDialog: (files: any[]) => void
  closeBatchDeleteDialog: () => void
  openInfoDrawer: (file: any) => void
  closeInfoDrawer: () => void

  // 操作状态
  setProcessing: (isProcessing: boolean, action?: string) => void

  // 重置状态
  reset: () => void
}

type FileManagementStore = FileManagementState & FileManagementActions

const initialState: FileManagementState = {
  selectedFile: null,
  selectedFiles: new Set(),
  selectionMode: 'multiple', // 默认为多选模式
  lastClickedIndex: null,
  selectMode: true, // 默认启用选择模式
  isRenameDialogOpen: false,
  isDeleteDialogOpen: false,
  isBatchDeleteDialogOpen: false,
  isInfoDrawerOpen: false,
  currentFile: null,
  fileForRename: null,
  filesForDelete: [],
  fileForInfo: null,
  isProcessing: false,
  processingAction: null
}

export const useFileManagementStore = create<FileManagementStore>((set, get) => ({
  ...initialState,

  // 选择操作 - 简化为多选模式
  selectSingleFile: (fileId: string, fileIndex?: number) => {
    set({
      selectedFile: fileId,
      selectedFiles: new Set([fileId]), // 单选时也添加到多选集合中
      selectionMode: 'multiple', // 始终保持多选模式
      lastClickedIndex: fileIndex ?? null
    })
  },

  toggleFileSelection: (fileId: string) => {
    const { selectedFiles } = get()
    const newSelection = new Set(selectedFiles)

    if (newSelection.has(fileId)) {
      newSelection.delete(fileId)
    } else {
      newSelection.add(fileId)
    }

    set({
      selectedFiles: newSelection,
      selectionMode: 'multiple',
      selectedFile: null
    })
  },

  selectAllFiles: (files: any[]) => {
    const { selectedFiles } = get()
    const allSelected = selectedFiles.size === files.length && files.length > 0

    if (allSelected) {
      set({
        selectedFiles: new Set(),
        selectionMode: 'multiple', // 保持多选模式
        selectedFile: null
      })
    } else {
      set({
        selectedFiles: new Set(files.map((f) => f.id)),
        selectionMode: 'multiple', // 保持多选模式
        selectedFile: null
      })
    }
  },

  selectFileRange: (startIndex: number, endIndex: number, files: any[]) => {
    const start = Math.min(startIndex, endIndex)
    const end = Math.max(startIndex, endIndex)
    const rangeFiles = files.slice(start, end + 1)
    const { selectedFiles } = get()
    const newSelection = new Set(selectedFiles)

    rangeFiles.forEach((file) => newSelection.add(file.id))

    set({
      selectedFiles: newSelection,
      selectionMode: 'multiple',
      selectedFile: null,
      lastClickedIndex: endIndex
    })
  },

  clearSelection: () => {
    set({
      selectedFile: null,
      selectedFiles: new Set(),
      selectionMode: 'multiple', // 保持多选模式
      lastClickedIndex: null
    })
  },

  setSelectionMode: (mode: 'single' | 'multiple') => {
    // 简化逻辑：始终保持多选模式
    const { selectedFile, selectedFiles } = get()
    set({
      selectionMode: 'multiple',
      selectedFiles:
        selectedFile && selectedFiles.size === 0 ? new Set([selectedFile]) : selectedFiles,
      selectedFile: selectedFile
    })
  },

  setSelectMode: (enabled: boolean) => {
    // 始终启用选择模式
    set({ selectMode: true })
  },

  // Dialog控制
  openRenameDialog: (file: any) => {
    set({
      fileForRename: file,
      isRenameDialogOpen: true
    })
  },

  closeRenameDialog: () => {
    set({
      fileForRename: null,
      isRenameDialogOpen: false
    })
  },

  openDeleteDialog: (file: any) => {
    set({
      filesForDelete: [file],
      isDeleteDialogOpen: true
    })
  },

  closeDeleteDialog: () => {
    set({
      filesForDelete: [],
      isDeleteDialogOpen: false
    })
  },

  openBatchDeleteDialog: (files: any[]) => {
    set({
      filesForDelete: files,
      isBatchDeleteDialogOpen: true
    })
  },

  closeBatchDeleteDialog: () => {
    set({
      filesForDelete: [],
      isBatchDeleteDialogOpen: false
    })
  },

  openInfoDrawer: (file: any) => {
    set({
      fileForInfo: file,
      isInfoDrawerOpen: true
    })
  },

  closeInfoDrawer: () => {
    set({
      fileForInfo: null,
      isInfoDrawerOpen: false
    })
  },

  // 操作状态
  setProcessing: (isProcessing: boolean, action?: string) => {
    set({
      isProcessing,
      processingAction: isProcessing ? action || null : null
    })
  },

  // 重置状态
  reset: () => {
    set(initialState)
  }
}))

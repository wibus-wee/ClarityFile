import { create } from 'zustand'
import type { DroppedFileInfo } from '@renderer/components/import-assistant/types'

/**
 * 全局 Drawer 状态管理
 * 用于控制各种 Drawer 组件的显示状态和数据
 */

// ExpenseFormDrawer 相关状态
export interface ExpenseFormDrawerState {
  isOpen: boolean
  mode: 'create' | 'edit'
  projectId?: string
  expense?: any // 编辑时的费用数据
  prefilledData?: {
    itemName?: string
    applicant?: string
    amount?: number
    notes?: string
  }
  preselectedFile?: DroppedFileInfo // 预选择的文件
  onClose?: () => void // 关闭回调
}

// DocumentDrawer 相关状态
export interface DocumentDrawerState {
  isOpen: boolean
  mode: 'create' | 'edit'
  projectId?: string
  document?: any // 编辑时的文档数据
  prefilledData?: {
    name?: string
    type?: string
    description?: string
  }
  preselectedFile?: DroppedFileInfo // 预选择的文件（用于创建文档后自动添加版本）
  onClose?: () => void // 关闭回调
}

// DocumentVersionFormDrawer 相关状态
export interface DocumentVersionFormDrawerState {
  isOpen: boolean
  mode: 'create' | 'edit'
  document?: any // 逻辑文档数据
  version?: any // 编辑时的版本数据
  projectDetails?: any
  preselectedFile?: DroppedFileInfo // 预选择的文件
  prefilledData?: {
    versionTag?: string
    notes?: string
    isGenericVersion?: boolean
  }
  onClose?: () => void // 关闭回调
}

// 全局状态
export interface GlobalDrawersState {
  expenseForm: ExpenseFormDrawerState
  documentForm: DocumentDrawerState
  documentVersionForm: DocumentVersionFormDrawerState
}

// 操作接口
export interface GlobalDrawersActions {
  // ExpenseFormDrawer 操作
  openExpenseForm: (config: Partial<ExpenseFormDrawerState>) => void
  closeExpenseForm: () => void
  updateExpenseForm: (updates: Partial<ExpenseFormDrawerState>) => void

  // DocumentDrawer 操作
  openDocumentForm: (config: Partial<DocumentDrawerState>) => void
  closeDocumentForm: () => void
  updateDocumentForm: (updates: Partial<DocumentDrawerState>) => void

  // DocumentVersionFormDrawer 操作
  openDocumentVersionForm: (config: Partial<DocumentVersionFormDrawerState>) => void
  closeDocumentVersionForm: () => void
  updateDocumentVersionForm: (updates: Partial<DocumentVersionFormDrawerState>) => void

  // 重置所有状态
  resetAll: () => void
}

type GlobalDrawersStore = GlobalDrawersState & GlobalDrawersActions

const initialState: GlobalDrawersState = {
  expenseForm: {
    isOpen: false,
    mode: 'create'
  },
  documentForm: {
    isOpen: false,
    mode: 'create'
  },
  documentVersionForm: {
    isOpen: false,
    mode: 'create'
  }
}

export const useGlobalDrawersStore = create<GlobalDrawersStore>((set) => ({
  ...initialState,

  // ExpenseFormDrawer 操作
  openExpenseForm: (config) => {
    set((state) => ({
      expenseForm: {
        ...state.expenseForm,
        ...config,
        isOpen: true
      }
    }))
  },

  closeExpenseForm: () => {
    set((state) => {
      // 调用关闭回调
      if (state.expenseForm.onClose) {
        state.expenseForm.onClose()
      }

      return {
        expenseForm: {
          ...initialState.expenseForm,
          isOpen: false
        }
      }
    })
  },

  updateExpenseForm: (updates) => {
    set((state) => ({
      expenseForm: {
        ...state.expenseForm,
        ...updates
      }
    }))
  },

  // DocumentDrawer 操作
  openDocumentForm: (config) => {
    set((state) => ({
      documentForm: {
        ...state.documentForm,
        ...config,
        isOpen: true
      }
    }))
  },

  closeDocumentForm: () => {
    set((state) => {
      // 调用关闭回调
      if (state.documentForm.onClose) {
        state.documentForm.onClose()
      }

      return {
        documentForm: {
          ...initialState.documentForm,
          isOpen: false
        }
      }
    })
  },

  updateDocumentForm: (updates) => {
    set((state) => ({
      documentForm: {
        ...state.documentForm,
        ...updates
      }
    }))
  },

  // DocumentVersionFormDrawer 操作
  openDocumentVersionForm: (config) => {
    set((state) => ({
      documentVersionForm: {
        ...state.documentVersionForm,
        ...config,
        isOpen: true
      }
    }))
  },

  closeDocumentVersionForm: () => {
    set((state) => {
      // 调用关闭回调
      if (state.documentVersionForm.onClose) {
        state.documentVersionForm.onClose()
      }

      return {
        documentVersionForm: {
          ...initialState.documentVersionForm,
          isOpen: false
        }
      }
    })
  },

  updateDocumentVersionForm: (updates) => {
    set((state) => ({
      documentVersionForm: {
        ...state.documentVersionForm,
        ...updates
      }
    }))
  },

  // 重置所有状态
  resetAll: () => {
    set(initialState)
  }
}))

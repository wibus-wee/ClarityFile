// 主要组件导出
export { NestedImportAssistant } from './components/nested-import-assistant'

// 全局组件导出
export { GlobalFileDropListener } from './components/global/file-drop-listener'
export { GlobalFileDropOverlay } from './components/global/file-drop-overlay'
export { GlobalDocumentDrawer } from './components/global/document-drawers'
export { GlobalExpenseFormDrawer } from './components/global/expense-form-drawer'

// Drawer组件导出
export { ExpenseDrawerWrapper } from './components/drawers/expense-drawer-wrapper'
export { DocumentDrawerWrapper } from './components/drawers/document-drawer-wrapper'
export {
  SimpleExpenseFormDrawer,
  SimpleDocumentDrawer,
  SimpleDocumentVersionFormDrawer
} from './components/drawers/simplified-drawers'

// Context导出
export { DragDropProvider, useDragDrop, useDragDropState } from './context/drag-drop-context'

// Hooks导出
export { useExpenseImportHandler, ExpenseImportUtils } from './hooks/use-expense-import'
export { useDocumentImportHandler, DocumentImportUtils } from './hooks/use-document-import'
export { useImportContextData, useFileValidation } from './hooks/use-import-context-data'

// 核心导出
export { ImportContextProvider, useImportContext } from './core/import-context'
export type {
  DroppedFileInfo,
  ImportContextData,
  ExpenseImportConfig,
  DocumentImportConfig,
  ImportHandlerResult
} from './core/types'
export { extractFileInfoFromFile, validateFileSize, validateFileForImportType } from './core/utils'

// 样式文件需要在使用的地方单独导入
// import '@renderer/components/import-assistant/styles/global-file-drop.css'

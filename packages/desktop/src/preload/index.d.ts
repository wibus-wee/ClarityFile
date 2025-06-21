import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      ipcInvoke: (channel: string, ...args: any[]) => Promise<any>
      ipcOn: (channel: string, callback: (...args: any[]) => void) => () => void
      ipcSend: (channel: string, ...args: any[]) => void
    }
  }
}

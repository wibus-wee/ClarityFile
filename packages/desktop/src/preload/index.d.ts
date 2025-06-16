import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      ipcInvoke: (channel: string, ...args: any[]) => Promise<any>
    }
  }
}

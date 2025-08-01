import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 暴露 ipcRenderer.invoke 给 TIPC 使用
  ipcInvoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),

  // 暴露事件相关的 API 给 TIPC 事件系统使用
  ipcOn: (channel: string, callback: (...args: any[]) => void) => {
    const subscription = (_event: any, ...args: any[]) => callback(...args)
    ipcRenderer.on(channel, subscription)
    return () => {
      ipcRenderer.off(channel, subscription)
    }
  },

  // 暴露 ipcRenderer.send 给 TIPC 事件系统使用
  ipcSend: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),

  // 暴露 webUtils.getPathForFile 用于获取拖拽文件的绝对路径
  getPathForFile: (file: File) => webUtils.getPathForFile(file)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

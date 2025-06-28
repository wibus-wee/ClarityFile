import { dialog, BrowserWindow } from 'electron'
import type { SelectDirectoryInput } from '../types/inputs'
import type { SelectDirectoryOutput } from '../types/outputs'

export class FilesystemService {
  // 选择文件夹
  static async selectDirectory(
    input: SelectDirectoryInput,
    context: any
  ): Promise<SelectDirectoryOutput> {
    // 从 WebContents 获取对应的 BrowserWindow
    const browserWindow = BrowserWindow.fromWebContents(context.sender)

    if (!browserWindow) {
      throw new Error('无法获取浏览器窗口')
    }

    const result = await dialog.showOpenDialog(browserWindow, {
      title: input.title || '选择文件夹',
      defaultPath: input.defaultPath,
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: '选择文件夹'
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, path: null }
    }

    return { canceled: false, path: result.filePaths[0] }
  }
}

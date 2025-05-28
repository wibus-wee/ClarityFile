import { dialog, BrowserWindow } from 'electron'
import type { SelectDirectoryInput, SelectFileInput } from '../types/inputs'
import type { SelectDirectoryOutput, SelectFileOutput } from '../types/outputs'

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

  // 选择文件
  static async selectFile(input: SelectFileInput, context: any): Promise<SelectFileOutput> {
    // 从 WebContents 获取对应的 BrowserWindow
    const browserWindow = BrowserWindow.fromWebContents(context.sender)

    if (!browserWindow) {
      throw new Error('无法获取浏览器窗口')
    }

    const result = await dialog.showOpenDialog(browserWindow, {
      title: input.title || '选择文件',
      defaultPath: input.defaultPath,
      properties: ['openFile'],
      filters: input.filters || [
        { name: '所有文件', extensions: ['*'] },
        { name: '文档文件', extensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'] },
        { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'] },
        { name: '文本文件', extensions: ['txt', 'md', 'json', 'xml', 'csv'] }
      ],
      buttonLabel: '选择文件'
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true, path: null }
    }

    return { canceled: false, path: result.filePaths[0] }
  }
}

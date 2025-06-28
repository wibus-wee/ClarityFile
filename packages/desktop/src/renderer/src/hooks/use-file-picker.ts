import { useCallback } from 'react'

export interface FilePickerOptions {
  accept?: string
  multiple?: boolean
  directory?: boolean
}

export interface FilePickerResult {
  files: File[]
  paths: string[]
  canceled: boolean
}

/**
 * 使用原生 HTML input[type="file"] 的文件选择 hook
 * 直接在前端获取文件路径，无需通过后端 IPC
 */
export function useFilePicker() {
  const pickFiles = useCallback(
    async (options: FilePickerOptions = {}): Promise<FilePickerResult> => {
      return new Promise((resolve) => {
        // 创建隐藏的 input 元素
        const input = document.createElement('input')
        input.type = 'file'
        input.style.display = 'none'

        // 设置选项
        if (options.accept) {
          input.accept = options.accept
        }
        if (options.multiple) {
          input.multiple = true
        }
        if (options.directory) {
          input.webkitdirectory = true
        }

        // 处理文件选择
        input.onchange = async (event) => {
          const target = event.target as HTMLInputElement
          console.log(event)
          const files = Array.from(target.files || [])

          if (files.length === 0) {
            resolve({ files: [], paths: [], canceled: true })
            return
          }

          // 获取文件路径
          const paths: string[] = []
          for (const file of files) {
            try {
              // 使用我们之前添加的 webUtils.getPathForFile
              const path = window.api.getPathForFile(file)
              paths.push(path)
            } catch (error) {
              console.warn('无法获取文件路径，使用文件名:', error)
              paths.push(file.name)
            }
          }

          resolve({ files, paths, canceled: false })

          // 清理
          document.body.removeChild(input)
        }

        // 处理取消
        input.oncancel = () => {
          resolve({ files: [], paths: [], canceled: true })
          document.body.removeChild(input)
        }

        // 添加到 DOM 并触发点击
        document.body.appendChild(input)
        input.click()
      })
    },
    []
  )

  const pickFile = useCallback(
    async (
      accept?: string
    ): Promise<{ file: File | null; path: string | null; canceled: boolean }> => {
      const result = await pickFiles({ accept, multiple: false })
      return {
        file: result.files[0] || null,
        path: result.paths[0] || null,
        canceled: result.canceled
      }
    },
    [pickFiles]
  )

  const pickDirectory = useCallback(async (): Promise<{
    path: string | null
    canceled: boolean
  }> => {
    const result = await pickFiles({ directory: true })

    if (result.canceled || result.files.length === 0) {
      return { path: null, canceled: true }
    }

    // 从第一个文件的路径中提取文件夹路径
    const firstFilePath = result.paths[0]
    if (firstFilePath) {
      // 获取文件的目录路径
      const folderPath = firstFilePath.substring(0, firstFilePath.lastIndexOf('/'))
      return { path: folderPath, canceled: false }
    }

    return { path: null, canceled: true }
  }, [pickFiles])

  return {
    pickFiles,
    pickFile,
    pickDirectory
  }
}

/**
 * 常用的文件类型过滤器
 */
export const FILE_FILTERS = {
  images: 'image/*',
  documents: '.pdf,.doc,.docx,.txt,.md,.ppt,.pptx',
  videos: 'video/*',
  audio: 'audio/*',
  all: '*/*'
} as const

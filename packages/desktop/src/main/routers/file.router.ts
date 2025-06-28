import {
  ManagedFileService,
  type CreateManagedFileInput,
  type GetGlobalFilesInput
} from '../services/managed-file.service'
import { FilesystemService } from '../services/filesystem.service'
import { TagService } from '../services/tag.service'
import type { CreateTagInput, SelectDirectoryInput } from '../types/inputs'
import { ITipc } from '../types'

export function fileRouter(t: ITipc) {
  return {
    // 创建管理的文件记录
    createManagedFile: t.procedure.input<CreateManagedFileInput>().action(async ({ input }) => {
      return await ManagedFileService.createManagedFile(input)
    }),

    // 获取所有标签
    getTags: t.procedure.action(async () => {
      return await TagService.getTags()
    }),

    // 创建标签
    createTag: t.procedure.input<CreateTagInput>().action(async ({ input }) => {
      return await TagService.createTag(input)
    }),

    // 选择文件夹
    selectDirectory: t.procedure
      .input<SelectDirectoryInput>()
      .action(async ({ input, context }) => {
        return await FilesystemService.selectDirectory(input, context)
      }),

    // 获取全局文件列表
    getGlobalFiles: t.procedure.input<GetGlobalFilesInput>().action(async ({ input }) => {
      return await ManagedFileService.getGlobalFiles(input)
    }),

    // 获取文件系统统计
    getFileSystemStats: t.procedure.action(async () => {
      return await ManagedFileService.getFileSystemStats()
    })
  }
}

import { FileManagementService } from '../services/file-management.service'
import { FilesystemService } from '../services/filesystem.service'
import { TagService } from '../services/tag.service'
import type {
  GetManagedFilesInput,
  CreateManagedFileInput,
  CreateTagInput,
  SelectDirectoryInput,
  SelectFileInput
} from '../types/inputs'

export function fileRouter(t: any) {
  return {
    // 获取管理的文件
    getManagedFiles: t.procedure
      .input()
      .action(async ({ input }: { input: GetManagedFilesInput }) => {
        return await FileManagementService.getManagedFiles(input)
      }),

    // 创建管理的文件记录
    createManagedFile: t.procedure
      .input()
      .action(async ({ input }: { input: CreateManagedFileInput }) => {
        return await FileManagementService.createManagedFile(input)
      }),

    // 获取所有标签
    getTags: t.procedure.action(async () => {
      return await TagService.getTags()
    }),

    // 创建标签
    createTag: t.procedure.input().action(async ({ input }: { input: CreateTagInput }) => {
      return await TagService.createTag(input)
    }),

    // 选择文件夹
    selectDirectory: t.procedure
      .input()
      .action(async ({ input, context }: { input: SelectDirectoryInput; context: any }) => {
        return await FilesystemService.selectDirectory(input, context)
      }),

    // 选择文件
    selectFile: t.procedure
      .input()
      .action(async ({ input, context }: { input: SelectFileInput; context: any }) => {
        return await FilesystemService.selectFile(input, context)
      })
  }
}

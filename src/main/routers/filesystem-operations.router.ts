import { FileSystemOperationsService } from '../services/filesystem-operations.service'
import type {
  RenameFileInput,
  CopyFileToDirectoryInput,
  OpenFileWithSystemInput,
  MoveFileToTrashInput,
  SaveFileAsInput
} from '../services/filesystem-operations.service'
import { ITipc } from '../types'

export function filesystemOperationsRouter(t: ITipc) {
  return {
    // 重命名文件
    renameFile: t.procedure.input<RenameFileInput>().action(async ({ input }) => {
      return await FileSystemOperationsService.renameFile(input)
    }),

    // 复制文件到指定目录
    copyFileToDirectory: t.procedure
      .input<CopyFileToDirectoryInput>()
      .action(async ({ input, context }) => {
        return await FileSystemOperationsService.copyFileToDirectory(input, context)
      }),

    // 使用系统默认应用打开文件
    openFileWithSystem: t.procedure.input<OpenFileWithSystemInput>().action(async ({ input }) => {
      return await FileSystemOperationsService.openFileWithSystem(input)
    }),

    // 移动文件到回收站
    moveFileToTrash: t.procedure.input<MoveFileToTrashInput>().action(async ({ input }) => {
      return await FileSystemOperationsService.moveFileToTrash(input)
    }),

    // 另存为文件
    saveFileAs: t.procedure.input<SaveFileAsInput>().action(async ({ input, context }) => {
      return await FileSystemOperationsService.saveFileAs(input, context)
    }),

    // 批量移动文件到回收站
    batchMoveFilesToTrash: t.procedure
      .input<{ fileIds: string[] }>()
      .action(async ({ input }) => {
        return await FileSystemOperationsService.batchMoveFilesToTrash(input.fileIds)
      }),

    // 批量复制文件到目录
    batchCopyFilesToDirectory: t.procedure
      .input<{ fileIds: string[]; targetDirectory: string }>()
      .action(async ({ input }) => {
        return await FileSystemOperationsService.batchCopyFilesToDirectory(
          input.fileIds,
          input.targetDirectory
        )
      }),

    // 通过文件ID打开文件
    openFileByIdWithSystem: t.procedure
      .input<{ fileId: string }>()
      .action(async ({ input }) => {
        // 先获取文件信息，然后打开
        const { ManagedFileService } = await import('../services/managed-file.service')
        const file = await ManagedFileService.getManagedFile({ id: input.fileId })
        if (!file) {
          throw new Error('文件不存在')
        }
        return await FileSystemOperationsService.openFileWithSystem({ filePath: file.physicalPath })
      })
  }
}

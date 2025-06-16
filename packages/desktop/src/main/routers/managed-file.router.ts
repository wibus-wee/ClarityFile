import { ManagedFileService } from '../services/managed-file.service'
import type {
  CreateManagedFileInput,
  UpdateManagedFileInput,
  GetManagedFileInput,
  DeleteManagedFileInput,
  GetManagedFilesInput
} from '../services/managed-file.service'
import { ITipc } from '../types'

export function managedFileRouter(t: ITipc) {
  return {
    // 分页获取受管文件列表
    getManagedFiles: t.procedure.input<GetManagedFilesInput>().action(async ({ input }) => {
      return await ManagedFileService.getManagedFiles(input)
    }),

    // 创建受管文件记录
    createManagedFile: t.procedure.input<CreateManagedFileInput>().action(async ({ input }) => {
      return await ManagedFileService.createManagedFile(input)
    }),

    // 获取受管文件
    getManagedFile: t.procedure.input<GetManagedFileInput>().action(async ({ input }) => {
      return await ManagedFileService.getManagedFile(input)
    }),

    // 更新受管文件
    updateManagedFile: t.procedure.input<UpdateManagedFileInput>().action(async ({ input }) => {
      return await ManagedFileService.updateManagedFile(input)
    }),

    // 删除受管文件
    deleteManagedFile: t.procedure.input<DeleteManagedFileInput>().action(async ({ input }) => {
      return await ManagedFileService.deleteManagedFile(input)
    }),

    // 搜索受管文件
    searchManagedFiles: t.procedure.input<{ query: string }>().action(async ({ input }) => {
      return await ManagedFileService.searchManagedFiles(input.query)
    }),

    // 检查文件是否存在
    checkFileExists: t.procedure.input<{ filePath: string }>().action(async ({ input }) => {
      return await ManagedFileService.checkFileExists(input.filePath)
    }),

    // 验证文件完整性
    validateFileIntegrity: t.procedure.input<{ fileId: string }>().action(async ({ input }) => {
      return await ManagedFileService.validateFileIntegrity(input.fileId)
    }),

    // 获取文件统计信息
    getFileStats: t.procedure.action(async () => {
      return await ManagedFileService.getFileStats()
    })
  }
}

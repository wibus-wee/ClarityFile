import { ManagedFileService } from '../services/managed-file.service'
import type {
  CreateManagedFileInput,
  UpdateManagedFileInput,
  GetManagedFileInput,
  DeleteManagedFileInput,
  ImportFileInput
} from '../services/managed-file.service'

export function managedFileRouter(t: any) {
  return {
    // 导入文件
    importFile: t.procedure.input().action(async ({ input }: { input: ImportFileInput }) => {
      return await ManagedFileService.importFile(input)
    }),

    // 创建受管文件记录
    createManagedFile: t.procedure
      .input()
      .action(async ({ input }: { input: CreateManagedFileInput }) => {
        return await ManagedFileService.createManagedFile(input)
      }),

    // 获取受管文件
    getManagedFile: t.procedure
      .input()
      .action(async ({ input }: { input: GetManagedFileInput }) => {
        return await ManagedFileService.getManagedFile(input)
      }),

    // 更新受管文件
    updateManagedFile: t.procedure
      .input()
      .action(async ({ input }: { input: UpdateManagedFileInput }) => {
        return await ManagedFileService.updateManagedFile(input)
      }),

    // 删除受管文件
    deleteManagedFile: t.procedure
      .input()
      .action(async ({ input }: { input: DeleteManagedFileInput }) => {
        return await ManagedFileService.deleteManagedFile(input)
      }),

    // 搜索受管文件
    searchManagedFiles: t.procedure
      .input()
      .action(async ({ input }: { input: { query: string } }) => {
        return await ManagedFileService.searchManagedFiles(input.query)
      }),

    // 检查文件是否存在
    checkFileExists: t.procedure
      .input()
      .action(async ({ input }: { input: { filePath: string } }) => {
        return await ManagedFileService.checkFileExists(input.filePath)
      }),

    // 验证文件完整性
    validateFileIntegrity: t.procedure
      .input()
      .action(async ({ input }: { input: { fileId: string } }) => {
        return await ManagedFileService.validateFileIntegrity(input.fileId)
      }),

    // 获取文件统计信息
    getFileStats: t.procedure.action(async () => {
      return await ManagedFileService.getFileStats()
    })
  }
}

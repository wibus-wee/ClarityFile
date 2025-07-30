import { ExpenseFormDrawer } from '@renderer/components/project-details/drawers/expense-form-drawer'
import { DocumentDrawer } from '@renderer/components/project-details/drawers/document-drawer'
import { DocumentVersionFormDrawer } from '@renderer/components/project-details/drawers/document-version-form-drawer'
import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { useImportAssistantStore } from '@renderer/stores/import-assistant'
import { useProjects } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import {
  usePreselectedFile,
  useExpensePrefilledData,
  useDocumentPrefilledData,
  useDocumentVersionPrefilledData,
  useImportContext
} from '../../core/import-hooks'

/**
 * 简化的发票报销 Drawer
 * 使用 Context 获取数据，减少 props
 */
export function SimpleExpenseFormDrawer() {
  const { expenseForm, closeExpenseForm } = useGlobalDrawersStore()
  const { closeImportAssistant } = useImportAssistantStore()
  const { projectId } = useImportContext()
  const preselectedFile = usePreselectedFile()
  const prefilledData = useExpensePrefilledData()

  const handleSuccess = () => {
    closeExpenseForm()
    closeImportAssistant() // 成功完成报销记录创建后关闭主导入助手
    toast.success('报销记录创建成功')
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      closeExpenseForm()
    }
  }

  if (!expenseForm.isOpen) {
    return null
  }

  return (
    <ExpenseFormDrawer
      open={expenseForm.isOpen}
      onOpenChange={handleClose}
      mode={expenseForm.mode}
      projectId={projectId}
      expense={expenseForm.expense}
      prefilledData={prefilledData}
      preselectedFile={preselectedFile || undefined}
      onSuccess={handleSuccess}
    />
  )
}

/**
 * 简化的文档 Drawer
 * 使用 Context 获取数据，减少 props
 */
export function SimpleDocumentDrawer() {
  const { documentForm, closeDocumentForm, openDocumentVersionForm } = useGlobalDrawersStore()
  const { closeImportAssistant } = useImportAssistantStore()
  const { projectId } = useImportContext()
  const preselectedFile = usePreselectedFile()
  const prefilledData = useDocumentPrefilledData()

  const handleDocumentSuccess = (createdDocument?: any) => {
    // 如果有预选择的文件，自动打开版本表单
    if (preselectedFile && createdDocument) {
      closeDocumentForm()

      openDocumentVersionForm({
        mode: 'create',
        document: {
          ...createdDocument,
          versions: []
        },
        preselectedFile,
        prefilledData: {
          versionTag: 'v1',
          notes: `导入文件：${preselectedFile.name}`,
          isGenericVersion: true
        }
        // 注意：不传递onClose回调，版本创建成功后的关闭逻辑在SimpleDocumentVersionFormDrawer中处理
      })

      toast.success('文档创建成功，正在添加文件版本...')
    } else {
      // 如果没有预选文件，直接完成文档创建流程
      closeDocumentForm()
      closeImportAssistant() // 成功完成文档创建后关闭主导入助手
      toast.success('文档创建成功')
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      closeDocumentForm()
    }
  }

  if (!documentForm.isOpen) {
    return null
  }

  return (
    <DocumentDrawer
      open={documentForm.isOpen}
      onOpenChange={handleClose}
      projectId={projectId}
      document={documentForm.document}
      prefilledData={prefilledData}
      onSuccess={handleDocumentSuccess}
    />
  )
}

/**
 * 简化的文档版本 Drawer
 * 使用 Context 获取数据，减少 props
 */
export function SimpleDocumentVersionFormDrawer() {
  const { documentVersionForm, closeDocumentVersionForm } = useGlobalDrawersStore()
  const { closeImportAssistant } = useImportAssistantStore()
  const { data: projects } = useProjects()
  const preselectedFile = usePreselectedFile()
  const prefilledData = useDocumentVersionPrefilledData()

  const getProjectDetails = () => {
    if (!documentVersionForm.document?.projectId || !projects) {
      return null
    }

    const project = projects.find((p) => p.id === documentVersionForm.document.projectId)
    if (!project) return null

    // 返回基本项目信息，其他数据将在导航后重新获取
    return {
      project: {
        ...project,
        status: project.status as 'active' | 'on_hold' | 'archived'
      },
      documents: [],
      assets: [],
      expenses: [],
      budgetOverview: {
        projectId: project.id,
        totalBudget: 0,
        allocatedBudget: 0,
        usedBudget: 0,
        remainingBudget: 0,
        utilizationRate: 0,
        budgetPools: []
      },
      competitions: [],
      tags: [],
      coverAsset: null,
      statistics: {
        documentCount: 0,
        versionCount: 0,
        assetCount: 0,
        expenseCount: 0,
        totalBudget: 0,
        usedBudget: 0,
        remainingBudget: 0,
        budgetUtilizationRate: 0,
        budgetPoolCount: 0,
        competitionCount: 0,
        tagCount: 0
      }
    }
  }

  const handleVersionSuccess = () => {
    closeDocumentVersionForm()
    closeImportAssistant() // 成功完成文档版本添加后关闭主导入助手
    toast.success('文档版本添加成功')
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      closeDocumentVersionForm()
    }
  }

  if (!documentVersionForm.isOpen) {
    return null
  }

  const projectDetails = getProjectDetails()

  if (!projectDetails) {
    closeDocumentVersionForm()
    toast.error('无法获取项目信息')
    return null
  }

  return (
    <DocumentVersionFormDrawer
      mode={documentVersionForm.mode}
      document={documentVersionForm.document}
      version={documentVersionForm.version}
      projectDetails={projectDetails}
      open={documentVersionForm.isOpen}
      onOpenChange={handleClose}
      prefilledData={prefilledData}
      preselectedFile={preselectedFile || undefined}
      onSuccess={handleVersionSuccess}
    />
  )
}

import { ExpenseFormDrawer } from '@renderer/components/project-details/drawers/expense-form-drawer'
import { DocumentDrawer } from '@renderer/components/project-details/drawers/document-drawer'
import { DocumentVersionFormDrawer } from '@renderer/components/project-details/drawers/document-version-form-drawer'
import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { useProjects } from '@renderer/hooks/use-tipc'
import {
  useImportContext,
  usePreselectedFile,
  useExpensePrefilledData,
  useDocumentPrefilledData,
  useDocumentVersionPrefilledData
} from '../../core/import-context'
import { toast } from 'sonner'

/**
 * 简化的发票报销 Drawer
 * 使用 Context 获取数据，减少 props
 */
export function SimpleExpenseFormDrawer() {
  const { expenseForm, closeExpenseForm } = useGlobalDrawersStore()
  const { projectId } = useImportContext()
  const preselectedFile = usePreselectedFile()
  const prefilledData = useExpensePrefilledData()

  const handleSuccess = () => {
    closeExpenseForm()
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
      })

      toast.success('文档创建成功，正在添加文件版本...')
    } else {
      closeDocumentForm()
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
  const { data: projects } = useProjects()
  const preselectedFile = usePreselectedFile()
  const prefilledData = useDocumentVersionPrefilledData()

  const getProjectDetails = () => {
    if (!documentVersionForm.document?.projectId || !projects) {
      return null
    }

    const project = projects.find((p) => p.id === documentVersionForm.document.projectId)
    if (!project) return null

    // 创建符合 ProjectDetailsOutput 类型的对象
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
      sharedResources: [],
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
        sharedResourceCount: 0,
        competitionCount: 0,
        tagCount: 0
      }
    }
  }

  const handleVersionSuccess = () => {
    closeDocumentVersionForm()
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

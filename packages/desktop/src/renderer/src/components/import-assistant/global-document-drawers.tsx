import { DocumentDrawer } from '@renderer/components/project-details/drawers/document-drawer'
import { DocumentVersionFormDrawer } from '@renderer/components/project-details/drawers/document-version-form-drawer'
import { useGlobalDrawersStore } from '@renderer/stores/global-drawers'
import { useProjects } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'

/**
 * 全局 DocumentDrawer 组件
 * 由全局状态管理控制，支持数据预填充
 */
export function GlobalDocumentDrawer() {
  const { documentForm, closeDocumentForm, openDocumentVersionForm } = useGlobalDrawersStore()

  // 处理文档创建成功后的回调
  const handleDocumentSuccess = (createdDocument?: any) => {
    // 如果有预选择的文件，自动打开版本表单
    if (documentForm.preselectedFile && createdDocument) {
      // 关闭文档表单
      closeDocumentForm()

      // 打开版本表单
      openDocumentVersionForm({
        mode: 'create',
        document: {
          ...createdDocument,
          versions: [] // 新创建的文档没有版本
        },
        preselectedFile: documentForm.preselectedFile,
        prefilledData: {
          versionTag: 'v1',
          notes: `导入文件：${documentForm.preselectedFile.name}`,
          isGenericVersion: true
        }
      })

      toast.success('文档创建成功，正在添加文件版本...')
    } else {
      closeDocumentForm()
      toast.success('文档创建成功')
    }
  }

  // 处理关闭
  const handleClose = (open: boolean) => {
    if (!open) {
      closeDocumentForm()
    }
  }

  // 如果没有打开状态，不渲染组件
  if (!documentForm.isOpen) {
    return null
  }

  return (
    <DocumentDrawer
      open={documentForm.isOpen}
      onOpenChange={handleClose}
      projectId={documentForm.projectId!}
      document={documentForm.document}
      prefilledData={documentForm.prefilledData}
      onSuccess={handleDocumentSuccess}
    />
  )
}

/**
 * 全局 DocumentVersionFormDrawer 组件
 * 由全局状态管理控制，支持文件预选择和数据预填充
 */
export function GlobalDocumentVersionFormDrawer() {
  const { documentVersionForm, closeDocumentVersionForm } = useGlobalDrawersStore()

  const { data: projects } = useProjects()

  // 获取项目详情
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

  // 处理版本创建成功
  const handleVersionSuccess = () => {
    closeDocumentVersionForm()
    toast.success('文档版本添加成功')
  }

  // 处理关闭
  const handleClose = (open: boolean) => {
    if (!open) {
      closeDocumentVersionForm()
    }
  }

  // 如果没有打开状态，不渲染组件
  if (!documentVersionForm.isOpen) {
    return null
  }

  const projectDetails = getProjectDetails()

  if (!projectDetails) {
    // 如果无法获取项目详情，关闭 drawer 并显示错误
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
      prefilledData={documentVersionForm.prefilledData}
      preselectedFile={documentVersionForm.preselectedFile}
      onSuccess={handleVersionSuccess}
    />
  )
}

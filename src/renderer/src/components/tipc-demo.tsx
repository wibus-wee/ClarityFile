import { useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Badge } from '@renderer/components/ui/badge'
import { Skeleton } from '@renderer/components/ui/skeleton'
import {
  useProjects,
  useCreateProject,
  useSystemInfo,
  useTags,
  useCreateTag
} from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'

export function TipcDemo() {
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState('#3b82f6')

  // 使用 SWR hooks
  const { data: projects, error: projectsError, isLoading: projectsLoading } = useProjects()
  const { data: systemInfo, isLoading: systemInfoLoading } = useSystemInfo()
  const { data: tags, isLoading: tagsLoading } = useTags()

  // 使用 SWR mutation hooks
  const { trigger: createProject, isMutating: isCreatingProject } = useCreateProject()
  const { trigger: createTag, isMutating: isCreatingTag } = useCreateTag()

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error('请输入项目名称')
      return
    }

    try {
      await createProject({
        name: projectName,
        description: projectDescription || undefined
      })
      toast.success('项目创建成功！')
      setProjectName('')
      setProjectDescription('')
    } catch (error) {
      toast.error('创建项目失败')
      console.error(error)
    }
  }

  const handleCreateTag = async () => {
    if (!tagName.trim()) {
      toast.error('请输入标签名称')
      return
    }

    try {
      await createTag({
        name: tagName,
        color: tagColor
      })
      toast.success('标签创建成功！')
      setTagName('')
    } catch (error) {
      toast.error('创建标签失败')
      console.error(error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 系统信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>系统信息</CardTitle>
            <CardDescription>当前系统统计数据</CardDescription>
          </CardHeader>
          <CardContent>
            {systemInfoLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : systemInfo ? (
              <div className="space-y-2 text-sm">
                <div>项目数量: {systemInfo.projectCount}</div>
                <div>文档数量: {systemInfo.documentCount}</div>
                <div>文件数量: {systemInfo.fileCount}</div>
                <div className="text-xs text-muted-foreground">
                  更新时间: {new Date(systemInfo.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">无法加载系统信息</div>
            )}
          </CardContent>
        </Card>

        {/* 创建项目卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>创建项目</CardTitle>
            <CardDescription>添加新的项目</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="项目名称"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <Input
              placeholder="项目描述（可选）"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
            <Button onClick={handleCreateProject} disabled={isCreatingProject} className="w-full">
              {isCreatingProject ? '创建中...' : '创建项目'}
            </Button>
          </CardContent>
        </Card>

        {/* 创建标签卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>创建标签</CardTitle>
            <CardDescription>添加新的标签</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="标签名称"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
                className="w-8 h-8 rounded border"
              />
              <span className="text-sm text-muted-foreground">选择颜色</span>
            </div>
            <Button onClick={handleCreateTag} disabled={isCreatingTag} className="w-full">
              {isCreatingTag ? '创建中...' : '创建标签'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 项目列表 */}
      <Card>
        <CardHeader>
          <CardTitle>项目列表</CardTitle>
          <CardDescription>所有项目的列表</CardDescription>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : projectsError ? (
            <div className="text-sm text-red-500">加载项目失败</div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      )}
                    </div>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    创建时间: {new Date(project.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">暂无项目</div>
          )}
        </CardContent>
      </Card>

      {/* 标签列表 */}
      <Card>
        <CardHeader>
          <CardTitle>标签列表</CardTitle>
          <CardDescription>所有可用的标签</CardDescription>
        </CardHeader>
        <CardContent>
          {tagsLoading ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>
          ) : tags && tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color || undefined }}
                  className="text-white"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">暂无标签</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

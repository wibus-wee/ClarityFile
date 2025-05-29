import { useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Label } from '@renderer/components/ui/label'
import { Save, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUpdateProject, useDeleteProject } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

interface ProjectSettingsProps {
  project: {
    id: string
    name: string
    description?: string | null
    status: string
    createdAt: Date
    updatedAt: Date
    folderPath?: string | null
  }
}

export function ProjectSettings({ project }: ProjectSettingsProps) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    status: project.status
  })

  const { trigger: updateProject, isMutating: isUpdating } = useUpdateProject()
  const { trigger: deleteProject, isMutating: isDeleting } = useDeleteProject()

  const handleSave = async () => {
    try {
      await updateProject({
        id: project.id,
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status
      })
      toast.success('项目设置已保存！')
    } catch (error) {
      toast.error('保存项目设置失败')
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`确定要删除项目 "${project.name}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      await deleteProject({ id: project.id })
      toast.success('项目已删除！')
      navigate({ to: '/projects' })
    } catch (error) {
      toast.error('删除项目失败')
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">项目设置</h2>
        <p className="text-sm text-muted-foreground">管理项目的基本信息和配置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本信息 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">项目名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入项目名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">项目描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入项目描述"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">项目状态</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="archived">已归档</SelectItem>
                    <SelectItem value="on_hold">暂停</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} disabled={isUpdating} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? '保存中...' : '保存设置'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* 项目信息 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>项目信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">项目ID</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{project.id}</p>
              </div>

              {project.folderPath && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">文件夹路径</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1 break-all">
                    {project.folderPath}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">创建时间</Label>
                  <p className="text-sm mt-1">{new Date(project.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">更新时间</Label>
                  <p className="text-sm mt-1">{new Date(project.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 危险操作 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">危险操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">删除项目</h4>
                <p className="text-sm text-muted-foreground">
                  删除项目将永久移除所有相关数据，此操作不可撤销。
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? '删除中...' : '删除项目'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

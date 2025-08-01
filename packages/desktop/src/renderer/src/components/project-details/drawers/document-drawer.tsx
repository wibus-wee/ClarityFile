import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@clarity/shadcn/ui/drawer'
import { Button } from '@clarity/shadcn/ui/button'
import { Input } from '@clarity/shadcn/ui/input'
import { Textarea } from '@clarity/shadcn/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@clarity/shadcn/ui/form'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@clarity/shadcn/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@clarity/shadcn/ui/popover'
import { useTranslation } from 'react-i18next'
import { FileText, Edit, Loader2, Plus, Check, ChevronsUpDown } from 'lucide-react'
import { useCreateLogicalDocument, useUpdateLogicalDocument } from '@renderer/hooks/use-tipc'
import { toast } from 'sonner'
import { cn } from '@renderer/lib/utils'
import type {
  CreateLogicalDocumentInput,
  UpdateLogicalDocumentInput,
  DocumentType
} from '@main/types/document-schemas'
import { COMMON_DOCUMENT_TYPES } from '@main/types/document-schemas'

// 文档输出类型（简化版，用于编辑）
interface DocumentOutput {
  id: string
  name: string
  type: DocumentType
  description?: string | null
  defaultStoragePathSegment?: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}

interface DocumentDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  document?: DocumentOutput | null // 编辑时传入，创建时为空
  // 新增：预填充数据支持
  prefilledData?: {
    name?: string
    type?: string
    description?: string
  }
  onSuccess?: (createdDocument?: any) => void
}

// 统一的表单数据类型
type DocumentFormData = {
  projectId?: string
  id?: string
  name: string
  type: DocumentType
  description?: string
  defaultStoragePathSegment?: string
}

// 文档类型 Combobox 组件
interface DocumentTypeComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

function DocumentTypeCombobox({
  value,
  onValueChange,
  placeholder = '选择或输入文档类型...',
  disabled = false
}: DocumentTypeComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const { t } = useTranslation('projects')

  // 过滤选项
  const filteredOptions = COMMON_DOCUMENT_TYPES.filter(
    (option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.value.toLowerCase().includes(searchValue.toLowerCase())
  )

  // 检查当前值是否在预定义选项中
  const selectedOption = COMMON_DOCUMENT_TYPES.find((option) => option.value === value)

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value) {
      onValueChange('')
    } else {
      onValueChange(selectedValue)
    }
    setOpen(false)
    setSearchValue('')
  }

  const handleCustomValue = () => {
    if (searchValue.trim()) {
      onValueChange(searchValue.trim())
      setOpen(false)
      setSearchValue('')
    }
  }

  const displayValue = selectedOption?.label || value || placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', !value && 'text-muted-foreground')}
          disabled={disabled}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={t('drawers.documentDrawer.fields.type.searchPlaceholder')}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  {t('drawers.documentDrawer.fields.type.noResults')}
                </p>
                {searchValue.trim() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCustomValue}
                    className="h-8 text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {t('drawers.documentDrawer.fields.type.useCustom', {
                      value: searchValue.trim()
                    })}
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                  className="flex flex-col items-start gap-1 py-3"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {/* 显示自定义值选项 */}
            {searchValue.trim() &&
              !filteredOptions.some(
                (option) => option.value.toLowerCase() === searchValue.toLowerCase()
              ) && (
                <CommandGroup>
                  <CommandItem
                    value={searchValue.trim()}
                    onSelect={() => handleCustomValue()}
                    className="flex items-center gap-2 py-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>
                      {t('drawers.documentDrawer.fields.type.useCustom', {
                        value: searchValue.trim()
                      })}
                    </span>
                  </CommandItem>
                </CommandGroup>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function DocumentDrawer({
  open,
  onOpenChange,
  projectId,
  document,
  prefilledData,
  onSuccess
}: DocumentDrawerProps) {
  const isEdit = !!document
  const { t } = useTranslation('projects')
  const { trigger: createDocument, isMutating: isCreating } = useCreateLogicalDocument()
  const { trigger: updateDocument, isMutating: isUpdating } = useUpdateLogicalDocument()

  const isMutating = isCreating || isUpdating

  const form = useForm<DocumentFormData>({
    defaultValues: {
      projectId: projectId,
      name: prefilledData?.name || '',
      type: (prefilledData?.type as DocumentType) || 'requirements',
      description: prefilledData?.description || '',
      defaultStoragePathSegment: '',
      ...(isEdit && { id: '' })
    }
  })

  // 当文档数据变化时更新表单
  useEffect(() => {
    if (document) {
      // 编辑模式
      form.reset({
        id: document.id,
        name: document.name,
        type: document.type,
        description: document.description || '',
        defaultStoragePathSegment: document.defaultStoragePathSegment || ''
      })
    } else {
      // 创建模式，支持预填充数据
      form.reset({
        projectId: projectId,
        name: prefilledData?.name || '',
        type: (prefilledData?.type as DocumentType) || 'requirements',
        description: prefilledData?.description || '',
        defaultStoragePathSegment: ''
      })
    }
  }, [document, projectId, prefilledData, form])

  const onSubmit = async (data: DocumentFormData) => {
    try {
      if (isEdit && document) {
        // 编辑模式
        const input: UpdateLogicalDocumentInput = {
          id: document.id,
          name: data.name?.trim(),
          type: data.type,
          description: data.description?.trim() || undefined,
          defaultStoragePathSegment: data.defaultStoragePathSegment?.trim() || undefined
        }
        await updateDocument(input)

        toast.success(t('drawers.documentDrawer.messages.updateSuccess'), {
          description: t('drawers.documentDrawer.messages.updateSuccessDesc', { name: data.name })
        })
      } else {
        // 创建模式
        const input: CreateLogicalDocumentInput = {
          projectId: projectId,
          name: data.name!.trim(),
          type: data.type!,
          description: data.description?.trim() || undefined,
          defaultStoragePathSegment: data.defaultStoragePathSegment?.trim() || undefined
        }
        const createdDocument = await createDocument(input)

        toast.success(t('drawers.documentDrawer.messages.createSuccess'), {
          description: t('drawers.documentDrawer.messages.createSuccessDesc', { name: data.name })
        })

        // 重置表单
        form.reset()

        // 关闭对话框
        onOpenChange(false)

        // 调用成功回调，传递创建的文档
        onSuccess?.(createdDocument)
        return
      }

      // 编辑模式的处理
      // 重置表单
      form.reset()

      // 关闭对话框
      onOpenChange(false)

      // 调用成功回调
      onSuccess?.()
    } catch (error) {
      console.error(`${isEdit ? '更新' : '创建'}文档失败:`, error)
      toast.error(
        isEdit
          ? t('drawers.documentDrawer.messages.updateError')
          : t('drawers.documentDrawer.messages.createError'),
        {
          description:
            error instanceof Error ? error.message : t('drawers.documentDrawer.messages.errorDesc')
        }
      )
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isEdit ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-primary/10'
              }`}
            >
              {isEdit ? (
                <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <FileText className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <DrawerTitle className="text-xl">
                {isEdit
                  ? t('drawers.documentDrawer.editTitle')
                  : t('drawers.documentDrawer.createTitle')}
              </DrawerTitle>
              <DrawerDescription className="text-sm">
                {isEdit
                  ? t('drawers.documentDrawer.editDescription', { name: document?.name })
                  : t('drawers.documentDrawer.createDescription')}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 overflow-y-auto"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 文档名称 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('drawers.documentDrawer.fields.name.label')}{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('drawers.documentDrawer.fields.name.placeholder')}
                        maxLength={100}
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {t('drawers.documentDrawer.helpTexts.nameHelp', {
                        count: field.value?.length || 0
                      })}
                    </p>
                  </FormItem>
                )}
              />

              {/* 文档类型 */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('drawers.documentDrawer.fields.type.label')}{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <DocumentTypeCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('drawers.documentDrawer.fields.type.placeholder')}
                    />
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {t('drawers.documentDrawer.helpTexts.typeHelp')}
                    </p>
                  </FormItem>
                )}
              />

              {/* 文档描述 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('drawers.documentDrawer.fields.description.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('drawers.documentDrawer.fields.description.placeholder')}
                        rows={3}
                        maxLength={500}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {t('drawers.documentDrawer.helpTexts.descriptionHelp', {
                        count: field.value?.length || 0
                      })}
                    </p>
                  </FormItem>
                )}
              />

              {/* 存储路径段 */}
              <FormField
                control={form.control}
                name="defaultStoragePathSegment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('drawers.documentDrawer.fields.storagePath.label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('drawers.documentDrawer.fields.storagePath.placeholder')}
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {t('drawers.documentDrawer.helpTexts.storagePathHelp', {
                        count: field.value?.length || 0
                      })}
                    </p>
                  </FormItem>
                )}
              />

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isMutating}
                  className="flex-1"
                >
                  {t('drawers.documentDrawer.actions.cancel')}
                </Button>

                <Button type="submit" disabled={isMutating} className="flex-1 gap-2">
                  {isMutating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isEdit
                        ? t('drawers.documentDrawer.actions.updating')
                        : t('drawers.documentDrawer.actions.creating')}
                    </>
                  ) : (
                    <>
                      {isEdit ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {isEdit
                        ? t('drawers.documentDrawer.actions.update')
                        : t('drawers.documentDrawer.actions.create')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </DrawerContent>
    </Drawer>
  )
}

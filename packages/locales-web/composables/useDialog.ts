import { ref } from 'vue'

interface DialogOptions {
  title?: string
  message?: string
  type?: 'alert' | 'confirm' | 'prompt'
  placeholder?: string
  confirmText?: string
  cancelText?: string
}

export const useDialog = () => {
  const isOpen = ref(false)
  const dialogOptions = ref<DialogOptions>({})
  const resolvePromise = ref<((value: any) => void) | null>(null)
  const rejectPromise = ref<((reason?: any) => void) | null>(null)

  // 显示对话框的通用方法
  const showDialog = (options: DialogOptions): Promise<any> => {
    return new Promise((resolve, reject) => {
      dialogOptions.value = {
        type: 'alert',
        confirmText: '确定',
        cancelText: '取消',
        ...options
      }

      resolvePromise.value = resolve
      rejectPromise.value = reject
      isOpen.value = true
    })
  }

  // 显示警告对话框
  const alert = (message: string, title?: string): Promise<void> => {
    return showDialog({
      type: 'alert',
      message,
      title: title || '提示'
    })
  }

  // 显示确认对话框
  const confirm = (message: string, title?: string): Promise<boolean> => {
    return showDialog({
      type: 'confirm',
      message,
      title: title || '确认'
    })
  }

  // 显示输入对话框
  const prompt = (
    message: string,
    placeholder?: string,
    title?: string
  ): Promise<string | null> => {
    return showDialog({
      type: 'prompt',
      message,
      placeholder,
      title: title || '输入'
    })
  }

  // 处理确认
  const handleConfirm = (value?: any) => {
    if (resolvePromise.value) {
      if (dialogOptions.value.type === 'confirm') {
        resolvePromise.value(true)
      } else if (dialogOptions.value.type === 'prompt') {
        resolvePromise.value(value || null)
      } else {
        resolvePromise.value(undefined)
      }
    }
    closeDialog()
  }

  // 处理取消
  const handleCancel = () => {
    if (dialogOptions.value.type === 'confirm') {
      if (resolvePromise.value) {
        resolvePromise.value(false)
      }
    } else if (dialogOptions.value.type === 'prompt') {
      if (resolvePromise.value) {
        resolvePromise.value(null)
      }
    } else {
      if (rejectPromise.value) {
        rejectPromise.value()
      }
    }
    closeDialog()
  }

  // 关闭对话框
  const closeDialog = () => {
    isOpen.value = false
    resolvePromise.value = null
    rejectPromise.value = null
    dialogOptions.value = {}
  }

  return {
    // 状态
    isOpen: readonly(isOpen),
    dialogOptions: readonly(dialogOptions),

    // 方法
    alert,
    confirm,
    prompt,
    handleConfirm,
    handleCancel,
    closeDialog
  }
}

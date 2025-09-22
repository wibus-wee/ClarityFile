import type { Ref } from 'vue'
import { readonly, ref } from 'vue'
import { createGlobalState } from '@vueuse/core'

export interface DialogOptions {
  title?: string
  message?: string
  type?: 'alert' | 'confirm' | 'prompt'
  placeholder?: string
  confirmText?: string
  cancelText?: string
}

interface DialogState {
  isOpen: Ref<boolean>
  dialogOptions: Ref<DialogOptions>
  alert: (message: string, options?: Pick<DialogOptions, 'title' | 'confirmText'>) => Promise<void>
  confirm: (
    message: string,
    options?: Pick<DialogOptions, 'title' | 'confirmText' | 'cancelText'>
  ) => Promise<boolean>
  prompt: (
    message: string,
    options?: Pick<DialogOptions, 'title' | 'placeholder' | 'confirmText' | 'cancelText'>
  ) => Promise<string | null>
  handleConfirm: (value?: any) => void
  handleCancel: () => void
  closeDialog: () => void
}

const useDialogState = createGlobalState<() => DialogState>(() => {
  const isOpen = ref(false)
  const dialogOptions = ref<DialogOptions>({ type: 'alert' })
  const resolvePromise = ref<((value: any) => void) | null>(null)
  const rejectPromise = ref<((reason?: any) => void) | null>(null)

  const showDialog = (options: DialogOptions): Promise<any> => {
    return new Promise((resolve, reject) => {
      dialogOptions.value = {
        type: 'alert',
        confirmText: 'OK',
        cancelText: 'Cancel',
        ...options
      }

      resolvePromise.value = resolve
      rejectPromise.value = reject
      isOpen.value = true
    })
  }

  const alert = (
    message: string,
    options: Pick<DialogOptions, 'title' | 'confirmText'> = {}
  ): Promise<void> => {
    return showDialog({
      type: 'alert',
      message,
      title: options.title || 'Notice',
      confirmText: options.confirmText || 'OK'
    })
  }

  const confirm = (
    message: string,
    options: Pick<DialogOptions, 'title' | 'confirmText' | 'cancelText'> = {}
  ): Promise<boolean> => {
    return showDialog({
      type: 'confirm',
      message,
      title: options.title || 'Confirmation',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel'
    })
  }

  const prompt = (
    message: string,
    options: Pick<DialogOptions, 'title' | 'placeholder' | 'confirmText' | 'cancelText'> = {}
  ): Promise<string | null> => {
    return showDialog({
      type: 'prompt',
      message,
      title: options.title || 'Input',
      placeholder: options.placeholder,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel'
    })
  }

  const handleConfirm = (value?: any) => {
    if (resolvePromise.value) {
      if (dialogOptions.value.type === 'confirm') {
        resolvePromise.value(true)
      } else if (dialogOptions.value.type === 'prompt') {
        resolvePromise.value(value ?? null)
      } else {
        resolvePromise.value(undefined)
      }
    }
    closeDialog()
  }

  const handleCancel = () => {
    if (dialogOptions.value.type === 'confirm') {
      resolvePromise.value?.(false)
    } else if (dialogOptions.value.type === 'prompt') {
      resolvePromise.value?.(null)
    } else {
      rejectPromise.value?.()
    }
    closeDialog()
  }

  const closeDialog = () => {
    isOpen.value = false
    resolvePromise.value = null
    rejectPromise.value = null
    dialogOptions.value = { type: 'alert' }
  }

  return {
    isOpen,
    dialogOptions,
    alert,
    confirm,
    prompt,
    handleConfirm,
    handleCancel,
    closeDialog
  }
})

export const useDialog = () => {
  const state = useDialogState()
  return {
    isOpen: readonly(state.isOpen),
    dialogOptions: readonly(state.dialogOptions),
    alert: state.alert,
    confirm: state.confirm,
    prompt: state.prompt,
    handleConfirm: state.handleConfirm,
    handleCancel: state.handleCancel,
    closeDialog: state.closeDialog
  }
}

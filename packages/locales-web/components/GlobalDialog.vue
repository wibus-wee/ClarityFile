<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
        role="presentation"
        @click.self="handleSecondary"
      >
        <div
          class="w-full max-w-md rounded-lg border border-antfu-border bg-antfu-bg shadow-xl"
          role="dialog"
          aria-modal="true"
        >
          <div class="px-5 pt-5">
            <h3 v-if="options.title" class="text-base font-medium text-antfu-text">
              {{ options.title }}
            </h3>
            <p v-if="options.message" class="mt-2 text-sm text-antfu-text-mute whitespace-pre-line">
              {{ options.message }}
            </p>
            <div v-if="isPrompt" class="mt-4">
              <input
                v-model="promptValue"
                :placeholder="options.placeholder || 'Enter a value'"
                class="w-full rounded border border-antfu-border bg-antfu-bg px-3 py-2 text-sm text-antfu-text focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                ref="promptInput"
                @keyup.enter="handlePrimary"
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 px-5 py-4 bg-antfu-soft">
            <button
              v-if="isConfirm || isPrompt"
              type="button"
              class="rounded border border-antfu-border px-3 py-1.5 text-xs text-antfu-text-soft hover:text-antfu-text hover:bg-antfu-bg transition-colors"
              @click="handleSecondary"
            >
              {{ options.cancelText || 'Cancel' }}
            </button>
            <button
              type="button"
              class="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
              @click="handlePrimary"
              ref="primaryButton"
            >
              {{ options.confirmText || 'OK' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useDialog } from '~/composables/useDialog'

const dialog = useDialog()

const isOpen = computed(() => dialog.isOpen.value)
const options = computed(() => dialog.dialogOptions.value)
const isPrompt = computed(() => options.value.type === 'prompt')
const isConfirm = computed(() => options.value.type === 'confirm')
const promptValue = ref('')
const primaryButton = ref<HTMLButtonElement | null>(null)
const promptInput = ref<HTMLInputElement | null>(null)

watch(isOpen, (open) => {
  if (open) {
    promptValue.value = ''
    nextTick(() => {
      if (isPrompt.value) {
        promptInput.value?.focus()
      } else {
        primaryButton.value?.focus()
      }
    })
  } else {
    promptValue.value = ''
  }
})

const handlePrimary = () => {
  if (isPrompt.value) {
    dialog.handleConfirm(promptValue.value)
  } else {
    dialog.handleConfirm()
  }
}

const handleSecondary = () => {
  dialog.handleCancel()
}

useEventListener('keydown', (event: KeyboardEvent) => {
  if (!isOpen.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    dialog.handleCancel()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>

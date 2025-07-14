<template>
  <div class="array-editor">
    <!-- 头部 -->
    <div class="flex items-center justify-between mb-2">
      <div class="text-xs text-antfu-text-mute opacity-60">{{ modelValue.length }} items</div>
      <button @click="addItem"
        class="flex items-center gap-1 px-2 py-1 text-xs text-antfu-text-soft hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-antfu-bg-mute rounded transition-all">
        <div class="i-carbon-add text-xs"></div>
        <span>Add</span>
      </button>
    </div>

    <!-- 数组项列表 -->
    <div class="space-y-1">
      <div v-for="(item, index) in modelValue" :key="index"
        class="flex items-center gap-3 hover:bg-antfu-bg-mute rounded transition-all" data-array-item>
        <!-- 序号 -->
        <div class="flex-shrink-0 w-5 text-xs text-antfu-text-mute opacity-50 text-right">
          {{ index + 1 }}
        </div>
        <!-- 输入框 -->
        <input :value="item" @input="updateItem(index, $event.target.value)"
          class="flex-1 px-0 text-sm bg-transparent text-antfu-text placeholder-antfu-text-mute border-0 focus:outline-none"
          :placeholder="`Item ${index + 1}`" />
        <!-- 删除按钮 -->
        <button @click="removeItem(index)"
          class="flex-shrink-0 p-1 opacity-0 text-antfu-text-mute hover:text-red-500 rounded transition-all"
          data-delete-button>
          <div class="i-carbon-close text-xs"></div>
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="modelValue.length === 0" class="text-center py-6 text-antfu-text-mute">
        <div class="i-carbon-list text-lg mb-2 opacity-20 mx-auto"></div>
        <p class="text-xs opacity-60">Empty array</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

function updateItem(index, value) {
  const newArray = [...props.modelValue]
  newArray[index] = value
  emit('update:modelValue', newArray)
}

function addItem() {
  const newArray = [...props.modelValue, '']
  emit('update:modelValue', newArray)
}

function removeItem(index) {
  const newArray = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newArray)
}
</script>

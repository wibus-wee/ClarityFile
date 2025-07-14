<template>
  <div class="array-editor">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Array ({{ modelValue.length }} items)
      </span>
      <button
        @click="addItem"
        class="px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-all flex items-center gap-1"
      >
        <div class="i-carbon-add text-xs"></div>
        Add Item
      </button>
    </div>
    
    <div class="space-y-2">
      <div
        v-for="(item, index) in modelValue"
        :key="index"
        class="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-600 rounded"
      >
        <div class="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 w-6">
          {{ index + 1 }}.
        </div>
        <input
          :value="item"
          @input="updateItem(index, $event.target.value)"
          class="flex-1 px-2 py-1 text-sm border-0 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
          :placeholder="`Item ${index + 1}`"
        />
        <button
          @click="removeItem(index)"
          class="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
        >
          <div class="i-carbon-trash-can text-xs"></div>
        </button>
      </div>
      
      <!-- 空状态 -->
      <div v-if="modelValue.length === 0" class="text-center py-4 text-gray-400 dark:text-gray-500">
        <div class="i-carbon-list text-lg mb-1 opacity-30 mx-auto"></div>
        <p class="text-xs">No items in array</p>
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

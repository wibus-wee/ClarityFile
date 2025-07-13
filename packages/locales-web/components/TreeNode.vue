<template>
  <div>
    <button class="w-full text-left p-2 rounded-md transition-all duration-200 group flex items-center gap-2" :class="[
      isSelected
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
    ]" :style="{ paddingLeft: `${level * 12 + 8}px` }" @click="handleClick">
      <!-- 展开/收起图标 -->
      <div v-if="isObject" class="w-4 h-4 flex-center transition-transform duration-200"
        :class="{ 'rotate-90': expanded }">
        <div class="i-mdi-chevron-right text-sm"></div>
      </div>
      <div v-else class="w-4"></div>

      <!-- 节点图标 -->
      <div class="w-4 h-4 flex-center"
        :class="isObject ? 'i-carbon-folder text-yellow-600' : 'i-carbon-document text-blue-600'"></div>

      <!-- 节点名称 -->
      <span class="text-sm font-medium flex-1">{{ nodeKey }}</span>

      <!-- 值预览（仅对叶子节点显示） -->
      <span v-if="!isObject && typeof value === 'string'"
        class="text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate">
        {{ value }}
      </span>
    </button>

    <!-- 子节点 -->
    <div v-if="isObject && expanded" class="mt-1">
      <TreeNode v-for="(childValue, childKey) in value" :key="childKey" :node-key="childKey" :value="childValue"
        :path="`${path}.${childKey}`" :selected-key="selectedKey" :level="level + 1"
        @select="$emit('select', $event)" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  nodeKey: {
    type: String,
    required: true
  },
  value: {
    type: [String, Object],
    required: true
  },
  path: {
    type: String,
    required: true
  },
  selectedKey: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select'])

const expanded = ref(true)

const isObject = computed(() => {
  return typeof props.value === 'object' && props.value !== null
})

const isSelected = computed(() => {
  return props.selectedKey === props.path
})

function handleClick() {
  if (isObject.value) {
    expanded.value = !expanded.value
  } else {
    // 选择叶子节点
    emit('select', props.path)
  }
}
</script>

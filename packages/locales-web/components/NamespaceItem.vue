<template>
  <button class="w-full text-left p-2 rounded transition-all duration-200 group" :class="[
    active
      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
      : 'hover:text-gray-700 dark:hover:text-gray-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
  ]" @click="$emit('select', namespace.name)">
    <div class="flex-between">
      <div>
        <div class="font-light text-sm">
          {{ namespace.label }}
        </div>
        <div class="text-xs opacity-60 mt-0.5">
          {{ namespace.name }}
        </div>
      </div>
      <span class="text-xs opacity-50 group-hover:opacity-75 transition-opacity">
        {{ namespace.count }}
      </span>
    </div>
  </button>
</template>

<script setup>
defineProps({
  namespace: {
    type: Object,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select'])
</script>

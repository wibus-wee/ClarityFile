<template>
  <div class="space-y-1">
    <TreeNode 
      v-for="(value, key) in data" 
      :key="key"
      :node-key="key"
      :value="value"
      :path="key"
      :selected-key="selectedKey"
      :level="0"
      @select="$emit('select', $event)"
    />
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true
  },
  selectedKey: {
    type: String,
    default: ''
  }
})

defineEmits(['select'])
</script>

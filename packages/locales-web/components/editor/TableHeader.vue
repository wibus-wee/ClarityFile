<template>
  <thead class="sticky top-0 bg-antfu-bg">
    <tr>
      <th class="px-4 py-2 text-left text-xs font-light text-antfu-text-mute border-b border-antfu-border w-64 opacity-75">
        Key
      </th>
      <th 
        v-for="language in languages" 
        :key="language.code"
        class="px-4 py-2 text-left text-xs font-light text-antfu-text-mute border-b border-antfu-border opacity-75"
        :style="{ width: `${Math.max(200, 400 / languages.length)}px` }"
      >
        {{ language.name }}
        <span class="font-normal ml-1 opacity-50">({{ language.code }})</span>
        <span v-if="language.isBase" class="ml-1 text-emerald-500 opacity-75">*</span>
      </th>
      <th class="px-4 py-2 text-left text-xs font-light text-antfu-text-mute border-b border-antfu-border w-20 opacity-75">
        Actions
      </th>
    </tr>
  </thead>
</template>

<script setup lang="ts">
import type { Language } from '~/types'

interface Props {
  /** 语言列表 */
  languages: Language[]
}

defineProps<Props>()
</script>

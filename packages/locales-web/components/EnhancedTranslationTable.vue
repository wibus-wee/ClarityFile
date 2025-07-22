<template>
  <!-- 使用新的拆分后的翻译表格组件 -->
  <TranslationTable
    :namespace="namespace"
    :languages="languages"
  />
</template>


<script setup lang="ts">
import type { Language } from '~/types'
import TranslationTable from './editor/TranslationTable.vue'

interface Props {
  /** 命名空间名称 */
  namespace: string
  /** 语言列表 */
  languages: Language[]
}

defineProps<Props>()
</script>

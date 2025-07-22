<template>
  <div class="json-editor">
    <!-- 简单值编辑器 -->
    <template v-if="isSimpleValue">
      <input v-if="typeof modelValue === 'string'" :value="modelValue" @input="updateValue($event.target.value)"
        class="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-emerald-500"
        :placeholder="placeholder" />
      <input v-else-if="typeof modelValue === 'number'" type="number" :value="modelValue"
        @input="updateValue(Number($event.target.value))"
        class="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-emerald-500"
        :placeholder="placeholder" />
      <label v-else-if="typeof modelValue === 'boolean'" class="flex items-center gap-2">
        <input type="checkbox" :checked="modelValue" @change="updateValue($event.target.checked)"
          class="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-1 dark:bg-gray-700 dark:border-gray-600" />
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ modelValue ? 'True' : 'False' }}</span>
      </label>
    </template>

    <!-- 数组编辑器 -->
    <template v-else-if="Array.isArray(modelValue)">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Array ({{ modelValue.length }} items)
          </span>
          <button @click="addArrayItem"
            class="px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-all flex items-center gap-1">
            <div class="i-carbon-add text-xs"></div>
            Add Item
          </button>
        </div>

        <div class="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          <div v-for="(item, index) in modelValue" :key="index" class="flex items-start gap-2">
            <div class="flex-1">
              <JsonEditor :model-value="item" @update:model-value="updateArrayItem(index, $event)"
                :placeholder="`Item ${index + 1}`" />
            </div>
            <button @click="removeArrayItem(index)"
              class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all">
              <div class="i-carbon-trash-can text-xs"></div>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- 对象编辑器 -->
    <template v-else-if="typeof modelValue === 'object' && modelValue !== null">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Object ({{ Object.keys(modelValue).length }} keys)
          </span>
          <button @click="showAddKeyDialog = true"
            class="px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-all flex items-center gap-1">
            <div class="i-carbon-add text-xs"></div>
            Add Key
          </button>
        </div>

        <div class="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          <div v-for="(value, key) in modelValue" :key="key" class="space-y-1">
            <div class="flex items-center gap-2">
              <input :value="key" @input="renameObjectKey(key, $event.target.value)"
                class="px-2 py-1 text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-emerald-500"
                style="min-width: 120px;" />
              <button @click="removeObjectKey(key)"
                class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all">
                <div class="i-carbon-trash-can text-xs"></div>
              </button>
            </div>
            <JsonEditor :model-value="value" @update:model-value="updateObjectValue(key, $event)"
              :placeholder="`Value for ${key}`" />
          </div>
        </div>
      </div>

      <!-- 添加键对话框 -->
      <div v-if="showAddKeyDialog" class="fixed inset-0 bg-black/50 flex-center z-50" @click="showAddKeyDialog = false">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg min-w-80" @click.stop>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Add New Key</h3>
          <input v-model="newKeyName" @keyup.enter="addObjectKey"
            class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:ring-1 focus:ring-emerald-500"
            placeholder="Enter key name..." autofocus />
          <div class="flex justify-end gap-2 mt-4">
            <button @click="showAddKeyDialog = false"
              class="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all">
              Cancel
            </button>
            <button @click="addObjectKey"
              class="px-3 py-1.5 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-all">
              Add
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Array, Object],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// 状态
const showAddKeyDialog = ref(false)
const newKeyName = ref('')

// 计算属性
const isSimpleValue = computed(() => {
  const type = typeof props.modelValue
  return type === 'string' || type === 'number' || type === 'boolean'
})

// 更新值
function updateValue(newValue) {
  emit('update:modelValue', newValue)
}

// 数组操作
function addArrayItem() {
  const newArray = [...props.modelValue, '']
  emit('update:modelValue', newArray)
}

function updateArrayItem(index, newValue) {
  const newArray = [...props.modelValue]
  newArray[index] = newValue
  emit('update:modelValue', newArray)
}

function removeArrayItem(index) {
  const newArray = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newArray)
}

// 对象操作
function addObjectKey() {
  if (!newKeyName.value.trim()) return

  const newObject = { ...props.modelValue }
  newObject[newKeyName.value] = ''
  emit('update:modelValue', newObject)

  newKeyName.value = ''
  showAddKeyDialog.value = false
}

function updateObjectValue(key, newValue) {
  const newObject = { ...props.modelValue }
  newObject[key] = newValue
  emit('update:modelValue', newObject)
}

function removeObjectKey(key) {
  const newObject = { ...props.modelValue }
  delete newObject[key]
  emit('update:modelValue', newObject)
}

function renameObjectKey(oldKey, newKey) {
  if (!newKey.trim() || oldKey === newKey) return

  const newObject = {}
  for (const [k, v] of Object.entries(props.modelValue)) {
    newObject[k === oldKey ? newKey : k] = v
  }
  emit('update:modelValue', newObject)
}
</script>

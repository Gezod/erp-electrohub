<template>
  <div class="audit-history mt-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Audit History
      </h3>
      <button
        @click="fetchLogs"
        class="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1"
        :disabled="loading"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>

    <div v-if="loading && !logs.length" class="py-8 text-center text-gray-500">
      Loading logs...
    </div>

    <div v-else-if="!logs.length" class="py-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
      No audit records found for this item.
    </div>

    <div v-else class="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6">
      <div v-for="log in logs" :key="log.id" class="relative pl-8">
        <!-- Dot -->
        <div class="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" :class="getActionColor(log.action)"></div>

        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider" :class="getActionBadgeClass(log.action)">
              {{ log.action }}
            </span>
            <span class="text-xs text-gray-400 font-medium">
              {{ formatDate(log.created_at) }}
            </span>
          </div>

          <p class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {{ log.note || getDefaultNote(log) }}
          </p>

          <div class="flex items-center gap-2 mb-3">
            <div class="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300">
              {{ log.user?.full_name?.charAt(0) || 'S' }}
            </div>
            <span class="text-xs text-gray-500">
              Oleh: <span class="font-semibold text-gray-700 dark:text-gray-300">{{ log.user?.full_name || 'System' }}</span>
            </span>
          </div>

          <!-- Changes Toggle -->
          <div v-if="hasChanges(log)" class="mt-2">
            <button
              @click="toggleExpand(log.id)"
              class="text-[11px] font-bold text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 transition-transform" :class="{ 'rotate-180': expanded[log.id] }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              {{ expanded[log.id] ? 'Hide Changes' : 'Show Changes' }}
            </button>

            <div v-if="expanded[log.id]" class="mt-3 overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700">
              <table class="w-full text-left text-[11px]">
                <thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th class="px-3 py-2 font-bold">Field</th>
                    <th class="px-3 py-2 font-bold text-red-500">Before</th>
                    <th class="px-3 py-2 font-bold text-green-500">After</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr v-for="(val, key) in getDiff(log)" :key="key" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    <td class="px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">{{ formatKey(key) }}</td>
                    <td class="px-3 py-2 text-gray-400 truncate max-w-[150px]" :title="formatValue(val.old)">{{ formatValue(val.old) }}</td>
                    <td class="px-3 py-2 text-gray-700 dark:text-gray-200 font-medium truncate max-w-[150px]" :title="formatValue(val.new)">{{ formatValue(val.new) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pagination.page < pagination.totalPages" class="mt-6 text-center">
      <button
        @click="loadMore"
        class="px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full transition-colors"
        :disabled="loading"
      >
        Load More History
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from '@/plugins/axios'

const props = defineProps({
  module: {
    type: String,
    required: true
  },
  recordId: {
    type: String,
    required: true
  }
})

const logs = ref([])
const loading = ref(false)
const expanded = reactive({})
const pagination = ref({
  page: 1,
  limit: 10,
  totalPages: 1
})

const fetchLogs = async () => {
  if (!props.recordId) return

  loading.value = true
  try {
    const response = await axios.get('/audit-logs', {
      params: {
        module: props.module,
        record_id: props.recordId,
        page: pagination.value.page,
        limit: pagination.value.limit
      }
    })

    if (pagination.value.page === 1) {
      logs.value = response.data.data
    } else {
      logs.value = [...logs.value, ...response.data.data]
    }

    pagination.value.totalPages = response.data.pagination.totalPages
  } catch (err) {
    console.error('Failed to fetch audit logs:', err)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  pagination.value.page++
  fetchLogs()
}

const getActionColor = (action) => {
  switch (action) {
    case 'CREATE': return 'bg-green-500'
    case 'UPDATE': return 'bg-gray-500'
    case 'DELETE': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getActionBadgeClass = (action) => {
  switch (action) {
    case 'CREATE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'UPDATE': return 'bg-gray-100 text-gray-700 dark:bg-gray-750 dark:text-gray-300'
    case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const getDefaultNote = (log) => {
  return `${log.action} record ${log.model}`
}

const hasChanges = (log) => {
  return (log.old_values && Object.keys(log.old_values).length > 0) ||
         (log.new_values && Object.keys(log.new_values).length > 0)
}

const toggleExpand = (id) => {
  expanded[id] = !expanded[id]
}

const formatKey = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatValue = (val) => {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'boolean') return val ? 'Ya' : 'Tidak'
  if (typeof val === 'object') return JSON.stringify(val)
  return val
}

const getDiff = (log) => {
  const oldVal = log.old_values || {}
  const newVal = log.new_values || {}
  const diff = {}

  // Collect all keys
  const keys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)])

  // Filter out noisy keys
  const ignoredKeys = ['created_at', 'updated_at', 'id', 'deleted_at', 'password', 'hashed_password']

  keys.forEach(key => {
    if (ignoredKeys.includes(key)) return

    // Check if changed
    const ov = oldVal[key]
    const nv = newVal[key]

    if (JSON.stringify(ov) !== JSON.stringify(nv)) {
      diff[key] = { old: ov, new: nv }
    }
  })

  return diff
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.audit-history {
  font-family: 'Inter';
}
</style>

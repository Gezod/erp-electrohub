<template>
  <div class="bg-white dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs transition-all duration-200">
    <!-- Header Section: Title + Actions (Filter button etc.) -->
    <div v-if="title || subtitle || $slots['title'] || $slots['header-actions']" class="px-5 pt-4 pb-1 flex flex-row justify-between items-start gap-3">
      <!-- Left: Title + Subtitle -->
      <div class="flex flex-col gap-0.5">
        <!-- Title: from slot or prop -->
        <slot name="title">
          <p v-if="title" class="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">{{ title }}</p>
        </slot>
        <!-- Supporting text: from slot or prop -->
        <slot name="subtitle">
          <p v-if="subtitle" class="text-xs text-zinc-500 dark:text-zinc-400 font-normal">{{ subtitle }}</p>
        </slot>
      </div>
      <!-- Right: Actions (filter button, export, etc.) -->
      <div v-if="$slots['header-actions']" class="flex items-center gap-2.5 shrink-0">
        <slot name="header-actions"></slot>
      </div>
    </div>

    <!-- Main Table View (Horizontal Scrollable) -->
    <div class="overflow-x-auto custom-scrollbar relative" :class="{ 'mt-3': title || subtitle || $slots['title'] || $slots['header-actions'] }">
      <table class="w-full text-xs md:text-sm text-left border-collapse min-w-max">
        <thead class="sticky top-0 z-20 bg-zinc-50/90 dark:bg-zinc-850/90 backdrop-blur-md border-y border-zinc-200 dark:border-zinc-800">
          <tr>
            <template v-for="(col, idx) in columns" :key="col ? col.key : idx">
              <th v-if="col"
                  class="px-3.5 py-2.5 font-medium text-zinc-500 dark:text-zinc-400 text-xs tracking-wider uppercase whitespace-nowrap"
                  :style="{ width: col.width || 'auto' }">
                <div class="flex items-center gap-1 select-none">
                  <span>{{ col.label }}</span>
                  <ChevronsUpDown v-if="col.key !== 'no' && col.key !== 'action'" class="w-3.5 h-3.5 text-zinc-400 opacity-60" />
                </div>
              </th>
            </template>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          <!-- Loading State (Skeleton Rows) -->
          <template v-if="loading">
            <tr v-for="n in Math.min(itemsPerPage || 5, 5)" :key="`skeleton-row-${n}`" class="animate-pulse">
              <template v-for="(col, idx) in columns" :key="col ? col.key : idx">
                <td v-if="col" class="px-3.5 py-3">
                  <!-- Action column skeleton -->
                  <div v-if="col.key === 'action' || col.key === 'actions'" class="flex items-center gap-1.5">
                    <div class="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800"></div>
                    <div class="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800"></div>
                  </div>

                  <!-- Number / No column skeleton -->
                  <div v-else-if="col.key === 'no' || col.key === 'index'" class="w-5 h-2.5 rounded bg-zinc-200 dark:bg-zinc-800"></div>

                  <!-- Status / Badge column skeleton -->
                  <div v-else-if="col.key === 'status' || col.key === 'is_active' || col.key === 'type'" 
                       class="h-5 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center px-2">
                    <div class="h-2 w-8 rounded bg-zinc-200 dark:bg-zinc-700"></div>
                  </div>

                  <!-- Standard column skeleton -->
                  <div v-else class="flex items-center">
                    <div class="h-2.5 rounded bg-zinc-200 dark:bg-zinc-800" :style="{ width: `${40 + (((n + idx) * 17) % 40)}%` }"></div>
                  </div>
                </td>
              </template>
            </tr>
          </template>

          <!-- Empty State -->
          <tr v-else-if="displayData.length === 0">
            <td :colspan="columns.length" class="px-6 py-20 text-center">
              <div class="flex flex-col items-center justify-center gap-4 opacity-90">
                <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                  <Inbox class="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tidak ada hasil ditemukan</p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">Silakan periksa kembali filter atau kata kunci pencarian Anda.</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr v-for="(item, index) in displayData" :key="index" 
              class="group transition-colors duration-150 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
            <template v-for="(col, idx) in columns" :key="col ? col.key : idx">
              <td v-if="col" class="px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100">
                <div :class="{ 'truncate max-w-[250px]': !col.width && !$slots[`cell-${col.key}`] }" :title="item[col.key]">
                  <!-- Normal slot or fallback for other columns / custom action slot -->
                  <slot :name="`cell-${col.key}`" :item="item" :index="index">
                    <!-- Action column default setup when no custom slot is provided -->
                    <template v-if="col.key === 'action' || col.key === 'actions'">
                      <div class="flex items-center gap-1.5" :class="col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'">
                        <slot name="action-prepend" :item="item" :index="index"></slot>

                        <!-- Detail / View Button -->
                        <button
                          v-if="checkActionVisible('detail', item)"
                          v-can="getActionPermission('detail')"
                          type="button"
                          @click.stop="triggerAction('detail', item)"
                          class="w-7 h-7 rounded-md flex items-center justify-center transition-colors bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                          :title="detailTitle || actionTitles?.detail || 'Lihat Detail'"
                        >
                          <Eye class="w-3.5 h-3.5" />
                        </button>

                        <!-- Edit / Update Button -->
                        <button
                          v-if="checkActionVisible('edit', item)"
                          v-can="getActionPermission('edit')"
                          type="button"
                          @click.stop="triggerAction('edit', item)"
                          class="w-7 h-7 rounded-md flex items-center justify-center transition-colors bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                          :title="editTitle || actionTitles?.edit || 'Edit Data'"
                        >
                          <Pencil class="w-3.5 h-3.5" />
                        </button>

                        <!-- Delete Button -->
                        <button
                          v-if="checkActionVisible('delete', item)"
                          v-can="getActionPermission('delete')"
                          type="button"
                          @click.stop="triggerAction('delete', item)"
                          class="w-7 h-7 rounded-md flex items-center justify-center transition-colors bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 cursor-pointer"
                          :title="deleteTitle || actionTitles?.delete || 'Hapus Data'"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>

                        <slot name="action-append" :item="item" :index="index"></slot>
                      </div>
                    </template>

                    <span v-else class="font-medium text-xs md:text-sm">{{ item[col.key] || '-' }}</span>
                  </slot>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Section -->
    <div v-if="!loading" class="px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <!-- Left: Info Stats -->
        <div class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Menampilkan</span>
          <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ paginationInfo.from }}–{{ paginationInfo.to }}</span>
          <span>dari</span>
          <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ paginationInfo.total }}</span>
          <span>data</span>
        </div>

        <!-- Right: Pagination Controls -->
        <div class="flex items-center gap-1">
          <!-- Back Button -->
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="h-8 px-2.5 flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <!-- Page Numbers -->
          <button
            v-for="page in visiblePages" :key="page"
            @click="changePage(page)"
            :class="[
              'min-w-8 h-8 px-2 flex items-center justify-center rounded-md text-xs font-semibold transition-colors select-none cursor-pointer',
              currentPage === page
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            ]"
          >
            {{ page }}
          </button>

          <!-- Next Button -->
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="h-8 px-2.5 flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, getCurrentInstance } from 'vue';
import { ChevronLeft, ChevronRight, Inbox, ChevronsUpDown, Eye, Pencil, Trash2 } from 'lucide-vue-next';

interface Column {
  key: string;
  label: string;
  width?: string;
  align?: string;
  hideOnMobile?: boolean;
}

interface Item {
  [key: string]: any;
}

const props = defineProps({
  columns: { type: Array as () => Column[], required: true },
  data: { type: Array as () => Item[], default: () => [] },
  loading: { type: Boolean, default: false },

  // Header title & subtitle (Figma: 18px medium / 14px #999)
  title: { type: String, default: 'Aktivitas Terbaru' },
  subtitle: { type: String, default: 'Monitor your latest activity' },

  serverSide: { type: Boolean, default: false },
  totalItems: { type: Number, default: 0 },
  currentPage: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 10 },

  // Default Action Setup
  actions: { type: Array as () => string[], default: undefined },
  showDetail: { type: Boolean, default: undefined },
  showEdit: { type: Boolean, default: undefined },
  showDelete: { type: Boolean, default: undefined },
  permissionPrefix: { type: String, default: '' },
  detailPermission: { type: String, default: undefined },
  editPermission: { type: String, default: undefined },
  deletePermission: { type: String, default: undefined },
  canDetail: { type: [Boolean, Function] as any, default: undefined },
  canEdit: { type: [Boolean, Function] as any, default: undefined },
  canDelete: { type: [Boolean, Function] as any, default: undefined },
  actionTitles: { type: Object as () => { detail?: string; edit?: string; delete?: string }, default: () => ({ detail: 'Lihat Detail', edit: 'Edit Data', delete: 'Hapus Data' }) },
  detailTitle: { type: String, default: '' },
  editTitle: { type: String, default: '' },
  deleteTitle: { type: String, default: '' },
});

const emit = defineEmits([
  'update:currentPage',
  'edit',
  'update',
  'delete',
  'detail',
  'view'
]);

const instance = getCurrentInstance();
const attrs = useAttrs();

const hasListener = (name: string) => {
  const vnodeProps = (instance?.vnode?.props || {}) as Record<string, any>;
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  return Boolean(
    vnodeProps[`on${capitalized}`] ||
    vnodeProps[`on${name}`] ||
    vnodeProps[`onUpdate:${name}`] ||
    (attrs as Record<string, any>)[`on${capitalized}`] ||
    (attrs as Record<string, any>)[`on${name}`]
  );
};

const checkActionVisible = (actionKey: 'detail' | 'edit' | 'delete', item: any) => {
  // 1. Specific condition prop checks per item
  if (actionKey === 'detail' && props.canDetail !== undefined) {
    return typeof props.canDetail === 'function' ? props.canDetail(item) : Boolean(props.canDetail);
  }
  if (actionKey === 'edit' && props.canEdit !== undefined) {
    return typeof props.canEdit === 'function' ? props.canEdit(item) : Boolean(props.canEdit);
  }
  if (actionKey === 'delete' && props.canDelete !== undefined) {
    return typeof props.canDelete === 'function' ? props.canDelete(item) : Boolean(props.canDelete);
  }

  // 2. Explicit showDetail, showEdit, showDelete props
  if (actionKey === 'detail' && props.showDetail !== undefined) return Boolean(props.showDetail);
  if (actionKey === 'edit' && props.showEdit !== undefined) return Boolean(props.showEdit);
  if (actionKey === 'delete' && props.showDelete !== undefined) return Boolean(props.showDelete);

  // 3. Explicit actions array prop
  if (Array.isArray(props.actions)) {
    if (actionKey === 'detail') {
      return props.actions.includes('detail') || props.actions.includes('view');
    }
    if (actionKey === 'edit') {
      return props.actions.includes('edit') || props.actions.includes('update');
    }
    return props.actions.includes(actionKey);
  }

  // 4. Default: Check if listener is attached, or fallback to enabled for edit & delete when action listeners are present
  if (actionKey === 'detail') {
    return hasListener('detail') || hasListener('view');
  }
  if (actionKey === 'edit') {
    return hasListener('edit') || hasListener('update') || (props.showEdit !== false && !Array.isArray(props.actions));
  }
  if (actionKey === 'delete') {
    return hasListener('delete') || (props.showDelete !== false && !Array.isArray(props.actions));
  }

  return false;
};

const getActionPermission = (actionKey: 'detail' | 'edit' | 'delete') => {
  if (actionKey === 'detail') {
    if (props.detailPermission !== undefined) return props.detailPermission;
    if (props.permissionPrefix) return `${props.permissionPrefix}:read`;
  }
  if (actionKey === 'edit') {
    if (props.editPermission !== undefined) return props.editPermission;
    if (props.permissionPrefix) return `${props.permissionPrefix}:update`;
  }
  if (actionKey === 'delete') {
    if (props.deletePermission !== undefined) return props.deletePermission;
    if (props.permissionPrefix) return `${props.permissionPrefix}:delete`;
  }
  return '';
};

const triggerAction = (actionKey: 'detail' | 'edit' | 'delete', item: any) => {
  if (actionKey === 'detail') {
    emit('detail', item);
    emit('view', item);
  } else if (actionKey === 'edit') {
    emit('edit', item);
    emit('update', item);
  } else if (actionKey === 'delete') {
    emit('delete', item);
  }
};

const displayData = computed(() => {
  if (!props.data) return [];
  if (props.serverSide) return props.data;
  
  const start = (props.currentPage - 1) * props.itemsPerPage;
  return props.data.slice(start, start + props.itemsPerPage);
});

const totalPages = computed(() => {
  const total = props.serverSide ? props.totalItems : (props.data?.length || 0);
  return Math.ceil(total / props.itemsPerPage) || 1;
});

const paginationInfo = computed(() => {
  const total = props.serverSide ? props.totalItems : (props.data?.length || 0);
  const from = total === 0 ? 0 : (props.currentPage - 1) * props.itemsPerPage + 1;
  const to = Math.min(props.currentPage * props.itemsPerPage, total);
  
  return { from, to, total };
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    emit('update:currentPage', newPage);
  }
};
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
  transition: background 0.3s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}

@media (max-width: 768px) {
  .custom-scrollbar::-webkit-scrollbar {
    height: 5px;
    display: block;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
  }

  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #475569;
  }
}
</style>

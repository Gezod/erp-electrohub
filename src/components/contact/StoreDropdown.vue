<template>
  <div class="search-container">
    <div class="selector-label">Cari &amp; Pilih Toko Anda</div>
    <div class="dropdown-wrap" ref="wrapRef">
      <button
        class="dropdown-trigger"
        :class="{ open: isOpen }"
        @click="toggle"
      >
        <span :class="selected ? 'selected-name' : 'placeholder'">
          {{ selected ? selected.toko : 'Pilih toko...' }}
        </span>
      </button>
      <span class="dropdown-arrow" :class="{ open: isOpen }">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </span>

      <div class="dropdown-panel" v-if="isOpen">
        <div class="dropdown-search-wrap">
          <input
            ref="searchRef"
            type="text"
            class="dropdown-search"
            placeholder="Ketik nama toko..."
            v-model="query"
            autocomplete="off"
          />
          <span class="search-icon-inner">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35"/>
            </svg>
          </span>
        </div>
        <div class="dropdown-list">
          <template v-if="filtered.length">
            <div
              v-for="store in filtered"
              :key="store.toko"
              class="dropdown-option"
              @click="pick(store)"
            >
              <span>{{ store.toko }}</span>
            </div>
          </template>
          <div v-else class="dropdown-no-result">Toko tidak ditemukan</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ContactPublicService } from '../../views/Contact/contact.service.js'

const emit = defineEmits(['select'])

const isOpen = ref(false)
const query  = ref('')
const selected = ref(null)
const wrapRef  = ref(null)
const searchRef = ref(null)

const stores = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const data = await ContactPublicService.getStoreContacts()
    stores.value = data.stores || []
  } catch (err) {
    console.error('Failed to fetch stores:', err)
    stores.value = []
  } finally {
    isLoading.value = false
  }
})

const filtered = computed(() =>
  stores.value.filter(s => s.toko.toLowerCase().includes(query.value.toLowerCase().trim()))
)

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => searchRef.value?.focus())
  }
}

function close() {
  isOpen.value = false
  query.value = ''
}

function pick(store) {
  selected.value = store
  close()
  emit('select', store)
}

function onOutsideClick(e) {
  if (wrapRef.value && !wrapRef.value.contains(e.target)) close()
}

onMounted(() => document.addEventListener('click', onOutsideClick))
onUnmounted(() => document.removeEventListener('click', onOutsideClick))
</script>

<template>
  <div class="screen-detail">
    <!-- Back button -->
    <div class="back-btn-container">
      <button class="back-btn" @click="$emit('back')">
        <span class="arr">←</span> Semua Toko
      </button>
    </div>

    <!-- Store hero -->
    <div class="store-hero">
      <div class="store-hero-name">{{ store.toko }}</div>
      <div class="store-hero-hint">Pusat Bantuan Staf &amp; Operasional</div>
    </div>

    <!-- Quick links -->
    <div class="quick-links-group">
      <div class="group-label">Formulir &amp; Tautan Penting</div>
      <div class="ql-grid">
        <a class="ql-card" href="https://forms.gle/H2qFjhejW2LLtWRL8" target="_blank">
          <div class="ql-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <div class="ql-info">
            <div class="ql-label">Absensi Training / Casual</div>
            <div class="ql-desc">Form kehadiran khusus staf training &amp; casual</div>
          </div>
          <div class="ql-arrow">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </a>

        <a class="ql-card" href="https://forms.gle/ygW9q7qE3aGGpUmT9" target="_blank">
          <div class="ql-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div class="ql-info">
            <div class="ql-label">Absensi Karyawan Kontrak</div>
            <div class="ql-desc">Gunakan jika aplikasi Talenta sedang bermasalah</div>
          </div>
          <div class="ql-arrow">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </a>

        <a class="ql-card" href="https://drive.google.com/file/d/1HwW3QB-ADKLsWSCmUR8pBf7JTN5oDzW6/view?usp=sharing" target="_blank">
          <div class="ql-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ql-info">
            <div class="ql-label">Tutorial Pengisian Absen</div>
            <div class="ql-desc">Panduan cara mengisi form absensi dengan benar</div>
          </div>
          <div class="ql-arrow">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </a>
      </div>
    </div>

    <!-- Contact groups -->
    <div
      v-for="group in visibleGroups"
      :key="group.label"
      class="contact-group"
    >
      <div class="group-label">{{ group.label }}</div>
      <div class="c-card">
        <div
          v-for="(item, idx) in group.items"
          :key="item.key"
          class="c-row"
          :style="{ animationDelay: animDelay(group, idx) + 's' }"
        >
          <div class="icon-box" :class="item.bg">{{ item.icon }}</div>
          <div class="c-info">
            <div class="c-label">{{ item.label }}</div>
            <div class="c-desc">{{ item.desc }}</div>
          </div>
          <div class="c-actions">
            <a class="btn-wa" :href="'https://wa.me/' + toWa(store[item.key])" target="_blank">
              <svg class="wa-svg" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.108.549 4.084 1.508 5.798L.057 23.716a.5.5 0 0 0 .604.63l6.074-1.405A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.82 9.82 0 0 1-4.98-1.352l-.357-.214-3.7.856.875-3.593-.232-.369A9.788 9.788 0 0 1 2.182 12C2.182 6.569 6.569 2.182 12 2.182S21.818 6.569 21.818 12 17.431 21.818 12 21.818z"/>
              </svg>
            </a>
            <button class="btn-call" @click="$emit('copy', store[item.key])">Salin</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pengaduan HR (always shown) -->
    <div class="contact-group">
      <div class="group-label">Kerahasiaan &amp; Keluhan</div>
      <div class="c-card">
        <div class="c-row" :style="{ animationDelay: pengaduanDelay + 's' }">
          <div class="icon-box bg-aduan">EX</div>
          <div class="c-info">
            <div class="c-label">Pengaduan HR Pusat</div>
            <div class="c-desc">Saluran aduan rahasia terkait pelanggaran operasional atau keluhan.</div>
          </div>
          <div class="c-actions">
            <a class="btn-wa" :href="'https://wa.me/' + toWa(pengaduanHR)" target="_blank">
              <svg class="wa-svg" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.108.549 4.084 1.508 5.798L.057 23.716a.5.5 0 0 0 .604.63l6.074-1.405A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.82 9.82 0 0 1-4.98-1.352l-.357-.214-3.7.856.875-3.593-.232-.369A9.788 9.788 0 0 1 2.182 12C2.182 6.569 6.569 2.182 12 2.182S21.818 6.569 21.818 12 17.431 21.818 12 21.818z"/>
              </svg>
            </a>
            <button class="btn-call" @click="$emit('copy', pengaduanHR)">Salin</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  store: Object,
  groups: { type: Array, default: () => [] },
  pengaduanHR: { type: String, default: '08139236214' },
})
defineEmits(['back', 'copy'])

// Only show groups that have at least one non-empty value for this store
const visibleGroups = computed(() =>
  props.groups.map(g => ({
    ...g,
    items: g.items.filter(it => props.store[it.key]),
  })).filter(g => g.items.length)
)

// Pre-compute cumulative item counts for stagger delays
function animDelay(group, itemIdx) {
  let count = 0
  for (const g of visibleGroups.value) {
    if (g.label === group.label) break
    count += g.items.length
  }
  return 0.1 + (count + itemIdx) * 0.05
}

const pengaduanDelay = computed(() => {
  const total = visibleGroups.value.reduce((s, g) => s + g.items.length, 0)
  return 0.1 + total * 0.05
})

function toWa(num) {
  if (!num) return ''
  return '62' + num.slice(1)
}
</script>

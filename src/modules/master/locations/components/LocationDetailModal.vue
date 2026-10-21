<template>
  <AppForm
    v-model="isOpen"
    title="Detail Lokasi"
    :subtitle="location?.location_name || ''"
    :is-modal="true"
    max-width="max-w-[620px]"
    @close="handleClose"
  >
    <!-- 1 FormSection dengan 1 Kolom per Baris -->
    <FormSection title="Informasi Lokasi" :cols="1">
      
      <!-- Nama Lokasi -->
      <FormField
        label="Nama Lokasi"
        v-model="locationName"
        label-width="160px"
        :readonly="true"
        :disabled="true"
      />

      <!-- Parent Lokasi -->
      <FormField label="Lokasi Induk" label-width="160px">
        <div class="text-[14px] font-medium text-text-active py-1">
          {{ location?.parent?.location_name || 'Lokasi Utama (Root Hub)' }}
        </div>
      </FormField>

      <!-- Tipe Lokasi -->
      <FormField label="Tipe Lokasi" label-width="160px">
        <div class="py-1">
          <span class="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-gray-100 dark:bg-gray-800 text-text-active border border-gray-200 dark:border-gray-700 inline-block">
            {{ location?.display_type || location?.location_type || '-' }}
          </span>
        </div>
      </FormField>

      <!-- Distrik / Wilayah -->
      <FormField
        label="Distrik / Wilayah"
        v-model="locationDistrict"
        label-width="160px"
        :readonly="true"
        :disabled="true"
      />

      <!-- Link Google Maps -->
      <FormField label="Google Maps" label-width="160px">
        <div class="py-1">
          <a
            v-if="location?.maps_url"
            :href="location.maps_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[14px] font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
          >
            <MapPin class="w-4 h-4 shrink-0" />
            <span>Buka Lokasi di Google Maps</span>
          </a>
          <span v-else class="text-text-muted text-[14px]">-</span>
        </div>
      </FormField>

      <!-- Status Lokasi -->
      <FormField label="Status" label-width="160px">
        <div class="py-1">
          <span 
            :class="location?.is_active 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
              : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border uppercase tracking-wider"
          >
            {{ location?.is_active ? 'Aktif' : 'Tidak Aktif' }}
          </span>
        </div>
      </FormField>

      <!-- Sub-Lokasi Terdaftar (Jika Ada) -->
      <FormField
        v-if="location?.children && location.children.length > 0"
        label="Sub-Lokasi"
        label-width="160px"
      >
        <div class="space-y-1.5 py-1 w-full max-h-40 overflow-y-auto custom-scrollbar">
          <div
            v-for="sub in location.children"
            :key="sub.id"
            class="flex items-center justify-between p-2 rounded-md bg-white dark:bg-gray-900 border border-[#e8e8e8] dark:border-gray-800 text-[13px]"
          >
            <span class="font-medium text-text-active">{{ sub.location_name }}</span>
            <span class="text-[11px] text-text-muted">{{ sub.display_type || sub.location_type }}</span>
          </div>
        </div>
      </FormField>

    </FormSection>

    <!-- Custom Footer for Detail View -->
    <template #footer>
      <button
        type="button"
        @click="handleClose"
        class="border border-[#e1e1e1] dark:border-gray-800 text-text-active px-[20px] rounded-[6px] font-medium text-[14px] bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm active:scale-95 h-10 justify-center cursor-pointer"
      >
        Tutup Detail
      </button>
    </template>
  </AppForm>
</template>

<script setup>
import { computed } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import { MapPin } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  location: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const locationName = computed(() => props.location?.location_name || '-');
const locationDistrict = computed(() => props.location?.location_district || '-');

const handleClose = () => {
  emit('update:modelValue', false);
};
</script>

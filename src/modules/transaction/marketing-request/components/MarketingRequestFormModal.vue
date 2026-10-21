<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Edit Pengajuan Marketing' : 'Buat Pengajuan Marketing'"
    :subtitle="isEdit ? `Kode: ${detail?.code || '-'}` : 'Formulir permintaan dan pengadaan barang/jasa marketing'"
    :is-modal="true"
    max-width="max-w-3xl"
    :loading="isSubmitting"
    :steps="['Informasi Pengajuan', step2Title]"
    v-model:current-step="currentStep"
    :is-step-valid="currentStep === 1 ? isStep1Valid : isStep2Valid"
    :show-draft="isEditable && isStep1Valid && (currentStep === 1 || (currentStep === 2 && isStep2Valid))"
    :status-badge="isEdit && detail?.status ? getStatusLabel(detail.status) : ''"
    :status-badge-class="statusBadgeClass(detail?.status)"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Kirim Pengajuan'"
    continue-label="Lanjut"
    @draft="handleSave('draft')"
    @submit="handleSave('diajukan')"
    @close="handleClose"
  >
    <!-- Warning Info for Submitted -->
    <div
      v-if="isEdit && detail?.status === 'diajukan'"
      class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 p-3 rounded-lg flex items-center gap-3 text-xs text-blue-700 dark:text-blue-300 mb-2"
    >
      <Info class="w-4 h-4 text-blue-500 shrink-0" />
      <span>Status Pengajuan: Sedang Diajukan. Perubahan data akan memperbarui pengajuan yang sedang menunggu pemrosesan.</span>
    </div>

    <!-- ==================== PHASE 1: Informasi Pengajuan ==================== -->
    <div v-if="currentStep === 1" class="flex flex-col gap-4">
      <FormSection title="Kategori Pengajuan" :cols="1">
        <FormField label="Kategori" label-width="140px" :required="true">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div
              v-for="t in requestTypes"
              :key="t.id"
              @click="!categoryLocked ? (form.requestType = t.id) : null"
              :class="[
                'border rounded-md p-3 flex items-start gap-3 transition-all',
                form.requestType === t.id
                  ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500'
                  : 'border-border bg-white dark:bg-gray-900 hover:bg-bg-2',
                categoryLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              ]"
            >
              <component :is="t.icon" class="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <div class="font-medium text-sm text-text-active">{{ t.label }}</div>
                <div class="text-xs text-text-muted mt-0.5">{{ t.desc }}</div>
              </div>
            </div>
          </div>
          <p v-if="categoryLocked" class="text-[11px] text-text-muted mt-2">
            Kategori tidak dapat diubah setelah pengajuan dibuat / sudah berisi item.
          </p>
        </FormField>
      </FormSection>

      <FormSection title="Informasi Pemohon & Lokasi" :cols="1">
        <FormField
          label="Pemohon"
          label-width="140px"
          type="searchable-select"
          master="employees"
          v-model="form.requesterEmployeeId"
          :initial-option="initialRequesterOption"
          :disabled="!isEditable || isSubmitting"
          :required="true"
          placeholder="Pilih karyawan pemohon..."
          search-placeholder="Cari nama karyawan..."
          :clearable="true"
          @select="onRequesterEmployeeSelected"
        />

        <FormField
          label="Lokasi Pemohon"
          label-width="140px"
          type="select"
          v-model="form.requesterLocationId"
          :options="requesterLocationSelectOptions"
          :disabled="!isEditable || isSubmitting || loadingRequesterLocations || !form.requesterEmployeeId"
          :required="true"
          :placeholder="requesterLocationPlaceholder"
        />

        <FormField label="Keperluan" label-width="140px">
          <textarea
            v-model="form.purpose"
            rows="3"
            :disabled="!isEditable || isSubmitting"
            placeholder="Masukkan tujuan atau keterangan pengajuan..."
            class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0 resize-none"
          ></textarea>
        </FormField>
      </FormSection>
    </div>

    <!-- ==================== PHASE 2: Daftar Item ==================== -->
    <div v-if="currentStep === 2" class="flex flex-col gap-4">
      <FormSection :title="step2SectionTitle" :cols="1">
        <div class="flex flex-col gap-3 w-full">
          <div
            v-for="(item, idx) in formItems"
            :key="idx"
            class="p-3.5 bg-bg-2 border border-border dark:bg-gray-800/40 rounded-xl flex flex-col gap-3 relative"
          >
            <div class="flex items-center justify-between border-b border-border/60 pb-2">
              <span class="text-xs font-bold text-brand-600 dark:text-brand-400">
                Item #{{ idx + 1 }}
              </span>
              <button
                v-if="formItems.length > 1 && isEditable"
                type="button"
                @click="removeItemRow(idx)"
                class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Hapus Item"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>

            <!-- ==== Barang ==== -->
            <template v-if="form.requestType === 'barang'">
              <FormField
                label="Barang Marketing"
                label-width="140px"
                type="searchable-select"
                master="marketing-goods"
                v-model="item.goodId"
                :initial-option="item.goodName ? { value: item.goodId, label: item.goodName } : null"
                placeholder="Pilih barang marketing..."
                search-placeholder="Cari nama atau kode barang..."
                :disabled="!isEditable || isSubmitting"
                :clearable="true"
                :required="true"
                @select="(val) => onGoodSelected(item, val)"
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                <FormField label="Jumlah (QTY)" label-width="120px" :required="true">
                  <input
                    v-model.number="item.qtyRequest"
                    type="number"
                    min="0.001"
                    step="any"
                    :disabled="!isEditable || isSubmitting"
                    placeholder="1"
                    class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active focus:ring-0"
                  />
                </FormField>

                <FormField label="Satuan / Tipe" label-width="120px">
                  <span class="text-sm font-medium text-text-muted">
                    {{ item.uomName || item.tipeBarang || '-' }}
                  </span>
                </FormField>
              </div>
              <p v-if="item.goodId && isDuplicateGood(item.goodId, idx)" class="text-xs text-amber-600 dark:text-amber-400 font-medium animate-pulse">
                * Perhatian: Barang ini sudah dipilih pada baris item lainnya.
              </p>
            </template>

            <!-- ==== Jasa ==== -->
            <template v-else>
              <FormField label="Deskripsi Keperluan" label-width="140px" :required="true">
                <input
                  v-model="item.description"
                  type="text"
                  :disabled="!isEditable || isSubmitting"
                  placeholder="Contoh: Transport dinas ke toko ABC"
                  class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
                />
              </FormField>

              <FormField label="Nominal" label-width="140px" :required="true">
                <div class="flex items-center gap-1.5 w-full">
                  <span class="text-xs font-mono font-bold text-text-muted select-none">Rp</span>
                  <input
                    type="text"
                    :disabled="!isEditable || isSubmitting"
                    :value="formatThousand(item.nominal)"
                    @input="(e) => onNominalInput(item, e)"
                    placeholder="0"
                    class="w-full bg-transparent border-0 p-0 outline-none text-sm font-mono font-semibold text-text-active placeholder:text-text-placeholder focus:ring-0"
                  />
                </div>
              </FormField>
            </template>

            <FormField label="Catatan Item" label-width="140px">
              <input
                v-model="item.notes"
                type="text"
                :disabled="!isEditable || isSubmitting"
                placeholder="Catatan spesifik untuk item ini (opsional)..."
                class="w-full bg-transparent border-0 p-0 outline-none text-sm font-medium text-text-active placeholder:text-text-placeholder focus:ring-0"
              />
            </FormField>
          </div>

          <div v-if="isEditable" class="flex justify-end pt-1">
            <button
              type="button"
              @click="addItemRow"
              class="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Baris Item</span>
            </button>
          </div>
        </div>
      </FormSection>

      <!-- ==================== BUKTI PENGAJUAN (EVIDENCE BEFORE) ==================== -->
      <FormSection title="Bukti Fisik" :cols="1" class="mt-4">
        <div class="p-4 bg-bg-2 border border-border dark:bg-gray-800/40 rounded-xl">
          <label class="block text-sm font-medium text-text-active mb-3">Upload atau Ambil Bukti</label>

          <input
            ref="galleryInputRef"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/jpg,image/webp,video/mp4"
            @change="handleFileChange"
            class="hidden"
            :disabled="!isEditable || isSubmitting"
          />

          <div class="flex flex-wrap gap-3 mb-2">
            <button
              type="button"
              @click="triggerGalleryUpload"
              :disabled="!isEditable || isSubmitting"
              class="flex items-center gap-2 px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 dark:text-brand-400 font-semibold text-[13px] rounded-xl transition-colors disabled:opacity-50"
            >
              <Image class="w-4 h-4" />
              <span>Pilih dari Galeri</span>
            </button>

            <button
              type="button"
              @click="startCamera"
              :disabled="!isEditable || isSubmitting"
              class="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-300 font-semibold text-[13px] rounded-xl transition-colors disabled:opacity-50"
            >
              <Camera class="w-4 h-4" />
              <span>Buka Kamera</span>
            </button>
          </div>

          <p class="text-[11px] text-text-muted mt-2">
            * Maks. 5MB untuk foto, 20MB untuk video (hanya MP4). Maksimal 10 file.
          </p>

          <ul v-if="selectedFiles.length" class="mt-4 space-y-2">
            <li
              v-for="(file, idx) in selectedFiles"
              :key="idx"
              class="text-xs font-medium text-text-active flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2.5 rounded-lg"
            >
              <div class="flex items-center gap-2 truncate">
                <span class="truncate">{{ file.name }}</span>
                <span class="text-text-muted shrink-0">({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</span>
              </div>
              <button
                type="button"
                @click="removeFile(idx)"
                :disabled="isSubmitting"
                class="text-red-500 hover:text-red-700 p-1 bg-red-50 dark:bg-red-500/10 rounded cursor-pointer shrink-0"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </li>
          </ul>
        </div>
      </FormSection>
    </div>
  </AppForm>

  <!-- ==================== WEB CAMERA MODAL OVERLAY ==================== -->
  <Teleport to="body">
    <div v-if="isCameraOpen" class="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center">
      <div class="relative w-full h-full max-w-2xl mx-auto bg-black flex flex-col justify-center">
        <video
          ref="videoRef"
          class="w-full h-auto max-h-[80vh] object-cover bg-black"
          autoplay
          playsinline
        ></video>

        <canvas ref="canvasRef" class="hidden"></canvas>

        <div class="absolute top-6 right-6">
          <button type="button" @click="stopCamera" class="p-3 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="absolute bottom-10 left-0 right-0 flex justify-center pb-safe">
          <button
            type="button"
            @click="takePhoto"
            class="w-16 h-16 bg-white rounded-full border-4 border-gray-400 hover:scale-105 active:scale-95 hover:bg-gray-200 shadow-xl flex items-center justify-center transition-all"
          >
            <div class="w-12 h-12 rounded-full border border-gray-300"></div>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import SearchableSelect from '@/components/common/SearchableSelect.vue';
import { Plus, Trash2, Info, Package, Wrench, Camera, Image, X } from 'lucide-vue-next';
import { useMarketingRequestStore } from '../marketingRequest.store';
import { MarketingRequestService } from '../marketingRequest.service';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { Alert } from '@/plugins/sweetalert';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatThousand, parseThousand } from '@/utils/format';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  requestId: { type: [String, Number], default: null },
});
const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useMarketingRequestStore();
const authStore = useAuthStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.requestId);
const isSubmitting = computed(() => store.isLoading);
const detail = computed(() => store.requestDetail);

const isEditable = computed(() => {
  if (!isEdit.value) return true;
  return ['draft', 'diajukan'].includes(detail.value?.status);
});

const currentStep = ref(1);
const requestTypes = [
  { id: 'barang', label: 'Barang', desc: 'Pengadaan barang marketing dari stok / PO', icon: Package },
  { id: 'jasa', label: 'Jasa', desc: 'Jasa vendor / reimburse (transport, parkir, pulsa)', icon: Wrench },
];

const form = reactive({
  requestType: 'barang',
  requesterEmployeeId: '',
  requesterLocationId: '',
  purpose: '',
});

// Urutan dideklarasikan DI ATAS computed yang menggunakannya
const createEmptyItem = () => {
  if (form.requestType === 'jasa') return { description: '', nominal: null, notes: '' };
  return { goodId: '', goodName: '', uomName: '', tipeBarang: '', qtyRequest: 1, notes: '' };
};

const formItems = ref([createEmptyItem()]);
const addItemRow = () => formItems.value.push(createEmptyItem());
const removeItemRow = (index) => { if (formItems.value.length > 1) formItems.value.splice(index, 1); };

const isDuplicateGood = (goodId, currentIndex) => {
  if (!goodId) return false;
  return formItems.value.some((it, idx) => it.goodId === goodId && idx !== currentIndex);
};

const onGoodSelected = (item, selected) => {
  const g = selected?.raw || selected;
  if (g && (g.id || g.value)) {
    item.goodName = g.good_name || g.name || g.goodName || '';
    item.uomName = g.uom?.name || g.uom_name || '';
    item.tipeBarang = g.tipe_barang || '';
  } else {
    item.goodName = ''; item.uomName = ''; item.tipeBarang = '';
  }
};

const onNominalInput = (item, e) => {
  const v = e.target.value;
  if (v.endsWith(',') || v.endsWith('.')) return;
  item.nominal = parseThousand(v);
};

const hasFilledItems = computed(() => {
  return formItems.value.some((it) => {
    if (form.requestType === 'jasa') {
      return !!(it.description && it.description.trim()) || Number(it.nominal) > 0;
    }
    return !!it.goodId;
  });
});
const categoryLocked = computed(() => isEdit.value || hasFilledItems.value);

const galleryInputRef = ref(null);
const selectedFiles = ref([]);

const isCameraOpen = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);
let cameraStream = null;

const step2Title = computed(() => (form.requestType === 'jasa' ? 'Rincian Jasa' : 'Item Barang Diminta'));
const step2SectionTitle = computed(() => (form.requestType === 'jasa' ? 'Rincian Jasa' : 'Daftar Barang Diminta'));

const initialRequesterOption = computed(() => {
  if (!form.requesterEmployeeId) return null;
  if (detail.value?.requesterEmployee?.full_name || detail.value?.requesterEmployeeName) {
    return { value: form.requesterEmployeeId, label: detail.value.requesterEmployee?.full_name || detail.value.requesterEmployeeName };
  }
  if (authStore.user?.employeeId === form.requesterEmployeeId) {
    return { value: form.requesterEmployeeId, label: authStore.user.employee?.full_name || authStore.user.displayName || authStore.user.fullName };
  }
  return null;
});

const initialLocationOption = computed(() => {
  if (!form.requesterLocationId) return null;
  if (detail.value?.requesterLocation?.location_name || detail.value?.requesterLocationName) {
    return { value: form.requesterLocationId, label: detail.value.requesterLocation?.location_name || detail.value.requesterLocationName };
  }
  return null;
});

const requesterLocationOptions = ref([]);
const loadingRequesterLocations = ref(false);

const requesterLocationSelectOptions = computed(() => {
  const options = requesterLocationOptions.value.map((loc) => ({ value: loc.id, label: loc.location_name }));
  if (initialLocationOption.value && !options.some((o) => o.value === initialLocationOption.value.value)) {
    options.unshift(initialLocationOption.value);
  }
  return options;
});

const requesterLocationPlaceholder = computed(() => {
  if (!form.requesterEmployeeId) return 'Pilih pemohon terlebih dahulu...';
  if (loadingRequesterLocations.value) return 'Memuat toko binaan...';
  if (!requesterLocationSelectOptions.value.length) return 'Tidak ada toko binaan aktif untuk pemohon ini';
  return 'Pilih lokasi...';
});

const loadRequesterLocations = async (employeeId) => {
  if (!employeeId) {
    requesterLocationOptions.value = [];
    return;
  }
  loadingRequesterLocations.value = true;
  try {
    const res = await MarketingRequestService.getRequesterLocations(employeeId);
    requesterLocationOptions.value = res || [];
  } catch (error) {
    requesterLocationOptions.value = [];
    Alert.error('Gagal', error.response?.data?.message || 'Gagal memuat lokasi toko binaan pemohon.');
  } finally {
    loadingRequesterLocations.value = false;
  }
};

const onRequesterEmployeeSelected = async () => {
  await loadRequesterLocations(form.requesterEmployeeId);
  if (!requesterLocationOptions.value.some((loc) => loc.id === form.requesterLocationId)) {
    form.requesterLocationId = '';
  }
};

watch(() => form.requestType, () => {
  if (!categoryLocked.value) formItems.value = [createEmptyItem()];
});

const isStep1Valid = computed(() => !!(form.requesterEmployeeId && form.requesterLocationId));
const isStep2Valid = computed(() => {
  if (!formItems.value.length) return false;
  if (form.requestType === 'jasa') return formItems.value.every((it) => it.description && it.description.trim() && Number(it.nominal) > 0);
  return formItems.value.every((it) => it.goodId && Number(it.qtyRequest) > 0);
});

const getStatusLabel = (s) => ({
  draft: 'Draft', diajukan: 'Diajukan', diproses: 'Diproses',
  menunggu_pemenuhan: 'Menunggu Pemenuhan', selesai: 'Selesai',
  ditolak: 'Ditolak', batal: 'Batal',
}[s] || s);

const statusBadgeClass = (s) => ({
  draft: 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
  diajukan: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
  diproses: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
  menunggu_pemenuhan: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400',
  selesai: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
  ditolak: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
  batal: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
}[s] || 'bg-gray-100 text-gray-700');

const triggerGalleryUpload = () => {
  if (galleryInputRef.value) galleryInputRef.value.click();
};

const checkFileLimit = (newCount) => {
  if (selectedFiles.value.length + newCount > 10) {
    Alert.error('Batas File', 'Maksimal hanya boleh mengunggah 10 file bukti.');
    return false;
  }
  return true;
};

const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  let validFiles = [];

  for (let file of files) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type === 'video/mp4';
    const sizeMB = file.size / 1024 / 1024;

    if (isImage && sizeMB > 5) { Alert.error('Ditolak', `Foto ${file.name} melebihi batas 5MB.`); continue; }
    if (isVideo && sizeMB > 20) { Alert.error('Ditolak', `Video ${file.name} melebihi batas 20MB.`); continue; }
    if (!isImage && !isVideo) { Alert.error('Ditolak', `File ${file.name} tidak valid. Hanya menerima gambar atau MP4.`); continue; }
    validFiles.push(file);
  }

  if (checkFileLimit(validFiles.length)) {
    selectedFiles.value = [...selectedFiles.value, ...validFiles];
  } else {
    const allowed = 10 - selectedFiles.value.length;
    selectedFiles.value = [...selectedFiles.value, ...validFiles.slice(0, allowed)];
  }
  e.target.value = '';
};

const startCamera = async () => {
  if (!checkFileLimit(1)) return;

  isCameraOpen.value = true;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });

    setTimeout(() => {
      if (videoRef.value) {
        videoRef.value.srcObject = cameraStream;
      }
    }, 100);
  } catch (err) {
    isCameraOpen.value = false;
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      Alert.error('Izin Kamera Ditolak', 'Akses kamera diblokir. Harap izinkan akses kamera melalui ikon gembok di address bar browser Anda.');
    } else {
      Alert.error('Kamera Error', 'Tidak dapat mengakses perangkat kamera.');
    }
    console.error('Kamera error:', err);
  }
};

const stopCamera = () => {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  isCameraOpen.value = false;
};

const takePhoto = () => {
  if (!videoRef.value || !canvasRef.value) return;
  const video = videoRef.value;
  const canvas = canvasRef.value;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (blob) {
      const file = new File([blob], `Kamera_${Date.now()}.jpg`, { type: 'image/jpeg' });
      selectedFiles.value.push(file);
    }
    stopCamera();
  }, 'image/jpeg', 0.85);
};

onUnmounted(() => stopCamera());

const removeFile = (index) => selectedFiles.value.splice(index, 1);

const resetForm = () => {
  currentStep.value = 1;
  form.requestType = 'barang';
  form.requesterEmployeeId = authStore.user?.employeeId || authStore.user?.employee_id || '';
  form.requesterLocationId = '';
  form.purpose = '';
  formItems.value = [createEmptyItem()];
  selectedFiles.value = [];
  requesterLocationOptions.value = [];
  loadRequesterLocations(form.requesterEmployeeId);
};

const loadDetailData = async (id) => {
  try {
    const data = await store.fetchDetail(id);
    if (!data) return;
    currentStep.value = 1;
    form.requestType = data.requestType || 'barang';
    form.requesterEmployeeId = data.requesterEmployeeId || '';
    form.requesterLocationId = data.requesterLocationId || '';
    form.purpose = data.purpose || '';
    selectedFiles.value = [];
    loadRequesterLocations(form.requesterEmployeeId);

    formItems.value = (data.items || []).map((it) => {
      if (form.requestType === 'jasa') {
        return { description: it.description || '', nominal: it.nominal != null ? Number(it.nominal) : null, notes: it.notes || '' };
      }
      return { goodId: it.goodId || '', goodName: it.goodName || '', uomName: it.uomName || '', tipeBarang: it.tipeBarang || '', qtyRequest: Number(it.qtyRequest) || 1, notes: it.notes || '' };
    });

    if (!formItems.value.length) formItems.value = [createEmptyItem()];
  } catch (err) {
    Alert.error('Gagal', 'Tidak dapat memuat detail pengajuan.');
    handleClose();
  }
};

watch(() => props.modelValue, async (open) => {
  if (open) {
    if (props.requestId) await loadDetailData(props.requestId);
    else resetForm();
  }
});

onMounted(async () => {
  if (props.modelValue) {
    if (props.requestId) await loadDetailData(props.requestId);
    else resetForm();
  }
});

const handleClose = () => {
  isOpen.value = false;
  selectedFiles.value = [];
  stopCamera();
  emit('update:modelValue', false);
  emit('close');
};

const handleSave = async (targetStatus = 'draft') => {
  if (!form.requesterEmployeeId) return Alert.error('Validasi Gagal', 'Pemohon wajib dipilih.');
  if (!form.requesterLocationId) return Alert.error('Validasi Gagal', 'Lokasi pemohon wajib dipilih.');
  if (!formItems.value.length) return Alert.error('Validasi Gagal', 'Daftar item pengajuan tidak boleh kosong.');

  if (form.requestType === 'jasa') {
    if (formItems.value.some((it) => !it.description || !it.description.trim())) return Alert.error('Validasi Gagal', 'Deskripsi keperluan wajib diisi.');
    if (formItems.value.some((it) => Number(it.nominal) <= 0)) return Alert.error('Validasi Gagal', 'Nominal jasa harus lebih dari 0.');
  } else {
    if (formItems.value.some((it) => !it.goodId)) return Alert.error('Validasi Gagal', 'Semua baris item wajib memilih barang.');
    if (formItems.value.some((it) => Number(it.qtyRequest) <= 0)) return Alert.error('Validasi Gagal', 'QTY item harus lebih dari 0.');
  }

  const actionLabel = isEdit.value ? 'Simpan perubahan data' : (targetStatus === 'diajukan' ? 'Kirim pengajuan' : 'Simpan draft');
  const confirmed = await Alert.confirm('Konfirmasi', `${actionLabel} pengajuan marketing ini?`);
  if (!confirmed) return;

  try {
    let res = null;
    let actualRequestId = props.requestId;

    if (isEdit.value) {
      res = await store.updateRequest(props.requestId, form, formItems.value);
    } else {
      res = await store.createRequest(form, formItems.value);
      actualRequestId = res?.id || res?.data?.id;
    }

    if (selectedFiles.value.length > 0 && actualRequestId) {
      const formData = new FormData();
      selectedFiles.value.forEach(file => formData.append('evidence_before', file));
      await MarketingRequestService.addEvidences(actualRequestId, formData);
    }

    if (targetStatus === 'diajukan' && actualRequestId) {
      if (!isEdit.value || detail.value?.status === 'draft') {
        try { await store.updateStatus(actualRequestId, { status: 'diajukan' }); }
        catch (e) { console.error('Auto status submit error', e); }
      }
    }

    Alert.toast(targetStatus === 'diajukan' ? 'Pengajuan berhasil dikirim.' : 'Draft berhasil disimpan.', 'success');
    emit('saved', res);
    handleClose();
  } catch (error) {
    Alert.error('Gagal', getApiErrorMessage(error, 'Gagal menyimpan pengajuan.'));
  }
};
</script>

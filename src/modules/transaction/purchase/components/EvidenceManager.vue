<template>
  <div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-border space-y-3.5">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <FileText class="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" aria-hidden="true" />
        <span class="text-xs font-bold text-text-active uppercase tracking-wide">
          Dokumen Pendukung
        </span>
        <span
          v-if="!isStaged && totalVisible > 0"
          class="text-[10px] font-bold text-text-muted bg-bg-2 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-border"
        >
          {{ totalVisible }} file
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="!disabled && !isStaged"
          v-can="'purchases:update'"
          type="button"
          @click="toggleAddPanel"
          class="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-semibold transition cursor-pointer select-none"
        >
          <component :is="showAdd ? X : Plus" class="w-3.5 h-3.5" aria-hidden="true" />
          <span>{{ showAdd ? 'Tutup' : 'Tambah Dokumen' }}</span>
        </button>
      </div>
    </div>

    <!-- Category Pill Switcher (if multiple kinds available) -->
    <div v-if="visibleKinds.length > 1" class="flex items-center p-1 bg-bg-2 dark:bg-gray-800/80 rounded-lg border border-border">
      <button
        v-for="kind in visibleKinds"
        :key="kind"
        type="button"
        @click="addKind = kind"
        :class="[
          'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer select-none',
          addKind === kind
            ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-300 shadow-xs font-semibold'
            : 'text-text-muted hover:text-text-active'
        ]"
      >
        <span>{{ EVIDENCE_KIND_LABELS[kind] }}</span>
        <span
          v-if="!isStaged && groupOf(kind).length > 0"
          class="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold"
          :class="addKind === kind ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300' : 'bg-gray-200 dark:bg-gray-600 text-text-muted'"
        >
          {{ groupOf(kind).length }}
        </span>
      </button>
    </div>

    <!-- Upload Panel (Mode Staged or Expanded in Managed) -->
    <div v-if="showAdd && !disabled" class="space-y-2.5">
      <!-- Compact Dropzone -->
      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        :class="[
          'border border-dashed rounded-lg p-3 text-center transition-all flex flex-col sm:flex-row items-center justify-between gap-2.5',
          isDragging
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10'
            : 'border-gray-300 dark:border-gray-700 hover:border-brand-400 bg-gray-50/50 dark:bg-gray-800/30'
        ]"
      >
        <input
          :id="fileInputId"
          ref="fileInputRef"
          type="file"
          multiple
          :accept="EVIDENCE_ACCEPT_ATTR"
          class="sr-only peer"
          @change="handleFileSelect"
        />
        <label
          :for="fileInputId"
          class="flex items-center gap-2.5 cursor-pointer text-left w-full sm:w-auto min-w-0"
        >
          <div class="p-2 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
            <UploadCloud class="w-4 h-4" aria-hidden="true" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-semibold text-text-active truncate">
              Klik atau tarik file ke sini
            </span>
            <span class="text-[10px] text-text-muted">
              JPG, PNG, WEBP, PDF (Maks {{ EVIDENCE_MAX_FILE_SIZE_MB }}MB) &bull; Kuota: {{ remainingQuota(addKind) }} tersisa
            </span>
          </div>
        </label>

        <!-- Secondary Action: Add External Link -->
        <button
          type="button"
          @click="addLinkRow"
          class="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium text-text-active transition cursor-pointer select-none shadow-xs"
        >
          <LinkIcon class="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
          <span>+ Link Eksternal</span>
        </button>
      </div>

      <!-- Staged Files List -->
      <div v-if="stagedFilesOfKind.length" class="space-y-1.5">
        <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          File Siap Diunggah ({{ stagedFilesOfKind.length }})
        </div>
        <div
          v-for="entry in stagedFilesOfKind"
          :key="entry.uid"
          class="p-2.5 bg-bg-2 dark:bg-gray-800/40 border border-border rounded-lg flex flex-col gap-1.5"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <button
                v-if="entry.previewUrl"
                type="button"
                @click="openPreview(entry.previewUrl, entry.file.name, entry.previewMime)"
                class="w-7 h-7 shrink-0 rounded overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:scale-105 transition cursor-pointer"
                title="Pratinjau"
              >
                <img
                  v-if="entry.previewMime && entry.previewMime.startsWith('image/')"
                  :src="entry.previewUrl"
                  :alt="entry.file.name"
                  class="w-full h-full object-cover"
                />
                <FileText v-else class="w-3.5 h-3.5 text-orange-500" aria-hidden="true" />
              </button>
              <FileText v-else class="w-4 h-4 text-orange-500 shrink-0" aria-hidden="true" />
              
              <div class="min-w-0">
                <span class="text-xs font-semibold text-text-active truncate block max-w-[280px]" :title="entry.file.name">
                  {{ entry.file.name }}
                </span>
                <span class="text-[10px] text-text-muted">
                  {{ formatSize(entry.file.size / 1024) }}
                </span>
              </div>
            </div>

            <button
              type="button"
              @click="removeStagedFile(entry.uid)"
              class="p-1 text-text-muted hover:text-red-500 rounded transition cursor-pointer"
              title="Hapus dari antrean"
            >
              <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <input
            v-model="entry.notes"
            type="text"
            :maxlength="EVIDENCE_MAX_NOTES_LENGTH"
            placeholder="Catatan dokumen (opsional)..."
            class="w-full px-2.5 py-1 text-xs text-text-active bg-white dark:bg-gray-900 border border-border rounded-md outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <!-- Staged Links List -->
      <div v-if="stagedLinksOfKind.length" class="space-y-1.5">
        <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Link Eksternal ({{ stagedLinksOfKind.length }})
        </div>
        <div
          v-for="entry in stagedLinksOfKind"
          :key="entry.uid"
          class="p-2.5 bg-bg-2 dark:bg-gray-800/40 border border-border rounded-lg flex flex-col gap-1.5"
        >
          <div class="flex items-center gap-2">
            <input
              v-model="entry.url"
              type="url"
              :maxlength="EVIDENCE_MAX_URL_LENGTH"
              placeholder="https://drive.google.com/..."
              class="flex-1 px-2.5 py-1 text-xs font-medium text-text-active bg-white dark:bg-gray-900 border border-border rounded-md outline-none focus:border-brand-500"
            />
            <button
              type="button"
              @click="removeStagedLink(entry.uid)"
              class="p-1 text-text-muted hover:text-red-500 rounded transition cursor-pointer"
              title="Hapus link"
            >
              <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <input
              v-model="entry.fileName"
              type="text"
              :maxlength="EVIDENCE_MAX_FILE_NAME_LENGTH"
              placeholder="Label nama dokumen (opsional)"
              class="w-full px-2.5 py-1 text-xs text-text-active bg-white dark:bg-gray-900 border border-border rounded-md outline-none focus:border-brand-500"
            />
            <input
              v-model="entry.notes"
              type="text"
              :maxlength="EVIDENCE_MAX_NOTES_LENGTH"
              placeholder="Catatan tambahan (opsional)"
              class="w-full px-2.5 py-1 text-xs text-text-active bg-white dark:bg-gray-900 border border-border rounded-md outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>

      <!-- Action upload button for managed mode -->
      <div v-if="!isStaged && hasPending" class="flex items-center gap-2 pt-1">
        <button
          type="button"
          @click="submitUpload"
          :disabled="isBusy"
          class="flex-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {{ isBusy ? 'Mengunggah...' : `Unggah ${pendingCount} Dokumen Sekarang` }}
        </button>
        <button
          type="button"
          @click="resetStaging"
          class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-text-muted rounded-lg text-xs font-medium transition cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>

    <!-- Saved Documents List (Managed Mode) -->
    <div v-if="!isStaged" class="space-y-2">
      <div v-for="kind in (visibleKinds.length > 1 ? [addKind] : visibleKinds)" :key="kind" class="space-y-2">
        <div
          v-if="!groupOf(kind).length"
          class="text-xs text-text-muted italic px-3 py-4 border border-dashed border-border rounded-lg text-center bg-gray-50/50 dark:bg-gray-900/20"
        >
          Belum ada dokumen pada kategori {{ EVIDENCE_KIND_LABELS[kind] }}.
        </div>

        <div
          v-for="(item, index) in groupOf(kind)"
          :key="item.id"
          class="p-2.5 border border-border rounded-lg bg-bg-2 dark:bg-gray-800/30 flex flex-col gap-1.5"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <!-- Thumbnail / Icon -->
              <button
                v-if="canPreview(item)"
                type="button"
                @click="openPreview(resolveFileUrl(item.fileUrl), item.fileName, item.mimeType)"
                class="w-7 h-7 shrink-0 rounded overflow-hidden flex items-center justify-center transition hover:scale-105 cursor-pointer shadow-2xs"
                :class="iconWrapClass(item)"
                :title="`Pratinjau ${item.fileName}`"
              >
                <img
                  v-if="item.isImage"
                  :src="resolveFileUrl(item.fileUrl)"
                  :alt="item.fileName"
                  class="w-full h-full object-cover"
                />
                <FileText v-else class="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <a
                v-else
                :href="resolveFileUrl(item.fileUrl)"
                target="_blank"
                rel="noopener noreferrer"
                class="w-7 h-7 shrink-0 rounded overflow-hidden flex items-center justify-center transition hover:scale-105 cursor-pointer shadow-2xs"
                :class="iconWrapClass(item)"
                :title="`Buka ${item.fileName}`"
              >
                <LinkIcon v-if="item.isLink" class="w-3.5 h-3.5" aria-hidden="true" />
                <FileText v-else class="w-3.5 h-3.5" aria-hidden="true" />
              </a>

              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-xs font-semibold text-text-active truncate max-w-[240px]" :title="item.fileName">
                    {{ item.fileName }}
                  </span>
                  <span
                    v-if="index === 0"
                    class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-500/20"
                  >
                    Utama
                  </span>
                </div>
                <div class="text-[10px] text-text-muted">
                  <span v-if="item.fileSizeKb">{{ formatSize(item.fileSizeKb) }} &bull; </span>
                  <span>{{ item.uploaderName }}</span>
                  <span v-if="item.createdAt"> &bull; {{ formatDate(item.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-1 shrink-0">
              <button
                v-if="canPreview(item)"
                type="button"
                @click="openPreview(resolveFileUrl(item.fileUrl), item.fileName, item.mimeType)"
                class="px-2 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded text-[11px] font-semibold transition cursor-pointer"
              >
                Lihat
              </button>
              <a
                v-else
                :href="resolveFileUrl(item.fileUrl)"
                target="_blank"
                rel="noopener noreferrer"
                class="px-2 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded text-[11px] font-semibold transition flex items-center gap-0.5"
              >
                <span>Buka</span>
                <ExternalLink class="w-2.5 h-2.5" />
              </a>

              <template v-if="!disabled">
                <button
                  v-can="'purchases:update'"
                  type="button"
                  @click="startEdit(item)"
                  class="p-1 text-text-muted hover:text-text-active rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                  title="Ubah Catatan"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>
                <button
                  v-can="'purchases:update'"
                  type="button"
                  @click="handleDelete(item, index)"
                  class="p-1 text-text-muted hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer"
                  title="Hapus Dokumen"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </template>
            </div>
          </div>

          <p v-if="item.notes && editingId !== item.id" class="text-[11px] text-text-muted italic px-1">
            "{{ item.notes }}"
          </p>

          <!-- Inline Edit Form -->
          <div v-if="editingId === item.id" class="space-y-1.5 pt-1 border-t border-border">
            <input
              v-model="editFileName"
              type="text"
              :maxlength="EVIDENCE_MAX_FILE_NAME_LENGTH"
              placeholder="Nama dokumen..."
              class="w-full px-2 py-1 text-xs text-text-active bg-white dark:bg-gray-900 border border-border rounded outline-none"
            />
            <input
              v-model="editNotes"
              type="text"
              :maxlength="EVIDENCE_MAX_NOTES_LENGTH"
              placeholder="Catatan..."
              class="w-full px-2 py-1 text-xs text-text-active bg-white dark:bg-gray-900 border border-border rounded outline-none"
            />
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="saveEdit(item)"
                :disabled="!isEditDirty(item) || isBusy"
                class="px-2.5 py-1 bg-brand-600 text-white rounded text-xs font-semibold disabled:opacity-40 transition cursor-pointer"
              >
                Simpan
              </button>
              <button
                type="button"
                @click="cancelEdit"
                class="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-text-muted rounded text-xs transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FilePreviewModal
      v-model="previewOpen"
      :src="previewSrc"
      :title="previewTitle"
      :mime="previewMime"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, useId, onBeforeUnmount } from 'vue';
import {
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Eye,
  UploadCloud,
  Plus,
  X,
  Pencil,
  Trash2
} from 'lucide-vue-next';
import { Alert } from '@/plugins/sweetalert';
import { resolveFileUrl } from '@/utils/file';
import FilePreviewModal from '@/components/common/FilePreviewModal.vue';
import { getApiErrorMessage } from '@/utils/apiError';
import { usePurchaseStore } from '../purchase.store';
import {
  EVIDENCE_KINDS,
  EVIDENCE_KIND_LABELS,
  EVIDENCE_KIND_HINTS,
  EVIDENCE_ACCEPT_ATTR,
  EVIDENCE_MAX_FILE_SIZE,
  EVIDENCE_MAX_FILE_SIZE_MB,
  EVIDENCE_MAX_FILES_PER_REQUEST,
  EVIDENCE_MAX_LINKS_PER_REQUEST,
  EVIDENCE_MAX_TOTAL_PER_KIND,
  EVIDENCE_MAX_URL_LENGTH,
  EVIDENCE_MAX_NOTES_LENGTH,
  EVIDENCE_MAX_FILE_NAME_LENGTH,
  EVIDENCE_ERR_FILE_TYPE,
  EVIDENCE_ERR_FILE_SIZE,
  isAllowedEvidenceFile,
  isValidEvidenceLink
} from '../evidence.constants';

const props = defineProps({
  /** Wajib di mode 'managed'. Biarkan null saat purchase belum dibuat. */
  purchaseId: { type: String, default: null },
  /** Daftar dokumen tersimpan (hasil PurchaseMapper.toUIEvidence) */
  evidences: { type: Array, default: () => [] },
  /** 'managed' = langsung unggah ke server · 'staged' = tumpuk lokal untuk induk */
  mode: { type: String, default: 'managed' },
  /** Batasi ke satu kategori saja */
  onlyKind: { type: String, default: null },
  /** Nonaktifkan semua aksi mutasi (status batal / tanpa privilege) */
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:staged']);

const purchaseStore = usePurchaseStore();
const fileInputId = useId();
const fileInputRef = ref(null);

const isStaged = computed(() => props.mode === 'staged');
const visibleKinds = computed(() => (props.onlyKind ? [props.onlyKind] : EVIDENCE_KINDS));

/* ---------- Pratinjau berkas (gambar / PDF) ---------- */

const previewOpen = ref(false);
const previewSrc = ref('');
const previewTitle = ref('');
const previewMime = ref('');

const openPreview = (src, title, mime = '') => {
  previewSrc.value = src;
  previewTitle.value = title || 'Pratinjau';
  previewMime.value = mime || '';
  previewOpen.value = true;
};

// Link eksternal selalu dibuka di tab baru — tidak pernah lewat modal.
const canPreview = (item) =>
  !item.isLink &&
  (item.isImage ||
    /pdf/i.test(item.mimeType || '') ||
    /\.pdf(\?|$)/i.test(item.fileUrl || ''));

const showAdd = ref(false);
const addKind = ref(props.onlyKind || EVIDENCE_KINDS[0]);
const isDragging = ref(false);
const isBusy = ref(false);

const stagedFiles = reactive([]);
const stagedLinks = reactive([]);
let uidCounter = 0;
const nextUid = () => `ev-${Date.now()}-${uidCounter++}`;

// Mode staged selalu menampilkan panel tambah (tidak ada daftar tersimpan)
if (isStaged.value) showAdd.value = true;

/* ---------- Daftar tersimpan ---------- */

const groupOf = (kind) => props.evidences.filter((e) => e.kind === kind);
const totalVisible = computed(() =>
  visibleKinds.value.reduce((sum, kind) => sum + groupOf(kind).length, 0)
);
const isKindFull = (kind) => groupOf(kind).length >= EVIDENCE_MAX_TOTAL_PER_KIND;

const stagedCountOfKind = (kind) =>
  stagedFiles.filter((f) => f.kind === kind).length +
  stagedLinks.filter((l) => l.kind === kind && l.url.trim()).length;

const remainingQuota = (kind) =>
  Math.max(0, EVIDENCE_MAX_TOTAL_PER_KIND - groupOf(kind).length - stagedCountOfKind(kind));

const iconWrapClass = (item) => {
  if (item.isImage) return 'bg-gray-100 dark:bg-gray-800';
  if (item.isLink) return 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400';
  return 'bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400';
};

/* ---------- Antrean (staging) ---------- */

const stagedFilesOfKind = computed(() => stagedFiles.filter((f) => f.kind === addKind.value));
const stagedLinksOfKind = computed(() => stagedLinks.filter((l) => l.kind === addKind.value));

const pendingCount = computed(
  () => stagedFiles.length + stagedLinks.filter((l) => l.url.trim()).length
);
const hasPending = computed(() => pendingCount.value > 0);

/** Payload siap kirim ke PurchaseMapper.toEvidenceFormData */
const buildPayload = () => {
  const payload = {};
  EVIDENCE_KINDS.forEach((kind) => {
    payload[kind] = {
      files: stagedFiles.filter((f) => f.kind === kind).map((f) => ({ file: f.file, notes: f.notes })),
      links: stagedLinks
        .filter((l) => l.kind === kind && l.url.trim())
        .map((l) => ({ url: l.url, fileName: l.fileName, notes: l.notes }))
    };
  });
  return payload;
};

// Mode staged: teruskan antrean ke induk setiap kali berubah
watch(
  [stagedFiles, stagedLinks],
  () => {
    if (isStaged.value) emit('update:staged', buildPayload());
  },
  { deep: true }
);

/* ---------- Validasi & staging file ---------- */

const stageFiles = (fileList) => {
  const kind = addKind.value;
  const incoming = Array.from(fileList || []);
  if (!incoming.length) return;

  const rejected = [];
  const accepted = [];
  let quota = remainingQuota(kind);
  let perRequestLeft = EVIDENCE_MAX_FILES_PER_REQUEST - stagedFiles.filter((f) => f.kind === kind).length;

  incoming.forEach((file) => {
    if (!isAllowedEvidenceFile(file)) {
      rejected.push(`${file.name} (${EVIDENCE_ERR_FILE_TYPE})`);
      return;
    }
    if (file.size > EVIDENCE_MAX_FILE_SIZE) {
      rejected.push(`${file.name} (${EVIDENCE_ERR_FILE_SIZE})`);
      return;
    }
    if (perRequestLeft <= 0) {
      rejected.push(`${file.name} (maks ${EVIDENCE_MAX_FILES_PER_REQUEST} file per unggahan)`);
      return;
    }
    if (quota <= 0) {
      rejected.push(`${file.name} (kuota kategori penuh, maks ${EVIDENCE_MAX_TOTAL_PER_KIND})`);
      return;
    }
    accepted.push(file);
    quota -= 1;
    perRequestLeft -= 1;
  });

  accepted.forEach((file) => {
    const previewable = file.type.startsWith('image/') || file.type === 'application/pdf';
    stagedFiles.push({
      uid: nextUid(),
      kind,
      file,
      notes: '',
      previewUrl: previewable ? URL.createObjectURL(file) : null,
      previewMime: file.type
    });
  });

  // Satu toast berisi semua penolakan, bukan satu toast per file
  if (rejected.length) {
    Alert.error('Sebagian File Ditolak', rejected.join(' • '));
  }
};

const handleFileSelect = (event) => {
  stageFiles(event.target.files);
  event.target.value = '';
};

const handleDrop = (event) => {
  isDragging.value = false;
  stageFiles(event.dataTransfer?.files);
};

const removeStagedFile = (uid) => {
  const idx = stagedFiles.findIndex((f) => f.uid === uid);
  if (idx === -1) return;
  if (stagedFiles[idx].previewUrl) URL.revokeObjectURL(stagedFiles[idx].previewUrl);
  stagedFiles.splice(idx, 1);
};

const addLinkRow = () => {
  const kind = addKind.value;
  if (stagedLinks.filter((l) => l.kind === kind).length >= EVIDENCE_MAX_LINKS_PER_REQUEST) {
    Alert.error('Batas Link', `Maksimal ${EVIDENCE_MAX_LINKS_PER_REQUEST} link per unggahan.`);
    return;
  }
  stagedLinks.push({ uid: nextUid(), kind, url: '', fileName: '', notes: '' });
};

const removeStagedLink = (uid) => {
  const idx = stagedLinks.findIndex((l) => l.uid === uid);
  if (idx !== -1) stagedLinks.splice(idx, 1);
};

const resetStaging = () => {
  stagedFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
  stagedFiles.splice(0, stagedFiles.length);
  stagedLinks.splice(0, stagedLinks.length);
  if (!isStaged.value) showAdd.value = false;
};

const toggleAddPanel = () => {
  showAdd.value = !showAdd.value;
  if (!showAdd.value) resetStaging();
};

/** Validasi link sebelum kirim. Mengembalikan true bila semua valid. */
const validateLinks = () => {
  const invalid = stagedLinks
    .filter((l) => l.url.trim())
    .filter((l) => !isValidEvidenceLink(l.url))
    .map((l) => l.url.trim().slice(0, 40));

  if (invalid.length) {
    Alert.error(
      'Link Tidak Valid',
      `Harus diawali http:// atau https:// dan maksimal ${EVIDENCE_MAX_URL_LENGTH} karakter: ${invalid.join(' • ')}`
    );
    return false;
  }
  return true;
};

const submitUpload = async () => {
  if (!props.purchaseId || !hasPending.value || isBusy.value) return;
  if (!validateLinks()) return;

  isBusy.value = true;
  try {
    const count = pendingCount.value;
    await purchaseStore.uploadEvidences(props.purchaseId, buildPayload());
    resetStaging();
    Alert.success('Berhasil', `${count} dokumen berhasil diunggah.`);
  } catch (err) {
    Alert.error('Gagal Mengunggah', getApiErrorMessage(err));
  } finally {
    isBusy.value = false;
  }
};

/* ---------- Edit metadata ---------- */

const editingId = ref(null);
const editNotes = ref('');
const editFileName = ref('');

const startEdit = (item) => {
  editingId.value = item.id;
  editNotes.value = item.notes || '';
  editFileName.value = item.fileName || '';
};

const cancelEdit = () => {
  editingId.value = null;
  editNotes.value = '';
  editFileName.value = '';
};

const isEditDirty = (item) =>
  editNotes.value !== (item.notes || '') || editFileName.value !== (item.fileName || '');

const saveEdit = async (item) => {
  // Backend membalas 400 bila body kosong — jangan kirim kalau tidak ada perubahan
  if (!isEditDirty(item) || isBusy.value) return;

  const payload = {};
  if (editNotes.value !== (item.notes || '')) payload.notes = editNotes.value.trim() || null;
  if (editFileName.value !== (item.fileName || '')) {
    payload.file_name = editFileName.value.trim() || null;
  }

  isBusy.value = true;
  try {
    await purchaseStore.updateEvidenceMeta(props.purchaseId, item.id, payload);
    cancelEdit();
    Alert.success('Berhasil', 'Catatan dokumen diperbarui.');
  } catch (err) {
    Alert.error('Gagal', getApiErrorMessage(err));
  } finally {
    isBusy.value = false;
  }
};

/* ---------- Hapus ---------- */

const handleDelete = async (item, index) => {
  const extra =
    index === 0
      ? ' Dokumen ini adalah dokumen utama; dokumen berikutnya akan menggantikannya.'
      : '';
  const confirmed = await Alert.confirm(
    'Hapus Dokumen?',
    `Dokumen "${item.fileName}" akan dihapus permanen.${extra}`
  );
  if (!confirmed) return;

  try {
    await purchaseStore.deleteEvidence(props.purchaseId, item.id);
    Alert.success('Berhasil', 'Dokumen dihapus.');
  } catch (err) {
    Alert.error('Gagal', getApiErrorMessage(err));
  }
};

/* ---------- Format ---------- */

const formatSize = (kb) => {
  const value = Number(kb) || 0;
  if (value < 1024) return `${Math.round(value)} KB`;
  return `${(value / 1024).toFixed(1)} MB`;
};

const formatDate = (d) => {
  if (!d) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(d));
};

// Bebaskan object URL pratinjau yang belum sempat di-revoke saat komponen dilepas.
onBeforeUnmount(() => {
  stagedFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
});

/** Dipakai form.vue mode create untuk mengambil antrean setelah purchase terbentuk */
defineExpose({
  getPending: buildPayload,
  hasPending: () => hasPending.value,
  validateLinks,
  resetStaging
});
</script>

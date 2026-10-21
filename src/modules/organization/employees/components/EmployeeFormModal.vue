<template>
  <AppForm
    v-model="isOpen"
    :title="isEdit ? 'Ubah Profil Karyawan' : 'Registrasi Karyawan Baru'"
    :subtitle="isEdit ? `Karyawan: ${form.fullName || '-'} • NIK: ${form.employeeNumber || '-'}` : 'Pendaftaran akun portal, identitas personal, dan penempatan organisasi'"
    :is-modal="true"
    max-width="max-w-[780px]"
    :loading="isSubmitting"
    :submit-label="isEdit ? 'Simpan Perubahan' : 'Daftarkan Karyawan'"
    cancel-label="Batal"
    :disabled="!isFormValid"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4">
      <!-- Enterprise Segmented Tab Header -->
      <div class="flex items-center gap-1.5 p-1 bg-bg-2 dark:bg-gray-800/80 rounded-xl border border-border overflow-x-auto custom-scrollbar shrink-0 select-none">
        <button
          v-for="tab in availableTabs"
          :key="tab.id"
          type="button"
          @click="activeTab = tab.id"
          :class="[
            'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
            activeTab === tab.id
              ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm border border-border font-bold'
              : 'text-text-muted hover:text-text-active hover:bg-white/50 dark:hover:bg-gray-900/50'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4 shrink-0" />
          <span>{{ tab.label }}</span>
          <CheckCircle2
            v-if="tab.isValid"
            class="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-0.5"
          />
        </button>
      </div>

      <!-- TAB 1: IDENTITAS & AKUN PORTAL -->
      <div v-show="activeTab === 'identity'" class="flex flex-col gap-4">
        <!-- Akun Portal Section -->
        <FormSection title="Akses Akun Portal" :cols="2">
          <FormField
            label="Email Akun"
            label-width="115px"
            type="email"
            v-model="form.email"
            :required="true"
            :disabled="isSubmitting"
            placeholder="nama@heaven-scent.com"
            :col-span="isEdit ? 2 : 1"
          />

          <FormField
            v-if="!isEdit"
            label="Password"
            label-width="115px"
            type="password"
            v-model="form.password"
            :required="true"
            :disabled="isSubmitting"
            placeholder="Min. 6 karakter"
          />

          <div v-if="!isEdit" class="col-span-1 md:col-span-2 p-3 bg-bg-2 border border-border rounded-xl">
            <label class="flex items-center gap-3 cursor-pointer select-none">
              <input
                v-model="form.isSuperadmin"
                type="checkbox"
                :disabled="isSubmitting"
                class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 transition cursor-pointer"
              />
              <div class="flex flex-col">
                <span class="text-xs font-bold text-text-active">Jadikan Akun Superadmin</span>
                <span class="text-[11px] text-text-muted">Memberikan hak akses penuh ke seluruh modul sistem ERP</span>
              </div>
            </label>
          </div>
        </FormSection>

        <!-- Biodata Personal Section -->
        <FormSection title="Biodata & Data Pokok Pegawai" :cols="2">
          <!-- Foto Profil Card -->
          <div class="col-span-1 md:col-span-2 flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-white dark:bg-gray-900 border border-border rounded-xl">
            <div class="relative w-16 h-16 rounded-2xl bg-bg-2 border border-border flex items-center justify-center overflow-hidden text-text-muted shrink-0">
              <img v-if="photoPreview" :src="photoPreview" class="w-full h-full object-cover" />
              <User v-else class="w-8 h-8" />
            </div>
            <div class="flex flex-col gap-1 flex-1 text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start gap-2">
                <span class="text-xs font-bold text-text-active">Foto Profil Karyawan</span>
                <span class="text-[10px] text-text-muted uppercase tracking-wider font-mono">JPG/PNG &bull; Max 2MB</span>
              </div>
              <p class="text-[11px] text-text-muted">Foto formal untuk profil akun dan kartu tanda pegawai.</p>
              <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handlePhotoChange" />
              <div class="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  @click="triggerFileInput"
                  :disabled="isSubmitting"
                  class="px-3 py-1 bg-bg-2 hover:bg-bg-3 border border-border rounded-lg text-xs font-semibold text-text-active transition cursor-pointer"
                >
                  {{ photoPreview ? 'Ganti Foto' : 'Unggah Foto' }}
                </button>
                <button
                  v-if="photoPreview"
                  type="button"
                  @click="clearPhoto"
                  :disabled="isSubmitting"
                  class="px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>

          <FormField
            label="No. Pegawai"
            label-width="115px"
            v-model="form.employeeNumber"
            :required="true"
            :disabled="isSubmitting"
            placeholder="Misal: EMP-001"
          />

          <FormField
            label="Nama Lengkap"
            label-width="115px"
            v-model="form.fullName"
            :required="true"
            :disabled="isSubmitting"
            placeholder="Nama sesuai KTP"
          />

          <FormField
            label="Panggilan"
            label-width="115px"
            v-model="form.nickname"
            :disabled="isSubmitting"
            placeholder="Nama panggilan"
          />

          <FormField
            label="Jenis Kelamin"
            label-width="115px"
            type="select"
            :options="genderOptions"
            v-model="form.gender"
            :disabled="isSubmitting"
          />

          <FormField
            label="Tempat Lahir"
            label-width="115px"
            v-model="form.placeOfBirth"
            :disabled="isSubmitting"
            placeholder="Kota lahir"
          />

          <FormField
            label="Tgl Lahir"
            label-width="115px"
            type="date"
            v-model="form.dateOfBirth"
            :disabled="isSubmitting"
            placeholder="Pilih tgl lahir"
            class="[&_input]:!py-0 [&_input]:!text-sm"
          />
        </FormSection>

        <!-- Identitas Kependudukan & Kontak Pribadi -->
        <FormSection title="Identitas Kependudukan & Kontak Pribadi" :cols="2">
          <FormField
            label="No. KTP (NIK)"
            label-width="115px"
            v-model="form.nationalId"
            :disabled="isSubmitting"
            placeholder="16 digit NIK"
          />

          <FormField
            label="No. WhatsApp"
            label-width="115px"
            type="tel"
            v-model="form.phone"
            :disabled="isSubmitting"
            placeholder="08xxxxxxxxxx"
          />

          <FormField
            label="Email Pribadi"
            label-width="115px"
            type="email"
            v-model="form.employeeEmail"
            :disabled="isSubmitting"
            placeholder="karyawan@email.com"
            col-span="2"
          />

          <FormField
            label="Alamat Domisili"
            label-width="115px"
            type="textarea"
            :rows="2"
            height="h-[64px]"
            v-model="form.address"
            :disabled="isSubmitting"
            placeholder="Alamat domisili tempat tinggal saat ini..."
            col-span="2"
          />
        </FormSection>

        <!-- Kontak Darurat -->
        <FormSection title="Kontak Darurat (Emergency Contact)" :cols="2">
          <FormField
            label="Nama Kerabat"
            label-width="115px"
            v-model="form.emergencyContactName"
            :disabled="isSubmitting"
            placeholder="Nama kerabat / keluarga"
          />

          <FormField
            label="No. Telepon"
            label-width="115px"
            type="tel"
            v-model="form.emergencyContactPhone"
            :disabled="isSubmitting"
            placeholder="08xxxxxxxxxx"
          />
        </FormSection>
      </div>

      <!-- TAB 2: PENEMPATAN & STRUKTUR ORGANISASI -->
      <div v-show="activeTab === 'placement'" class="flex flex-col gap-4">
        <FormSection title="Penempatan & Jabatan" :cols="2">
          <FormField
            label="Lokasi Kerja"
            label-width="115px"
            :required="true"
            type="searchable-select"
            master="locations"
            v-model="form.locationId"
            :disabled="isSubmitting"
            :clearable="true"
            placeholder="Pilih lokasi kerja..."
          />

          <FormField
            label="Status Pegawai"
            label-width="115px"
            type="select"
            :options="statusOptions"
            v-model="form.status"
            :disabled="isSubmitting"
          />

          <!-- Toggle Chief Highlight Card -->
          <div class="col-span-1 md:col-span-2 p-3 bg-bg-2 border border-border rounded-xl">
            <label class="flex items-start gap-3 cursor-pointer select-none">
              <input
                v-model="form.isChief"
                type="checkbox"
                :disabled="isSubmitting"
                class="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 transition cursor-pointer"
              />
              <div class="flex flex-col">
                <span class="text-xs font-bold text-text-active">Tandai Sebagai Pangkat Chief (Eksekutif)</span>
                <span class="text-[11px] text-text-muted mt-0.5">
                  Posisi Chief berada langsung di bawah pimpinan utama. Field Divisi & Jabatan akan dinonaktifkan secara otomatis.
                </span>
              </div>
            </label>
          </div>

          <FormField
            label="Divisi"
            label-width="115px"
            :required="!form.isChief"
            type="searchable-select"
            master="divisions"
            v-model="form.divisionId"
            :disabled="isSubmitting || form.isChief"
            :clearable="true"
            placeholder="Pilih divisi..."
          />

          <FormField
            label="Jabatan"
            label-width="115px"
            :required="!form.isChief"
            type="searchable-select"
            master="positions"
            v-model="form.positionId"
            :disabled="isSubmitting || form.isChief"
            :clearable="true"
            placeholder="Pilih jabatan..."
          />

          <FormField
            label="Tgl Gabung"
            label-width="115px"
            type="date"
            v-model="form.joinDate"
            :disabled="isSubmitting"
            placeholder="Pilih tgl gabung"
            class="[&_input]:!py-0 [&_input]:!text-sm"
          />

          <FormField
            label="Atasan"
            label-width="115px"
            type="searchable-select"
            master="employees"
            v-model="form.supervisorId"
            :disabled="isSubmitting"
            :clearable="true"
            placeholder="Pilih atasan..."
          />

          <FormField
            label="PIC HRGA"
            label-width="115px"
            type="searchable-select"
            master="employees"
            v-model="form.hrgaPicId"
            :disabled="isSubmitting"
            :clearable="true"
            placeholder="Pilih PIC HRGA penanggung jawab..."
            col-span="2"
          />

          <FormField
            label="Catatan"
            label-width="115px"
            type="textarea"
            :rows="2"
            height="h-[64px]"
            v-model="form.trainingNotes"
            :disabled="isSubmitting"
            placeholder="Catatan hasil orientasi, sertifikasi, atau riwayat pelatihan..."
            col-span="2"
          />
        </FormSection>
      </div>

      <!-- TAB 3: PAYROLL & REKENING BANK -->
      <div v-show="activeTab === 'payroll'" class="flex flex-col gap-4">
        <div class="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300">
          <Info class="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <p class="text-xs leading-relaxed">
            Informasi rekening bank ini digunakan oleh Finance untuk pembayaran gaji (payroll), tunjangan operasional, dan reimbursement pengeluaran kantor.
          </p>
        </div>

        <FormSection title="Informasi Rekening Payroll" :cols="2">
          <FormField
            label="Nama Bank"
            label-width="115px"
            v-model="form.bankName"
            :disabled="isSubmitting"
            placeholder="Contoh: BCA / Mandiri / BRI"
          />

          <FormField
            label="No. Rekening"
            label-width="115px"
            v-model="form.bankAccountNumber"
            :disabled="isSubmitting"
            placeholder="Nomor rekening bank"
          />

          <FormField
            label="Nama Pemilik"
            label-width="115px"
            v-model="form.bankAccountHolder"
            :disabled="isSubmitting"
            placeholder="Nama lengkap pemilik rekening sesuai buku tabungan"
            col-span="2"
          />
        </FormSection>
      </div>

      <!-- TAB 4: METADATA MUTASI (Hanya saat mode edit) -->
      <div v-if="isEdit" v-show="activeTab === 'mutation'" class="flex flex-col gap-4">
        <div class="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
          <Info class="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <p class="text-xs leading-relaxed">
            Isi formulir mutasi jika pembaruan profil ini menyangkut perpindahan penempatan kerja, kenaikan jabatan (promosi), demosi, atau perubahan struktural resmi.
          </p>
        </div>

        <FormSection title="Catatan & Riwayat Mutasi" :cols="2">
          <FormField
            label="Jenis Mutasi"
            label-width="115px"
            type="select"
            :options="changeTypeOptions"
            v-model="form.changeType"
            :disabled="isSubmitting"
          />

          <FormField
            label="Tgl Efektif"
            label-width="115px"
            type="date"
            v-model="form.effectiveDate"
            :disabled="isSubmitting || !form.changeType"
            placeholder="Pilih tgl efektif"
            class="[&_input]:!py-0 [&_input]:!text-sm"
          />

          <FormField
            label="Alasan Mutasi"
            label-width="115px"
            type="textarea"
            :rows="3"
            height="h-[75px]"
            v-model="form.reason"
            :disabled="isSubmitting || !form.changeType"
            placeholder="Tuliskan latar belakang atau alasan resmi dilakukan perubahan data ini..."
            col-span="2"
          />
        </FormSection>
      </div>
    </div>
  </AppForm>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { AppForm, FormSection, FormField } from '@/components/forms';
import { User, Briefcase, CreditCard, ArrowRightLeft, CheckCircle2, Info } from 'lucide-vue-next';
import { useEmployeeStore } from '../employee.store';
import { Alert } from '@/plugins/sweetalert';
import { getApiErrorMessage } from '@/utils/apiError';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  employeeId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved', 'close']);

const store = useEmployeeStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.employeeId);
const isSubmitting = ref(false);

const activeTab = ref('identity');

const genderOptions = [
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
];

const statusOptions = [
  { value: 'active', label: 'Active (Aktif)' },
  { value: 'inactive', label: 'Inactive (Nonaktif)' },
  { value: 'resigned', label: 'Resigned (Mengundurkan Diri)' },
  { value: 'terminated', label: 'Terminated (Diberhentikan)' },
];

const changeTypeOptions = [
  { value: null, label: '-- Tidak Ada Mutasi --' },
  { value: 'mutation', label: 'Mutasi (Perubahan Lokasi Kerja)' },
  { value: 'promotion', label: 'Promosi (Kenaikan Jabatan)' },
  { value: 'demotion', label: 'Demosi (Penyesuaian Jabatan)' },
  { value: 'reorganization', label: 'Reorganisasi Departemen' },
  { value: 'administrative', label: 'Koreksi Data Administratif' },
];

const fileInput = ref(null);
const photoPreview = ref(null);
const selectedPhotoFile = ref(null);

const form = reactive({
  // Account
  email: '',
  password: '',
  isSuperadmin: false,

  // Personal
  employeeNumber: '',
  fullName: '',
  nickname: '',
  gender: 'male',
  placeOfBirth: '',
  dateOfBirth: null,
  nationalId: '',
  phone: '',
  employeeEmail: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  address: '',

  // Payroll
  bankName: '',
  bankAccountNumber: '',
  bankAccountHolder: '',

  // Job
  locationId: null,
  divisionId: null,
  positionId: null,
  joinDate: null,
  isChief: false,
  status: 'active',
  supervisorId: null,
  hrgaPicId: null,
  trainingNotes: '',

  // Mutation
  changeType: null,
  effectiveDate: null,
  reason: '',
});

const isIdentityValid = computed(() => {
  const hasAccount = !!form.email.trim() && (isEdit.value || (form.password && form.password.length >= 6));
  const hasPersonal = !!form.employeeNumber.trim() && !!form.fullName.trim();
  return hasAccount && hasPersonal;
});

const isPlacementValid = computed(() => {
  return !!form.locationId && (form.isChief || (!!form.divisionId && !!form.positionId));
});

const isFormValid = computed(() => {
  return isIdentityValid.value && isPlacementValid.value;
});

const availableTabs = computed(() => {
  const tabs = [
    {
      id: 'identity',
      label: '1. Identitas & Akun',
      icon: User,
      isValid: isIdentityValid.value,
    },
    {
      id: 'placement',
      label: '2. Penempatan & Struktur',
      icon: Briefcase,
      isValid: isPlacementValid.value,
    },
    {
      id: 'payroll',
      label: '3. Payroll & Bank',
      icon: CreditCard,
      isValid: true,
    },
  ];

  if (isEdit.value) {
    tabs.push({
      id: 'mutation',
      label: '4. Catatan Mutasi',
      icon: ArrowRightLeft,
      isValid: true,
    });
  }

  return tabs;
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handlePhotoChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    Alert.error('Ukuran Terlalu Besar', 'Maksimal ukuran foto adalah 2MB.');
    return;
  }

  selectedPhotoFile.value = file;
  photoPreview.value = URL.createObjectURL(file);
};

const clearPhoto = () => {
  selectedPhotoFile.value = null;
  photoPreview.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

const resetForm = () => {
  activeTab.value = 'identity';
  form.email = '';
  form.password = '';
  form.isSuperadmin = false;

  form.employeeNumber = '';
  form.fullName = '';
  form.nickname = '';
  form.gender = 'male';
  form.placeOfBirth = '';
  form.dateOfBirth = null;
  form.nationalId = '';
  form.phone = '';
  form.employeeEmail = '';
  form.emergencyContactName = '';
  form.emergencyContactPhone = '';
  form.address = '';

  form.bankName = '';
  form.bankAccountNumber = '';
  form.bankAccountHolder = '';

  form.locationId = null;
  form.divisionId = null;
  form.positionId = null;
  form.joinDate = null;
  form.isChief = false;
  form.status = 'active';
  form.supervisorId = null;
  form.hrgaPicId = null;
  form.trainingNotes = '';

  form.changeType = null;
  form.effectiveDate = null;
  form.reason = '';

  clearPhoto();
};

const loadDetailData = async (id) => {
  isSubmitting.value = true;
  try {
    const data = await store.fetchEmployeeDetail(id);
    if (data) {
      form.email = data.email || '';
      form.employeeNumber = data.employeeNumber || '';
      form.fullName = data.fullName || '';
      form.nickname = data.nickname || '';
      form.gender = data.gender || 'male';
      form.placeOfBirth = data.placeOfBirth || '';
      form.dateOfBirth = data.dateOfBirth || null;
      form.nationalId = data.nationalId || '';
      form.phone = data.phone || '';
      form.employeeEmail = data.employeeEmail || '';
      form.emergencyContactName = data.emergencyContactName || '';
      form.emergencyContactPhone = data.emergencyContactPhone || '';
      form.address = data.address || '';

      form.bankName = data.bankName || '';
      form.bankAccountNumber = data.bankAccountNumber || '';
      form.bankAccountHolder = data.bankAccountHolder || '';

      form.locationId = data.locationId || null;
      form.divisionId = data.divisionId || null;
      form.positionId = data.positionId || null;
      form.joinDate = data.joinDate || null;
      form.isChief = !!data.isChief;
      form.status = data.status || 'active';
      form.supervisorId = data.supervisorId || null;
      form.hrgaPicId = data.hrgaPicId || null;
      form.trainingNotes = data.trainingNotes || '';

      form.changeType = null;
      form.effectiveDate = null;
      form.reason = '';

      photoPreview.value = data.photoUrl || null;
    }
  } catch (error) {
    console.error('Failed to load employee detail', error);
    Alert.error('Gagal', 'Data karyawan tidak ditemukan.');
    handleClose();
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      if (props.employeeId) {
        await loadDetailData(props.employeeId);
      } else {
        resetForm();
      }
    }
  }
);

onMounted(async () => {
  if (props.modelValue) {
    if (props.employeeId) {
      await loadDetailData(props.employeeId);
    } else {
      resetForm();
    }
  }
});

const handleClose = () => {
  isOpen.value = false;
  emit('update:modelValue', false);
  emit('close');
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    Alert.error('Validasi Gagal', 'Mohon lengkapi seluruh field wajib bertanda bintang.');
    return;
  }

  const actionText = isEdit.value ? 'Simpan perubahan profil karyawan?' : 'Daftarkan data karyawan baru?';
  const confirmed = await Alert.confirm('Konfirmasi', actionText);
  if (!confirmed) return;

  isSubmitting.value = true;
  try {
    let savedUserId = props.employeeId;

    if (isEdit.value) {
      await store.updateEmployee(props.employeeId, form);
      Alert.toast('Profil karyawan berhasil diperbarui.', 'success');
    } else {
      const result = await store.createEmployee(form);
      savedUserId = result?.data?.id || result?.id;
      Alert.toast('Karyawan baru berhasil didaftarkan.', 'success');
    }

    // Upload photo if selected
    if (selectedPhotoFile.value && savedUserId) {
      try {
        await store.uploadPhoto(savedUserId, selectedPhotoFile.value);
      } catch (photoErr) {
        console.warn('Foto gagal diunggah:', photoErr);
      }
    }

    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Submit employee error:', error);
    Alert.error('Gagal Simpan', getApiErrorMessage(error, 'Gagal menyimpan data karyawan.'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

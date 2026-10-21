<template>
  <header class="sticky top-0 z-[50] w-full transition-all duration-200">
    <div class="backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between w-full h-16 px-5 lg:px-8 shadow-2xs">
      <!-- Left: Toggle & Dynamic Page Titles -->
      <div class="flex items-center gap-3.5 min-w-0">
        <button
          @click="handleToggle"
          class="lg:hidden flex items-center justify-center w-9 h-9 text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 shadow-xs active:scale-95 shrink-0 outline-none focus:ring-2 focus:ring-zinc-500/20"
        >
          <X v-if="isMobileOpen" class="w-4.5 h-4.5" />
          <Menu v-else class="w-4.5 h-4.5" />
        </button>

        <div class="flex flex-col min-w-0">
          <h1 class="text-sm md:text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate leading-tight">
            {{ pageTitle }}
          </h1>
          <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate font-normal">
            {{ pageSubtitle }}
          </p>
        </div>
      </div>

      <!-- Right: Actions & User -->
      <div class="flex items-center gap-3 shrink-0">
        <ThemeToggler />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebar } from '@/composables/useSidebar'
import ThemeToggler from '../common/ThemeToggler.vue'
import { Menu, X } from 'lucide-vue-next'

const { toggleSidebar, toggleMobileSidebar, isMobileOpen } = useSidebar()
const route = useRoute()

const subtitleMap: Record<string, string> = {
  'Beranda': 'Ringkasan Harian & Info Terkini',
  'Dashboard': 'Real-time GA Analytics & Monitoring',
  'Divisions': 'Struktur Organisasi & Tata Kelola • ERP',
  'Create Division': 'Tambah Divisi Baru ke Struktur Organisasi',
  'Edit Division': 'Ubah Informasi Divisi Kerja',
  'Employees': 'Kelola Data & Informasi Karyawan',
  'Create Employee': 'Tambah Karyawan Baru ke Sistem',
  'Edit Employee': 'Ubah Data Informasi Karyawan',
  'Employee Detail': 'Detail & Riwayat Karyawan',
  'Chiefs': 'Pimpinan Divisi & Jabatan Struktur',
  'Create Chief': 'Tambah Pimpinan Divisi Baru',
  'Edit Chief': 'Ubah Informasi Pimpinan Divisi',
  'Goods': 'Daftar Barang & Inventaris Sistem',
  'Categories': 'Kategori & Klasifikasi Inventaris',
  'Create Category': 'Tambah Kategori Inventaris Baru',
  'Edit Category': 'Ubah Kategori Inventaris',
  'Locations': 'Lokasi Penyimpanan & Distribusi',
  'Create Location': 'Tambah Lokasi Penyimpanan',
  'Edit Location': 'Ubah Informasi Lokasi Penyimpanan',
  'Asset Types': 'Tipe Aset & Karakteristik Barang',
  'Create Asset Type': 'Tambah Tipe Aset Baru',
  'Edit Asset Type': 'Ubah Tipe Aset',
  'Positions': 'Daftar Jabatan & Peran Organisasi',
  'Create Position': 'Tambah Jabatan Baru',
  'Edit Position': 'Ubah Informasi Jabatan',
  'Units of Measurement': 'Satuan Ukuran Barang & Inventaris',
  'Create UOM': 'Tambah Satuan Ukuran Baru',
  'Edit UOM': 'Ubah Satuan Ukuran',
  'Assets': 'Monitoring & Manajemen Aset Perusahaan',
  'Tambah Aset': 'Registrasi Aset Baru ke Sistem',
  'Ubah Aset': 'Ubah Informasi Data Aset',
  'Detail Aset': 'Detail Spesifikasi & Riwayat Aset',
  'Stock Monitor': 'Pemantauan Stok Real-time & Mutasi',
  'Buat Stok Baru': 'Registrasi Stok Barang Baru',
  'Ubah Data Stok': 'Ubah Informasi Data Stok',
  'Detail & Mutasi Stok': 'Log Riwayat Mutasi & Detail Stok',
  'Asset Transfers': 'Mutasi & Transfer Aset Antar Lokasi',
  'Buat Mutasi Aset': 'Ajukan Transfer Aset Baru',
  'Detail Mutasi Aset': 'Detail Log Transfer Aset',
  'Daftar Pembelian': 'Manajemen Order Pembelian & Pengadaan',
  'Buat Pembelian Baru': 'Buat Form Order Pembelian Baru',
  'Edit Pembelian': 'Ubah Data Purchase Order',
  'Detail Pembelian': 'Detail Informasi Order Pembelian',
  'Purchase Marketing': 'Manajemen Order Pembelian & Pengadaan Marketing',
  'Buat Purchase Marketing': 'Buat Form Order Pembelian Marketing Baru',
  'Edit Purchase Marketing': 'Ubah Data Purchase Order Marketing',
  'Detail Purchase Marketing': 'Detail Informasi Order Pembelian Marketing',
  'Requests': 'Manajemen Permintaan Barang',
  'Buat Permintaan Barang': 'Ajukan Permintaan Barang Departemen',
  'Detail Permintaan Barang': 'Detail Status Permintaan Barang',
  'Pengajuan Marketing': 'Request Toko / Provinsi Marketing',
  'Buat Pengajuan Marketing': 'Ajukan Permintaan Barang Marketing',
  'Detail Pengajuan Marketing': 'Detail Status Pengajuan Marketing',
  'Edit Pengajuan Marketing': 'Ubah Data Pengajuan Marketing',
  'Maintenance': 'Manajemen Perbaikan & Pemeliharaan Aset',
  'Tambah Pengajuan Maintenance': 'Ajukan Tiket Perbaikan Aset',
  'Detail Maintenance': 'Detail & Status Tiket Perbaikan',
  'Schedules': 'Penjadwalan Pemeliharaan & Armada',
  'Tambah Jadwal': 'Buat Jadwal Pemeliharaan Baru',
  'Ubah Jadwal': 'Ubah Jadwal Pemeliharaan',
  'Vehicles': 'Kelola Armada Kendaraan Operasional',
  'Tambah Kendaraan': 'Registrasi Kendaraan Baru',
  'Ubah Kendaraan': 'Ubah Informasi Data Kendaraan',
  'Licenses': 'Manajemen Lisensi & Sertifikasi',
  'Tambah Lisensi': 'Registrasi Lisensi Baru',
  'Ubah Lisensi': 'Ubah Data Lisensi',
  'Reminders': 'Manajemen Pengingat & Notifikasi',
  'Tambah Pengingat': 'Buat Pengingat Baru',
  'Ubah Pengingat': 'Ubah Konfigurasi Pengingat',
  'OPA Stores': 'Kelola Daftar Toko OPA',
  'Sales Targets': 'Target Penjualan & Distribusi Toko',
  'SOG': 'Standard Operating Guideline Toko',
  'Create SOG': 'Tambah Guideline Baru',
  'Edit SOG': 'Ubah Guideline Toko',
  'Regulations': 'Regulasi & Ketentuan Toko OPA',
  'Create Regulation': 'Tambah Regulasi Baru',
  'Edit Regulation': 'Ubah Regulasi Toko',
  'Audit Templates': 'Template Formulir Audit Toko',
  'Create Audit Template': 'Buat Template Audit Baru',
  'Edit Audit Template': 'Ubah Template Audit',
  'Violations': 'Pencatatan Pelanggaran Toko',
  'Record Violation': 'Catat Pelanggaran Baru',
  'Edit Violation': 'Ubah Data Pelanggaran',
  'Audits': 'Daftar Audit Operasional Toko',
  'Isi Form Audit': 'Formulir Penilaian Audit Lapangan',
  'Detail Audit': 'Laporan Hasil Audit Operasional',
  'Review Assignment': 'Tinjau Tugas Audit Toko',
  'Bonus': 'Perhitungan Bonus & Insentif Karyawan Toko',
  'Produktivitas': 'Kelola Kinerja & Produktivitas Toko',
  'Buat Periode Produktivitas': 'Buat Periode Kinerja Baru',
  'Edit Periode Produktivitas': 'Ubah Periode Produktivitas',
  'Detail Produktivitas': 'Laporan Detail Produktivitas Karyawan',
  'OPA Dashboard': 'Analisis & Pemantauan Performa OPA',
  'Detail Toko OPA': 'Detail Performa Toko OPA',
  'Tier Toko': 'Klasifikasi & Tiering Toko',
  'Create Tier Toko': 'Tambah Tier Toko Baru',
  'Edit Tier Toko': 'Ubah Tier Toko',
  'CP Categories': 'Kategori Profil Perusahaan',
  'Tambah Kategori CP': 'Tambah Kategori Profil Baru',
  'Edit Kategori CP': 'Ubah Kategori Profil',
  'Banners': 'Manajemen Banner Promosi & Web',
  'Tambah Banner CP': 'Tambah Banner Web Baru',
  'Edit Banner CP': 'Ubah Banner Web',
  'Memberships': 'Program Membership & Loyalitas',
  'Tambah Membership CP': 'Tambah Program Member Baru',
  'Edit Membership CP': 'Ubah Program Member',
  'Products': 'Manajemen Katalog Produk Web',
  'Tambah Produk CP': 'Tambah Produk Baru',
  'Edit Produk CP': 'Ubah Produk Katalog',
  'News': 'Berita & Publikasi Perusahaan',
  'Tambah Berita CP': 'Tambah Berita Baru',
  'Edit Berita CP': 'Ubah Berita',
  'Careers': 'Lowongan Kerja & Karir Perusahaan',
  'Tambah Lowongan CP': 'Tambah Lowongan Karir Baru',
  'Edit Lowongan CP': 'Ubah Lowongan Karir',
  'CP Stores': 'Manajemen Lokasi Toko Retail',
  'Tambah Toko CP': 'Tambah Toko Baru',
  'Edit Toko CP': 'Ubah Toko Retail',
  'My Tasks': 'Daftar Pekerjaan & Tugas Pribadi',
  'Boards': 'Papan Kolaborasi Tugas Tim',
  'Board Detail': 'Detail Board & Kanban View',
  'Team Tasks': 'Manajemen Tugas Anggota Tim',
  'WhatsApp Broadcast': 'Mass Broadcast WhatsApp',
  'Buat Broadcast': 'Buat Broadcast WhatsApp Baru',
  'Email Broadcast': 'Mass Broadcast Email',
  'Daftar Resign': 'Data Pengajuan Resign Karyawan',
  'Peraturan Perusahaan': 'Ketentuan & Kebijakan Internal',
  'Pelanggaran Karyawan': 'Log Pelanggaran & Tindakan Disiplin',
  'Data ST/SP': 'Surat Teguran & Surat Peringatan Karyawan'
}

const pageTitle = computed(() => {
  return route.meta.title || route.name || 'ElectroHub'
})

const pageSubtitle = computed(() => {
  if (route.meta.subtitle) return route.meta.subtitle
  if (route.meta.description) return route.meta.description
  const title = String(route.meta.title || route.name || '')
  return subtitleMap[title] || 'Sistem ERP Terintegrasi ElectroHub'
})

const handleToggle = () => {
  if (window.innerWidth >= 1024) {
    toggleSidebar()
  } else {
    toggleMobileSidebar()
  }
}
</script>


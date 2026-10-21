<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div class="mb-8 flex items-center gap-4">
        <button @click="router.back()" class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h2 class="text-2xl font-black text-gray-800 dark:text-white leading-none">{{ isEdit ? 'Edit Lokasi Absen' : 'Tambah Lokasi Absen' }}</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-8 space-y-5">
          <div>
            <label class="section-label">Location Setting Name</label>
            <input v-model="form.setting_name" type="text" class="input-base" placeholder="mis. GUDANG JABO" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="section-label">Type *</label>
              <input v-model.number="form.type" type="number" min="1" class="input-base" />
            </div>
            <div>
              <label class="section-label">Radius (Meter) *</label>
              <input v-model.number="form.radius_meters" type="number" min="1" class="input-base" @input="updateCircle" />
            </div>
          </div>
          <div>
            <label class="section-label">Location Name *</label>
            <input v-model="form.name" type="text" class="input-base" placeholder="mis. OFFICE JABO" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="section-label">Latitude *</label>
              <input v-model.number="form.latitude" type="number" step="0.0000001" class="input-base font-mono" @change="syncMapFromInputs" required />
            </div>
            <div>
              <label class="section-label">Longitude *</label>
              <input v-model.number="form.longitude" type="number" step="0.0000001" class="input-base font-mono" @change="syncMapFromInputs" required />
            </div>
          </div>
          <button type="button" @click="useMyLocation" class="btn-outline w-full">
            <LocateFixed class="w-4 h-4" /> Lokasi Saya
          </button>

          <div class="flex justify-end gap-4 pt-4">
            <button @click="router.back()" class="btn-outline px-8 h-11">Batal</button>
            <button @click="handleSubmit" :disabled="submitting" class="btn-primary px-8 h-11">
              {{ submitting ? 'Menyimpan...' : isEdit ? 'Update Lokasi' : 'Simpan Lokasi' }}
            </button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-xs p-4">
          <div id="map-lokasi" class="w-full rounded-2xl overflow-hidden" style="height: 420px"></div>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3 px-2">Klik peta atau geser marker untuk mengatur titik geofence</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { AttendanceLocationService } from './attendanceLocation.service'
import { ArrowLeft, LocateFixed } from 'lucide-vue-next'
import { Alert } from '@/plugins/sweetalert'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)

const DEFAULT_CENTER = [-6.2088, 106.8456] // Jakarta fallback

const form = reactive({
  setting_name: '',
  type: 1,
  name: '',
  latitude: DEFAULT_CENTER[0],
  longitude: DEFAULT_CENTER[1],
  radius_meters: 50,
})

let map = null
let marker = null
let circle = null

const initMap = () => {
  map = L.map('map-lokasi').setView([form.latitude, form.longitude], 16)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  marker = L.marker([form.latitude, form.longitude], { draggable: true }).addTo(map)
  circle = L.circle([form.latitude, form.longitude], { radius: form.radius_meters, color: '#627EF2', fillOpacity: 0.15 }).addTo(map)

  marker.on('dragend', () => {
    const pos = marker.getLatLng()
    form.latitude = Number(pos.lat.toFixed(7))
    form.longitude = Number(pos.lng.toFixed(7))
    circle.setLatLng(pos)
  })

  map.on('click', (e) => {
    form.latitude = Number(e.latlng.lat.toFixed(7))
    form.longitude = Number(e.latlng.lng.toFixed(7))
    marker.setLatLng(e.latlng)
    circle.setLatLng(e.latlng)
  })
}

const syncMapFromInputs = () => {
  if (!map || !form.latitude || !form.longitude) return
  const latlng = [form.latitude, form.longitude]
  marker.setLatLng(latlng)
  circle.setLatLng(latlng)
  map.setView(latlng)
}

const updateCircle = () => {
  if (circle) circle.setRadius(form.radius_meters || 0)
}

const useMyLocation = () => {
  if (!navigator.geolocation) {
    Alert.error('Browser tidak mendukung geolocation')
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.latitude = Number(pos.coords.latitude.toFixed(7))
      form.longitude = Number(pos.coords.longitude.toFixed(7))
      syncMapFromInputs()
    },
    () => Alert.error('Gagal mengambil lokasi saat ini'),
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

const handleSubmit = async () => {
  if (!form.name || !form.latitude || !form.longitude || !form.radius_meters) {
    Alert.error('Mohon lengkapi data wajib!')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await AttendanceLocationService.update(route.params.id, form)
      Alert.success('Lokasi berhasil diperbarui')
    } else {
      await AttendanceLocationService.create(form)
      Alert.success('Lokasi absen berhasil ditambahkan')
    }
    router.push({ name: 'HrAttendanceLocations' })
  } catch (err) {
    Alert.error('Gagal menyimpan lokasi', err.response?.data?.message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const data = await AttendanceLocationService.getOne(route.params.id)
      Object.assign(form, {
        setting_name: data.setting_name || '',
        type: data.type || 1,
        name: data.name,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        radius_meters: data.radius_meters,
      })
    } catch (err) {
      Alert.error('Gagal memuat data lokasi')
    }
  }
  await nextTick()
  initMap()
})

onBeforeUnmount(() => {
  if (map) map.remove()
})
</script>

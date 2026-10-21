<template>
  <div class="bg-fixed"></div>
  <div class="bg-overlay"></div>

  <div class="content">
    <header class="header">
      <div class="header-eyebrow">ElectroHub Indonesia</div>
      <h1 class="header-title">Admin<br /><em>Pusat</em></h1>
      <p class="header-desc">Direktori kontak eksklusif untuk staf toko.</p>
    </header>

    <div class="page">
      <!-- Search screen -->
      <StoreDropdown v-if="!selectedStore" @select="onSelect" />

      <!-- Detail screen -->
      <StoreDetail v-else :store="selectedStore" :groups="groups" :pengaduanHR="pengaduanHR" @back="onBack" @copy="onCopy" />

      <footer>Admin Pusat · Hak Cipta &copy; ElectroHub Indonesia</footer>
    </div>
  </div>

  <!-- Toast -->
  <div id="toast" :class="{ show: toastVisible }">{{ toastText }}</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StoreDropdown from '../../components/contact/StoreDropdown.vue'
import StoreDetail from '../../components/contact/StoreDetail.vue'
import { usePetals } from '../../composables/usePetals.js'
import { useToast } from '../../composables/useToast.js'
import { ContactPublicService } from './contact.service.js'

usePetals()
const { toastText, toastVisible, showToast } = useToast()

const selectedStore = ref(null)
const groups = ref([])
const pengaduanHR = ref('08139236214')

onMounted(async () => {
  try {
    const data = await ContactPublicService.getStoreContacts()
    groups.value = data.groups || []
    pengaduanHR.value = data.pengaduanHR || '08139236214'
  } catch (err) {
    console.error('Failed to fetch contact data:', err)
  }
})

function onSelect(store) {
  selectedStore.value = store
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onBack() {
  selectedStore.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onCopy(num) {
  try {
    navigator.clipboard.writeText(num)
  } catch {}
  showToast('Nomor ' + num + ' disalin')
}
</script>

<style src="@/assets/styleContact.css"></style>
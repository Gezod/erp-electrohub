import './assets/main.css'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'

import { createApp } from 'vue'
import App from './App.vue'

// Import plugin satu per satu secara eksplisit
import setupPinia from './plugins/pinia'
import setupRouter from './plugins/router'
import setupDirectives from './plugins/directive'
import setupApexCharts from './plugins/apexcharts'

const app = createApp(App)

// URUTAN INI SANGAT KRUSIAL:
// 1. Daftarkan Pinia (Store) TERLEBIH DAHULU agar router/axios/directive bisa menggunakannya nanti
setupPinia(app)

// 2. Daftarkan Directives
app.use(setupDirectives)
setupApexCharts(app)

// 3. Daftarkan Router SETELAH Pinia
setupRouter(app)

app.mount('#app')

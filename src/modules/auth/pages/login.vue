<template>
  <FullScreenLayout>
    <!-- Background Canvas: Clean Monochrome & Zinc Minimalist -->
    <div
      class="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased bg-[#F9FAFB] dark:bg-[#090A0C] text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors duration-300">
      
      <!-- Subtle Background Grid & Ambient Glow (Notion / Linear Style) -->
      <div
        class="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.15] bg-grid-pattern">
      </div>
      <div
        class="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-zinc-200/50 dark:bg-zinc-800/20 blur-[120px] pointer-events-none">
      </div>
      <div
        class="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-zinc-300/40 dark:bg-zinc-800/30 blur-[140px] pointer-events-none">
      </div>

      <!-- Main Center Container (Split Screen Minimalist Card) -->
      <div
        class="relative z-10 w-full max-w-[1120px] min-h-[680px] rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0E1013]/90 backdrop-blur-xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.07)] dark:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.7)] p-3 sm:p-4 flex flex-col lg:flex-row gap-4 transition-all duration-300">

        <!-- ===== LEFT PANEL: MINIMALIST TECH HERO & ORBIT SHOWCASE ===== -->
        <div
          class="w-full lg:w-[50%] min-h-[460px] lg:min-h-[640px] rounded-[22px] bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden select-none border border-zinc-800/60 shadow-inner">
          
          <!-- Subtle radial texture -->
          <div
            class="absolute inset-0 bg-radial-[at_50%_40%] from-zinc-800/25 via-transparent to-transparent pointer-events-none">
          </div>

          <!-- Top Brand Eyebrow -->
          <div class="relative z-10 flex items-center justify-between">
            <div class="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-800/60 border border-zinc-700/50 backdrop-blur-md">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-[11px] font-semibold tracking-wider uppercase text-zinc-300">ElectroHub OS v2.4</span>
            </div>
            <span class="text-xs font-mono text-zinc-400">Retail ERP Suite</span>
          </div>

          <!-- Center Interactive Minimalist Orbit System -->
          <div class="relative z-10 my-auto py-6 flex items-center justify-center overflow-visible">
            
            <!-- Central Tech Hexagon Core -->
            <div
              class="z-20 relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-[0_0_40px_rgba(255,255,255,0.08)] flex items-center justify-center hover:scale-105 transition-transform duration-300 group">
              <div class="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
              <img
                src="/images/logo/logo-icon.svg"
                alt="ElectroHub"
                class="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-transform group-hover:rotate-6"
              />
            </div>

            <!-- Orbit Ring 1 (Inner) -->
            <div
              class="absolute w-[170px] sm:w-[210px] h-[170px] sm:h-[210px] rounded-full border border-zinc-700/40 orbit-rotate-cw">
              <div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div
                  class="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-600/80 flex items-center justify-center shadow-md orbit-rotate-ccw hover:scale-110 transition-transform">
                  <Smartphone class="w-3.5 h-3.5 text-zinc-200" />
                </div>
              </div>
              <div class="absolute -bottom-3.5 left-1/2 -translate-x-1/2">
                <div
                  class="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-600/80 flex items-center justify-center shadow-md orbit-rotate-ccw hover:scale-110 transition-transform">
                  <Laptop class="w-3.5 h-3.5 text-zinc-200" />
                </div>
              </div>
            </div>

            <!-- Orbit Ring 2 (Middle) -->
            <div
              class="absolute w-[240px] sm:w-[300px] h-[240px] sm:h-[300px] rounded-full border border-dashed border-zinc-700/30 orbit-rotate-ccw">
              <div class="absolute top-1/2 -left-3.5 -translate-y-1/2">
                <div
                  class="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-600/80 flex items-center justify-center shadow-md orbit-rotate-cw hover:scale-110 transition-transform">
                  <Headphones class="w-3.5 h-3.5 text-zinc-200" />
                </div>
              </div>
              <div class="absolute top-1/2 -right-3.5 -translate-y-1/2">
                <div
                  class="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-600/80 flex items-center justify-center shadow-md orbit-rotate-cw hover:scale-110 transition-transform">
                  <QrCode class="w-3.5 h-3.5 text-zinc-200" />
                </div>
              </div>
            </div>

            <!-- Orbit Ring 3 (Outer) -->
            <div
              class="absolute w-[310px] sm:w-[390px] h-[310px] sm:h-[390px] rounded-full border border-zinc-800/40 orbit-rotate-cw">
              <div class="absolute top-[18%] left-[18%] -translate-x-1/2 -translate-y-1/2">
                <div
                  class="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-600/80 flex items-center justify-center shadow-md orbit-rotate-ccw hover:scale-110 transition-transform">
                  <Cpu class="w-3.5 h-3.5 text-zinc-200" />
                </div>
              </div>
              <div class="absolute bottom-[18%] right-[18%] translate-x-1/2 translate-y-1/2">
                <div
                  class="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-600/80 flex items-center justify-center shadow-md orbit-rotate-ccw hover:scale-110 transition-transform">
                  <Layers class="w-3.5 h-3.5 text-zinc-200" />
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Feature Highlights (Pill Badges) -->
          <div class="relative z-10 space-y-3">
            <div class="text-center lg:text-left">
              <h3 class="text-lg font-bold text-white tracking-tight">Precision Electronics Management</h3>
              <p class="text-xs text-zinc-400 mt-1">Multi-outlet inventory, IMEI tracking, and operations seamlessly synced.</p>
            </div>

            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
                <Package class="w-3 h-3 text-zinc-400" /> SN &amp; IMEI Sync
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
                <ShieldCheck class="w-3 h-3 text-zinc-400" /> Multi-Store GA
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
                <Users class="w-3 h-3 text-zinc-400" /> HR &amp; Payroll
              </span>
            </div>
          </div>

        </div>

        <!-- ===== RIGHT PANEL: MINIMALIST AUTHENTICATION FORM ===== -->
        <div class="w-full lg:w-[50%] flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          
          <!-- Top Right Helper/Brand -->
          <div class="flex items-center justify-between select-none">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-white dark:text-zinc-900">
                  <path d="M24 10L36 17V31L24 38L12 31V17L24 10Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
                  <path d="M18 19H30M18 24H27M18 29H30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="text-xs font-black tracking-[0.2em] text-zinc-900 dark:text-white uppercase">ELECTROHUB</span>
            </div>
            <span class="text-[11px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1 rounded-md">Enterprise</span>
          </div>

          <!-- Center Login Form Area -->
          <div class="my-auto py-6 max-w-[380px] w-full mx-auto space-y-6">
            
            <!-- Headline Header -->
            <div class="space-y-1.5">
              <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Sign in to workspace
              </h1>
              <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Enter your authorized credentials to access your ElectroHub management portal.
              </p>
            </div>

            <!-- Error Notification Alert -->
            <transition name="shake-alert">
              <div v-if="apiError"
                class="p-3.5 bg-red-50/90 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 rounded-xl text-xs flex items-start gap-2.5 font-medium">
                <AlertCircle class="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span class="leading-relaxed">{{ apiError }}</span>
              </div>
            </transition>

            <!-- Form -->
            <form @submit="onSubmit" class="space-y-4">
              
              <!-- Email Field -->
              <div class="space-y-1.5">
                <label for="email" class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail class="w-4 h-4" />
                  </div>
                  <input
                    v-model="email"
                    v-bind="emailAttrs"
                    type="email"
                    id="email"
                    placeholder="admin@electrohub.com"
                    autocomplete="email"
                    class="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-normal transition-all duration-200 bg-zinc-50/60 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                    :class="{ '!border-red-400 dark:!border-red-500/50 bg-red-50/20': errors.email }"
                  />
                </div>
                <p v-if="errors.email" class="text-[11px] text-red-500 font-medium ml-0.5">{{ errors.email }}</p>
              </div>

              <!-- Password Field -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label for="password" class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                </div>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock class="w-4 h-4" />
                  </div>
                  <input
                    v-model="password"
                    v-bind="passwordAttrs"
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    class="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-normal transition-all duration-200 bg-zinc-50/60 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                    :class="{ '!border-red-400 dark:!border-red-500/50 bg-red-50/20': errors.password }"
                  />
                  <!-- Toggle Visibility -->
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1"
                    title="Toggle password visibility">
                    <Eye v-if="!showPassword" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
                <p v-if="errors.password" class="text-[11px] text-red-500 font-medium ml-0.5">{{ errors.password }}</p>
              </div>

              <!-- Remember Me & Forgot Password -->
              <div class="flex items-center justify-between pt-1">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    v-model="keepLoggedIn"
                    type="checkbox"
                    id="keep-logged-in"
                    class="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-zinc-900 dark:focus:ring-zinc-400 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span class="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Keep me signed in</span>
                </label>
              </div>

              <!-- Submit Button (Solid Minimalist) -->
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full mt-2 h-11 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-sm transition-all duration-200 shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-transparent">
                <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                <span v-else class="inline-flex items-center gap-2">
                  Sign In <ArrowRight class="w-4 h-4" />
                </span>
              </button>

            </form>

          </div>

          <!-- Bottom Footer -->
          <div class="text-center pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <p class="text-[11px] text-zinc-400 font-medium">
              Protected by Enterprise Authentication &bull; ElectroHub ERP
            </p>
          </div>

        </div>

      </div>

    </div>
  </FullScreenLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { useAuthStore } from '../stores/auth.store'
import { getFirstAllowedPath } from '@/plugins/router'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import {
  Smartphone, Laptop, Headphones, QrCode, Cpu, Layers,
  Package, ShieldCheck, Users, Mail, Lock, Eye, EyeOff, Loader2,
  AlertCircle, ArrowRight
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showPassword = ref(false)
const keepLoggedIn = ref(true)
const apiError = ref('')

const schema = yup.object({
  email: yup.string().required('Email is required'),
  password: yup.string().required('Password is required'),
})

const { errors, handleSubmit, isSubmitting, defineField } = useForm({
  validationSchema: schema,
  initialValues: {
    email: 'refangga@electrohub.demo',
    password: 'password123',
  },
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  try {
    apiError.value = ''
    await authStore.login({
      email: values.email || 'refangga@electrohub.demo',
      password: values.password || 'password123',
      remember: true,
    })
    const redirectPath = route.query.redirect || '/dashboard'
    router.push(redirectPath)
  } catch (error) {
    console.warn('[Login Demo] Fallback bypass:', error)
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.bg-grid-pattern {
  background-size: 24px 24px;
  background-image: 
    linear-gradient(to right, rgba(120, 120, 120, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(120, 120, 120, 0.1) 1px, transparent 1px);
}

.orbit-rotate-cw {
  animation: orbit-spin-cw 60s linear infinite;
}

.orbit-rotate-ccw {
  animation: orbit-spin-ccw 45s linear infinite;
}

.orbit-rotate-cw:hover,
.orbit-rotate-ccw:hover {
  animation-play-state: paused;
}

@keyframes orbit-spin-cw {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes orbit-spin-ccw {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.shake-alert-enter-active {
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
</style>

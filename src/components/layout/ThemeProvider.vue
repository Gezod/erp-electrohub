<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, computed } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

const isDarkMode = computed(() => theme.value === 'dark')

const applyTheme = (t: Theme) => {
  theme.value = t
  if (t === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', t)
}

const toggleTheme = () => {
  const nextTheme: Theme = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme(nextTheme)
}

onMounted(() => {
  const saved = localStorage.getItem('theme') as Theme | null
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const initialTheme: Theme = saved === 'dark' || (!saved && prefersDark) ? 'dark' : 'light'
  applyTheme(initialTheme)
})

provide('theme', {
  isDarkMode,
  toggleTheme,
})
</script>

<script lang="ts">
import { inject } from 'vue'

export function useTheme() {
  const theme = inject('theme')
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return theme
}
</script>

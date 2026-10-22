<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, computed } from 'vue'

type Theme = 'light'

const theme = ref<Theme>('light')

const isDarkMode = computed(() => false)

const applyTheme = () => {
  theme.value = 'light'
  document.documentElement.classList.remove('dark')
  localStorage.setItem('theme', 'light')
}

const toggleTheme = () => {
  applyTheme()
}

onMounted(() => {
  applyTheme()
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

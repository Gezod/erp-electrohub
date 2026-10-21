import { ref } from 'vue'

export function useToast() {
  const toastText = ref('')
  const toastVisible = ref(false)
  let timer = null

  function showToast(msg) {
    toastText.value = msg
    toastVisible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { toastVisible.value = false }, 2500)
  }

  return { toastText, toastVisible, showToast }
}

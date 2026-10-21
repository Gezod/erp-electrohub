<template>
  <div class="relative" v-click-outside="closeDropdown" ref="dropdown">
    <!-- Dropdown Trigger Button -->
    <button @click="toggleDropdown($event)" :class="buttonClass">
      <slot name="icon">
        <!-- Default icon -->
        <svg
          class="fill-current"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
            fill="currentColor"
          />
        </svg>
      </slot>
    </button>

    <!-- Dropdown Menu -->
    <teleport to="body">
      <div v-if="open" :class="menuClass" :style="menuStyle">
        <slot name="menu">
          <!-- Default menu items -->
          <template v-for="(item, index) in menuItems">
            <router-link
              v-if="item.to"
              :key="`router-${index}`"
              :to="item.to"
              @click.native="handleMenuItemClick(item.onClick)"
              :class="itemClass"
            >
              {{ item.label }}
            </router-link>

            <button
              v-else
              :key="`button-${index}`"
              @click="handleMenuItemClick(item.onClick)"
              :class="itemClass"
            >
              {{ item.label }}
            </button>
          </template>
        </slot>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, onUnmounted } from 'vue'
import vClickOutside from './v-click-outside.vue'

const props = defineProps({
  menuItems: {
    type: Array,
    default: () => [],
  },
  buttonClass: {
    type: String,
    default: 'text-gray-500 dark:text-gray-400',
  },
  menuClass: {
    type: String,
    default:
      'w-40 p-2 space-y-1 bg-white border border-gray-200 rounded-2xl shadow-lg dark:border-gray-800 dark:bg-gray-dark',
  },
  itemClass: {
    type: String,
    default:
      'flex w-full px-3 py-2 font-medium text-left text-gray-500 rounded-lg text-theme-xs hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300',
  },
})

const open = ref(false)
const menuStyle = ref({})

// Close on window scroll to keep fixed positioning aligned
const handleScroll = () => {
  if (open.value) {
    closeDropdown()
  }
}

const toggleDropdown = (event) => {
  open.value = !open.value
  if (open.value) {
    window.addEventListener('scroll', handleScroll, { passive: true })
    nextTick(() => {
      const rect = event.currentTarget.getBoundingClientRect()
      
      // Parse width from menuClass (e.g. w-[180px] -> 180, w-[140px] -> 140)
      let width = 160 // default w-40
      const widthMatch = props.menuClass.match(/w-\[(\d+)px\]/)
      if (widthMatch) {
        width = parseInt(widthMatch[1], 10)
      } else if (props.menuClass.includes('w-40')) {
        width = 160
      }
      
      // Right align relative to the button
      const left = Math.max(10, rect.right - width)
      
      // Check if there is enough space below
      const dropdownHeight = 110 // average height for 2 items
      const showAbove = rect.bottom + dropdownHeight > window.innerHeight
      
      menuStyle.value = {
        position: 'fixed',
        top: showAbove ? `${rect.top - dropdownHeight - 4}px` : `${rect.bottom + 4}px`,
        left: `${left}px`,
        width: `${width}px`,
        right: 'auto',
        bottom: 'auto',
        zIndex: 99999
      }
    })
  } else {
    window.removeEventListener('scroll', handleScroll)
  }
}

const closeDropdown = () => {
  open.value = false
  window.removeEventListener('scroll', handleScroll)
}

const handleMenuItemClick = (callback) => {
  if (typeof callback === 'function') {
    callback() // Execute the provided callback function
  }
  closeDropdown() // Close the dropdown after the item is clicked
}

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<script>
export default {
  directives: {
    clickOutside: vClickOutside,
  },
}
</script>

import { onMounted, onUnmounted } from 'vue'

const PETALS = ['🌸', '✿', '❀', '🌺']

function spawnPetal() {
  const p = document.createElement('div')
  p.className = 'petal'
  p.textContent = PETALS[Math.floor(Math.random() * PETALS.length)]
  const duration = 12 + Math.random() * 8
  const delay    = Math.random() * 2
  const fontSize = 12 + Math.random() * 12
  const leftPos  = Math.random() * 100
  p.style.cssText = `left:${leftPos}vw;top:-40px;font-size:${fontSize}px;animation-duration:${duration}s;animation-delay:${delay}s;`
  document.body.appendChild(p)
  setTimeout(() => p.remove(), (duration + delay) * 1000 + 500)
}

export function usePetals() {
  let interval = null

  onMounted(() => {
    for (let i = 0; i < 5; i++) spawnPetal()
    interval = setInterval(spawnPetal, 4000)
  })

  onUnmounted(() => {
    clearInterval(interval)
  })
}

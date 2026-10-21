import { ref } from 'vue'

const MAX_DIMENSION = 1280
const JPEG_QUALITY = 0.7

// Client-side compress (max 1280px, JPEG q0.7) + burn a timestamp/GPS watermark into the
// bottom of the frame, mirroring the source public check-in form's own canvas pipeline.
export function usePhotoCapture() {
  const processing = ref(false)

  const compressAndWatermark = (file, watermarkLines = []) =>
    new Promise((resolve, reject) => {
      processing.value = true
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        try {
          let { width, height } = img
          if (width >= height && width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width)
            width = MAX_DIMENSION
          } else if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height)
            height = MAX_DIMENSION
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          if (watermarkLines.length) {
            const fontSize = Math.max(13, Math.round(width * 0.026))
            const lineHeight = fontSize * 1.4
            const panelHeight = watermarkLines.length * lineHeight + 16

            const gradient = ctx.createLinearGradient(0, height - panelHeight, 0, height)
            gradient.addColorStop(0, 'rgba(17,24,39,0)')
            gradient.addColorStop(1, 'rgba(17,24,39,0.78)')
            ctx.fillStyle = gradient
            ctx.fillRect(0, height - panelHeight, width, panelHeight)

            ctx.fillStyle = '#627EF2'
            ctx.fillRect(0, height - panelHeight, 4, panelHeight)

            ctx.fillStyle = '#ffffff'
            ctx.font = `${fontSize}px sans-serif`
            ctx.textBaseline = 'top'
            watermarkLines.forEach((line, i) => {
              ctx.fillText(line, 14, height - panelHeight + 8 + i * lineHeight)
            })
          }

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url)
              processing.value = false
              if (!blob) return reject(new Error('Gagal memproses foto'))
              resolve(new File([blob], 'absen.jpg', { type: 'image/jpeg' }))
            },
            'image/jpeg',
            JPEG_QUALITY
          )
        } catch (err) {
          URL.revokeObjectURL(url)
          processing.value = false
          reject(err)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        processing.value = false
        reject(new Error('Gagal memuat foto'))
      }

      img.src = url
    })

  return { processing, compressAndWatermark }
}

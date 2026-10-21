import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

/**
 * escapeHtml
 * Meng-escape karakter HTML spesial untuk mencegah XSS ketika string
 * caller-supplied (title/text/message) disisipkan ke innerHTML atau
 * opsi `html:` SweetAlert2.
 */
const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Theme Helper
 * Mendeteksi mode tema aktif (light/dark)
 */
const getThemeConfig = () => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    background: isDark ? '#0f172a' : '#ffffff', // Slate-900 atau Putih
    color: isDark ? '#f1f5f9' : '#1e293b',      // Slate-100 atau Slate-800
    confirmButtonColor: '#627EF2',              // Brand Primary Figma Accent Blue
    cancelButtonColor: isDark ? '#334155' : '#94a3b8',
    iconColor: '#627EF2'
  }
}

/**
 * Alert Helper
 * Menyediakan wrapper standar untuk SweetAlert2 dengan tema premium yang konsisten.
 */
export const Alert = {
  /**
   * success
   * Alert sukses standar (modal/toast).
   */
  success: (title, text = '') => {
    Alert.toast(title, text, 'success')
    return Promise.resolve()
  },

  /**
   * error
   * Alert error standar (modal/toast).
   */
  error: (title, text = '') => {
    Alert.toast(title, text, 'error')
    return Promise.resolve()
  },

  /**
   * warning
   * Alert peringatan standar (modal dengan GlossyButton).
   */
  warning: (title, text = '', confirmButtonText = 'Mengerti') => {
    return new Promise((resolve) => {
      const isDark = document.documentElement.classList.contains('dark')
      const rand = Math.random().toString(36).substring(2, 9)

      const backdrop = document.createElement('div')
      backdrop.className = 'fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate__animated animate__fadeIn'

      const borderClass = isDark ? 'border-gray-800' : 'border-[#e0e0e0]'
      const bgClass = isDark ? 'bg-gray-950' : 'bg-white'
      const textBlackClass = isDark ? 'text-white' : 'text-[#0a0a0a]'
      const textGrayClass = isDark ? 'text-gray-400' : 'text-[#666]'

      const warningDiamondSvg = `<svg class="w-12 h-12 text-[#F59E0B]" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M51.4785 25.5329L30.4675 4.51973C29.8118 3.86785 28.9247 3.50195 28 3.50195C27.0754 3.50195 26.1883 3.86785 25.5325 4.51973L4.53254 25.5329C3.88067 26.1886 3.51477 27.0757 3.51477 28.0004C3.51477 28.925 3.88067 29.8121 4.53254 30.4679L25.5435 51.481C26.1993 52.1329 27.0863 52.4987 28.011 52.4987C28.9356 52.4987 29.8227 52.1329 30.4785 51.481L51.4894 30.4679C52.1413 29.8121 52.5072 28.925 52.5072 28.0004C52.5072 27.0757 52.1413 26.1886 51.4894 25.5329H51.4785ZM26.25 17.5004C26.25 17.0362 26.4344 16.5911 26.7626 16.2629C27.0908 15.9347 27.5359 15.7504 28 15.7504C28.4642 15.7504 28.9093 15.9347 29.2375 16.2629C29.5657 16.5911 29.75 17.0362 29.75 17.5004V29.7504C29.75 30.2145 29.5657 30.6596 29.2375 30.9878C28.9093 31.316 28.4642 31.5004 28 31.5004C27.5359 31.5004 27.0908 31.316 26.7626 30.9878C26.4344 30.6596 26.25 30.2145 26.25 29.7504V17.5004ZM28 40.2504C27.4809 40.2504 26.9734 40.0964 26.5417 39.808C26.11 39.5195 25.7735 39.1095 25.5749 38.6299C25.3762 38.1502 25.3242 37.6224 25.4255 37.1132C25.5268 36.604 25.7768 36.1363 26.1439 35.7692C26.511 35.4021 26.9787 35.1521 27.4879 35.0508C27.9971 34.9495 28.5249 35.0015 29.0046 35.2002C29.4842 35.3988 29.8942 35.7353 30.1827 36.167C30.4711 36.5987 30.625 37.6254 30.625 37.6254C30.625 38.3215 30.3485 38.9892 29.8562 39.4815C29.3639 39.9738 28.6962 40.2504 28 40.2504Z" fill="#F59E0B" />
      </svg>`

      const card = document.createElement('div')
      card.className = `rounded-[12px] border border-solid ${borderClass} shadow-2xl overflow-hidden p-0 max-w-[440px] w-full font-sans ${bgClass} animate__animated animate__zoomIn animate__faster mx-4`
      card.innerHTML = `
        <div class="flex flex-col gap-[14px] items-center justify-center p-[20px] text-center border-b border-solid ${borderClass} w-full select-none">
          <div class="w-12 h-12 shrink-0">${warningDiamondSvg}</div>
          <div class="flex flex-col gap-[4px] items-center justify-center w-full leading-[1.4] not-italic">
            <p class="font-bold text-[16px] ${textBlackClass} leading-[1.3] w-full m-0 tracking-tight">${escapeHtml(title)}</p>
            <p class="font-normal text-[13px] ${textGrayClass} leading-[1.4] w-full m-0">${escapeHtml(text)}</p>
          </div>
        </div>
        <div class="flex flex-row gap-[8px] items-center justify-end px-[16px] py-[12px] bg-transparent w-full m-0">
          <button id="native-confirm-btn" class="border border-solid border-[rgba(255,255,255,0.3)] bg-gradient-to-b from-[#1e1e1e] to-[#0a0a0a] hover:from-[#2e2e2e] hover:to-[#1a1a1a] text-white rounded-[6px] transition-all duration-200 active:scale-95 shadow-[inset_0px_2px_2px_0px_rgba(255,255,255,0.05),inset_0px_2px_2px_0px_rgba(255,255,255,0.08)] relative overflow-hidden px-[16px] py-[8px] h-9 flex items-center justify-center gap-[6px] font-sans font-medium text-[13px] select-none outline outline-1 outline-offset-[-1px] outline-white/30 cursor-pointer shrink-0">
            <span class="relative z-10">${confirmButtonText}</span>
            <div class="-translate-x-1/2 absolute h-[21px] left-[calc(50%+0.5px)] top-[23px] w-[148px] z-10 pointer-events-none overflow-visible">
              <svg class="absolute inset-[-125.18%_-17.76%] w-[200.575px] h-[73.575px] opacity-60" preserveAspectRatio="none" viewBox="0 0 200.575 73.575" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#glow-filter-${rand})">
                  <ellipse cx="100.287" cy="36.7875" rx="74" ry="10.5" fill="url(#glow-gradient-${rand})"/>
                </g>
                <defs>
                  <filter id="glow-filter-${rand}" x="0" y="0" width="200.575" height="73.575" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feGaussianBlur stdDeviation="13.14" result="blur"/>
                  </filter>
                  <linearGradient id="glow-gradient-${rand}" x1="26.2875" y1="36.7875" x2="174.287" y2="36.7875" gradientUnits="userSpaceOnUse">
                    <stop stop-color="white"/>
                    <stop offset="1" stop-color="#D5E5F8"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </button>
        </div>
      `

      backdrop.appendChild(card)
      document.body.appendChild(backdrop)

      const cleanup = (value) => {
        backdrop.classList.replace('animate__fadeIn', 'animate__fadeOut')
        card.classList.replace('animate__zoomIn', 'animate__zoomOut')
        setTimeout(() => {
          backdrop.remove()
          resolve(value)
        }, 150)
      }

      card.querySelector('#native-confirm-btn').addEventListener('click', () => cleanup(true))
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) cleanup(true)
      })
    })
  },

  /**
   * info
   * Alert informasi standar (modal dengan GlossyButton).
   */
  info: (title, text = '', confirmButtonText = 'OK') => {
    return new Promise((resolve) => {
      const isDark = document.documentElement.classList.contains('dark')
      const rand = Math.random().toString(36).substring(2, 9)

      const backdrop = document.createElement('div')
      backdrop.className = 'fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate__animated animate__fadeIn'

      const borderClass = isDark ? 'border-gray-800' : 'border-[#e0e0e0]'
      const bgClass = isDark ? 'bg-gray-950' : 'bg-white'
      const textBlackClass = isDark ? 'text-white' : 'text-[#0a0a0a]'
      const textGrayClass = isDark ? 'text-gray-400' : 'text-[#666]'

      const infoSvg = `<svg class="w-12 h-12 text-[#3B82F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>`

      const card = document.createElement('div')
      card.className = `rounded-[12px] border border-solid ${borderClass} shadow-2xl overflow-hidden p-0 max-w-[440px] w-full font-sans ${bgClass} animate__animated animate__zoomIn animate__faster mx-4`
      card.innerHTML = `
        <div class="flex flex-col gap-[14px] items-center justify-center p-[20px] text-center border-b border-solid ${borderClass} w-full select-none">
          <div class="w-12 h-12 shrink-0">${infoSvg}</div>
          <div class="flex flex-col gap-[4px] items-center justify-center w-full leading-[1.4] not-italic">
            <p class="font-bold text-[16px] ${textBlackClass} leading-[1.3] w-full m-0 tracking-tight">${escapeHtml(title)}</p>
            <p class="font-normal text-[13px] ${textGrayClass} leading-[1.4] w-full m-0">${escapeHtml(text)}</p>
          </div>
        </div>
        <div class="flex flex-row gap-[8px] items-center justify-end px-[16px] py-[12px] bg-transparent w-full m-0">
          <button id="native-confirm-btn" class="border border-solid border-[rgba(255,255,255,0.3)] bg-gradient-to-b from-[#1e1e1e] to-[#0a0a0a] hover:from-[#2e2e2e] hover:to-[#1a1a1a] text-white rounded-[6px] transition-all duration-200 active:scale-95 shadow-[inset_0px_2px_2px_0px_rgba(255,255,255,0.05),inset_0px_2px_2px_0px_rgba(255,255,255,0.08)] relative overflow-hidden px-[16px] py-[8px] h-9 flex items-center justify-center gap-[6px] font-sans font-medium text-[13px] select-none outline outline-1 outline-offset-[-1px] outline-white/30 cursor-pointer shrink-0">
            <span class="relative z-10">${confirmButtonText}</span>
            <div class="-translate-x-1/2 absolute h-[21px] left-[calc(50%+0.5px)] top-[23px] w-[148px] z-10 pointer-events-none overflow-visible">
              <svg class="absolute inset-[-125.18%_-17.76%] w-[200.575px] h-[73.575px] opacity-60" preserveAspectRatio="none" viewBox="0 0 200.575 73.575" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#glow-filter-${rand})">
                  <ellipse cx="100.287" cy="36.7875" rx="74" ry="10.5" fill="url(#glow-gradient-${rand})"/>
                </g>
                <defs>
                  <filter id="glow-filter-${rand}" x="0" y="0" width="200.575" height="73.575" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feGaussianBlur stdDeviation="13.14" result="blur"/>
                  </filter>
                  <linearGradient id="glow-gradient-${rand}" x1="26.2875" y1="36.7875" x2="174.287" y2="36.7875" gradientUnits="userSpaceOnUse">
                    <stop stop-color="white"/>
                    <stop offset="1" stop-color="#D5E5F8"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </button>
        </div>
      `

      backdrop.appendChild(card)
      document.body.appendChild(backdrop)

      const cleanup = (value) => {
        backdrop.classList.replace('animate__fadeIn', 'animate__fadeOut')
        card.classList.replace('animate__zoomIn', 'animate__zoomOut')
        setTimeout(() => {
          backdrop.remove()
          resolve(value)
        }, 150)
      }

      card.querySelector('#native-confirm-btn').addEventListener('click', () => cleanup(true))
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) cleanup(true)
      })
    })
  },

  /**
   * confirm
   * Modal konfirmasi dengan pilihan Ya/Batal dan GlossyButton.
   */
  confirm: (title, text = '', confirmButtonText = 'Ya, Lanjutkan') => {
    return new Promise((resolve) => {
      const isDark = document.documentElement.classList.contains('dark')
      const rand = Math.random().toString(36).substring(2, 9)

      const backdrop = document.createElement('div')
      backdrop.className = 'fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate__animated animate__fadeIn'

      const borderClass = isDark ? 'border-gray-800' : 'border-[#e0e0e0]'
      const bgClass = isDark ? 'bg-gray-950' : 'bg-white'
      const textBlackClass = isDark ? 'text-white' : 'text-[#0a0a0a]'
      const textGrayClass = isDark ? 'text-gray-400' : 'text-[#666]'
      const cancelBorderClass = isDark ? 'border-gray-800' : 'border-[#e1e1e1]'
      const cancelBgClass = isDark ? 'bg-gray-900' : 'bg-white'
      const cancelTextClass = isDark ? 'text-white' : 'text-black'

      const warningDiamondSvg = `<svg class="w-12 h-12 text-[#F59E0B]" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M51.4785 25.5329L30.4675 4.51973C29.8118 3.86785 28.9247 3.50195 28 3.50195C27.0754 3.50195 26.1883 3.86785 25.5325 4.51973L4.53254 25.5329C3.88067 26.1886 3.51477 27.0757 3.51477 28.0004C3.51477 28.925 3.88067 29.8121 4.53254 30.4679L25.5435 51.481C26.1993 52.1329 27.0863 52.4987 28.011 52.4987C28.9356 52.4987 29.8227 52.1329 30.4785 51.481L51.4894 30.4679C52.1413 29.8121 52.5072 28.925 52.5072 28.0004C52.5072 27.0757 52.1413 26.1886 51.4894 25.5329H51.4785ZM26.25 17.5004C26.25 17.0362 26.4344 16.5911 26.7626 16.2629C27.0908 15.9347 27.5359 15.7504 28 15.7504C28.4642 15.7504 28.9093 15.9347 29.2375 16.2629C29.5657 16.5911 29.75 17.0362 29.75 17.5004V29.7504C29.75 30.2145 29.5657 30.6596 29.2375 30.9878C28.9093 31.316 28.4642 31.5004 28 31.5004C27.5359 31.5004 27.0908 31.316 26.7626 30.9878C26.4344 30.6596 26.25 30.2145 26.25 29.7504V17.5004ZM28 40.2504C27.4809 40.2504 26.9734 40.0964 26.5417 39.808C26.11 39.5195 25.7735 39.1095 25.5749 38.6299C25.3762 38.1502 25.3242 37.6224 25.4255 37.1132C25.5268 36.604 25.7768 36.1363 26.1439 35.7692C26.511 35.4021 26.9787 35.1521 27.4879 35.0508C27.9971 34.9495 28.5249 35.0015 29.0046 35.2002C29.4842 35.3988 29.8942 35.7353 30.1827 36.167C30.4711 36.5987 30.625 37.6254 30.625 37.6254C30.625 38.3215 30.3485 38.9892 29.8562 39.4815C29.3639 39.9738 28.6962 40.2504 28 40.2504Z" fill="#F59E0B" />
      </svg>`

      const confirmIcon = `<svg class="w-4 h-4 shrink-0 text-white relative z-10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.3538 4.85403L6.35378 12.854C6.30735 12.9005 6.2522 12.9374 6.1915 12.9626C6.1308 12.9877 6.06574 13.0007 6.00003 13.0007C5.93433 13.0007 5.86926 12.9877 5.80856 12.9626C5.74786 12.9374 5.69272 12.9005 5.64628 12.854L2.14628 9.35403C2.05246 9.26021 1.99976 9.13296 1.99976 9.00028C1.99976 8.8676 2.05246 8.74035 2.14628 8.64653C2.2401 8.55271 2.36735 8.5 2.50003 8.5C2.63272 8.5 2.75996 8.55271 2.85378 8.64653L6.00003 11.7934L13.6463 4.14653C13.7401 4.05271 13.8674 4 14 4C14.1327 4 14.26 4.05271 14.3538 4.14653C14.4476 4.24035 14.5003 4.3676 14.5003 4.50028C14.5003 4.63296 14.4476 4.76021 14.3538 4.85403Z" fill="currentColor"/></svg>`
      const cancelIcon = `<svg class="w-4 h-4 shrink-0 ${isDark ? 'text-white' : 'text-black'} relative z-10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 4L4 12M4 4L12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>`

      const card = document.createElement('div')
      card.className = `rounded-[12px] border border-solid ${borderClass} shadow-2xl overflow-hidden p-0 max-w-[440px] w-full font-sans ${bgClass} animate__animated animate__zoomIn animate__faster mx-4`
      card.innerHTML = `
        <div class="flex flex-col gap-[14px] items-center justify-center p-[20px] text-center border-b border-solid ${borderClass} w-full select-none">
          <div class="w-12 h-12 shrink-0">${warningDiamondSvg}</div>
          <div class="flex flex-col gap-[4px] items-center justify-center w-full leading-[1.4] not-italic">
            <p class="font-bold text-[16px] ${textBlackClass} leading-[1.3] w-full m-0 tracking-tight">${escapeHtml(title)}</p>
            <p class="font-normal text-[13px] ${textGrayClass} leading-[1.4] w-full m-0">${escapeHtml(text)}</p>
          </div>
        </div>
        <div class="flex flex-row gap-[8px] items-center justify-end px-[16px] py-[12px] bg-transparent w-full m-0">
          <button id="native-cancel-btn" class="border border-solid ${cancelBorderClass} ${cancelBgClass} ${cancelTextClass} hover:opacity-90 rounded-[6px] transition-all duration-200 active:scale-95 px-[14px] py-[8px] h-9 outline-none select-none cursor-pointer flex items-center justify-center gap-[6px] shrink-0 font-sans font-medium text-[13px] shadow-xs">
            ${cancelIcon}
            <span class="relative z-10">Batal</span>
          </button>
          <button id="native-confirm-btn" class="border border-solid border-[rgba(255,255,255,0.3)] bg-gradient-to-b from-[#1e1e1e] to-[#0a0a0a] hover:from-[#2e2e2e] hover:to-[#1a1a1a] text-white rounded-[6px] transition-all duration-200 active:scale-95 shadow-[inset_0px_2px_2px_0px_rgba(255,255,255,0.05),inset_0px_2px_2px_0px_rgba(255,255,255,0.08)] relative overflow-hidden px-[16px] py-[8px] h-9 flex items-center justify-center gap-[6px] font-sans font-medium text-[13px] select-none outline outline-1 outline-offset-[-1px] outline-white/30 cursor-pointer shrink-0">
            ${confirmIcon}
            <span class="relative z-10">${confirmButtonText}</span>
            <div class="-translate-x-1/2 absolute h-[21px] left-[calc(50%+0.5px)] top-[23px] w-[148px] z-10 pointer-events-none overflow-visible">
              <svg class="absolute inset-[-125.18%_-17.76%] w-[200.575px] h-[73.575px] opacity-60" preserveAspectRatio="none" viewBox="0 0 200.575 73.575" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#glow-filter-${rand})">
                  <ellipse cx="100.287" cy="36.7875" rx="74" ry="10.5" fill="url(#glow-gradient-${rand})"/>
                </g>
                <defs>
                  <filter id="glow-filter-${rand}" x="0" y="0" width="200.575" height="73.575" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feGaussianBlur stdDeviation="13.14" result="blur"/>
                  </filter>
                  <linearGradient id="glow-gradient-${rand}" x1="26.2875" y1="36.7875" x2="174.287" y2="36.7875" gradientUnits="userSpaceOnUse">
                    <stop stop-color="white"/>
                    <stop offset="1" stop-color="#D5E5F8"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </button>
        </div>
      `

      backdrop.appendChild(card)
      document.body.appendChild(backdrop)

      const cleanup = (value) => {
        backdrop.classList.replace('animate__fadeIn', 'animate__fadeOut')
        card.classList.replace('animate__zoomIn', 'animate__zoomOut')
        setTimeout(() => {
          backdrop.remove()
          resolve(value)
        }, 150)
      }

      card.querySelector('#native-cancel-btn').addEventListener('click', () => cleanup(false))
      card.querySelector('#native-confirm-btn').addEventListener('click', () => cleanup(true))
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) cleanup(false)
      })
    })
  },

  /**
   * confirmExport
   * Modal konfirmasi export dengan tema WarningDiamond premium & GlossyButton.
   */
  confirmExport: (title, text = '') => {
    return new Promise((resolve) => {
      const isDark = document.documentElement.classList.contains('dark')
      const rand = Math.random().toString(36).substring(2, 9)

      const backdrop = document.createElement('div')
      backdrop.className = 'fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate__animated animate__fadeIn'

      const borderClass = isDark ? 'border-gray-800' : 'border-[#e0e0e0]'
      const bgClass = isDark ? 'bg-gray-950' : 'bg-white'
      const textBlackClass = isDark ? 'text-white' : 'text-[#0a0a0a]'
      const textGrayClass = isDark ? 'text-gray-400' : 'text-[#666]'
      const cancelBorderClass = isDark ? 'border-gray-800' : 'border-[#e1e1e1]'
      const cancelBgClass = isDark ? 'bg-gray-900' : 'bg-white'
      const cancelTextClass = isDark ? 'text-white' : 'text-black'

      const warningDiamondSvg = `<svg class="w-12 h-12 text-[#F59E0B]" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M51.4785 25.5329L30.4675 4.51973C29.8118 3.86785 28.9247 3.50195 28 3.50195C27.0754 3.50195 26.1883 3.86785 25.5325 4.51973L4.53254 25.5329C3.88067 26.1886 3.51477 27.0757 3.51477 28.0004C3.51477 28.925 3.88067 29.8121 4.53254 30.4679L25.5435 51.481C26.1993 52.1329 27.0863 52.4987 28.011 52.4987C28.9356 52.4987 29.8227 52.1329 30.4785 51.481L51.4894 30.4679C52.1413 29.8121 52.5072 28.925 52.5072 28.0004C52.5072 27.0757 52.1413 26.1886 51.4894 25.5329H51.4785ZM26.25 17.5004C26.25 17.0362 26.4344 16.5911 26.7626 16.2629C27.0908 15.9347 27.5359 15.7504 28 15.7504C28.4642 15.7504 28.9093 15.9347 29.2375 16.2629C29.5657 16.5911 29.75 17.0362 29.75 17.5004V29.7504C29.75 30.2145 29.5657 30.6596 29.2375 30.9878C28.9093 31.316 28.4642 31.5004 28 31.5004C27.5359 31.5004 27.0908 31.316 26.7626 30.9878C26.4344 30.6596 26.25 30.2145 26.25 29.7504V17.5004ZM28 40.2504C27.4809 40.2504 26.9734 40.0964 26.5417 39.808C26.11 39.5195 25.7735 39.1095 25.5749 38.6299C25.3762 38.1502 25.3242 37.6224 25.4255 37.1132C25.5268 36.604 25.7768 36.1363 26.1439 35.7692C26.511 35.4021 26.9787 35.1521 27.4879 35.0508C27.9971 34.9495 28.5249 35.0015 29.0046 35.2002C29.4842 35.3988 29.8942 35.7353 30.1827 36.167C30.4711 36.5987 30.625 37.6254 30.625 37.6254C30.625 38.3215 30.3485 38.9892 29.8562 39.4815C29.3639 39.9738 28.6962 40.2504 28 40.2504Z" fill="#F59E0B" />
      </svg>`

      const confirmIcon = `<svg class="w-4 h-4 shrink-0 text-white relative z-10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.3538 4.85403L6.35378 12.854C6.30735 12.9005 6.2522 12.9374 6.1915 12.9626C6.1308 12.9877 6.06574 13.0007 6.00003 13.0007C5.93433 13.0007 5.86926 12.9877 5.80856 12.9626C5.74786 12.9374 5.69272 12.9005 5.64628 12.854L2.14628 9.35403C2.05246 9.26021 1.99976 9.13296 1.99976 9.00028C1.99976 8.8676 2.05246 8.74035 2.14628 8.64653C2.2401 8.55271 2.36735 8.5 2.50003 8.5C2.63272 8.5 2.75996 8.55271 2.85378 8.64653L6.00003 11.7934L13.6463 4.14653C13.7401 4.05271 13.8674 4 14 4C14.1327 4 14.26 4.05271 14.3538 4.14653C14.4476 4.24035 14.5003 4.3676 14.5003 4.50028C14.5003 4.63296 14.4476 4.76021 14.3538 4.85403Z" fill="currentColor"/></svg>`
      const cancelIcon = `<svg class="w-4 h-4 shrink-0 ${isDark ? 'text-white' : 'text-black'} relative z-10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 4L4 12M4 4L12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>`

      const card = document.createElement('div')
      card.className = `rounded-[12px] border border-solid ${borderClass} shadow-2xl overflow-hidden p-0 max-w-[440px] w-full font-sans ${bgClass} animate__animated animate__zoomIn animate__faster mx-4`
      card.innerHTML = `
        <div class="flex flex-col gap-[14px] items-center justify-center p-[20px] text-center border-b border-solid ${borderClass} w-full select-none">
          <div class="w-12 h-12 shrink-0">${warningDiamondSvg}</div>
          <div class="flex flex-col gap-[4px] items-center justify-center w-full leading-[1.4] not-italic">
            <p class="font-bold text-[16px] ${textBlackClass} leading-[1.3] w-full m-0 tracking-tight">${escapeHtml(title)}</p>
            <p class="font-normal text-[13px] ${textGrayClass} leading-[1.4] w-full m-0">${escapeHtml(text)}</p>
          </div>
        </div>
        <div class="flex flex-row gap-[8px] items-center justify-end px-[16px] py-[12px] bg-transparent w-full m-0">
          <button id="native-cancel-btn" class="border border-solid ${cancelBorderClass} ${cancelBgClass} ${cancelTextClass} hover:opacity-90 rounded-[6px] transition-all duration-200 active:scale-95 px-[14px] py-[8px] h-9 outline-none select-none cursor-pointer flex items-center justify-center gap-[6px] shrink-0 font-sans font-medium text-[13px] shadow-xs">
            ${cancelIcon}
            <span class="relative z-10">Batal</span>
          </button>
          <button id="native-confirm-btn" class="border border-solid border-[rgba(255,255,255,0.3)] bg-gradient-to-b from-[#1e1e1e] to-[#0a0a0a] hover:from-[#2e2e2e] hover:to-[#1a1a1a] text-white rounded-[6px] transition-all duration-200 active:scale-95 shadow-[inset_0px_2px_2px_0px_rgba(255,255,255,0.05),inset_0px_2px_2px_0px_rgba(255,255,255,0.08)] relative overflow-hidden px-[16px] py-[8px] h-9 flex items-center justify-center gap-[6px] font-sans font-medium text-[13px] select-none outline outline-1 outline-offset-[-1px] outline-white/30 cursor-pointer shrink-0">
            ${confirmIcon}
            <span class="relative z-10">Setuju</span>
            <div class="-translate-x-1/2 absolute h-[21px] left-[calc(50%+0.5px)] top-[23px] w-[148px] z-10 pointer-events-none overflow-visible">
              <svg class="absolute inset-[-125.18%_-17.76%] w-[200.575px] h-[73.575px] opacity-60" preserveAspectRatio="none" viewBox="0 0 200.575 73.575" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#glow-filter-${rand})">
                  <ellipse cx="100.287" cy="36.7875" rx="74" ry="10.5" fill="url(#glow-gradient-${rand})"/>
                </g>
                <defs>
                  <filter id="glow-filter-${rand}" x="0" y="0" width="200.575" height="73.575" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feGaussianBlur stdDeviation="13.14" result="blur"/>
                  </filter>
                  <linearGradient id="glow-gradient-${rand}" x1="26.2875" y1="36.7875" x2="174.287" y2="36.7875" gradientUnits="userSpaceOnUse">
                    <stop stop-color="white"/>
                    <stop offset="1" stop-color="#D5E5F8"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </button>
        </div>
      `

      backdrop.appendChild(card)
      document.body.appendChild(backdrop)

      const cleanup = (value) => {
        backdrop.classList.replace('animate__fadeIn', 'animate__fadeOut')
        card.classList.replace('animate__zoomIn', 'animate__zoomOut')
        setTimeout(() => {
          backdrop.remove()
          resolve(value)
        }, 150)
      }

      card.querySelector('#native-cancel-btn').addEventListener('click', () => cleanup(false))
      card.querySelector('#native-confirm-btn').addEventListener('click', () => cleanup(true))
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) cleanup(false)
      })
    })
  },

  /**
   * toast
   * Notifikasi kecil di pojok kanan atas dengan design 1:1 Figma.
   */
  toast: (title, textOrIcon = 'success', icon = 'success') => {
    let text = ''
    let actualIcon = 'success'

    if (typeof textOrIcon === 'string') {
      const knownIcons = ['success', 'error', 'warning', 'info', 'question']
      if (knownIcons.includes(textOrIcon)) {
        actualIcon = textOrIcon
      } else {
        text = textOrIcon
        actualIcon = icon
      }
    }

    let container = document.getElementById('native-toast-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'native-toast-container'
      container.className = 'fixed top-4 right-4 z-[999999] flex flex-col gap-3 pointer-events-none'
      document.body.appendChild(container)
    }

    const toastCard = document.createElement('div')
    toastCard.className = 'pointer-events-auto bg-white dark:bg-gray-950 border border-solid border-[#d4d4d4] dark:border-gray-800 rounded-[6px] shadow-[12px_-2px_32px_8px_rgba(0,0,0,0.12)] p-[12px] max-w-sm w-[340px] relative overflow-hidden flex items-start gap-[12px] animate__animated animate__fadeInRight animate__faster mb-2 mr-2'

    let iconSvg = ''
    if (actualIcon === 'success') {
      iconSvg = `<svg class="w-5 h-5 shrink-0 text-[#0F894D]" viewBox="0 0 16.25 16.25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.125 0.0517578C10.2654 0.0540316 12.3176 0.905472 13.8311 2.41895C15.3445 3.93242 16.196 5.98463 16.1982 8.125C16.1982 9.72167 15.724 11.2828 14.8369 12.6104C13.95 13.9376 12.6896 14.972 11.2148 15.583C9.73971 16.194 8.1158 16.3545 6.5498 16.043C4.98389 15.7314 3.54596 14.962 2.41699 13.833C1.28802 12.704 0.518553 11.2661 0.207031 9.7002C-0.104464 8.1342 0.0559722 6.51029 0.666992 5.03516C1.27798 3.56041 2.31242 2.30003 3.63965 1.41309C4.88428 0.58145 6.33419 0.112869 7.82617 0.0576172L8.125 0.0517578ZM11.25 5.57227C11.1612 5.57227 11.0733 5.59009 10.9912 5.62402C10.909 5.65807 10.8334 5.7076 10.7705 5.77051L6.875 9.66602L5.47949 8.27051C5.35245 8.14347 5.17966 8.07227 5 8.07227C4.82034 8.07227 4.64755 8.14347 4.52051 8.27051C4.39347 8.39755 4.32227 8.57034 4.32227 8.75C4.32227 8.92966 4.39347 9.10245 4.52051 9.22949L6.39551 11.1045V11.1035C6.45829 11.1664 6.5332 11.2169 6.61523 11.251C6.69743 11.2851 6.78602 11.3027 6.875 11.3027C6.96398 11.3027 7.05257 11.2851 7.13477 11.251C7.21679 11.2169 7.29074 11.1664 7.35352 11.1035L7.35449 11.1045L11.7295 6.72949C11.7924 6.66659 11.8419 6.59098 11.876 6.50879C11.9099 6.42672 11.9277 6.33881 11.9277 6.25L11.9141 6.11816C11.9055 6.07481 11.8929 6.03225 11.876 5.99121C11.8419 5.90902 11.7924 5.83341 11.7295 5.77051C11.6666 5.7076 11.591 5.65807 11.5088 5.62402C11.4267 5.5901 11.3388 5.57227 11.25 5.57227Z" fill="#0F894D" stroke="#0F894D" stroke-width="0.1" />
      </svg>`
    } else if (actualIcon === 'error') {
      iconSvg = `<svg class="w-5 h-5 shrink-0 text-[#DC2626]" viewBox="0 0 16.25 16.25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.125 0.0517578C10.2654 0.0540316 12.3176 0.905472 13.8311 2.41895C15.3445 3.93242 16.196 5.98463 16.1982 8.125C16.1982 9.72167 15.724 11.2828 14.8369 12.6104C13.95 13.9376 12.6896 14.972 11.2148 15.583C9.73971 16.194 8.1158 16.3545 6.5498 16.043C4.98389 15.7314 3.54596 14.962 2.41699 13.833C1.28802 12.704 0.518553 11.2661 0.207031 9.7002C-0.104464 8.1342 0.0559722 6.51029 0.666992 5.03516C1.27798 3.56041 2.31242 2.30003 3.63965 1.41309C4.88428 0.58145 6.33419 0.112869 7.82617 0.0576172L8.125 0.0517578ZM11.375 10.3145C11.433 10.3725 11.4791 10.4415 11.5105 10.5173C11.542 10.5932 11.5581 10.6745 11.5581 10.7566C11.5581 10.8388 11.542 10.9201 11.5105 10.996C11.4791 11.0718 11.433 11.1408 11.375 11.1988C11.317 11.2568 11.248 11.3029 11.1722 11.3343C11.0963 11.3658 11.015 11.382 10.9329 11.382C10.8508 11.382 10.7695 11.3658 10.6936 11.3343C10.6178 11.3029 10.6178 11.3029 10.5488 11.2568C10.4908 11.1988L8.125 8.83296L5.75917 11.1988C5.64189 11.3161 5.48283 11.382 5.31698 11.382C5.15113 11.382 4.99207 11.3161 4.87479 11.1988C4.75752 11.0815 4.69163 10.9225 4.69163 10.7566C4.69163 10.5908 4.75752 10.4317 4.87479 10.3145L7.24062 7.94858L4.87479 5.58279C4.75752 5.46551 4.69163 5.30645 4.69163 5.1406C4.69163 4.97475 4.75752 4.81569 4.87479 4.69841C4.99207 4.58113 5.15113 4.51525 5.31698 4.51525C5.48283 4.51525 5.64189 4.58113 5.75917 4.69841L8.125 7.06424L10.4908 4.69841C10.6081 4.58113 10.7672 4.51525 10.933 4.51525C11.0988 4.51525 11.2579 4.58113 11.3752 4.69841C11.4925 4.81569 11.5584 4.97475 11.5584 5.1406C11.5584 5.30645 11.4925 5.46551 11.3752 5.58279L9.00938 7.94858L11.375 10.3145Z" fill="#DC2626" />
      </svg>`
    } else {
      iconSvg = `<svg class="w-5 h-5 shrink-0 text-[#F59E0B]" viewBox="0 0 16.25 16.25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.125 0.0517578C10.2654 0.0540316 12.3176 0.905472 13.8311 2.41895C15.3445 3.93242 16.196 5.98463 16.1982 8.125C16.1982 9.72167 15.724 11.2828 14.8369 12.6104C13.95 13.9376 12.6896 14.972 11.2148 15.583C9.73971 16.194 8.1158 16.3545 6.5498 16.043C4.98389 15.7314 3.54596 14.962 2.41699 13.833C1.28802 12.704 0.518553 11.2661 0.207031 9.7002C-0.104464 8.1342 0.0559722 6.51029 0.666992 5.03516C1.27798 3.56041 2.31242 2.30003 3.63965 1.41309C4.88428 0.58145 6.33419 0.112869 7.82617 0.0576172L8.125 0.0517578ZM7.25 4.5C7.25 4.22386 7.47386 4 7.75 4C8.02614 4 8.25 4.22386 8.25 4.5V8.5C8.25 8.77614 8.02614 9 7.75 9C7.47386 9 7.25 8.77614 7.25 8.5V4.5ZM7.75 12C7.33579 12 7 11.6642 7 11.25C7 10.8358 7.33579 10.5 7.75 10.5C8.16421 10.5 8.5 10.8358 8.5 11.25C8.5 11.6642 8.16421 12 7.75 12Z" fill="#F59E0B" />
      </svg>`
    }

    const closeBtn = document.createElement('button')
    closeBtn.className = 'absolute right-2.5 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white p-0 m-0 h-5 w-5 bg-transparent border-0 outline-none shadow-none cursor-pointer flex items-center justify-center'
    closeBtn.innerHTML = `<svg class="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.0672 15.1832C16.1252 15.2412 16.1713 15.3102 16.2027 15.386C16.2342 15.4619 16.2503 15.5432 16.2503 15.6253C16.2503 15.7075 16.2342 15.7888 16.2027 15.8647C16.1713 15.9405 16.1252 16.0095 16.0672 16.0675C16.0091 16.1256 15.9402 16.1717 15.8643 16.2031C15.7884 16.2345 15.7071 16.2507 15.625 16.2507C15.5429 16.2507 15.4615 16.2345 15.3857 16.2031C15.3098 16.1717 15.2409 16.1256 15.1828 16.0675L9.99998 10.8839L4.81717 16.0675C4.69989 16.1848 4.54083 16.2507 4.37498 16.2507C4.20913 16.2507 4.05007 16.1848 3.93279 16.0675C3.81552 15.9503 3.74963 15.7912 3.74963 15.6253C3.74963 15.4595 3.81552 15.3004 3.93279 15.1832L9.11639 10.0003L3.93279 4.81753C3.81552 4.70026 3.74963 4.5412 3.74963 4.37535C3.74963 4.2095 3.81552 4.05044 3.93279 3.93316C4.05007 3.81588 4.20913 3.75 4.37498 3.75C4.54083 3.75 4.69989 3.81588 4.81717 3.93316L9.99998 9.11675L15.1828 3.93316C15.3001 3.81588 15.4591 3.75 15.625 3.75C15.7908 3.75 15.9499 3.81588 16.0672 3.93316C16.1844 4.05271 16.2503 4.2095 16.2503 4.37535C16.2503 4.5412 16.1844 4.76021 16.0672 4.81753L10.8836 10.0003L16.0672 15.1832Z" fill="#A3A3A3"/></svg>`

    const contentDiv = document.createElement('div')
    contentDiv.className = 'flex gap-[12px] items-start w-full text-left font-sans select-none'
    contentDiv.innerHTML = `
      <div class="shrink-0 size-[20px] flex items-center justify-center rounded-[100px] mt-0.5">${iconSvg}</div>
      <div class="flex-1 flex flex-col gap-[4px] items-start not-italic text-[14px]">
        <p class="font-sans font-bold leading-[1.2] text-black dark:text-white w-full m-0">${escapeHtml(title)}</p>
        ${text ? `<p class="font-sans leading-[1.4] text-[#666] dark:text-gray-400 w-full m-0">${escapeHtml(text)}</p>` : ''}
      </div>
    `

    toastCard.appendChild(contentDiv)
    toastCard.appendChild(closeBtn)
    container.appendChild(toastCard)

    const removeToast = () => {
      toastCard.classList.replace('animate__fadeInRight', 'animate__fadeOutUp')
      setTimeout(() => {
        toastCard.remove()
        if (container.children.length === 0) {
          container.remove()
        }
      }, 200)
    }

    closeBtn.addEventListener('click', removeToast)

    let autoTimer = setTimeout(removeToast, 3000)

    toastCard.addEventListener('mouseenter', () => clearTimeout(autoTimer))
    toastCard.addEventListener('mouseleave', () => {
      autoTimer = setTimeout(removeToast, 2000)
    })
  }
}

export default Alert

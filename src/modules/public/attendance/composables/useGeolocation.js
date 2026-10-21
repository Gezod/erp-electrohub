import { ref, onUnmounted } from 'vue'

const EARTH_RADIUS_M = 6371000
const toRad = (deg) => (deg * Math.PI) / 180

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * Math.asin(Math.sqrt(a)) * EARTH_RADIUS_M
}

// Progressive-accuracy geolocation watcher: only accepts readings that improve on the
// best accuracy seen so far, mirroring the source's own client-side refinement behavior.
export function useGeolocation() {
  const latitude = ref(null)
  const longitude = ref(null)
  const accuracy = ref(null)
  const status = ref('idle') // idle | loading | active | denied | unsupported | error

  let watchId = null
  let bestAccuracy = Infinity

  const start = () => {
    if (!navigator.geolocation) {
      status.value = 'unsupported'
      return
    }
    status.value = 'loading'
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (pos.coords.accuracy <= bestAccuracy) {
          bestAccuracy = pos.coords.accuracy
          latitude.value = pos.coords.latitude
          longitude.value = pos.coords.longitude
          accuracy.value = pos.coords.accuracy
          status.value = 'active'
        }
      },
      (err) => {
        status.value = err.code === err.PERMISSION_DENIED ? 'denied' : 'error'
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    )
  }

  const stop = () => {
    if (watchId != null) navigator.geolocation.clearWatch(watchId)
    watchId = null
    bestAccuracy = Infinity
  }

  const distanceTo = (lat, lng) => {
    if (latitude.value == null || longitude.value == null || lat == null || lng == null) return null
    return haversineDistance(latitude.value, longitude.value, lat, lng)
  }

  onUnmounted(() => stop())

  return { latitude, longitude, accuracy, status, start, stop, distanceTo }
}

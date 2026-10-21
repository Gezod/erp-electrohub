import { getActivePinia } from 'pinia';
import { resetAllRegisteredFilters } from './filterRegistry';

/**
 * resetAppCache
 * Clears all Pinia store state and resets registered composable filters
 * when a user logs out or switches accounts.
 * Decoupled from individual feature modules to maintain clean architecture.
 */
export function resetAppCache() {
  // 1. Reset all active Pinia stores back to default initial state
  try {
    const pinia = getActivePinia();
    if (pinia && pinia._s) {
      const stores = pinia._s instanceof Map ? Array.from(pinia._s.values()) : Object.values(pinia._s);
      stores.forEach((store) => {
        if (store.$id !== 'auth' && typeof store.$reset === 'function') {
          store.$reset();
        }
      });
    }
  } catch (err) {
    console.warn('[resetAppCache] Error resetting Pinia stores:', err);
  }

  // 2. Reset all registered composable module filters
  resetAllRegisteredFilters();
}

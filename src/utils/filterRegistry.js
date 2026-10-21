/**
 * filterRegistry.js
 * Decoupled registry for module-level composable filter reset callbacks.
 * Follows the Observer/Registry pattern to avoid circular dependencies
 * and tight coupling between core utilities and feature modules.
 */

const filterResetCallbacks = new Set();

/**
 * Register a callback to reset a composable's module-level filters.
 * @param {Function} callback 
 */
export function registerFilterReset(callback) {
  if (typeof callback === 'function') {
    filterResetCallbacks.add(callback);
  }
}

/**
 * Execute all registered filter reset callbacks.
 */
export function resetAllRegisteredFilters() {
  filterResetCallbacks.forEach((resetFn) => {
    try {
      resetFn();
    } catch (err) {
      console.warn('[FilterRegistry] Failed to reset filter:', err);
    }
  });
}

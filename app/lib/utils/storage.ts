/**
 * localStorage Utilities with Hydration Safety
 *
 * Provides type-safe localStorage access with:
 * - Hydration safety for Next.js SSR
 * - Error handling for quota exceeded
 * - Automatic JSON serialization
 * - IndexedDB fallback (future enhancement)
 */

const STORAGE_PREFIX = 'dashboard-builder:';

// Storage keys
export const STORAGE_KEYS = {
  DASHBOARDS: `${STORAGE_PREFIX}dashboards`,
  ACTIVE_DASHBOARD: `${STORAGE_PREFIX}active-dashboard`,
  USER_PREFERENCES: `${STORAGE_PREFIX}preferences`,
} as const;

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Get item from localStorage with type safety
 */
export function getStorageItem<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Set item in localStorage with type safety
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Consider implementing cleanup.');
      // TODO: Implement automatic cleanup or IndexedDB fallback
    } else {
      console.error(`Error writing to localStorage (key: ${key}):`, error);
    }
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Clear all app-specific storage
 */
export function clearAppStorage(): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    const keys = Object.keys(window.localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing app storage:', error);
    return false;
  }
}

/**
 * Get storage usage information
 */
export function getStorageUsage(): {
  used: number;
  available: number;
  percentage: number;
} | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    // Estimate storage usage
    const allKeys = Object.keys(window.localStorage);
    const usedBytes = allKeys.reduce((total, key) => {
      const item = window.localStorage.getItem(key);
      return total + (item?.length || 0) * 2; // UTF-16 = 2 bytes per char
    }, 0);

    // localStorage typically has ~5-10MB limit
    const availableBytes = 5 * 1024 * 1024; // 5MB conservative estimate

    return {
      used: usedBytes,
      available: availableBytes,
      percentage: (usedBytes / availableBytes) * 100,
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return null;
  }
}

/**
 * Debounce function for auto-save
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

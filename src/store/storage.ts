import type { PersistStorage, StorageValue } from 'zustand/middleware';

/**
 * localStorage-backed persist storage that reads back what it just wrote to
 * verify the write actually landed (mirrors the write-then-verify approach
 * used by the original shared_preferences-based progress repository).
 * Failures degrade silently — the app must keep working even if
 * localStorage is unavailable (private browsing, quota, etc).
 */
export function createVerifiedStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name) => {
      try {
        const raw = localStorage.getItem(name);
        if (raw === null) return null;
        return JSON.parse(raw) as StorageValue<T>;
      } catch (e) {
        console.warn(`[storage] Failed to read "${name}"`, e);
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(name, serialized);
        const readBack = localStorage.getItem(name);
        if (readBack !== serialized) {
          console.warn(`[storage] Write verification failed for "${name}"`);
        }
      } catch (e) {
        console.warn(`[storage] Failed to write "${name}"`, e);
      }
    },
    removeItem: (name) => {
      try {
        localStorage.removeItem(name);
      } catch (e) {
        console.warn(`[storage] Failed to remove "${name}"`, e);
      }
    },
  };
}

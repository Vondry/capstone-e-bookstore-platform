/**
 * SIMULATED: Medusa has no wishlist in the store API, so the wishlist is a list of book
 * handles in localStorage (per browser). Replace with a backend module when available.
 */

export const WISHLIST_STORAGE_KEY = 'bw.wishlist';

type Listener = () => void;
const listeners = new Set<Listener>();

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/** Book handles in the wishlist; empty when storage is missing, corrupt or unavailable */
export function getWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return isStringArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWishlist(handles: string[]): void {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(handles));
  } catch {
    // Storage unavailable (private mode): the change lasts for this call only
  }
  listeners.forEach((listener) => {
    listener();
  });
}

export function isInWishlist(handle: string): boolean {
  return getWishlist().includes(handle);
}

export function addToWishlist(handle: string): void {
  const current = getWishlist();
  if (!current.includes(handle)) saveWishlist([...current, handle]);
}

export function removeFromWishlist(handle: string): void {
  const current = getWishlist();
  if (current.includes(handle)) saveWishlist(current.filter((item) => item !== handle));
}

/** Adds or removes the book; returns true when the book is now in the wishlist */
export function toggleWishlist(handle: string): boolean {
  if (isInWishlist(handle)) {
    removeFromWishlist(handle);
    return false;
  }
  addToWishlist(handle);
  return true;
}

/** Subscribe to wishlist changes (same tab and other tabs) */
export function subscribeWishlist(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === WISHLIST_STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

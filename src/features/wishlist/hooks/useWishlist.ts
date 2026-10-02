import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { getWishlist, isInWishlist, subscribeWishlist, toggleWishlist } from '../lib/wishlist';

/** SIMULATED (localStorage): whether a book is wishlisted, and a toggle */
export function useWishlistItem(handle: string) {
  const isWishlisted = useSyncExternalStore(
    subscribeWishlist,
    () => isInWishlist(handle),
    () => false
  );
  const toggle = useCallback(() => toggleWishlist(handle), [handle]);
  return { isWishlisted, toggle };
}

/** SIMULATED (localStorage): all wishlisted book handles, oldest first */
export function useWishlist(): string[] {
  // The snapshot must be stable between renders, so compare the serialised list
  const serialised = useSyncExternalStore(
    subscribeWishlist,
    () => JSON.stringify(getWishlist()),
    () => '[]'
  );
  return useMemo(() => JSON.parse(serialised) as string[], [serialised]);
}

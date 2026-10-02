import { describe, expect, it, vi } from 'vitest';
import {
  WISHLIST_STORAGE_KEY,
  addToWishlist,
  getWishlist,
  isInWishlist,
  removeFromWishlist,
  subscribeWishlist,
  toggleWishlist,
} from './wishlist';

describe('wishlist (SIMULATED localStorage)', () => {
  it('starts empty', () => {
    expect(getWishlist()).toEqual([]);
    expect(isInWishlist('godaan')).toBe(false);
  });

  it('adds a handle once', () => {
    addToWishlist('godaan');
    addToWishlist('godaan');
    expect(getWishlist()).toEqual(['godaan']);
    expect(isInWishlist('godaan')).toBe(true);
  });

  it('removes a handle and ignores unknown handles', () => {
    addToWishlist('godaan');
    addToWishlist('madhushala');
    removeFromWishlist('godaan');
    removeFromWishlist('unknown');
    expect(getWishlist()).toEqual(['madhushala']);
  });

  it('toggles and reports the new state', () => {
    expect(toggleWishlist('godaan')).toBe(true);
    expect(toggleWishlist('godaan')).toBe(false);
    expect(getWishlist()).toEqual([]);
  });

  it('treats corrupt or wrongly shaped storage as empty', () => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, '{not json');
    expect(getWishlist()).toEqual([]);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([1, 2]));
    expect(getWishlist()).toEqual([]);
  });

  it('survives unavailable storage', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(getWishlist()).toEqual([]);
    expect(() => {
      addToWishlist('godaan');
    }).not.toThrow();
    getItem.mockRestore();
    setItem.mockRestore();
  });

  it('notifies subscribers on change and on storage events from other tabs', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeWishlist(listener);
    addToWishlist('godaan');
    window.dispatchEvent(new StorageEvent('storage', { key: WISHLIST_STORAGE_KEY }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'other' }));
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    addToWishlist('madhushala');
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

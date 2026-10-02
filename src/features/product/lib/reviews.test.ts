import { describe, expect, it, vi } from 'vitest';
import { createReview, loadReviews, reviewerName, reviewsStorageKey, saveReview } from './reviews';

const now = new Date('2026-07-16T10:00:00.000Z');

describe('reviews (SIMULATED localStorage)', () => {
  it('creates a trimmed review', () => {
    const review = createReview({ text: '  Loved it ', rating: 4 }, 'Priya N.', now);
    expect(review).toMatchObject({
      name: 'Priya N.',
      text: 'Loved it',
      rating: 4,
      createdAt: now.toISOString(),
    });
    expect(review.id).toEqual(expect.any(String));
  });

  it('saves newest first, per handle', () => {
    const older = createReview({ text: 'First', rating: 3 }, 'A', now);
    const newer = createReview({ text: 'Second', rating: 5 }, 'B', now);
    saveReview('godaan', older);
    expect(saveReview('godaan', newer)).toEqual([newer, older]);
    expect(loadReviews('godaan')).toEqual([newer, older]);
    expect(loadReviews('madhushala')).toEqual([]);
  });

  it('ignores corrupt storage and malformed entries', () => {
    localStorage.setItem(reviewsStorageKey('godaan'), 'nope');
    expect(loadReviews('godaan')).toEqual([]);
    localStorage.setItem(reviewsStorageKey('godaan'), JSON.stringify({ not: 'a list' }));
    expect(loadReviews('godaan')).toEqual([]);
    localStorage.setItem(reviewsStorageKey('godaan'), JSON.stringify([{ id: 1 }, null]));
    expect(loadReviews('godaan')).toEqual([]);
  });

  it('still returns the list when storage is unavailable', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const review = createReview({ text: 'Hi', rating: 2 }, 'A', now);
    expect(saveReview('godaan', review)).toEqual([review]);
    setItem.mockRestore();
  });

  it('formats the reviewer name', () => {
    expect(reviewerName(null)).toBe('Guest reader');
    expect(reviewerName(undefined)).toBe('Guest reader');
    expect(reviewerName({ firstName: '', lastName: 'X' })).toBe('Guest reader');
    expect(reviewerName({ firstName: 'Priya', lastName: 'Nair' })).toBe('Priya N.');
    expect(reviewerName({ firstName: 'Priya', lastName: '' })).toBe('Priya');
  });
});

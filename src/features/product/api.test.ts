import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fetchReviews, submitReview } from './api';
import { resetMockReviews } from '@/mocks/handlers/reviews';
import { mockBooks } from '@/mocks/data/books';
import { AUTH_TOKEN_KEY } from '@/lib/medusa';

describe('product reviews API', () => {
  const focusBook = mockBooks.find((b) => b.handle === 'the-art-of-focus') ?? mockBooks[0];
  if (!focusBook) throw new Error('mockBook not found');

  beforeEach(() => {
    resetMockReviews();
    localStorage.clear();
  });

  afterEach(() => {
    resetMockReviews();
    localStorage.clear();
  });

  it('fetches reviews and average rating for a product', async () => {
    const result = await fetchReviews(focusBook.id);
    expect(result.count).toBeGreaterThanOrEqual(1);
    expect(result.averageRating).toBe(5);
    expect(result.reviews[0]).toMatchObject({
      name: 'Asha Verma',
      rating: 5,
    });
    expect(result.reviews[0]?.text).toContain('Clear and actionable');
  });

  it('submits a new review when user is authenticated', async () => {
    // Authenticate as demo customer
    localStorage.setItem(AUTH_TOKEN_KEY, 'mock-token-cus_demo');

    const created = await submitReview({
      productId: focusBook.id,
      content: 'Brilliant read on deep focus!',
      rating: 5,
    });

    expect(created).toMatchObject({
      name: 'Asha Verma',
      text: 'Brilliant read on deep focus!',
      rating: 5,
    });
    expect(created.id).toBeDefined();

    // Verify it is returned on subsequent fetch
    const updated = await fetchReviews(focusBook.id);
    expect(updated.count).toBe(2);
    expect(updated.reviews[0]?.text).toBe('Brilliant read on deep focus!');
  });
});

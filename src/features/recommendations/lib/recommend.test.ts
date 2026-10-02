import { describe, it, expect } from 'vitest';
import { mockBooks } from '../../../mocks/data/books';
import type { Book } from '../../catalog/types';
import type { Order } from '../../orders/types';
import { categoryWeights, recommendBooks } from './recommend';

const book = (handle: string): Book => {
  const found = mockBooks.find((b) => b.handle === handle);
  if (!found) throw new Error(handle);
  return found;
};

const order = (handles: string[], quantity = 1): Order =>
  ({
    id: handles.join('+'),
    lines: handles.map((handle) => ({ id: handle, book: book(handle), quantity, unitPriceInr: 0 })),
  }) as Order;

describe('categoryWeights', () => {
  it('counts categories by quantity across orders', () => {
    const weights = categoryWeights([order(['the-art-of-focus'], 2), order(['joy-of-minimalism'])]);
    expect(weights.get('self-help')).toBe(3);
    expect(weights.get('non-fiction')).toBe(3);
  });
});

describe('recommendBooks', () => {
  it('recommends books from the categories of past orders, excluding books already bought', () => {
    const result = recommendBooks(mockBooks, [order(['the-art-of-focus'])]);
    expect(result.isPersonal).toBe(true);
    expect(result.books.map((b) => b.handle)).toEqual([
      'the-art-of-learning',
      'the-path-to-success',
      'joy-of-minimalism',
    ]);
  });

  it('ranks the strongest category match first, then by sales', () => {
    const result = recommendBooks(mockBooks, [order(['the-midnight-hour'])], { limit: 2 });
    // Thriller and Horror each count once; several books match one of them, and
    // The Final Frontier (Thriller) sells the most.
    expect(result.books[0]?.handle).toBe('the-final-frontier');
  });

  it('leaves out excluded handles, e.g. books in the cart', () => {
    const result = recommendBooks(mockBooks, [order(['the-art-of-focus'])], {
      exclude: ['the-art-of-learning'],
    });
    expect(result.books.map((b) => b.handle)).not.toContain('the-art-of-learning');
  });

  it('uses broad categories only when nothing more specific matches', () => {
    const onlyBroad: Book = {
      ...book('the-art-of-focus'),
      handle: 'x',
      categories: [{ id: 'f', name: 'Fiction', handle: 'fiction' }],
    };
    const catalogue = [onlyBroad, book('godaan'), book('river-of-words')];
    const result = recommendBooks(catalogue, [order(['the-midnight-hour'])]);
    expect(result.isPersonal).toBe(true);
    expect(result.books.map((b) => b.handle)).toEqual(['godaan', 'x']);
  });

  it('falls back to bestsellers without order history', () => {
    const result = recommendBooks(mockBooks, []);
    expect(result.isPersonal).toBe(false);
    expect(result.books.map((b) => b.handle)).toEqual([
      'the-midnight-hour',
      'beneath-the-stars',
      'the-final-frontier',
    ]);
  });

  it('respects the limit', () => {
    expect(recommendBooks(mockBooks, [], { limit: 5 }).books).toHaveLength(5);
  });
});

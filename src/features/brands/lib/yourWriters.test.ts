import { describe, it, expect } from 'vitest';
import { mockBooks } from '../../../mocks/data/books';
import type { Order } from '../../orders/types';
import type { WriterSummary } from '../types';
import { yourWriters } from './yourWriters';

const writer = (slug: string): WriterSummary => ({ slug, name: slug, avatarUrl: '', bookCount: 1 });
const writers = [writer('arjun-patel'), writer('ananya-rao'), writer('daniel-reed')];

describe('yourWriters', () => {
  it('collects writers from orders and the wishlist, keeping the list order', () => {
    const order = {
      lines: [{ book: mockBooks.find((b) => b.handle === 'the-art-of-focus') }],
    } as Order;
    const result = yourWriters(writers, [order], ['joy-of-minimalism'], mockBooks);
    expect(result.map((w) => w.slug)).toEqual(['arjun-patel', 'daniel-reed']);
  });

  it('is empty without orders or wishlist', () => {
    expect(yourWriters(writers, [], [], mockBooks)).toEqual([]);
  });
});

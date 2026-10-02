import { describe, expect, it } from 'vitest';
import { mockBooks } from '@/mocks/data/books';
import { mockProducts } from '@/mocks/medusa/products';
import type { BookProductDTO } from '@/lib/storeTypes';
import { orderByIds, toBook } from './mappers';

const [firstProduct] = mockProducts;
if (!firstProduct) throw new Error('Mock catalogue is empty');

describe('toBook', () => {
  it('round-trips every mock product back to the same book', () => {
    const books = mockProducts.map(toBook);
    expect(
      books.map(({ categories, ...book }) => ({
        ...book,
        categories: categories.map((c) => c.handle),
      }))
    ).toEqual(
      mockBooks.map(({ categories, ...book }) => ({
        ...book,
        categories: categories.map((c) => c.handle),
      }))
    );
  });

  it('restores the category order from metadata, since Medusa returns them unordered', () => {
    const product: BookProductDTO = {
      ...firstProduct,
      categories: [...(firstProduct.categories ?? [])].reverse(),
    };
    expect(toBook(product).categories.map((c) => c.handle)).toEqual(['non-fiction', 'self-help']);
  });

  it('maps the second image as the back cover', () => {
    const product: BookProductDTO = {
      ...firstProduct,
      images: [
        { id: 'front', url: 'front.png', rank: 0 },
        { id: 'back', url: 'back.png', rank: 1 },
      ],
    };
    expect(toBook(product).backCoverUrl).toBe('back.png');
  });

  it('falls back gracefully when links and metadata are missing', () => {
    const product: BookProductDTO = {
      ...firstProduct,
      writer: null,
      publisher: null,
      metadata: null,
      type: null,
      tags: [],
    };
    const book = toBook(product);
    expect(book.author).toEqual({ name: 'Unknown writer', slug: '' });
    expect(book.publisher).toBeUndefined();
    expect(book.rating).toBeUndefined();
    expect(book.soldCount).toBeUndefined();
    expect(book.format).toBe('Paperback');
    expect(book.language).toBe('English');
  });

  it('rejects a product without a variant (it could not be added to the cart)', () => {
    expect(() => toBook({ ...firstProduct, variants: [] })).toThrow(/no variant/);
  });
});

describe('orderByIds', () => {
  it('keeps the order of the ids and drops unknown ones', () => {
    const [a, b] = mockBooks;
    if (!a || !b) throw new Error('Mock catalogue too small');
    expect(orderByIds([a, b], [b.id, 'missing', a.id]).map((book) => book.id)).toEqual([
      b.id,
      a.id,
    ]);
  });
});

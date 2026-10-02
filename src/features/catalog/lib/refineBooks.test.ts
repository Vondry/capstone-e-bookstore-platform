import { describe, expect, it } from 'vitest';
import { mockBooks } from '@/mocks/data/books';
import { refineBooks } from './refineBooks';

const titles = (books: { title: string }[]) => books.map((book) => book.title);

describe('refineBooks', () => {
  it('returns everything for the default filters, in the given order', () => {
    expect(titles(refineBooks(mockBooks, {}))).toEqual(titles(mockBooks));
  });

  it('filters by format and language, ignoring case', () => {
    const ebooks = refineBooks(mockBooks, { format: 'ebook' });
    expect(ebooks.length).toBeGreaterThan(0);
    expect(ebooks.every((book) => book.format === 'eBook')).toBe(true);

    const hindi = refineBooks(mockBooks, { language: 'hindi' });
    expect(hindi.length).toBeGreaterThan(0);
    expect(hindi.every((book) => book.language === 'Hindi')).toBe(true);
  });

  it('filters by price range, with 10000 meaning no upper limit', () => {
    const mid = refineBooks(mockBooks, { priceMin: 200, priceMax: 400 });
    expect(mid.length).toBeGreaterThan(0);
    expect(mid.every((book) => book.priceInr >= 200 && book.priceInr <= 400)).toBe(true);
    expect(refineBooks(mockBooks, { priceMin: 600, priceMax: 10000 }).length).toBeGreaterThan(0);
  });

  it('sorts by price and by copies sold', () => {
    const prices = refineBooks(mockBooks, { sortBy: 'price-asc' }).map((book) => book.priceInr);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    const sold = refineBooks(mockBooks, { sortBy: 'bestselling' }).map((b) => b.soldCount ?? 0);
    expect(sold).toEqual([...sold].sort((a, b) => b - a));
  });

  it('leaves the input array untouched', () => {
    const input = [...mockBooks];
    refineBooks(input, { sortBy: 'price-desc' });
    expect(titles(input)).toEqual(titles(mockBooks));
  });
});

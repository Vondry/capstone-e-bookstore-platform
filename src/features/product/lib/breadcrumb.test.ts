import { describe, expect, it } from 'vitest';
import { mockBooks } from '@/mocks/data/books';
import type { Book } from '../../catalog/types';
import { buildProductBreadcrumb } from './breadcrumb';

function findBook(handle: string): Book {
  const book = mockBooks.find((candidate) => candidate.handle === handle);
  if (!book) throw new Error(`Missing mock book ${handle}`);
  return book;
}

const base = findBook('joy-of-minimalism');

describe('buildProductBreadcrumb', () => {
  it('builds Home / top / sub with the top category linked', () => {
    expect(buildProductBreadcrumb(base)).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Non-fiction', to: '/category/non-fiction' },
      { label: 'Self Help' },
    ]);
  });

  it('shows a single category as the current crumb', () => {
    const book = { ...base, categories: [{ id: 'poetry', name: 'Poetry', handle: 'poetry' }] };
    expect(buildProductBreadcrumb(book)).toEqual([{ label: 'Home', to: '/' }, { label: 'Poetry' }]);
  });

  it('falls back to the title without categories', () => {
    expect(buildProductBreadcrumb({ ...base, categories: [] })).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Joy of Minimalism' },
    ]);
  });
});

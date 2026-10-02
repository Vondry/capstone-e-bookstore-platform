import { describe, expect, it } from 'vitest';
import { mockBooks } from '@/mocks/data/books';
import type { Book } from '../../catalog/types';
import { pickRelatedBooks, relatedCategory } from './related';

const [first, second, third, fourth, fifth] = mockBooks as [Book, Book, Book, Book, Book];

describe('relatedCategory', () => {
  it('prefers the sub category', () => {
    expect(relatedCategory(first)?.handle).toBe('self-help');
  });

  it('falls back to the only category, or none', () => {
    const single = { ...first, categories: [{ id: 'poetry', name: 'Poetry', handle: 'poetry' }] };
    expect(relatedCategory(single)?.handle).toBe('poetry');
    expect(relatedCategory({ ...first, categories: [] })).toBeUndefined();
  });
});

describe('pickRelatedBooks', () => {
  it('excludes the current book and limits to 3', () => {
    const result = pickRelatedBooks(first, [first, second, third, fourth, fifth]);
    expect(result.map((book) => book.id)).toEqual([second.id, third.id, fourth.id]);
  });

  it('drops duplicates and supports a custom limit', () => {
    expect(pickRelatedBooks(first, [second, second, third], 5)).toEqual([second, third]);
  });

  it('returns an empty list when only the current book matches', () => {
    expect(pickRelatedBooks(first, [first])).toEqual([]);
  });
});

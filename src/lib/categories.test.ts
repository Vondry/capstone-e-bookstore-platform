import { describe, expect, it } from 'vitest';
import { categoryName } from './categories';

describe('categoryName', () => {
  it('names sidebar genres', () => {
    expect(categoryName('self-help')).toBe('Self-help');
  });

  it('names catalogue categories that are not in the sidebar', () => {
    expect(categoryName('fiction')).toBe('Fiction');
    expect(categoryName('non-fiction')).toBe('Non-fiction');
  });

  it('returns undefined for unknown handles', () => {
    expect(categoryName('all')).toBeUndefined();
    expect(categoryName('nope')).toBeUndefined();
  });
});

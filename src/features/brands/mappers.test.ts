import { describe, expect, it } from 'vitest';
import { toPublisher, toWriterSummary } from './mappers';

describe('brand mappers', () => {
  it('maps a writer summary', () => {
    expect(
      toWriterSummary({ slug: 'a-b', name: 'A B', avatar_url: 'a.svg', book_count: 2 })
    ).toEqual({ slug: 'a-b', name: 'A B', avatarUrl: 'a.svg', bookCount: 2 });
  });

  it('maps a publisher and ignores its product ids', () => {
    expect(toPublisher({ slug: 'p', name: 'P', description: 'D', book_count: 3 })).toEqual({
      slug: 'p',
      name: 'P',
      description: 'D',
      bookCount: 3,
    });
  });
});

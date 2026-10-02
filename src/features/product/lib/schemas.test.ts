import { describe, expect, it } from 'vitest';
import { REVIEW_MAX_LENGTH, reviewSchema } from './schemas';

function messages(input: unknown): string[] {
  const result = reviewSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('reviewSchema', () => {
  it('accepts a review with a rating', () => {
    expect(reviewSchema.parse({ text: '  Great read  ', rating: 5 })).toEqual({
      text: 'Great read',
      rating: 5,
    });
  });

  it('requires text', () => {
    expect(messages({ text: '   ', rating: 3 })).toEqual(['Please write a review']);
  });

  it('allows exactly 100 characters and rejects more', () => {
    expect(messages({ text: 'a'.repeat(REVIEW_MAX_LENGTH), rating: 3 })).toEqual([]);
    expect(messages({ text: 'a'.repeat(REVIEW_MAX_LENGTH + 1), rating: 3 })).toEqual([
      'Reviews can be at most 100 characters',
    ]);
  });

  it('requires a rating between 1 and 5', () => {
    expect(messages({ text: 'Nice', rating: 0 })).toEqual(['Please choose a rating']);
    expect(messages({ text: 'Nice', rating: 6 })).toEqual(['Please choose a rating']);
  });
});

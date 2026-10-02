import type { Book, Category } from '../../catalog/types';

export const RELATED_LIMIT = 3;

/** The most specific category (sub category when present), used to find related reads */
export function relatedCategory(book: Book): Category | undefined {
  return book.categories[1] ?? book.categories[0];
}

/** Up to `limit` books from the candidates, excluding the current book and duplicates */
export function pickRelatedBooks(book: Book, candidates: Book[], limit = RELATED_LIMIT): Book[] {
  const seen = new Set<string>([book.id]);
  const related: Book[] = [];
  for (const candidate of candidates) {
    if (related.length >= limit) break;
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    related.push(candidate);
  }
  return related;
}

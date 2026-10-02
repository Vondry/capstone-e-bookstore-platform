/**
 * The catalogue filters Medusa's product list can't apply (plan 14, spike 3): format, language
 * and price range, and the price / bestseller sort orders. Search, category and "newest" are
 * applied by the API. Fine for the seed catalogue; a large catalogue would need a search route.
 */

import type { Book, Filters } from '../types';

export const PRICE_FILTER_MAX = 10000;

export function refineBooks(books: Book[], filters: Partial<Filters>): Book[] {
  const { language = 'all', format = 'all', priceMin = 0, priceMax = PRICE_FILTER_MAX } = filters;

  const refined = books.filter(
    (book) =>
      (language === 'all' || book.language.toLowerCase() === language.toLowerCase()) &&
      (format === 'all' || book.format.toLowerCase() === format.toLowerCase()) &&
      book.priceInr >= priceMin &&
      (priceMax >= PRICE_FILTER_MAX || book.priceInr <= priceMax)
  );

  switch (filters.sortBy) {
    case 'price-asc':
      return refined.sort((a, b) => a.priceInr - b.priceInr);
    case 'price-desc':
      return refined.sort((a, b) => b.priceInr - a.priceInr);
    case 'bestselling':
      return refined.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
    default:
      // relevance and newest keep the API's order
      return refined;
  }
}

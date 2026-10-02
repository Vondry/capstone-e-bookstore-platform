/**
 * SIMULATED: recommendations based on order history (.bob/rules/01-stack-and-architecture.md).
 * Books from the categories of past orders, excluding books already bought; falls back to
 * bestsellers when there is no history or nothing matches.
 */

import type { Book } from '../../catalog/types';
import type { Order } from '../../orders/types';

/** Top-level categories match almost everything, so they only count when nothing else does */
const BROAD_CATEGORIES = new Set(['fiction', 'non-fiction']);

export type RecommendationOptions = {
  /** Handles to leave out, e.g. books already in the cart */
  exclude?: string[];
  limit?: number;
};

export type Recommendations = {
  books: Book[];
  /** true when based on the customer's orders, false for the bestseller fallback */
  isPersonal: boolean;
};

const bySales = (a: Book, b: Book) => (b.soldCount ?? 0) - (a.soldCount ?? 0);

/** How often each category appears in the customer's orders */
export function categoryWeights(orders: Order[]): Map<string, number> {
  const weights = new Map<string, number>();
  for (const order of orders) {
    for (const line of order.lines) {
      for (const category of line.book.categories) {
        weights.set(category.handle, (weights.get(category.handle) ?? 0) + line.quantity);
      }
    }
  }
  return weights;
}

function score(book: Book, weights: Map<string, number>, includeBroad: boolean): number {
  return book.categories.reduce((sum, category) => {
    if (!includeBroad && BROAD_CATEGORIES.has(category.handle)) return sum;
    return sum + (weights.get(category.handle) ?? 0);
  }, 0);
}

export function recommendBooks(
  catalogue: Book[],
  orders: Order[],
  { exclude = [], limit = 3 }: RecommendationOptions = {}
): Recommendations {
  const bought = new Set(orders.flatMap((order) => order.lines.map((line) => line.book.handle)));
  const candidates = catalogue.filter(
    (book) => !bought.has(book.handle) && !exclude.includes(book.handle)
  );
  const weights = categoryWeights(orders);

  for (const includeBroad of [false, true]) {
    const matches = candidates
      .map((book) => ({ book, score: score(book, weights, includeBroad) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || bySales(a.book, b.book))
      .map((entry) => entry.book);
    if (matches.length > 0) return { books: matches.slice(0, limit), isPersonal: true };
  }

  return { books: [...candidates].sort(bySales).slice(0, limit), isPersonal: false };
}

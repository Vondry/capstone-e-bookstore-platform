/**
 * "Your writers": writers of books the customer ordered or saved to the wishlist
 */

import type { Book } from '../../catalog/types';
import type { Order } from '../../orders/types';
import type { WriterSummary } from '../types';

export function yourWriters(
  writers: WriterSummary[],
  orders: Order[],
  wishlistHandles: string[],
  catalogue: Book[]
): WriterSummary[] {
  const slugs = new Set<string>();
  orders.forEach((order) => {
    order.lines.forEach((line) => slugs.add(line.book.author.slug));
  });
  catalogue
    .filter((book) => wishlistHandles.includes(book.handle))
    .forEach((book) => slugs.add(book.author.slug));
  return writers.filter((writer) => slugs.has(writer.slug));
}

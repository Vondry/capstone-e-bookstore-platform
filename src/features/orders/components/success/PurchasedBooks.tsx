import { BookCard } from '@/features/catalog/components/BookCard';
import type { OrderLine } from '../../types';

export type PurchasedBooksProps = {
  lines: OrderLine[];
  /** When the order was placed (ISO), for the delivery estimate */
  orderedAt: string;
};

/** The books of an order as horizontal cards: 1 column on sm, 2 columns from md */
export function PurchasedBooks({ lines, orderedAt }: Readonly<PurchasedBooksProps>) {
  return (
    <ul aria-label="Purchased books" className="grid grid-cols-1 gap-24 text-left md:grid-cols-2">
      {lines.map((line) => (
        <li key={line.id}>
          <BookCard book={line.book} orderedAt={orderedAt}>
            {line.quantity > 1 && (
              <p className="text-14 text-text-secondary">Qty {line.quantity}</p>
            )}
          </BookCard>
        </li>
      ))}
    </ul>
  );
}

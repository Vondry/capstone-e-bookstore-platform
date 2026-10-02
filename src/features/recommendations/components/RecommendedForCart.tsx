/**
 * "Recommended for You" under the cart (deck slide 11: recommends items based on order history)
 */

import { useMemo } from 'react';
import { BookCard } from '../../catalog/components/BookCard';
import { useRecommendations } from '../hooks/useRecommendations';

export type RecommendedForCartProps = {
  /** Books already in the cart */
  cartHandles: string[];
};

export function RecommendedForCart({ cartHandles }: Readonly<RecommendedForCartProps>) {
  const exclude = useMemo(() => cartHandles, [cartHandles]);
  const { books, isPersonal, isLoading } = useRecommendations({ exclude });

  if (isLoading || books.length === 0) return null;

  const title = isPersonal ? 'Recommended for You' : 'Popular right now';
  return (
    <section aria-labelledby="cart-recommendations" className="mt-32">
      <h2 id="cart-recommendations" className="mb-16 text-20 text-text-primary">
        {title}
      </h2>
      {isPersonal && (
        <p className="-mt-8 mb-16 text-14 text-text-secondary">
          Based on the books you’ve ordered before
        </p>
      )}
      <ul className="grid grid-cols-1 gap-24 md:grid-cols-2 xlg:grid-cols-3">
        {books.map((book) => (
          <li key={book.id}>
            <BookCard book={book} headingLevel="h3" />
          </li>
        ))}
      </ul>
    </section>
  );
}

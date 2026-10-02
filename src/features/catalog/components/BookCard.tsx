/**
 * BookCard component - Horizontal book card layout
 */

import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../types';
import { formatCurrency, formatDeliveryDate } from '../../../lib/formatters';

export type BookCardProps = {
  book: Book;
  onClick?: () => void;
  /** Extra content under the delivery line, e.g. a quantity stepper (S4) or "Buy it again" (S7) */
  children?: React.ReactNode;
  /** Order placement time (ISO): delivery is estimated from it instead of from today (S6, S7) */
  orderedAt?: string;
  /** Title heading level: h3 when the card sits under a section's h2 */
  headingLevel?: 'h2' | 'h3';
};

// The title link/button stretches over the whole card (::after), so the card is clickable
// without nesting the author and category links inside another link.
const stretchedClass =
  'text-left after:absolute after:inset-0 focus-visible:outline-hidden focus-visible:after:ring-2 focus-visible:after:ring-focus';

const inlineLinkClass = 'relative z-10 text-link underline hover:text-interactive-hover';

export function BookCard({
  book,
  onClick,
  children,
  orderedAt,
  headingLevel: Heading = 'h2',
}: Readonly<BookCardProps>) {
  const deliveryDate = formatDeliveryDate(book.format, orderedAt ?? new Date());

  return (
    <article className="group relative flex gap-16">
      {/* Book cover */}
      <img
        src={book.coverUrl}
        alt={`${book.title} by ${book.author.name} — cover`}
        className="h-[180px] w-[120px] shrink-0 object-cover md:h-[216px] md:w-[144px]"
        loading="lazy"
      />

      {/* Book info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Heading className="line-clamp-2 text-16 leading-tight font-normal text-text-primary group-hover:underline md:text-20">
          {onClick ? (
            <button type="button" onClick={onClick} className={stretchedClass}>
              {book.title}
            </button>
          ) : (
            <Link to={`/books/${book.handle}`} className={stretchedClass}>
              {book.title}
            </Link>
          )}
        </Heading>

        <p className="mt-8 text-14 text-text-primary">
          by{' '}
          <Link to={`/writers/${book.author.slug}`} className={inlineLinkClass}>
            {book.author.name}
          </Link>
        </p>

        <p className="mt-8 line-clamp-1 text-14 text-text-secondary md:line-clamp-2">
          {book.description}
        </p>

        <p className="mt-16 text-14 text-text-primary">{book.format}</p>

        <p className="mt-8 text-14">
          {book.categories.map((category, index) => (
            <Fragment key={category.id}>
              {index > 0 && <span className="text-text-primary">, </span>}
              <Link to={`/category/${category.handle}`} className={inlineLinkClass}>
                {category.name}
              </Link>
            </Fragment>
          ))}
        </p>

        <p className="mt-auto pt-16 text-20 font-semibold text-text-primary">
          {formatCurrency(book.priceInr)}
        </p>
        <p className="text-14 text-text-primary">
          {book.format === 'eBook' ? (
            <>
              Delivery: <strong className="font-semibold">Instant</strong>
            </>
          ) : (
            <>
              Delivery by <strong className="font-semibold">{deliveryDate}</strong>
            </>
          )}
        </p>
        {children && <div className="relative z-10 mt-16">{children}</div>}
      </div>
    </article>
  );
}

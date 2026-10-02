/**
 * BookGrid component - Responsive grid of book cards
 */

import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { BookCard } from './BookCard';
import type { Book } from '../types';

export type BookGridProps = {
  books: Book[];
  loading?: boolean;
  error?: Error;
  /** Shows a "Try again" button in the error state */
  onRetry?: () => void;
  emptyMessage?: string;
  /** Heading level of each card title: h3 when the grid sits under an h2 */
  cardHeadingLevel?: 'h2' | 'h3';
};

function BookSkeleton() {
  return (
    <div className="flex animate-pulse gap-16">
      {/* Cover skeleton */}
      <div className="h-[180px] w-[120px] shrink-0 bg-layer-2 md:h-[216px] md:w-[144px]" />

      {/* Info skeleton */}
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <div className="h-20 w-3/4 bg-layer-2" />
        <div className="h-16 w-1/2 bg-layer-2" />
        <div className="h-14 w-full bg-layer-2" />
        <div className="h-14 w-5/6 bg-layer-2" />
        <div className="h-12 w-1/3 bg-layer-2" />
        <div className="mt-auto h-20 w-1/4 bg-layer-2" />
      </div>
    </div>
  );
}

export function BookGrid({
  books,
  loading,
  error,
  onRetry,
  emptyMessage = 'No books found',
  cardHeadingLevel,
}: Readonly<BookGridProps>) {
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-24 md:grid-cols-2 xlg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <BookSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load books"
        error={error}
        onRetry={onRetry}
        className="min-h-[400px]"
      />
    );
  }

  // Empty state
  if (books.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description="Try adjusting your filters or search terms"
        className="min-h-[400px]"
      />
    );
  }

  // Success state
  return (
    <div className="grid grid-cols-1 gap-24 md:grid-cols-2 xlg:grid-cols-3">
      {books.map((book) => (
        <BookCard key={book.id} book={book} headingLevel={cardHeadingLevel} />
      ))}
    </div>
  );
}

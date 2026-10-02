import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookCard } from '../../catalog/components/BookCard';
import type { Book } from '../../catalog/types';
import { useRelatedBooks } from '../hooks/useProduct';
import { RELATED_LIMIT } from '../lib/related';
import { SectionHeading } from './SectionHeading';

export type RelatedReadsProps = {
  book: Book;
};

export function RelatedCardSkeleton() {
  return (
    <div className="flex gap-16">
      <Skeleton className="h-[180px] w-[120px] shrink-0" />
      <div className="flex-1 space-y-8">
        <Skeleton className="h-24 w-3/4" />
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

function RelatedBody({ book }: Readonly<RelatedReadsProps>) {
  const { data: books, isPending, isError, error, refetch } = useRelatedBooks(book);

  if (isPending) {
    return (
      <div className="flex flex-col gap-24" aria-busy="true">
        {Array.from({ length: RELATED_LIMIT }, (_, index) => (
          <RelatedCardSkeleton key={index} />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <ErrorState
        title="Could not load related reads"
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }
  if (books.length === 0) {
    return (
      <EmptyState
        title="No related reads yet"
        description="Browse the catalogue to find your next book."
      />
    );
  }
  return (
    <ul className="flex flex-col gap-24">
      {books.map((related) => (
        <li key={related.id}>
          <BookCard book={related} headingLevel="h3" />
        </li>
      ))}
    </ul>
  );
}

/** Right column ≥ lg (with a vertical divider); below the reviews on smaller screens */
export function RelatedReads({ book }: Readonly<RelatedReadsProps>) {
  return (
    <aside
      aria-labelledby="related-heading"
      className="border-t border-border pt-24 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-24"
    >
      <SectionHeading id="related-heading">Related Reads</SectionHeading>
      <RelatedBody book={book} />
    </aside>
  );
}

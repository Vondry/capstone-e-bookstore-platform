import { BookGrid } from '../../catalog/components/BookGrid';
import { useBooksByBrand } from '../hooks/useBrands';
import type { BrandFilter } from '../api';

export type BrandBooksProps = {
  title: string;
  filter: BrandFilter;
};

/** Books by one writer or publisher */
export function BrandBooks({ title, filter }: Readonly<BrandBooksProps>) {
  const { data, isLoading, error, refetch } = useBooksByBrand(filter);
  return (
    <section aria-labelledby="brand-books" className="mt-32">
      <h2 id="brand-books" className="mb-16 text-20 text-text-primary">
        {title}
      </h2>
      <BookGrid
        books={data ?? []}
        loading={isLoading}
        error={error ?? undefined}
        onRetry={() => void refetch()}
        emptyMessage="No books yet"
        cardHeadingLevel="h3"
      />
    </section>
  );
}

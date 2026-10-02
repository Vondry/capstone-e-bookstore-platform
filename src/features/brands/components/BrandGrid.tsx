import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

export type BrandGridProps<T> = {
  items: T[] | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  getKey: (item: T) => string;
  emptyTitle?: string;
  renderItem: (item: T) => React.ReactNode;
};

const gridClass = 'grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3 xlg:grid-cols-4';

/** Responsive grid of writer or publisher cards with loading, error and empty states */
export function BrandGrid<T>({
  items,
  isLoading,
  error,
  onRetry,
  getKey,
  renderItem,
  emptyTitle = 'Nothing here yet',
}: Readonly<BrandGridProps<T>>) {
  if (isLoading) {
    return (
      <div className={gridClass} aria-busy="true">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-[80px]" />
        ))}
      </div>
    );
  }
  if (error) return <ErrorState title="Couldn't load this list" error={error} onRetry={onRetry} />;

  if (!items?.length) return <EmptyState title={emptyTitle} />;

  return (
    <ul className={gridClass}>
      {items.map((item) => (
        <li key={getKey(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

import { Skeleton } from '@/components/ui/Skeleton';
import { RelatedCardSkeleton } from './RelatedReads';

/** Mirrors the product layout: breadcrumb, cover + details, then the related column */
export function ProductSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading book"
      className="grid gap-32 lg:grid-cols-[minmax(0,1fr)_360px] xlg:grid-cols-[minmax(0,1fr)_400px]"
    >
      <div className="space-y-24">
        <Skeleton className="h-16 w-1/3" />
        <div className="flex flex-col gap-24 md:flex-row">
          <Skeleton className="aspect-[2/3] w-full max-w-[240px] md:w-[200px]" />
          <div className="flex-1 space-y-12">
            <Skeleton className="h-32 w-2/3" />
            <Skeleton className="h-16 w-1/3" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-1/2" />
            <Skeleton className="h-40 w-1/4" />
            <div className="flex gap-16">
              <Skeleton className="h-48 w-[192px]" />
              <Skeleton className="h-48 w-[192px]" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-24">
        <Skeleton className="h-24 w-1/2" />
        <RelatedCardSkeleton />
        <RelatedCardSkeleton />
        <RelatedCardSkeleton />
      </div>
    </div>
  );
}

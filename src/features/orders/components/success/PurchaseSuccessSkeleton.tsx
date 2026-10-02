import { Skeleton } from '@/components/ui/Skeleton';

/** Loading placeholder in the shape of PurchaseSuccessPanel */
export function PurchaseSuccessSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading your order"
      className="mx-auto flex w-full max-w-[650px] flex-col items-center bg-layer-1 p-24 md:p-32"
    >
      <Skeleton className="h-48 w-48 rounded-full" />
      <Skeleton className="mt-24 h-24 w-3/4" />
      <Skeleton className="mt-8 h-24 w-1/2" />
      <div className="mt-24 grid w-full grid-cols-1 gap-24 md:grid-cols-2">
        {[0, 1].map((key) => (
          <div key={key} className="flex gap-16">
            <Skeleton className="h-[180px] w-[120px] shrink-0" />
            <div className="flex flex-1 flex-col gap-8">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-2/3" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="mt-24 h-48 w-[200px]" />
    </div>
  );
}

import { Skeleton } from '@/components/ui/Skeleton';

const PANELS = ['first', 'second'] as const;
const CARDS = ['a', 'b', 'c'] as const;

/** Mirrors OrderPanel: header row + grid of horizontal book cards */
export function OrdersSkeleton() {
  return (
    <div role="status" aria-label="Loading your orders" className="flex flex-col gap-24">
      {PANELS.map((panel) => (
        <div key={panel} className="bg-layer-1 p-16 md:p-24">
          <div className="flex flex-wrap items-center gap-16 border-b border-border pb-16">
            <Skeleton className="h-24 w-[140px]" />
            <Skeleton className="h-24 w-[80px]" />
            <Skeleton className="h-16 w-[180px]" />
            <Skeleton className="h-16 w-[100px]" />
          </div>
          <div className="mt-24 grid grid-cols-1 gap-24 md:grid-cols-2 xlg:grid-cols-3">
            {CARDS.map((card) => (
              <div key={card} className="flex gap-16">
                <Skeleton className="h-[180px] w-[120px] shrink-0 md:h-[216px] md:w-[144px]" />
                <div className="flex flex-1 flex-col gap-8">
                  <Skeleton className="h-24 w-3/4" />
                  <Skeleton className="h-16 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="mt-auto h-40 w-[140px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

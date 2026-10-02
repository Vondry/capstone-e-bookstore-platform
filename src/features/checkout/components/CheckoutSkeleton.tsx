/**
 * Loading placeholder mirroring the S4 layout: cart cards, address form and Grand Total
 */

import { Skeleton } from '@/components/ui/Skeleton';

export function CheckoutSkeleton() {
  return (
    <div role="status" aria-label="Loading your cart" className="flex flex-col gap-24">
      <div className="grid grid-cols-1 gap-32 bg-layer-1 p-16 md:grid-cols-2 md:p-24 xlg:grid-cols-3">
        {[0, 1].map((key) => (
          <div key={key} className="flex gap-16">
            <Skeleton className="h-[180px] w-[120px] shrink-0 md:h-[216px] md:w-[144px]" />
            <div className="flex flex-1 flex-col gap-8">
              <Skeleton className="h-24 w-3/4" />
              <Skeleton className="h-16 w-1/2" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="mt-auto h-48 w-[144px]" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-24 lg:grid-cols-[3fr_2fr]">
        <div className="grid grid-cols-1 gap-16 bg-layer-1 p-16 md:grid-cols-2 md:p-24">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-48 w-full" />
          ))}
        </div>
        <div className="flex flex-col gap-12 bg-layer-1 p-16 md:p-24">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

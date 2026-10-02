import { Skeleton } from '@/components/ui/Skeleton';

/** Matches the payment panel: header row, tab column and a 2 × 2 field grid */
export function PaymentSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading payment"
      className="mx-auto w-full max-w-[650px] bg-layer-1"
    >
      <div className="flex justify-between gap-16 border-b border-border p-16">
        <Skeleton className="h-24 w-[160px]" />
        <Skeleton className="h-24 w-[200px]" />
      </div>
      <div className="flex flex-col md:flex-row">
        <Skeleton className="h-48 w-full md:h-[192px] md:w-[168px]" />
        <div className="grid flex-1 grid-cols-1 gap-16 p-16 md:grid-cols-2">
          {['number', 'name', 'cvv', 'expiry'].map((field) => (
            <Skeleton key={field} className="h-[68px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

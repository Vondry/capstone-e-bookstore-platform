import { cn } from '@/lib/utils';
import type { OrderStatus } from '../../types';
import { orderStatusLabel } from '../../lib/orderFormat';

export type OrderStatusTagProps = {
  status: OrderStatus;
};

/** Square Carbon-style tag. SIMULATED: "Cancellation requested" is a request, never "Cancelled". */
export function OrderStatusTag({ status }: Readonly<OrderStatusTagProps>) {
  return (
    <span
      className={cn(
        // Status colour on a 3px bar (like toasts) keeps the text at AA contrast in both themes
        'inline-flex h-24 items-center border-l-[3px] bg-layer-2 px-8 text-12 text-text-primary',
        status === 'placed' ? 'border-support-success' : 'border-support-error'
      )}
    >
      <span className="sr-only">Status: </span>
      {orderStatusLabel(status)}
    </span>
  );
}

import { useId } from 'react';
import { BookCard } from '@/features/catalog/components/BookCard';
import type { Order } from '../../types';
import { canCancel, hoursLeftToCancel } from '../../lib/cancelWindow';
import { BuyAgainButton } from './BuyAgainButton';
import { CancelOrderButton } from './CancelOrderButton';
import { OrderHeader } from './OrderHeader';

export type OrderPanelProps = {
  order: Order;
  /** Current time; the cancel window is re-evaluated on every render */
  now: Date;
};

/** One order as an S4-style layer-1 panel with S2 book cards */
export function OrderPanel({ order, now }: Readonly<OrderPanelProps>) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="bg-layer-1 p-16 md:p-24">
      <OrderHeader
        order={order}
        headingId={headingId}
        actions={
          canCancel(order, now) && (
            <CancelOrderButton
              orderId={order.id}
              displayId={order.displayId}
              hoursLeft={hoursLeftToCancel(order, now)}
            />
          )
        }
      />
      <ul className="mt-24 grid grid-cols-1 gap-24 md:grid-cols-2 xlg:grid-cols-3">
        {order.lines.map((line) => (
          <li key={line.id}>
            <BookCard book={line.book} orderedAt={order.createdAt} headingLevel="h3">
              <BuyAgainButton book={line.book} />
            </BookCard>
          </li>
        ))}
      </ul>
    </section>
  );
}

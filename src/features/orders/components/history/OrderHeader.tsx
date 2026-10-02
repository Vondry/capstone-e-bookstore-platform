import { formatCurrency } from '@/lib/formatters';
import type { Order } from '../../types';
import { formatItemCount, formatOrderDate } from '../../lib/orderFormat';
import { OrderStatusTag } from './OrderStatusTag';

export type OrderHeaderProps = {
  order: Order;
  headingId: string;
  /** e.g. the Cancel order button */
  actions?: React.ReactNode;
};

export function OrderHeader({ order, headingId, actions }: Readonly<OrderHeaderProps>) {
  return (
    <header className="flex flex-col gap-16 border-b border-border pb-16 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-x-16 gap-y-8">
        <h2 id={headingId} className="text-20 text-text-primary">
          Order #{order.displayId}
        </h2>
        <OrderStatusTag status={order.status} />
        <p className="text-14 text-text-secondary">
          Placed on <time dateTime={order.createdAt}>{formatOrderDate(order.createdAt)}</time>
        </p>
        <p className="text-14 text-text-secondary">{formatItemCount(order.totals.itemCount)}</p>
        <p className="text-16 font-semibold text-text-primary">
          <span className="sr-only">Total: </span>
          {formatCurrency(order.totals.total, true)}
        </p>
      </div>
      {actions}
    </header>
  );
}

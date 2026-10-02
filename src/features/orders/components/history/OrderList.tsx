import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useOrders } from '../../hooks/useOrders';
import { OrderPanel } from './OrderPanel';
import { OrdersSkeleton } from './OrdersSkeleton';
import { useNow } from './useNow';

export type OrderListProps = {
  /** False for guests: the orders API is not called */
  enabled: boolean;
};

/** The logged-in customer's orders, newest first (the API already sorts them) */
export function OrderList({ enabled }: Readonly<OrderListProps>) {
  const { data: orders, isPending, isError, error, refetch } = useOrders(enabled);
  // Re-evaluates the cancel window every minute, so "Cancel order" disappears at 48 h
  const now = useNow();

  if (isError) {
    return (
      <ErrorState
        title="We couldn't load your orders"
        error={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }
  if (isPending) return <OrdersSkeleton />;

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Books you buy will show up here, ready to buy again."
        action={
          <Link to="/" className="text-16 text-link underline hover:text-interactive-hover">
            Browse the catalogue
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-24">
      {orders.map((order) => (
        <OrderPanel key={order.id} order={order} now={now} />
      ))}
    </div>
  );
}

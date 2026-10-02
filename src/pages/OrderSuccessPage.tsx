/**
 * OrderSuccessPage - S6 Purchase success (`/orders/:id/success`)
 */

import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { IllustratedBackground } from '@/components/ui/Illustration';
import { useCustomer } from '@/features/auth/hooks/useCustomer';
import { PurchaseSuccessPanel } from '@/features/orders/components/success/PurchaseSuccessPanel';
import { PurchaseSuccessSkeleton } from '@/features/orders/components/success/PurchaseSuccessSkeleton';
import { useOrder } from '@/features/orders/hooks/useOrders';
import { isHttpError } from '@/lib/medusa';

const panelWidth = 'mx-auto max-w-[860px]';

export function OrderSuccessPage() {
  const { id = '' } = useParams<{ id: string }>();
  const order = useOrder(id);
  const customer = useCustomer();

  useEffect(() => {
    document.title = 'Order confirmed · Book Worm';
  }, []);

  const isNotFound = isHttpError(order.error, 404);

  const renderContent = () => {
    if (order.isPending) {
      return <PurchaseSuccessSkeleton />;
    }
    if (isNotFound) {
      return (
        <>
          <h1 className="sr-only">Order not found</h1>
          <EmptyState
            className={panelWidth}
            title="We couldn't find that order"
            description="Check the link, or find it later under My Orders."
            action={
              <Link to="/" className="text-14 text-link underline">
                Back to the catalogue
              </Link>
            }
          />
        </>
      );
    }
    if (order.isError) {
      return (
        <>
          <h1 className="sr-only">Order confirmation</h1>
          <ErrorState
            className={panelWidth}
            title="We couldn't load your order"
            error={order.error}
            onRetry={() => void order.refetch()}
          />
        </>
      );
    }
    return <PurchaseSuccessPanel order={order.data} isGuest={customer.data === null} />;
  };

  return <IllustratedBackground>{renderContent()}</IllustratedBackground>;
}

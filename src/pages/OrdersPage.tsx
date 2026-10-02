/**
 * OrdersPage - S7 My Orders (no wireframe: S2 book cards inside S4-style panels)
 * Order history, Buy it again and SIMULATED cancellation requests within 48 h.
 */

import { useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/ui/ErrorState';
import { useCustomer } from '../features/auth/hooks/useCustomer';
import { GuestPrompt } from '../features/orders/components/history/GuestPrompt';
import { OrderList } from '../features/orders/components/history/OrderList';
import { OrdersSkeleton } from '../features/orders/components/history/OrdersSkeleton';

function OrdersContent() {
  const { data: customer, isPending, isError, error, refetch } = useCustomer();

  if (isPending) return <OrdersSkeleton />;
  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }
  if (!customer) return <GuestPrompt />;
  return <OrderList enabled />;
}

export function OrdersPage() {
  useEffect(() => {
    document.title = 'My Orders · Book Worm';
  }, []);

  return (
    <PageContainer>
      <h1 className="mb-24 text-28 text-text-primary">My Orders</h1>
      <OrdersContent />
    </PageContainer>
  );
}

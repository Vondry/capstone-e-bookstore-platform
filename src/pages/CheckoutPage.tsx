/**
 * CheckoutPage - S4 Shopping cart + checkout (`/checkout`)
 * Wireframe: docs/wireframes/03-cart-checkout.png
 */

import { useEffect } from 'react';
import { ButtonLink } from '../components/ui/ButtonLink';
import { ArrowRight } from '@carbon/icons-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { useCustomer } from '../features/auth/hooks/useCustomer';
import { useCart } from '../features/cart/hooks/useCart';
import { CheckoutContent } from '../features/checkout/components/CheckoutContent';
import { CheckoutSkeleton } from '../features/checkout/components/CheckoutSkeleton';
import { buildCheckoutBreadcrumb } from '../features/checkout/lib/breadcrumb';

export function CheckoutPage() {
  const cartQuery = useCart();
  const customerQuery = useCustomer();
  const cart = cartQuery.data;

  useEffect(() => {
    document.title = 'Checkout · Book Worm';
  }, []);

  const renderBody = () => {
    // The customer decides whether saved address and gift points show, so wait for both
    if (cartQuery.isPending || customerQuery.isPending) return <CheckoutSkeleton />;
    if (cartQuery.isError) {
      return (
        <ErrorState
          title="We couldn't load your cart"
          error={cartQuery.error}
          onRetry={() => void cartQuery.refetch()}
        />
      );
    }
    if (!cart || cart.lines.length === 0) {
      return (
        <EmptyState
          title="Your cart is empty"
          description="Find your next read in the catalogue and add it to your cart."
          action={
            <ButtonLink to="/" className="gap-24" icon={<ArrowRight size={20} />}>
              Browse books
            </ButtonLink>
          }
        />
      );
    }
    return <CheckoutContent cart={cart} customer={customerQuery.data ?? null} />;
  };

  return (
    <PageContainer>
      <Breadcrumb items={buildCheckoutBreadcrumb(cart)} />
      <h1 className="mt-24 mb-16 text-20 text-text-primary">Shopping Cart</h1>
      {renderBody()}
    </PageContainer>
  );
}

/**
 * PaymentPage - S5 Payment (`/payment`): steps 10 Initiate payment, 11 Payment confirmation
 */

import { useEffect } from 'react';
import { ErrorState } from '../components/ui/ErrorState';
import { IllustratedBackground } from '../components/ui/Illustration';
import { useCart } from '../features/cart/hooks/useCart';
import { PaymentNotice } from '../features/payment/components/PaymentNotice';
import { PaymentPanel } from '../features/payment/components/PaymentPanel';
import { PaymentSkeleton } from '../features/payment/components/PaymentSkeleton';
import { usePayment } from '../features/payment/hooks/usePayment';

export function PaymentPage() {
  const { data: cart, isPending, isError, error, refetch } = useCart();
  const payment = usePayment();

  useEffect(() => {
    document.title = 'Payment · Book Worm';
  }, []);

  const renderContent = () => {
    // After a successful payment the cart is cleared; keep the skeleton until we navigate away
    if (isPending || payment.isComplete) return <PaymentSkeleton />;
    if (isError) {
      return (
        <ErrorState
          className="mx-auto max-w-[650px]"
          title="We couldn't load your basket"
          error={error}
          onRetry={() => void refetch()}
        />
      );
    }
    if (!cart || cart.lines.length === 0 || !cart.shippingAddress)
      return <PaymentNotice cart={cart} />;
    return <PaymentPanel total={cart.totals.total} payment={payment} />;
  };

  return <IllustratedBackground>{renderContent()}</IllustratedBackground>;
}

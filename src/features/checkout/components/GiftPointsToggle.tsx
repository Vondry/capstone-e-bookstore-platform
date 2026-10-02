/**
 * Redeem gift points (S4). SIMULATED: points live in customer/cart metadata
 */

import { Link } from 'react-router-dom';
import { Toggle } from '@/components/ui/Toggle';
import { useToast } from '@/components/ui/toastContext';
import type { Customer } from '../../auth/types';
import { useUpdateCart } from '../../cart/hooks/useCart';
import { withRedirect } from '../../auth/lib/redirect';

export type GiftPointsToggleProps = {
  customer: Customer | null;
  redeemPoints: boolean;
};

export function GiftPointsToggle({ customer, redeemPoints }: Readonly<GiftPointsToggleProps>) {
  const updateCart = useUpdateCart();
  const { showToast } = useToast();

  if (!customer) {
    return (
      <p className="flex min-h-48 items-center text-14 text-text-secondary">
        <span>
          <Link to={withRedirect('/login', '/checkout')} className="text-link underline">
            Log in
          </Link>{' '}
          to redeem gift points.
        </span>
      </p>
    );
  }

  return (
    <Toggle
      label="Redeem gift points"
      description={`Available: ${String(customer.giftPoints)} points`}
      checked={redeemPoints}
      disabled={customer.giftPoints <= 0 || updateCart.isPending}
      onChange={(checked) => {
        updateCart.mutate(
          { redeemPoints: checked },
          {
            onError: () => {
              showToast('Could not update gift points. Please try again.', 'error');
            },
          }
        );
      }}
    />
  );
}

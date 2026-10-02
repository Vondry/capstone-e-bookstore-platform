/**
 * S4 body once the cart has loaded: items, address form and Grand Total
 */

import type { Customer } from '../../auth/types';
import type { Cart } from '../../cart/types';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { AddressForm } from './AddressForm';
import { CartItems } from './CartItems';
import { GrandTotalPanel } from './GrandTotalPanel';
import { RecommendedForCart } from '../../recommendations/components/RecommendedForCart';

export type CheckoutContentProps = {
  cart: Cart;
  customer: Customer | null;
};

export function CheckoutContent({ cart, customer }: Readonly<CheckoutContentProps>) {
  const { form, canUseSavedAddress, savedAddressSelected, toggleSavedAddress, onSubmit, isSaving } =
    useCheckoutForm({ cart, customer });

  return (
    <div className="flex flex-col gap-24">
      <CartItems cart={cart} />
      <div className="grid grid-cols-1 items-start gap-24 lg:grid-cols-[3fr_2fr]">
        <AddressForm
          form={form}
          canUseSavedAddress={canUseSavedAddress}
          savedAddressSelected={savedAddressSelected}
          onToggleSavedAddress={toggleSavedAddress}
          onSubmit={onSubmit}
        />
        <GrandTotalPanel cart={cart} customer={customer} isSaving={isSaving} />
      </div>
      <RecommendedForCart cartHandles={cart.lines.map((line) => line.book.handle)} />
    </div>
  );
}

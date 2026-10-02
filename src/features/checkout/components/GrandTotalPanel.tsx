/**
 * Grand Total panel (S4): totals from the server, coupon, gift points and Pay Now
 */

import { Purchase } from '@carbon/icons-react';
import { Button } from '@/components/ui/Button';
import { BookIllustration } from '@/components/ui/Illustration';
import { formatCurrency } from '@/lib/formatters';
import type { Customer } from '../../auth/types';
import type { Cart } from '../../cart/types';
import { ADDRESS_FORM_ID } from './AddressForm';
import { CouponField } from './CouponField';
import { GiftPointsToggle } from './GiftPointsToggle';
import { TotalsRow } from './TotalsRow';

export type GrandTotalPanelProps = {
  cart: Cart;
  customer: Customer | null;
  isSaving: boolean;
};

const money = (amount: number) => formatCurrency(amount, true);

export function GrandTotalPanel({ cart, customer, isSaving }: Readonly<GrandTotalPanelProps>) {
  const { totals } = cart;
  const itemLabel = totals.itemCount === 1 ? 'item' : 'items';

  return (
    <aside
      aria-labelledby="grand-total-heading"
      className="flex gap-24 bg-layer-1 p-16 md:p-24 lg:sticky lg:top-[4rem]"
    >
      <BookIllustration
        variant="portrait"
        className="hidden w-[40%] max-w-[240px] shrink-0 self-stretch md:block"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-12">
        <h2 id="grand-total-heading" className="text-20 text-text-primary">
          Grand Total
        </h2>
        <dl className="flex flex-col gap-12">
          <TotalsRow
            label={`Price (${String(totals.itemCount)} ${itemLabel})`}
            value={money(totals.subtotal)}
          />
          <TotalsRow label="Tax" value={money(totals.tax)} />
          <TotalsRow
            label="Delivery Charges"
            value={totals.delivery === 0 ? 'Free' : money(totals.delivery)}
          />
        </dl>
        <hr className="border-border" />
        <CouponField appliedCode={cart.couponCode} subtotal={totals.subtotal} />
        <GiftPointsToggle customer={customer} redeemPoints={cart.redeemPoints} />
        <dl className="flex flex-col gap-12">
          <TotalsRow
            label="Discount"
            value={totals.discount > 0 ? `−${money(totals.discount)}` : money(0)}
          />
          {totals.pointsRedeemed > 0 && (
            <TotalsRow label="Gift points" value={`−${money(totals.pointsRedeemed)}`} />
          )}
        </dl>
        <hr className="border-border" />
        <dl aria-live="polite">
          <TotalsRow label="Total Amount" value={money(totals.total)} emphasis />
        </dl>
        <Button
          type="submit"
          form={ADDRESS_FORM_ID}
          loading={isSaving}
          icon={<Purchase size={20} />}
          className="mt-8 w-full md:ml-auto md:w-auto md:min-w-[160px]"
        >
          Pay Now
        </Button>
      </div>
    </aside>
  );
}

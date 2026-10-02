import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Cart } from '../../cart/types';

export type PaymentNoticeProps = {
  cart: Cart | null;
};

/** Shown instead of the form when there is nothing to pay for yet */
export function PaymentNotice({ cart }: Readonly<PaymentNoticeProps>) {
  const isEmpty = !cart || cart.lines.length === 0;
  return (
    <div className="mx-auto w-full max-w-[650px]">
      <EmptyState
        title={isEmpty ? 'Your basket is empty' : 'Add a delivery address first'}
        description={
          isEmpty
            ? 'Add some books to your basket before paying.'
            : 'We need to know where to deliver your books before you pay.'
        }
        action={<ButtonLink to="/checkout">Back to checkout</ButtonLink>}
      />
    </div>
  );
}

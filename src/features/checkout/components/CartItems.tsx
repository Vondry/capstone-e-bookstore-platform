/**
 * Cart panel (S4): book cards with a quantity stepper; quantity 0 asks before removing
 */

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useToast } from '@/components/ui/toastContext';
import { BookCard } from '../../catalog/components/BookCard';
import { useRemoveLine, useUpdateLineQuantity } from '../../cart/hooks/useCart';
import type { Cart, CartLine } from '../../cart/types';

export const MAX_LINE_QUANTITY = 10;

export type CartItemsProps = {
  cart: Cart;
};

export function CartItems({ cart }: Readonly<CartItemsProps>) {
  const updateQuantity = useUpdateLineQuantity();
  const removeLine = useRemoveLine();
  const { showToast } = useToast();
  const [pendingRemoval, setPendingRemoval] = useState<CartLine | null>(null);

  const changeQuantity = (line: CartLine, quantity: number) => {
    if (quantity <= 0) {
      setPendingRemoval(line);
      return;
    }
    updateQuantity.mutate(
      { lineId: line.id, quantity },
      {
        onError: () => {
          showToast(`Could not update ${line.book.title}. Please try again.`, 'error');
        },
      }
    );
  };

  const confirmRemoval = () => {
    if (!pendingRemoval) return;
    const { id, book } = pendingRemoval;
    removeLine.mutate(id, {
      onSuccess: () => {
        setPendingRemoval(null);
        showToast(`Removed ${book.title} from your cart`);
      },
      onError: () => {
        showToast(`Could not remove ${book.title}. Please try again.`, 'error');
      },
    });
  };

  return (
    <section aria-labelledby="cart-items-heading" className="bg-layer-1 p-16 md:p-24">
      <h2 id="cart-items-heading" className="sr-only">
        Your items
      </h2>
      <ul className="grid grid-cols-1 gap-32 md:grid-cols-2 xlg:grid-cols-3">
        {cart.lines.map((line) => (
          <li key={line.id}>
            <BookCard book={line.book} headingLevel="h3">
              <QuantityStepper
                value={line.quantity}
                onChange={(quantity) => {
                  changeQuantity(line, quantity);
                }}
                itemLabel={line.book.title}
                max={MAX_LINE_QUANTITY}
                disabled={removeLine.isPending}
              />
            </BookCard>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={pendingRemoval !== null}
        title={pendingRemoval ? `Remove ${pendingRemoval.book.title} from your cart?` : ''}
        description="You can add it again from the catalogue at any time."
        confirmLabel="Remove"
        loading={removeLine.isPending}
        onConfirm={confirmRemoval}
        onCancel={() => {
          setPendingRemoval(null);
        }}
      />
    </section>
  );
}

/**
 * TanStack Query hooks for the cart
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaymentMethod } from '../../checkout/types';
import { ordersQueryKeys } from '../../orders/hooks/useOrders';
import { authQueryKeys } from '../../auth/hooks/useCustomer';
import type { Customer } from '../../auth/types';
import { computeTotals } from '../../checkout/lib/totals';
import {
  addLineItem,
  applyCoupon,
  completeCart,
  fetchCart,
  removeCoupon,
  removeLineItem,
  updateCart,
  updateLineItem,
  type CartUpdate,
} from '../api';
import type { Cart } from '../types';

export const cartQueryKeys = {
  cart: ['cart'] as const,
};

/** All cart writes share one scope so they run one at a time, in the order they were made */
const cartMutationScope = { id: 'cart' };

export function useCart() {
  return useQuery({
    queryKey: cartQueryKeys.cart,
    queryFn: fetchCart,
  });
}

/** Number of items in the cart (0 while loading or without a cart) */
export function useCartCount(): number {
  const { data } = useCart();
  return data?.totals.itemCount ?? 0;
}

function useCartMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<Cart>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    scope: cartMutationScope,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKeys.cart, cart);
    },
  });
}

export function useAddToCart() {
  return useCartMutation(({ variantId, quantity = 1 }: { variantId: string; quantity?: number }) =>
    addLineItem(variantId, quantity)
  );
}

/** Optimistically updates the quantity so the stepper feels instant */
export function useUpdateLineQuantity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, quantity }: { lineId: string; quantity: number }) =>
      updateLineItem(lineId, quantity),
    scope: cartMutationScope,
    onMutate: async ({ lineId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKeys.cart });
      const previous = queryClient.getQueryData<Cart | null>(cartQueryKeys.cart);
      if (previous) {
        const lines = previous.lines.map((line) =>
          line.id === lineId ? { ...line, quantity } : line
        );
        const customer = queryClient.getQueryData<Customer | null>(authQueryKeys.customer);
        // Same maths as the backend, so the badge and Grand Total move with the stepper
        const totals = computeTotals({
          lines: lines.map((line) => ({
            unitPrice: line.book.priceInr,
            quantity: line.quantity,
            isDigital: line.book.format === 'eBook',
          })),
          couponCode: previous.couponCode,
          redeemPoints: previous.redeemPoints,
          availablePoints: customer?.giftPoints ?? 0,
        });
        queryClient.setQueryData<Cart>(cartQueryKeys.cart, { ...previous, lines, totals });
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined)
        queryClient.setQueryData(cartQueryKeys.cart, context.previous);
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKeys.cart, cart);
    },
  });
}

export function useRemoveLine() {
  return useCartMutation((lineId: string) => removeLineItem(lineId));
}

export function useUpdateCart() {
  return useCartMutation((update: CartUpdate) => updateCart(update));
}

export function useApplyCoupon() {
  return useCartMutation((code: string) => applyCoupon(code));
}

export function useRemoveCoupon() {
  return useCartMutation(() => removeCoupon());
}

export function useCompleteCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentMethod: PaymentMethod) => completeCart(paymentMethod),
    scope: cartMutationScope,
    onSuccess: (order) => {
      queryClient.setQueryData(cartQueryKeys.cart, null);
      queryClient.setQueryData(ordersQueryKeys.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: ordersQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.customer });
    },
  });
}

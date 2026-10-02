/**
 * Medusa order DTO → domain `Order`. Line items only carry product ids; books are passed in.
 */

import type { HttpTypes } from '@medusajs/types';
import type { CancellationRequestDTO, OrderDTO } from '@/lib/storeTypes';
import { toTotals } from '../cart/mappers';
import type { Book } from '../catalog/types';
import { fromMedusaAddress } from '../checkout/mappers';
import { pointsEarned } from '../checkout/lib/totals';
import type { PaymentMethod } from '../checkout/types';
import type { Order } from './types';

export const ORDER_FIELDS =
  '*items,*items.adjustments,*shipping_address,+metadata,+cancellation_request.*';

const PAYMENT_METHODS: PaymentMethod[] = ['credit-card', 'debit-card', 'upi', 'wallet'];

/** Only present in mock mode: Medusa's store API doesn't return order metadata */
function paymentMethod(metadata: Record<string, unknown> | null | undefined): PaymentMethod | null {
  const method = metadata?.payment_method;
  return PAYMENT_METHODS.find((candidate) => candidate === method) ?? null;
}

/** An order as the SDK types it, plus the Cancellation module link we request */
export type SdkOrder = HttpTypes.StoreOrder & {
  cancellation_request?: CancellationRequestDTO | null;
};

export function asOrderDTO(order: SdkOrder): OrderDTO {
  return {
    ...order,
    items: order.items ?? [],
    shipping_address: order.shipping_address ?? null,
  };
}

export function toOrder(order: OrderDTO, books: Book[]): Order {
  const totals = toTotals(order);
  return {
    id: order.id,
    displayId: order.display_id ?? 0,
    createdAt: new Date(order.created_at).toISOString(),
    // SIMULATED: a cancellation request is pending until the store confirms it in Medusa Admin
    status: order.cancellation_request ? 'cancellation_requested' : 'placed',
    email: order.email ?? '',
    lines: order.items.flatMap((item) => {
      const book = books.find((candidate) => candidate.id === item.product_id);
      return book
        ? [{ id: item.id, book, quantity: item.quantity, unitPriceInr: item.unit_price }]
        : [];
    }),
    totals,
    // SIMULATED: same rule as the backend's order.placed subscriber (1 point per ₹10)
    pointsEarned: pointsEarned(totals.total),
    shippingAddress: order.shipping_address
      ? fromMedusaAddress(order.shipping_address, order.email ?? '')
      : fromMedusaAddress({}, order.email ?? ''),
    paymentMethod: paymentMethod(order.metadata),
  };
}

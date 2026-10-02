/**
 * SIMULATED: Medusa cart and order DTOs from the mock records. Totals come from the shared
 * checkout maths (features/checkout/lib/totals.ts). Discounts appear as line-item adjustments,
 * the gift-points discount as a customer-only promotion (Medusa loyalty tutorial pattern).
 */

import { toMedusaAddress } from '../../features/checkout/mappers';
import {
  computeTotals,
  DELIVERY_CHARGE,
  FREE_DELIVERY_THRESHOLD,
  TAX_RATE,
} from '../../features/checkout/lib/totals';
import type { Address, CartTotals } from '../../features/checkout/types';
import type { Book } from '../../features/catalog/types';
import type {
  AdjustmentDTO,
  CartAddressDTO,
  CartDTO,
  CartLineDTO,
  OrderDTO,
  OrderLineDTO,
} from '../../lib/storeTypes';
import { mockBooks } from '../data/books';
import type { CartRecord, OrderRecord } from '../db';

export const loyaltyPromoId = (ownerId: string) => `promo_loyalty_${ownerId}`;
export const SHIPPING_OPTION = { id: 'so_standard', name: 'Standard delivery' };

export function addressDTO(address: Address | null, ownerId: string): CartAddressDTO | null {
  return address ? { id: `addr_${ownerId}`, ...toMedusaAddress(address) } : null;
}

export function cartBooks(record: CartRecord): { lineId: string; book: Book; quantity: number }[] {
  return record.lines.flatMap((line) => {
    const book = mockBooks.find((b) => b.id === line.bookId);
    return book ? [{ lineId: line.id, book, quantity: line.quantity }] : [];
  });
}

export function cartTotals(record: CartRecord, availablePoints: number): CartTotals {
  return computeTotals({
    lines: cartBooks(record).map(({ book, quantity }) => ({
      unitPrice: book.priceInr,
      quantity,
      isDigital: book.format === 'eBook',
    })),
    couponCode: record.couponCode,
    redeemPoints: record.redeemPoints,
    availablePoints,
  });
}

/** Coupon and gift-points adjustments, put on the first line for simplicity */
function adjustments(
  ownerId: string,
  couponCode: string | null,
  totals: CartTotals
): AdjustmentDTO[] {
  const result: AdjustmentDTO[] = [];
  if (couponCode && totals.discount > 0) {
    result.push({
      id: `adj_coupon_${ownerId}`,
      code: couponCode,
      amount: totals.discount,
      promotion_id: `promo_${couponCode}`,
    });
  }
  if (totals.pointsRedeemed > 0) {
    result.push({
      id: `adj_loyalty_${ownerId}`,
      code: `LOYALTY-${ownerId}`,
      amount: totals.pointsRedeemed,
      promotion_id: loyaltyPromoId(ownerId),
    });
  }
  return result;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Like Medusa: discount_total includes the tax the discount saved (discount_tax_total) */
function totalsFields(totals: CartTotals) {
  const discount = totals.discount + totals.pointsRedeemed;
  const discountTax = round2(discount * TAX_RATE);
  return {
    item_subtotal: totals.subtotal,
    item_total: round2(totals.subtotal - discount + totals.tax),
    tax_total: totals.tax,
    shipping_total: totals.delivery,
    discount_total: round2(discount + discountTax),
    discount_tax_total: discountTax,
    total: totals.total,
  };
}

export function toCartDTO(record: CartRecord, availablePoints: number): CartDTO {
  const computed = cartTotals(record, availablePoints);
  // Like Medusa: delivery is charged exactly when a shipping method is on the cart, priced on the
  // subtotal before discounts, whatever the items are. A method left on an eBook-only cart still
  // costs ₹40 until DELETE /store/carts/:id/shipping-methods removes it. Delivery is GST-exempt.
  const delivery =
    record.hasShippingMethod && computed.subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_CHARGE : 0;
  const totals: CartTotals = {
    ...computed,
    delivery,
    total: computed.total - computed.delivery + delivery,
  };
  const lineAdjustments = adjustments(record.id, record.couponCode, totals);

  const items: CartLineDTO[] = cartBooks(record).map(({ lineId, book, quantity }, index) => ({
    id: lineId,
    title: book.title,
    thumbnail: book.coverUrl,
    quantity,
    unit_price: book.priceInr,
    product_id: book.id,
    variant_id: book.variantId,
    requires_shipping: book.format !== 'eBook',
    adjustments: index === 0 ? lineAdjustments : [],
  }));

  return {
    id: record.id,
    region_id: 'reg_india',
    currency_code: 'inr',
    email: record.email ?? undefined,
    metadata: {
      ...(record.redeemPoints ? { loyalty_promo_id: loyaltyPromoId(record.id) } : {}),
      ...(record.paymentMethod ? { payment_method: record.paymentMethod } : {}),
    },
    items,
    shipping_address: addressDTO(record.shippingAddress, record.id),
    shipping_methods: record.hasShippingMethod
      ? [
          {
            id: `sm_${record.id}`,
            name: SHIPPING_OPTION.name,
            amount: totals.delivery,
            shipping_option_id: SHIPPING_OPTION.id,
          },
        ]
      : [],
    promotions: [
      ...(record.couponCode ? [{ id: `promo_${record.couponCode}`, code: record.couponCode }] : []),
      ...(record.redeemPoints
        ? [{ id: loyaltyPromoId(record.id), code: `LOYALTY-${record.id}` }]
        : []),
    ],
    payment_collection: record.paymentCollectionId ? { id: record.paymentCollectionId } : null,
    ...totalsFields(totals),
  };
}

export function toOrderDTO(order: OrderRecord): OrderDTO {
  const lineAdjustments = adjustments(
    order.id,
    order.totals.discount > 0 ? 'COUPON' : null,
    order.totals
  );
  const items: OrderLineDTO[] = order.lines.map((line, index) => ({
    id: line.id,
    title: line.book.title,
    thumbnail: line.book.coverUrl,
    quantity: line.quantity,
    unit_price: line.unitPriceInr,
    product_id: line.book.id,
    variant_id: line.book.variantId,
    adjustments: index === 0 ? lineAdjustments : [],
  }));
  return {
    id: order.id,
    display_id: order.displayId,
    email: order.email,
    status: 'pending',
    created_at: order.createdAt,
    currency_code: 'inr',
    metadata: {
      ...(order.paymentMethod ? { payment_method: order.paymentMethod } : {}),
      ...(order.totals.pointsRedeemed > 0 ? { loyalty_promo_id: loyaltyPromoId(order.id) } : {}),
    },
    items,
    shipping_address: addressDTO(order.shippingAddress, order.id),
    cancellation_request:
      order.status === 'cancellation_requested'
        ? {
            id: `creq_${order.id}`,
            order_id: order.id,
            status: 'requested',
            created_at: order.cancellationRequestedAt ?? order.createdAt,
          }
        : null,
    ...totalsFields(order.totals),
  };
}

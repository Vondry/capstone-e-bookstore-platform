/**
 * Medusa cart DTO → domain `Cart` (docs/data-model.md → Order).
 * Line items only carry product ids, so the books are loaded separately and passed in.
 */

import type { AdjustmentDTO, CartDTO } from '@/lib/storeTypes';
import type { Book } from '../catalog/types';
import { fromMedusaAddress } from '../checkout/mappers';
import type { CartTotals } from '../checkout/types';
import type { Cart } from './types';

/** Cart fields every cart request asks for */
export const CART_FIELDS =
  '*items,*items.adjustments,*shipping_address,*shipping_methods,*promotions,*payment_collection,+metadata';

type TotalsSource = Pick<
  CartDTO,
  | 'item_subtotal'
  | 'tax_total'
  | 'shipping_total'
  | 'discount_total'
  | 'discount_tax_total'
  | 'total'
> & { items: { quantity: number; adjustments?: AdjustmentDTO[] }[] };

/**
 * The gift-points promotion is created per customer with a `LOYALTY-` code (Loyalty module,
 * Medusa's loyalty tutorial pattern). The code is used to recognise it because orders don't
 * expose metadata on the store API.
 */
export const LOYALTY_CODE_PREFIX = 'LOYALTY-';

export const isLoyaltyCode = (code: string | undefined) =>
  code?.startsWith(LOYALTY_CODE_PREFIX) ?? false;

/** Medusa's totals → the Grand Total rows; the gift-points promotion is shown on its own row */
export function toTotals(source: TotalsSource): CartTotals {
  // Adjustment amounts are before tax, like the subtotal
  const pointsRedeemed = source.items
    .flatMap((item) => item.adjustments ?? [])
    .filter((adjustment) => isLoyaltyCode(adjustment.code))
    .reduce((sum, adjustment) => sum + adjustment.amount, 0);
  // discount_total includes the tax the discount saved; the Grand Total shows it before tax
  const discountBeforeTax = source.discount_total - source.discount_tax_total;
  return {
    itemCount: source.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: source.item_subtotal,
    tax: source.tax_total,
    delivery: source.shipping_total,
    discount: round2(discountBeforeTax - pointsRedeemed),
    pointsRedeemed: round2(pointsRedeemed),
    total: source.total,
  };
}

const round2 = (value: number) => Math.round(value * 100) / 100;

export function toCart(cart: CartDTO, books: Book[]): Cart {
  const coupon = cart.promotions.find(
    (promotion) => promotion.code && !isLoyaltyCode(promotion.code)
  );
  const address = cart.shipping_address;
  return {
    id: cart.id,
    lines: cart.items.flatMap((item) => {
      const book = books.find((candidate) => candidate.id === item.product_id);
      return book ? [{ id: item.id, book, quantity: item.quantity }] : [];
    }),
    couponCode: coupon?.code ?? null,
    redeemPoints: cart.promotions.some((promotion) => isLoyaltyCode(promotion.code)),
    shippingAddress: address?.address_1 ? fromMedusaAddress(address, cart.email ?? '') : null,
    totals: toTotals(cart),
  };
}

/** Product ids of the lines, without duplicates, for loading their books */
export function productIds(items: { product_id?: string | null }[]): string[] {
  return [...new Set(items.flatMap((item) => (item.product_id ? [item.product_id] : [])))];
}

export function requiresShipping(cart: CartDTO): boolean {
  return cart.items.some((item) => item.requires_shipping);
}

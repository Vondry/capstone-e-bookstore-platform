/**
 * Pure checkout maths: tax, delivery, coupons and gift points.
 * Used by the cart UI and by the mock backend so both always agree.
 */

import type { CartTotals } from '../types';

export const TAX_RATE = 0.12;
export const FREE_DELIVERY_THRESHOLD = 499;
export const DELIVERY_CHARGE = 40;
/** SIMULATED: gift points — earn 1 point per ₹10, redeem 1 point = ₹1, max 50 % of the subtotal */
export const POINTS_PER_RUPEES = 10;
export const MAX_POINTS_SHARE = 0.5;

export type Coupon =
  | { code: string; type: 'flat'; amount: number; minSubtotal: number }
  | { code: string; type: 'percent'; percent: number; minSubtotal: number };

/** SIMULATED: coupon catalogue (a real store would use Medusa promotions) */
export const COUPONS: Coupon[] = [
  { code: 'BOOKWORM100', type: 'flat', amount: 100, minSubtotal: 300 },
  { code: 'READMORE10', type: 'percent', percent: 10, minSubtotal: 0 },
];

export type TotalsLine = {
  unitPrice: number;
  quantity: number;
  isDigital: boolean;
};

export type TotalsInput = {
  lines: TotalsLine[];
  couponCode: string | null;
  redeemPoints: boolean;
  availablePoints: number;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

export type CouponResult = { ok: true; coupon: Coupon } | { ok: false; reason: string };

export function validateCoupon(code: string, subtotal: number): CouponResult {
  const coupon = COUPONS.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return { ok: false, reason: 'This coupon code is not valid' };
  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      reason: `This coupon needs a minimum order of ₹${String(coupon.minSubtotal)}`,
    };
  }
  return { ok: true, coupon };
}

export function couponDiscount(coupon: Coupon, subtotal: number): number {
  const discount = coupon.type === 'flat' ? coupon.amount : (subtotal * coupon.percent) / 100;
  return round2(Math.min(discount, subtotal));
}

export function maxRedeemablePoints(subtotal: number, availablePoints: number): number {
  return Math.max(
    0,
    Math.min(Math.floor(availablePoints), Math.floor(subtotal * MAX_POINTS_SHARE))
  );
}

export function pointsEarned(total: number): number {
  return Math.max(0, Math.floor(total / POINTS_PER_RUPEES));
}

export function computeTotals({
  lines,
  couponCode,
  redeemPoints,
  availablePoints,
}: TotalsInput): CartTotals {
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = round2(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));
  const needsShipping = lines.some((line) => !line.isDigital && line.quantity > 0);
  const delivery = !needsShipping || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;

  const couponResult = couponCode ? validateCoupon(couponCode, subtotal) : null;
  const discount = couponResult?.ok ? couponDiscount(couponResult.coupon, subtotal) : 0;
  const pointsRedeemed = redeemPoints
    ? maxRedeemablePoints(subtotal - discount, availablePoints)
    : 0;
  // Like Medusa: GST is charged on what's left after the coupon and gift points; delivery is exempt
  const tax = round2((subtotal - discount - pointsRedeemed) * TAX_RATE);

  const total = round2(Math.max(0, subtotal - discount - pointsRedeemed + tax + delivery));
  return { itemCount, subtotal, tax, delivery, discount, pointsRedeemed, total };
}

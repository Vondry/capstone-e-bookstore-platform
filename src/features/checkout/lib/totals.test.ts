import { describe, it, expect } from 'vitest';
import {
  computeTotals,
  couponDiscount,
  maxRedeemablePoints,
  pointsEarned,
  validateCoupon,
  COUPONS,
  DELIVERY_CHARGE,
} from './totals';

const paperback = (unitPrice: number, quantity = 1) => ({ unitPrice, quantity, isDigital: false });
const ebook = (unitPrice: number, quantity = 1) => ({ unitPrice, quantity, isDigital: true });
const base = { couponCode: null, redeemPoints: false, availablePoints: 0 };

describe('validateCoupon', () => {
  it('accepts a known code case-insensitively', () => {
    expect(validateCoupon(' bookworm100 ', 508)).toEqual({ ok: true, coupon: COUPONS[0] });
  });

  it('rejects unknown codes', () => {
    expect(validateCoupon('NOPE', 508)).toEqual({
      ok: false,
      reason: 'This coupon code is not valid',
    });
  });

  it('rejects codes below the minimum subtotal', () => {
    const result = validateCoupon('BOOKWORM100', 299);
    expect(result.ok).toBe(false);
  });
});

describe('couponDiscount', () => {
  it('applies flat and percent coupons, never above the subtotal', () => {
    expect(couponDiscount({ code: 'A', type: 'flat', amount: 100, minSubtotal: 0 }, 508)).toBe(100);
    expect(couponDiscount({ code: 'A', type: 'flat', amount: 100, minSubtotal: 0 }, 60)).toBe(60);
    expect(
      couponDiscount({ code: 'B', type: 'percent', percent: 10, minSubtotal: 0 }, 508)
    ).toBeCloseTo(50.8, 2);
  });
});

describe('gift points', () => {
  it('caps redeemable points at 50 % of the subtotal and the balance', () => {
    expect(maxRedeemablePoints(508, 1000)).toBe(254);
    expect(maxRedeemablePoints(508, 120)).toBe(120);
    expect(maxRedeemablePoints(-5, 120)).toBe(0);
  });

  it('earns 1 point per ₹10', () => {
    expect(pointsEarned(470)).toBe(47);
    expect(pointsEarned(9.99)).toBe(0);
    expect(pointsEarned(-1)).toBe(0);
  });
});

describe('computeTotals', () => {
  it('handles the wireframe cart (₹149 + ₹359, coupon ₹100), taxing the discounted amount', () => {
    const totals = computeTotals({
      ...base,
      lines: [paperback(149), paperback(359)],
      couponCode: 'BOOKWORM100',
    });
    expect(totals).toEqual({
      itemCount: 2,
      subtotal: 508,
      tax: 48.96,
      delivery: 0,
      discount: 100,
      pointsRedeemed: 0,
      total: 456.96,
    });
  });

  it('charges delivery below the threshold for physical books', () => {
    expect(computeTotals({ ...base, lines: [paperback(149, 2)] }).delivery).toBe(DELIVERY_CHARGE);
  });

  it('never charges delivery for eBook-only carts', () => {
    expect(computeTotals({ ...base, lines: [ebook(99)] }).delivery).toBe(0);
  });

  it('ignores invalid coupons', () => {
    expect(
      computeTotals({ ...base, lines: [paperback(149)], couponCode: 'BOOKWORM100' }).discount
    ).toBe(0);
  });

  it('redeems points after the discount', () => {
    const totals = computeTotals({
      lines: [paperback(508)],
      couponCode: 'BOOKWORM100',
      redeemPoints: true,
      availablePoints: 1000,
    });
    expect(totals.pointsRedeemed).toBe(204);
  });

  it('handles an empty cart', () => {
    expect(computeTotals({ ...base, lines: [] })).toEqual({
      itemCount: 0,
      subtotal: 0,
      tax: 0,
      delivery: 0,
      discount: 0,
      pointsRedeemed: 0,
      total: 0,
    });
  });
});

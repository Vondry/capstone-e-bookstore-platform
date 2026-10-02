import { describe, expect, it } from 'vitest';
import { mockBooks } from '@/mocks/data/books';
import type { CartDTO } from '@/lib/storeTypes';
import { productIds, toCart, toTotals } from './mappers';

const [book] = mockBooks;
if (!book) throw new Error('Mock catalogue is empty');

const baseCart: CartDTO = {
  id: 'cart_1',
  region_id: 'reg_india',
  currency_code: 'inr',
  email: 'ravi@example.com',
  metadata: {},
  items: [
    {
      id: 'line_1',
      title: book.title,
      thumbnail: book.coverUrl,
      quantity: 2,
      unit_price: 300,
      product_id: book.id,
      variant_id: book.variantId,
      requires_shipping: true,
      adjustments: [],
    },
  ],
  shipping_address: null,
  shipping_methods: [],
  promotions: [],
  payment_collection: null,
  item_subtotal: 600,
  item_total: 672,
  tax_total: 72,
  shipping_total: 0,
  discount_total: 0,
  discount_tax_total: 0,
  total: 672,
};

const [firstLine] = baseCart.items;
if (!firstLine) throw new Error('Cart fixture has no line');

describe('toTotals', () => {
  it('maps Medusa totals to the Grand Total rows', () => {
    expect(toTotals(baseCart)).toEqual({
      itemCount: 2,
      subtotal: 600,
      tax: 72,
      delivery: 0,
      discount: 0,
      pointsRedeemed: 0,
      total: 672,
    });
  });

  it('splits the gift-points promotion out of the discount', () => {
    // Medusa: discount_total includes the GST the discounts saved (150 × 12 % = 18)
    const totals = toTotals({
      ...baseCart,
      discount_total: 168,
      discount_tax_total: 18,
      tax_total: 54,
      total: 504,
      items: [
        {
          quantity: 2,
          adjustments: [
            { id: 'a', amount: 100, promotion_id: 'promo_1', code: 'BOOKWORM100' },
            { id: 'b', amount: 50, promotion_id: 'promo_2', code: 'LOYALTY-cus_1' },
          ],
        },
      ],
    });
    expect(totals.discount).toBe(100);
    expect(totals.pointsRedeemed).toBe(50);
  });
});

describe('toCart', () => {
  it('maps lines to books and ignores lines whose book is unknown', () => {
    const cart = toCart(
      {
        ...baseCart,
        items: [...baseCart.items, { ...firstLine, id: 'line_2', product_id: 'gone' }],
      },
      [book]
    );
    expect(cart.lines).toEqual([{ id: 'line_1', book, quantity: 2 }]);
  });

  it('tells the coupon apart from the gift-points promotion', () => {
    const cart = toCart(
      {
        ...baseCart,
        promotions: [
          { id: 'promo_loyalty', code: 'LOYALTY-cus_1' },
          { id: 'promo_BOOKWORM100', code: 'BOOKWORM100' },
        ],
      },
      [book]
    );
    expect(cart.couponCode).toBe('BOOKWORM100');
    expect(cart.redeemPoints).toBe(true);
  });

  it('treats an address without a street (e.g. only the region country) as no address', () => {
    expect(
      toCart({ ...baseCart, shipping_address: { id: 'addr', country_code: 'in' } }, [book])
        .shippingAddress
    ).toBeNull();
  });
});

describe('productIds', () => {
  it('lists each product once', () => {
    expect(productIds([{ product_id: 'a' }, { product_id: 'a' }, { product_id: null }])).toEqual([
      'a',
    ]);
  });
});

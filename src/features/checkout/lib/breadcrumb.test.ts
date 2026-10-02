import { describe, expect, it } from 'vitest';
import type { Cart } from '../../cart/types';
import { mockBooks } from '../../../mocks/data/books';
import { buildCheckoutBreadcrumb } from './breadcrumb';

const found = mockBooks.find((b) => b.handle === 'joy-of-minimalism');
if (!found) throw new Error('joy-of-minimalism missing from the mock books');
const book = found;

const cart = (lines: Cart['lines']): Cart => ({
  id: 'cart_1',
  lines,
  couponCode: null,
  redeemPoints: false,
  shippingAddress: null,
  totals: {
    itemCount: 0,
    subtotal: 0,
    tax: 0,
    delivery: 0,
    discount: 0,
    pointsRedeemed: 0,
    total: 0,
  },
});

describe('buildCheckoutBreadcrumb', () => {
  it('uses the first line: categories, then the book, then Checkout', () => {
    const items = buildCheckoutBreadcrumb(cart([{ id: 'l1', book, quantity: 1 }]));
    expect(items[0]).toEqual({ label: 'Home', to: '/' });
    expect(items.slice(1, -2)).toEqual(
      book.categories.map((c) => ({ label: c.name, to: `/category/${c.handle}` }))
    );
    expect(items.at(-2)).toEqual({ label: book.title, to: `/books/${book.handle}` });
    expect(items.at(-1)).toEqual({ label: 'Checkout' });
  });

  it('falls back to Home / Checkout without lines or cart', () => {
    expect(buildCheckoutBreadcrumb(cart([]))).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Checkout' },
    ]);
    expect(buildCheckoutBreadcrumb(null)).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Checkout' },
    ]);
  });
});

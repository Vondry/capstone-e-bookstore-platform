import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/mocks/db';
import { login, logout, register } from '../auth/api';
import {
  addLineItem,
  applyCoupon,
  fetchCart,
  getStoredCartId,
  removeCoupon,
  removeLineItem,
  setStoredCartId,
  transferStoredCart,
  updateCart,
} from './api';

describe('cart api', () => {
  it('puts concurrent first adds into one cart instead of creating two', async () => {
    // variant_07 Joy of Minimalism, variant_03 The Path to Success
    await Promise.all([addLineItem('variant_07'), addLineItem('variant_03')]);

    const cart = await fetchCart();
    expect(cart?.id).toBe(getStoredCartId());
    expect(cart?.lines.map((line) => line.book.title).sort((a, b) => a.localeCompare(b))).toEqual([
      'Joy of Minimalism',
      'The Path to Success',
    ]);
  });
});

describe('applyCoupon', () => {
  // The wireframe cart: Joy of Minimalism ₹149 + The Path to Success ₹359 = ₹508
  async function wireframeCart() {
    await addLineItem('variant_07');
    await addLineItem('variant_03');
  }

  it('applies a code typed in lower case with spaces (Medusa codes are case-sensitive)', async () => {
    await wireframeCart();
    const cart = await applyCoupon('  bookworm100 ');
    expect(cart.couponCode).toBe('BOOKWORM100');
  });

  it('explains an unknown code', async () => {
    await wireframeCart();
    await expect(applyCoupon('NOPE')).rejects.toThrow('This coupon code is not valid');
  });

  it('explains a code whose minimum order is not reached', async () => {
    await addLineItem('variant_07'); // ₹149 < ₹300
    await expect(applyCoupon('BOOKWORM100')).rejects.toThrow(
      'This coupon needs a minimum order of ₹300'
    );
  });

  it('removes the applied code', async () => {
    await wireframeCart();
    await applyCoupon('BOOKWORM100');
    const cart = await removeCoupon();
    expect(cart.couponCode).toBeNull();
  });

  it('keeps the cart as it is when no code is applied', async () => {
    const before = await addLineItem('variant_07');
    const cart = await removeCoupon();
    expect(cart.id).toBe(before.id);
  });
});

describe('transferStoredCart', () => {
  it("gives a guest's cart to the customer who logs in, so they can redeem gift points", async () => {
    const guestCart = await addLineItem('variant_03');
    await login(DEMO_EMAIL, DEMO_PASSWORD);

    // Without the transfer the cart still belongs to the guest (as in Medusa)
    await expect(updateCart({ redeemPoints: true })).rejects.toThrow(
      'Log in to redeem gift points'
    );

    await transferStoredCart();
    const cart = await updateCart({ redeemPoints: true });
    expect(cart.id).toBe(guestCart.id);
    expect(cart.redeemPoints).toBe(true);
    expect(cart.lines.map((line) => line.book.title)).toEqual(['The Path to Success']);
  });

  it('forgets a cart that belongs to another customer instead of failing the login', async () => {
    await login(DEMO_EMAIL, DEMO_PASSWORD);
    await addLineItem('variant_03');
    await logout();
    await register({
      email: 'ravi@example.com',
      password: 'Secret123!',
      firstName: 'Ravi',
      lastName: 'Kumar',
    });

    await expect(transferStoredCart()).resolves.toBeUndefined();
    expect(getStoredCartId()).toBeNull();
  });

  it('does nothing without a stored cart', async () => {
    await login(DEMO_EMAIL, DEMO_PASSWORD);
    await expect(transferStoredCart()).resolves.toBeUndefined();
    expect(getStoredCartId()).toBeNull();
  });
});

describe('fetchCart', () => {
  it('returns null without a stored cart', async () => {
    await expect(fetchCart()).resolves.toBeNull();
  });

  it('forgets a cart the backend no longer knows', async () => {
    setStoredCartId('cart_gone');
    await expect(fetchCart()).resolves.toBeNull();
    expect(getStoredCartId()).toBeNull();
  });

  it('keeps the cart and surfaces other errors so the UI can retry', async () => {
    const cart = await addLineItem('variant_07');
    server.use(
      http.get('*/store/carts/:id', () => HttpResponse.json({ message: 'Down' }, { status: 503 }))
    );
    await expect(fetchCart()).rejects.toThrow('Down');
    expect(getStoredCartId()).toBe(cart.id);
  });

  it('treats unavailable storage as no cart', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    await expect(fetchCart()).resolves.toBeNull();
    vi.restoreAllMocks();
  });
});

describe('transferStoredCart on server errors', () => {
  it('keeps the cart when the transfer fails for a temporary reason', async () => {
    const cart = await addLineItem('variant_07');
    await login(DEMO_EMAIL, DEMO_PASSWORD);
    server.use(
      http.post('*/store/carts/:id/customer', () =>
        HttpResponse.json({ message: 'Down' }, { status: 500 })
      )
    );
    await transferStoredCart();
    expect(getStoredCartId()).toBe(cart.id);
  });
});

describe('removeCoupon without a cart', () => {
  it('fails with not found', async () => {
    setStoredCartId('cart_gone');
    await expect(removeCoupon()).rejects.toThrow('Cart not found');
  });
});

describe('delivery on eBook-only carts', () => {
  // variant_07 Joy of Minimalism (₹149 paperback), variant_08 The Vanishing House (₹99 eBook)
  it('charges ₹40 for a paperback under ₹499 and nothing for an eBook alone', async () => {
    expect((await addLineItem('variant_07')).totals.delivery).toBe(40);
    setStoredCartId(null);
    expect((await addLineItem('variant_08')).totals.delivery).toBe(0);
  });

  it('drops the delivery when the paperback is removed from a mixed cart', async () => {
    await addLineItem('variant_08');
    const mixed = await addLineItem('variant_07');
    expect(mixed.totals.delivery).toBe(40);

    const paperback = mixed.lines.find((line) => line.book.format === 'Paperback');
    if (!paperback) throw new Error('paperback line missing');
    const cart = await removeLineItem(paperback.id);
    expect(cart.totals.delivery).toBe(0);
    expect(cart.totals.total).toBeCloseTo(110.88, 2);
  });

  it('drops the delivery when an eBook replaces the last paperback', async () => {
    const withPaperback = await addLineItem('variant_07');
    const [line] = withPaperback.lines;
    if (!line) throw new Error('line missing');
    await removeLineItem(line.id);

    const cart = await addLineItem('variant_08');
    expect(cart.totals.delivery).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { mockBooks } from '@/mocks/data/books';
import type { OrderDTO } from '@/lib/storeTypes';
import { toOrder } from './mappers';

const [book] = mockBooks;
if (!book) throw new Error('Mock catalogue is empty');

const order: OrderDTO = {
  id: 'order_1',
  display_id: 1003,
  email: 'ravi@example.com',
  status: 'pending',
  created_at: '2026-10-01T10:00:00.000Z',
  currency_code: 'inr',
  metadata: { payment_method: 'upi' },
  items: [
    {
      id: 'ol_1',
      title: book.title,
      thumbnail: book.coverUrl,
      quantity: 1,
      unit_price: 399,
      product_id: book.id,
      variant_id: book.variantId,
    },
  ],
  shipping_address: {
    id: 'addr',
    first_name: 'Ravi',
    last_name: 'Kumar',
    address_1: '4 Park Street',
    city: 'Kolkata',
    postal_code: '700016',
    province: 'West Bengal',
    country_code: 'in',
    phone: '+91 9876543210',
  },
  item_subtotal: 399,
  item_total: 446.88,
  tax_total: 47.88,
  shipping_total: 40,
  discount_total: 0,
  discount_tax_total: 0,
  total: 486.88,
  cancellation_request: null,
};

describe('toOrder', () => {
  it('maps the order, its lines, address and payment method', () => {
    const mapped = toOrder(order, [book]);
    expect(mapped).toMatchObject({
      id: 'order_1',
      displayId: 1003,
      status: 'placed',
      paymentMethod: 'upi',
      lines: [{ id: 'ol_1', book, quantity: 1, unitPriceInr: 399 }],
      shippingAddress: { firstName: 'Ravi', city: 'Kolkata', email: 'ravi@example.com' },
      totals: { itemCount: 1, delivery: 40, total: 486.88 },
    });
    // SIMULATED: 1 point per ₹10 of the total
    expect(mapped.pointsEarned).toBe(48);
  });

  it('shows a pending cancellation request as "cancellation_requested"', () => {
    expect(
      toOrder(
        {
          ...order,
          cancellation_request: {
            id: 'creq',
            order_id: 'order_1',
            status: 'requested',
            created_at: '2026-10-01T11:00:00.000Z',
          },
        },
        [book]
      ).status
    ).toBe('cancellation_requested');
  });

  it('leaves the payment method unknown when it is missing or unrecognised', () => {
    // Medusa's store API doesn't return order metadata, so this is the usual live case
    expect(toOrder({ ...order, metadata: undefined }, [book]).paymentMethod).toBeNull();
    expect(
      toOrder({ ...order, metadata: { payment_method: 'cash' } }, [book]).paymentMethod
    ).toBeNull();
  });

  it('copes with what live orders leave out: number, e-mail, address and unknown products', () => {
    const [item] = order.items;
    if (!item) throw new Error('Fixture order has no items');
    const mapped = toOrder(
      {
        ...order,
        display_id: undefined,
        email: null,
        shipping_address: null,
        items: [...order.items, { ...item, id: 'ol_2', product_id: 'prod_deleted' }],
      },
      [book]
    );
    expect(mapped.displayId).toBe(0);
    expect(mapped.email).toBe('');
    // A line whose product no longer exists is dropped instead of crashing the page
    expect(mapped.lines).toHaveLength(1);
    expect(mapped.shippingAddress).toMatchObject({ firstName: '', country: 'India', email: '' });
  });
});
